import type { SectionOffering, SelectedSection, TimetableSpan } from '../lib/types/timetable';

jest.mock('uuid', () => ({ v4: () => 'test-uuid' }));

import { createSectionBrowser } from '../features/timetable/section-browsing';
import {
  createLegacySectionBrowsingAdapter,
  createPlanSectionBrowsingAdapter,
  projectSectionBrowsingItems,
} from '../features/timetable/section-browsing-adapters';
import {
  createTimetableSectionCatalog,
  type TimetableSectionSource,
} from '../features/timetable/server-section-catalog';
import { fetchTimetableSectionPage } from '../features/timetable/hooks/useTimetableSectionBrowser';

function section(index: number, overrides: Partial<SectionOffering> = {}): SectionOffering {
  return {
    no: index,
    department: index % 2 === 0 ? 'AI대학' : '기초교육학부',
    course_code: `TEST${String(index).padStart(4, '0')}`,
    section: '01',
    title: `테스트 과목 ${index}`,
    category: '선택',
    program: '학사',
    hours: { lecture_hours: 3, lab_hours: 0, credits: 3 },
    meetings: [{ day: 'MON', start: '09:00', end: '10:30' }],
    capacity: 30,
    instructors: [{ name: index === 7 ? '김검색' : `교수 ${index}`, staff_id: String(index) }],
    ...overrides,
  };
}

