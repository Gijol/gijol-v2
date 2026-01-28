import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware'; // Using createJSONStorage for potential SSR issues
import { TimetableSpan, SelectedSection, SectionOffering } from '@/lib/types/timetable';
import { sectionToSpans, getNextColor } from '@/features/timetable/selectors';
import { checkConflict } from '@/features/timetable/conflict';

interface SavedTimetable {
  selectedSections: SelectedSection[];
  scheduledSpans: TimetableSpan[];
  savedAt: number;
}

interface TimetableState {
  // Persisted Data
  selectedSections: SelectedSection[];
  scheduledSpans: TimetableSpan[];
  savedTimetables: Record<string, SavedTimetable>;

  // Ephemeral Data
  previewSpans: TimetableSpan[]; // For hover preview, not persisted

  // Actions
  addSection: (section: SectionOffering) => boolean; // returns success
  removeSection: (sectionId: string) => void;
  setPreview: (section: SectionOffering | null) => void;
  clearPreview: () => void;
  reset: () => void;

  // Saved Timetables Actions
  saveTimetable: (name: string) => void;
  loadTimetable: (name: string) => void;
  deleteTimetable: (name: string) => void;
  getSavedTimetablesList: () => Array<{ name: string; savedAt: number }>;
}

export const useTimetableStore = create<TimetableState>()(
  persist(
    (set, get) => ({
      selectedSections: [],
      scheduledSpans: [],
      savedTimetables: {},
      previewSpans: [],

      addSection: (section) => {
        const { selectedSections, scheduledSpans } = get();
        const sectionId = `${section.course_code}-${section.section}`;

        // Check already added
        if (selectedSections.some((s) => s.id === sectionId)) {
          console.warn('Section already added');
          return false;
        }

        // Check conflict
        if (checkConflict(section, scheduledSpans)) {
          console.warn('Conflict detected');
          return false;
        }

        // Assign color
        const usedColors = selectedSections.map((s) => s.color);
        const color = getNextColor(usedColors);

        const newSelected: SelectedSection = {
          id: sectionId,
          section,
          color,
        };

        const newSpans = sectionToSpans(newSelected, 'scheduled');

        set({
          selectedSections: [...selectedSections, newSelected],
          scheduledSpans: [...scheduledSpans, ...newSpans],
        });

        return true;
      },

      removeSection: (sectionId) => {
        set((state) => ({
          selectedSections: state.selectedSections.filter((s) => s.id !== sectionId),
          scheduledSpans: state.scheduledSpans.filter((span) => span.sectionId !== sectionId),
        }));
      },

      setPreview: (section) => {
        if (!section) {
          set({ previewSpans: [] });
          return;
        }

        // For preview, we don't need a real color (will use semi-transparent ghost style in UI),
        // but we can pass one if needed. Or check conflict here to tint it.
        const { scheduledSpans } = get();
        const isConflict = checkConflict(section, scheduledSpans);

        // We can encode conflict status in the span or handle in UI.
        // Let's create a temporary SelectedSection struct just to use helper
        const tempSelected: SelectedSection = {
          id: 'preview',
          section,
          color: isConflict ? 'rgba(239, 68, 68, 0.5)' : 'rgba(100, 116, 139, 0.5)', // Red if conflict, Slate if not
        };

        const spans = sectionToSpans(tempSelected, 'preview');
        // If conflict, we might want to flag spans.
        // For now, let's just put them in previewSpans. UI will handle overlap visuals if desired.
        // Actually, let's explicitly set the 'color' on spans to be used by the UI.

        spans.forEach((s) => (s.color = tempSelected.color));

        set({ previewSpans: spans });
      },

      clearPreview: () => {
        set({ previewSpans: [] });
      },

      reset: () => {
        set({ selectedSections: [], scheduledSpans: [], previewSpans: [] });
      },

      saveTimetable: (name) => {
        const { selectedSections, scheduledSpans, savedTimetables } = get();

        if (!name.trim()) {
          console.warn('Timetable name cannot be empty');
          return;
        }

        const newSavedTimetable: SavedTimetable = {
          selectedSections: [...selectedSections],
          scheduledSpans: [...scheduledSpans],
          savedAt: Date.now(),
        };

        set({
          savedTimetables: {
            ...savedTimetables,
            [name]: newSavedTimetable,
          },
        });
      },

      loadTimetable: (name) => {
        const { savedTimetables } = get();
        const timetable = savedTimetables[name];

        if (!timetable) {
          console.warn(`Timetable "${name}" not found`);
          return;
        }

        set({
          selectedSections: [...timetable.selectedSections],
          scheduledSpans: [...timetable.scheduledSpans],
          previewSpans: [],
        });
      },

      deleteTimetable: (name) => {
        const { savedTimetables } = get();
        const { [name]: _, ...remainingTimetables } = savedTimetables;

        set({
          savedTimetables: remainingTimetables,
        });
      },

      getSavedTimetablesList: () => {
        const { savedTimetables } = get();
        return Object.entries(savedTimetables)
          .map(([name, data]) => ({
            name,
            savedAt: data.savedAt,
          }))
          .sort((a, b) => b.savedAt - a.savedAt);
      },
    }),
    {
      name: 'timetable-storage',
      storage: createJSONStorage(() => localStorage),
      // only persist selectedSections, scheduledSpans, and savedTimetables
      partialize: (state) => ({
        selectedSections: state.selectedSections,
        scheduledSpans: state.scheduledSpans,
        savedTimetables: state.savedTimetables,
      }),
    },
  ),
);
