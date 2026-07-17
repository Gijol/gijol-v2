import { render, screen, waitFor } from '@testing-library/react';
import { useRouter } from 'next/router';
import { SectionBrowserSidebar } from '../features/timetable/components/SectionBrowserSidebar';
import { useTimetableSectionBrowser } from '../features/timetable/hooks/useTimetableSectionBrowser';

jest.mock('uuid', () => ({ v4: () => 'test-uuid' }));
jest.mock('next/router', () => ({ useRouter: jest.fn() }));
jest.mock('../features/timetable/hooks/useTimetableSectionBrowser', () => ({
  useTimetableSectionBrowser: jest.fn(),
}));

const mockUseRouter = jest.mocked(useRouter);
const mockUseTimetableSectionBrowser = jest.mocked(useTimetableSectionBrowser);

const interaction = {
  selectedSectionKeys: new Set<string>(),
  scheduledSpans: [],
  add: jest.fn(),
  remove: jest.fn(),
  preview: jest.fn(),
};

function browserResult(departments: string[], isLoading = false) {
  return {
    sections: [],
    departments,
    hasLoadedDepartmentOptions: !isLoading,
    totalElements: 0,
    undergraduateSectionCount: 12,
    graduateSectionCount: 3,
    isLoading,
    isFetchingNextPage: false,
    hasNextPage: false,
    loadMore: jest.fn(),
    refetch: jest.fn(),
    error: null,
  };
}

describe('SectionBrowserSidebar department filter', () => {
  beforeAll(() => {
    HTMLElement.prototype.scrollTo = jest.fn();
  });

  beforeEach(() => {
    mockUseRouter.mockReturnValue({
      isReady: true,
      pathname: '/dashboard/timetable',
      query: { department: 'AI대학' },
      replace: jest.fn().mockResolvedValue(true),
    } as unknown as ReturnType<typeof useRouter>);
    mockUseTimetableSectionBrowser.mockImplementation((_term, _query, department) =>
      department ? browserResult([], true) : browserResult(['AI대학', '기초교육학부']),
    );
  });

  it('keeps the selected department while its filtered result is loading', async () => {
    render(<SectionBrowserSidebar term="2026-2" interaction={interaction} />);

    await waitFor(() => {
      expect(screen.getByRole('button', { name: '학과 필터' })).toHaveTextContent('AI대학');
    });
    expect(mockUseTimetableSectionBrowser).toHaveBeenCalledWith('2026-2', '', 'AI대학', 'undergraduate');
  });
});
