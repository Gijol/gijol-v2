import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import type { SectionOffering, SelectedSection } from '@/lib/types/timetable';
import type {
  TimetableCandidateReason,
  TimetableCourseCandidate,
  TimetablePlanAlternative,
  TimetablePreferredFreeTime,
  TimetableSectionInfoStatus,
  TimetableTermPlanGroup,
} from '@/lib/types/timetable-plan';
import { normalizeCourseCode } from '@/features/course-catalog/normalize';
import { getNextColor } from '@/features/timetable/selectors';
import { createSectionKey, getPlanStatus, sectionToSnapshot } from '@/features/timetable/plan-model';

const STORAGE_KEY = 'timetable-plan-storage-v2';

function createId(prefix: string): string {
  return `${prefix}_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
}

function now(): number {
  return Date.now();
}

function createDefaultPlanName(term: string, index: number): string {
  return `${term} 대안 ${index}`;
}

function reasonKey(reason: TimetableCandidateReason): string {
  return [reason.kind, reason.sourceId ?? '', reason.label].join('|');
}

function mergeReasons(
  current: readonly TimetableCandidateReason[],
  incoming: readonly TimetableCandidateReason[],
): TimetableCandidateReason[] {
  const byKey = new Map<string, TimetableCandidateReason>();
  [...current, ...incoming].forEach((reason) => byKey.set(reasonKey(reason), reason));
  return Array.from(byKey.values());
}

function getUsedColors(candidates: readonly TimetableCourseCandidate[]): string[] {
  return candidates.flatMap((candidate) => (candidate.color ? [candidate.color] : []));
}

function updatePlan(
  plans: Record<string, TimetablePlanAlternative>,
  planId: string,
  updater: (plan: TimetablePlanAlternative) => TimetablePlanAlternative,
): Record<string, TimetablePlanAlternative> {
  const plan = plans[planId];
  if (!plan) return plans;
  return {
    ...plans,
    [planId]: updater(plan),
  };
}

interface AddCandidateInput {
  courseCode: string;
  title?: string;
  credits?: number;
  reasons: TimetableCandidateReason[];
}

interface TimetablePlanState {
  termGroups: Record<string, TimetableTermPlanGroup>;
  plans: Record<string, TimetablePlanAlternative>;

  ensureTermGroup: (term: string, sectionInfoStatus: TimetableSectionInfoStatus) => void;
  createPlan: (term: string, sectionInfoStatus: TimetableSectionInfoStatus) => string;
  importLegacyPlan: (args: {
    name: string;
    term: string;
    selectedSections: SelectedSection[];
    sectionInfoStatus: TimetableSectionInfoStatus;
  }) => string;
  deletePlan: (planId: string) => void;
  renamePlan: (planId: string, name: string) => void;
  setRepresentativePlan: (term: string, planId: string) => void;
  addOrMergeCandidate: (planId: string, input: AddCandidateInput) => string | null;
  removeCandidate: (planId: string, candidateId: string) => void;
  selectSectionForCandidate: (planId: string, candidateId: string, section: SectionOffering) => void;
  addSectionDirect: (planId: string, section: SectionOffering) => string | null;
  clearSelectedSectionByKey: (planId: string, sectionKey: string) => void;
  addPreferredFreeTime: (planId: string, freeTime: Omit<TimetablePreferredFreeTime, 'id'>) => void;
  removePreferredFreeTime: (planId: string, freeTimeId: string) => void;
}

export const useTimetablePlanStore = create<TimetablePlanState>()(
  persist(
    (set, get) => ({
      termGroups: {},
      plans: {},

      ensureTermGroup: (term, sectionInfoStatus) => {
        if (!term) return;
        set((state) => {
          const existing = state.termGroups[term];
          const timestamp = now();
          if (existing) {
            if (existing.sectionInfoStatus === sectionInfoStatus) return state;
            return {
              termGroups: {
                ...state.termGroups,
                [term]: {
                  ...existing,
                  sectionInfoStatus,
                  updatedAt: timestamp,
                },
              },
              plans: Object.fromEntries(
                Object.entries(state.plans).map(([planId, plan]) => [
                  planId,
                  plan.term === term
                    ? { ...plan, status: getPlanStatus(sectionInfoStatus), updatedAt: timestamp }
                    : plan,
                ]),
              ),
            };
          }

          return {
            termGroups: {
              ...state.termGroups,
              [term]: {
                term,
                sectionInfoStatus,
                representativePlanId: undefined,
                planIds: [],
                createdAt: timestamp,
                updatedAt: timestamp,
              },
            },
          };
        });
      },

      createPlan: (term, sectionInfoStatus) => {
        const planId = createId('plan');
        const timestamp = now();

        set((state) => {
          const existingGroup = state.termGroups[term];
          const planIndex = (existingGroup?.planIds.length ?? 0) + 1;
          const group: TimetableTermPlanGroup = existingGroup ?? {
            term,
            sectionInfoStatus,
            representativePlanId: undefined,
            planIds: [],
            createdAt: timestamp,
            updatedAt: timestamp,
          };

          const plan: TimetablePlanAlternative = {
            id: planId,
            term,
            name: createDefaultPlanName(term, planIndex),
            status: getPlanStatus(group.sectionInfoStatus),
            candidates: [],
            preferredFreeTimes: [],
            createdAt: timestamp,
            updatedAt: timestamp,
          };

          return {
            termGroups: {
              ...state.termGroups,
              [term]: {
                ...group,
                representativePlanId: group.representativePlanId ?? planId,
                planIds: [...group.planIds, planId],
                updatedAt: timestamp,
              },
            },
            plans: {
              ...state.plans,
              [planId]: plan,
            },
          };
        });

        return planId;
      },

      importLegacyPlan: ({ name, term, selectedSections, sectionInfoStatus }) => {
        const planId = get().createPlan(term, sectionInfoStatus);
        get().renamePlan(planId, name);

        selectedSections.forEach((selected) => {
          const candidateId = get().addSectionDirect(planId, selected.section);
          if (!candidateId) return;
          set((state) => ({
            plans: updatePlan(state.plans, planId, (plan) => ({
              ...plan,
              candidates: plan.candidates.map((candidate) =>
                candidate.id === candidateId
                  ? {
                      ...candidate,
                      color: selected.color || candidate.color,
                      updatedAt: now(),
                    }
                  : candidate,
              ),
            })),
          }));
        });

        return planId;
      },

      deletePlan: (planId) => {
        set((state) => {
          const plan = state.plans[planId];
          if (!plan) return state;
          const { [planId]: _, ...remainingPlans } = state.plans;
          const group = state.termGroups[plan.term];
          if (!group) return { plans: remainingPlans };

          const nextPlanIds = group.planIds.filter((id) => id !== planId);
          const nextRepresentative = group.representativePlanId === planId ? nextPlanIds[0] : group.representativePlanId;

          return {
            plans: remainingPlans,
            termGroups: {
              ...state.termGroups,
              [plan.term]: {
                ...group,
                representativePlanId: nextRepresentative,
                planIds: nextPlanIds,
                updatedAt: now(),
              },
            },
          };
        });
      },

      renamePlan: (planId, name) => {
        const trimmed = name.trim();
        if (!trimmed) return;
        set((state) => ({
          plans: updatePlan(state.plans, planId, (plan) => ({
            ...plan,
            name: trimmed,
            updatedAt: now(),
          })),
        }));
      },

      setRepresentativePlan: (term, planId) => {
        set((state) => {
          const group = state.termGroups[term];
          if (!group || !group.planIds.includes(planId)) return state;
          return {
            termGroups: {
              ...state.termGroups,
              [term]: {
                ...group,
                representativePlanId: planId,
                updatedAt: now(),
              },
            },
          };
        });
      },

      addOrMergeCandidate: (planId, input) => {
        const normalizedCourseCode = normalizeCourseCode(input.courseCode);
        if (!normalizedCourseCode) return null;

        let candidateId: string | null = null;
        set((state) => ({
          plans: updatePlan(state.plans, planId, (plan) => {
            const timestamp = now();
            const existing = plan.candidates.find((candidate) => candidate.normalizedCourseCode === normalizedCourseCode);
            if (existing) {
              candidateId = existing.id;
              return {
                ...plan,
                candidates: plan.candidates.map((candidate) =>
                  candidate.id === existing.id
                    ? {
                        ...candidate,
                        courseCode: candidate.courseCode || normalizedCourseCode,
                        title: candidate.title ?? input.title,
                        credits: candidate.credits ?? input.credits,
                        reasons: mergeReasons(candidate.reasons, input.reasons),
                        updatedAt: timestamp,
                      }
                    : candidate,
                ),
                updatedAt: timestamp,
              };
            }

            const nextCandidate: TimetableCourseCandidate = {
              id: createId('candidate'),
              courseCode: normalizedCourseCode,
              normalizedCourseCode,
              title: input.title,
              credits: input.credits,
              reasons: input.reasons,
              createdAt: timestamp,
              updatedAt: timestamp,
            };
            candidateId = nextCandidate.id;

            return {
              ...plan,
              candidates: [...plan.candidates, nextCandidate],
              updatedAt: timestamp,
            };
          }),
        }));

        return candidateId;
      },

      removeCandidate: (planId, candidateId) => {
        set((state) => ({
          plans: updatePlan(state.plans, planId, (plan) => ({
            ...plan,
            candidates: plan.candidates.filter((candidate) => candidate.id !== candidateId),
            updatedAt: now(),
          })),
        }));
      },

      selectSectionForCandidate: (planId, candidateId, section) => {
        set((state) => ({
          plans: updatePlan(state.plans, planId, (plan) => {
            const timestamp = now();
            const usedColors = getUsedColors(plan.candidates);
            return {
              ...plan,
              candidates: plan.candidates.map((candidate) =>
                candidate.id === candidateId
                  ? {
                      ...candidate,
                      title: candidate.title ?? section.title,
                      credits: candidate.credits ?? section.hours?.credits,
                      color: candidate.color ?? getNextColor(usedColors),
                      selectedSection: {
                        sectionKey: createSectionKey(section),
                        snapshot: sectionToSnapshot(section),
                        selectedAt: timestamp,
                      },
                      updatedAt: timestamp,
                    }
                  : candidate,
              ),
              updatedAt: timestamp,
            };
          }),
        }));
      },

      addSectionDirect: (planId, section) => {
        const candidateId = get().addOrMergeCandidate(planId, {
          courseCode: section.course_code,
          title: section.title,
          credits: section.hours?.credits,
          reasons: [{ kind: 'direct', label: '직접 추가' }],
        });
        if (!candidateId) return null;
        get().selectSectionForCandidate(planId, candidateId, section);
        return candidateId;
      },

      clearSelectedSectionByKey: (planId, sectionKey) => {
        set((state) => ({
          plans: updatePlan(state.plans, planId, (plan) => ({
            ...plan,
            candidates: plan.candidates.map((candidate) =>
              candidate.selectedSection?.sectionKey === sectionKey
                ? {
                    ...candidate,
                    selectedSection: undefined,
                    updatedAt: now(),
                  }
                : candidate,
            ),
            updatedAt: now(),
          })),
        }));
      },

      addPreferredFreeTime: (planId, freeTime) => {
        set((state) => ({
          plans: updatePlan(state.plans, planId, (plan) => ({
            ...plan,
            preferredFreeTimes: [
              ...plan.preferredFreeTimes,
              {
                ...freeTime,
                id: createId('free'),
              },
            ],
            updatedAt: now(),
          })),
        }));
      },

      removePreferredFreeTime: (planId, freeTimeId) => {
        set((state) => ({
          plans: updatePlan(state.plans, planId, (plan) => ({
            ...plan,
            preferredFreeTimes: plan.preferredFreeTimes.filter((freeTime) => freeTime.id !== freeTimeId),
            updatedAt: now(),
          })),
        }));
      },
    }),
    {
      name: STORAGE_KEY,
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        termGroups: state.termGroups,
        plans: state.plans,
      }),
    },
  ),
);