describe('timetable section browsing module', () => {
  const fixture = Array.from({ length: 65 }, (_, index) => section(index));

  it('owns title, course-code, instructor, and department search semantics', () => {
    const browser = createSectionBrowser([...fixture, section(100, { department: '' })]);

    expect(browser.browse({ query: 'TEST0007' }).content[0].no).toBe(7);
    expect(browser.browse({ query: '김검색' }).content[0].no).toBe(7);
    expect(browser.browse({ courseCodes: [' test0007 '] }).content.map((item) => item.no)).toEqual([7]);
    expect(browser.browse({ departments: ['AI대학'] }).content.every((item) => item.department === 'AI대학')).toBe(
      true,
    );
    expect(
      browser
        .browse({ departments: ['AI대학', '기초교육학부'], pageSize: 100 })
        .content.every((item) => ['AI대학', '기초교육학부'].includes(item.department)),
    ).toBe(true);
    expect(browser.browse().departments).toHaveLength(2);
    expect(browser.browse().departments).toEqual(expect.arrayContaining(['AI대학', '기초교육학부']));
    expect(browser.browse().departments).not.toContain('');
  });

  it('returns stable non-overlapping progressive pages', () => {
    const browser = createSectionBrowser(fixture);
    const first = browser.browse({ page: 1 });
    const second = browser.browse({ page: 2 });

    expect(first.content).toHaveLength(30);
    expect(second.content).toHaveLength(30);
    expect(second.content.some((item) => first.content.some((firstItem) => firstItem.no === item.no))).toBe(false);
    expect(first.totalElements).toBe(65);
    expect(first.totalPages).toBe(3);
  });

  it('defaults to undergraduate sections and exposes accurate program counts', () => {
    const graduateSections = [
      section(100, { program: '석사', department: 'AI대학원' }),
      section(101, { program: '박사', department: 'AI대학원' }),
      section(102, { program: '대학원', department: 'AI대학원' }),
    ];
    const browser = createSectionBrowser([...fixture, ...graduateSections]);
    const undergraduate = browser.browse();
    const graduate = browser.browse({ programLevel: 'graduate' });

    expect(undergraduate.totalElements).toBe(65);
    expect(undergraduate.content.every((item) => item.program === '학사')).toBe(true);
    expect(undergraduate.undergraduateSectionCount).toBe(65);
    expect(undergraduate.graduateSectionCount).toBe(3);
    expect(undergraduate.departments).not.toContain('AI대학원');
    expect(graduate.totalElements).toBe(3);
    expect(graduate.departments).toEqual(['AI대학원']);
    expect(graduate.content.map((item) => item.program)).toEqual(['석사', '박사', '대학원']);
  });

  it('gives plan and legacy adapters identical selection and conflict projections', () => {
    const selected = section(1);
    const conflicting = section(2);
    const selectedKey = `${selected.course_code}-${selected.section}`;
    const scheduledSpans: TimetableSpan[] = [
      {
        nanoid: 'span',
        week_day: 1,
        start_time: '09:00',
        end_time: '10:30',
        type: 'scheduled',
        courseCode: selected.course_code,
        sectionId: selectedKey,
      },
    ];
    const legacySelected: SelectedSection[] = [{ id: 'legacy-raw-id', section: selected, color: '#fff' }];
    const removedPlanKeys: string[] = [];
    const removedLegacyIds: string[] = [];
    const plan = createPlanSectionBrowsingAdapter({
      selectedSectionKeys: new Set([selectedKey]),
      scheduledSpans,
      add: jest.fn(),
      removeByKey: (key) => removedPlanKeys.push(key),
      preview: jest.fn(),
    });
    const legacy = createLegacySectionBrowsingAdapter({
      selectedSections: legacySelected,
      scheduledSpans,
      add: jest.fn(),
      removeByLegacyId: (id) => removedLegacyIds.push(id),
      preview: jest.fn(),
    });

    expect(
      projectSectionBrowsingItems([selected, conflicting], plan).map(({ isAdded, isConflict }) => ({
        isAdded,
        isConflict,
      })),
    ).toEqual(
      projectSectionBrowsingItems([selected, conflicting], legacy).map(({ isAdded, isConflict }) => ({
        isAdded,
        isConflict,
      })),
    );
    plan.remove(selected);
    legacy.remove(selected);
    expect(removedPlanKeys).toEqual([selectedKey]);
    expect(removedLegacyIds).toEqual(['legacy-raw-id']);
  });

  it('caches each term once behind the section-source adapter', async () => {
    const load = jest.fn(async () => fixture);
    const source: TimetableSectionSource = { load };
    const catalog = createTimetableSectionCatalog(source);

    await Promise.all([catalog.browse('2026-1'), catalog.browse('2026-1', { page: 2 })]);
    expect(load).toHaveBeenCalledTimes(1);
  });

  it('retries loading after a transient failure rather than caching a rejected promise', async () => {
    const load = jest.fn().mockRejectedValueOnce(new Error('temporary failure')).mockResolvedValue(fixture);
    const catalog = createTimetableSectionCatalog({ load });
    await expect(catalog.browse('2026-2')).rejects.toThrow('temporary failure');
    await expect(catalog.browse('2026-2')).resolves.toMatchObject({ totalElements: 65 });
    expect(load).toHaveBeenCalledTimes(2);
  });

  it('forwards AbortSignal to superseded browser requests', async () => {
    const originalFetch = global.fetch;
    const fetchMock = jest.fn(async (_input: RequestInfo | URL, init?: RequestInit) => ({
      ok: true,
      json: async () => ({
        content: [],
        page: 1,
        pageSize: 30,
        totalElements: 0,
        totalPages: 0,
        departments: [],
        undergraduateSectionCount: 0,
        graduateSectionCount: 0,
      }),
      signal: init?.signal,
    }));
    global.fetch = fetchMock as unknown as typeof fetch;
    const controller = new AbortController();

    await fetchTimetableSectionPage('2026-1', 'AI', ['AI대학', '기초교육학부'], 'undergraduate', 1, controller.signal);
    expect(fetchMock.mock.calls[0][1]?.signal).toBe(controller.signal);
    expect(String(fetchMock.mock.calls[0][0])).toContain('level=undergraduate');
    expect(String(fetchMock.mock.calls[0][0])).toContain('department=AI%EB%8C%80%ED%95%99');
    expect(String(fetchMock.mock.calls[0][0])).toContain(
      'department=%EA%B8%B0%EC%B4%88%EA%B5%90%EC%9C%A1%ED%95%99%EB%B6%80',
    );
    global.fetch = originalFetch;
  });
});
