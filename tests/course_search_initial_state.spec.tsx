import { act, cleanup, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import CourseSearchPage from '../pages/dashboard/course/search';
import { useGraduationStore } from '../lib/stores/useGraduationStore';

const emptyDiscoveryPage = {
  content: [],
  page: 1,
  pageSize: 24,
  totalElements: 0,
  totalPages: 0,
  facets: { departments: [], terms: ['2026-2'] },
};

describe('course search initial discovery state', () => {
  const originalFetch = global.fetch;

  afterEach(() => {
    cleanup();
    act(() => {
      useGraduationStore.setState({ gradStatus: null, takenCourses: [], isRegeneratingOutcome: false });
    });
    global.fetch = originalFetch;
  });

  it('shows useful discovery content and loading placeholders immediately', () => {
    global.fetch = jest.fn(() => new Promise(() => undefined)) as unknown as typeof fetch;

    render(<CourseSearchPage />);

    expect(screen.getByRole('heading', { name: '어떤 강의를 찾고 있나요?' })).toBeInTheDocument();
    expect(screen.getByRole('status')).toHaveTextContent('강의 목록을 불러오는 중…');
    expect(screen.getByRole('button', { name: /전공 강의/ })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /실습 과목/ })).toBeInTheDocument();
  });

  it('keeps initial exploration distinct from an empty filtered result', async () => {
    const user = userEvent.setup();
    const fetchMock = jest.fn(async () => ({
      ok: true,
      json: async () => emptyDiscoveryPage,
    }));
    global.fetch = fetchMock as unknown as typeof fetch;

    render(<CourseSearchPage />);

    await screen.findByText('2026 2학기 개설');
    expect(screen.queryByText('검색 결과가 없습니다')).not.toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: /실습 과목/ }));

    await waitFor(() => {
      const requestedUrls = fetchMock.mock.calls as unknown as Array<[RequestInfo | URL]>;
      expect(requestedUrls.some(([url]) => String(url).includes('labOnly=true'))).toBe(true);
    });
  });

  it('uses the dashboard recommendation result for the personalized preset', async () => {
    const user = userEvent.setup();
    const fetchMock = jest.fn(async () => ({
      ok: true,
      json: async () => emptyDiscoveryPage,
    }));
    global.fetch = fetchMock as unknown as typeof fetch;
    useGraduationStore.setState({
      gradStatus: {
        recommendations: [],
        allRecommendations: [
          {
            courseCode: 'GS1212',
            courseName: '일반물리학 및 연습 II',
            credit: 3,
            reason: '기초과학 전체 이수학점',
            categoryKey: 'scienceBasic',
          },
          {
            courseCode: 'HS2502',
            courseName: '인문사회 선택',
            credit: 3,
            reason: '인문사회 전체 이수학점',
            categoryKey: 'humanities',
          },
        ],
      } as unknown as NonNullable<ReturnType<typeof useGraduationStore.getState>['gradStatus']>,
      isRegeneratingOutcome: false,
    });

    render(<CourseSearchPage />);

    await user.click(await screen.findByRole('button', { name: /내 부족 영역 과목/ }));

    await waitFor(() => {
      const requestedUrls = (fetchMock.mock.calls as unknown as Array<[RequestInfo | URL]>).map(([url]) => String(url));
      expect(
        requestedUrls.some(
          (url) =>
            url.includes('courseCode=GS1212') &&
            url.includes('courseCode=HS2502') &&
            !url.includes('feature=recommendation'),
        ),
      ).toBe(true);
    });
    expect(screen.getByText('내 부족 영역 과목', { selector: '[class*="bg-blue-50"]' })).toBeInTheDocument();
  });
});
