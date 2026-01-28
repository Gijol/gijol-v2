// features/roadmap/PresetsSidebar.tsx
// Sidebar component with collapsible accordion structure for roadmap presets
import React, { useEffect, useState, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';

import { Map, ChevronRight, ChevronDown, Loader2, Plus, PanelLeftClose, PanelLeftOpen } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { PresetInfo } from '@/pages/api/roadmap/presets';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@components/ui/collapsible';

const SCROLL_POSITION_KEY = 'roadmap-preset-sidebar-scroll';

// Define the ordered hierarchy structure
const MAJOR_ORDER = [
  '전기전자컴퓨터공학부',
  '신소재공학부',
  '기계공학부',
  '지구·환경공학부',
  '생명과학부',
  '물리·광과학과',
  '화학과',
  '기초교육학부',
  '의생명공학과',
  '융합기술대학',
  'AI융합학과',
  'SW/AI 연계교육',
];

// Slug to display name mapping for tracks
const TRACK_DISPLAY_NAMES: Record<string, string> = {
  // EECS
  EECS_NETWORK: '통신/네트워크 분야',
  EECS_AI: 'AI 분야',
  EECS_CORE: 'CS 코어 분야',
  EECS_SEMICONDUCTOR: '반도체/광 분야',
  'EECS_SIGNAL_PROCESSING,json': '신호처리 분야',
  // Materials
  MATERIAL_ELECTRONICS: '전자재료 분야',
  MATERIAL_POLYMER: '고분자재료 분야',
  // Mechanical
  MECHANICAL_ENGINEERING: '기계공학부 기본 이수체계',
  MECHANICAL_ENGINEERING_ADVANCED: '전공선택(심화) 과목 선후수 관계',
  // Earth
  EARTH_ENGINEERING: '지구환경공학부 이수체계',
  // Bioscience
  BIOSCIENCE_ODD_YEAR: '홀수년 입학생 이수체계',
  BIOSCIENCE_EVEN_YEAR: '짝수년 입학생 이수체계',
  BIOSCIENCE_RESEARCH: '연구분야별 이수체계',
  // Physics
  PHYSICAL_OPTICS: '물리광과학과 이수체계',
  // Chemistry
  CHEMISTRY_PHYSICAL_ANALYTICS: '물리/분석화학 분야',
  CHEMISTRY_ORGANIC_INORGANIC: '유기/무기화학 분야',
  CHEMISTRY_BIO: '생명화학 분야',
  // Basic Education (minors)
  MATH_MINOR: '수학 부전공',
  BASIC_CREATIVE_DESIGN: '융합 부전공',
  BASIC_ECONOMICS: '경제·경영 부전공',
  BASIC_SCIENCE_AI: '과학기술·AI 부전공',
  BASIC_FUTURE: '미래형 부전공',
  BASIC_LITERATURE_HISTORY: '문학과 역사',
  HUMANITIES_LITERATURE_HISTORY: '문학과 역사',
  HUMANITIES_LAW_POLITICS: '법과 정치',
  // Biomedical
  BIOMEDICAL_ENGINEERING: '의생명공학과 이수체계',
  // Convergence Tech
  CONVERGENCE_ENERGY: '융합기술대학 공통 이수체계',
  CONVERGENCE_MECHANICAL: '기계 부전공',
  CONVERGENCE_MATERIALS: '재료 부전공',
  // AI Convergence
  AI_CONVERGENCE: 'AI 융합 부전공',
  // SW/AI
  SW_AI_LINKED: '교과 로드맵',
};

// Map presets to their canonical major categories
function getCanonicalMajor(preset: PresetInfo): string {
  const slug = preset.slug;

  if (slug.startsWith('EECS')) return '전기전자컴퓨터공학부';
  if (slug.startsWith('MATERIAL')) return '신소재공학부';
  if (slug.startsWith('MECHANICAL')) return '기계공학부';
  if (slug.startsWith('EARTH')) return '지구·환경공학부';
  if (slug.startsWith('BIOSCIENCE')) return '생명과학부';
  if (slug.startsWith('PHYSICAL') || slug === 'PHYSICAL_OPTICS') return '물리·광과학과';
  if (slug.startsWith('CHEMISTRY')) return '화학과';
  if (slug.startsWith('BASIC') || slug.startsWith('HUMANITIES') || slug === 'MATH_MINOR') return '기초교육학부';
  if (slug.startsWith('BIOMEDICAL')) return '의생명공학과';
  if (slug.startsWith('CONVERGENCE')) return '융합기술대학';
  if (slug === 'AI_CONVERGENCE') return 'AI융합학과';
  if (slug === 'SW_AI_LINKED') return 'SW/AI 연계교육';

  return preset.major || '기타';
}

interface PresetsSidebarProps {
  className?: string;
}

export function PresetsSidebar({ className }: PresetsSidebarProps) {
  const router = useRouter();
  const currentSlug = router.query.slug as string | undefined;
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const [presets, setPresets] = useState<PresetInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({});
  const [isCollapsed, setIsCollapsed] = useState(() => {
    // Load collapse state from localStorage
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('presets-sidebar-collapsed');
      return saved === 'true';
    }
    return false;
  });

  // Save collapse state to localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('presets-sidebar-collapsed', String(isCollapsed));
    }
  }, [isCollapsed]);

  useEffect(() => {
    fetch('/api/roadmap/presets')
      .then((res) => res.json())
      .then((data) => {
        setPresets(data);
        setLoading(false);

        // Auto-expand the section containing the current preset
        if (currentSlug) {
          const currentPreset = data.find((p: PresetInfo) => p.slug === currentSlug);
          if (currentPreset) {
            const majorKey = getCanonicalMajor(currentPreset);
            setOpenSections((prev) => ({ ...prev, [majorKey]: true }));
          }
        }
      })
      .catch((err) => {
        console.error('Failed to load presets:', err);
        setLoading(false);
      });
  }, [currentSlug]);

  // Restore scroll position after loading completes
  useEffect(() => {
    if (!loading && scrollContainerRef.current) {
      const savedPosition = sessionStorage.getItem(SCROLL_POSITION_KEY);
      if (savedPosition) {
        const viewport = scrollContainerRef.current.querySelector('[data-radix-scroll-area-viewport]');
        if (viewport) {
          viewport.scrollTop = parseInt(savedPosition, 10);
        }
      }
    }
  }, [loading]);

  const handlePresetClick = () => {
    if (scrollContainerRef.current) {
      const viewport = scrollContainerRef.current.querySelector('[data-radix-scroll-area-viewport]');
      if (viewport) {
        sessionStorage.setItem(SCROLL_POSITION_KEY, String(viewport.scrollTop));
      }
    }
  };

  const toggleSection = (major: string) => {
    setOpenSections((prev) => ({ ...prev, [major]: !prev[major] }));
  };

  // Group presets by canonical major
  const groupedPresets = presets.reduce(
    (acc, preset) => {
      const major = getCanonicalMajor(preset);
      if (!acc[major]) acc[major] = [];
      acc[major].push(preset);
      return acc;
    },
    {} as Record<string, PresetInfo[]>,
  );

  // Sort groups by defined order
  const sortedGroups = MAJOR_ORDER.filter((major) => groupedPresets[major] && groupedPresets[major].length > 0).map(
    (major) => ({ major, presets: groupedPresets[major] }),
  );

  // Add any remaining groups not in the order
  Object.keys(groupedPresets).forEach((major) => {
    if (!MAJOR_ORDER.includes(major)) {
      sortedGroups.push({ major, presets: groupedPresets[major] });
    }
  });

  // Collapsed state UI
  if (isCollapsed) {
    return (
      <div
        className={cn(
          'flex h-full w-12 flex-col items-center gap-4 border-r bg-white py-4 transition-all duration-300 ease-in-out',
          className,
        )}
      >
        <Button variant="ghost" size="icon" onClick={() => setIsCollapsed(false)} className="h-8 w-8">
          <PanelLeftOpen className="h-5 w-5 text-gray-500" />
        </Button>
        <div
          className="font-mono text-xs tracking-widest text-slate-600 uppercase"
          style={{ writingMode: 'vertical-lr' }}
        >
          COURSE PRESETS
        </div>
      </div>
    );
  }

  return (
    <div
      className={cn(
        'flex h-full w-[280px] flex-col border-r bg-white transition-all duration-300 ease-in-out',
        className,
      )}
    >
      {/* Header */}
      <div className="flex items-center justify-between border-b bg-slate-50/50 p-3">
        <div className="flex items-center gap-2">
          <Map className="h-4 w-4 text-blue-500" />
          <h2 className="text-sm font-semibold">로드맵 프리셋</h2>
        </div>
        <Button variant="ghost" size="icon" onClick={() => setIsCollapsed(true)} className="h-7 w-7">
          <PanelLeftClose className="h-4 w-4 text-gray-500" />
        </Button>
      </div>

      {/* Create Button */}
      <div className="border-b p-2">
        <Link href="/dashboard/roadmap/create" className="block">
          <Button
            variant="outline"
            className="h-10 w-full border-dashed border-blue-200 bg-blue-50/50 text-blue-700 hover:border-blue-300 hover:bg-blue-100"
          >
            <Plus className="mr-2 h-4 w-4" />
            나만의 로드맵 만들기
          </Button>
        </Link>
      </div>

      {/* Presets List with Accordion */}
      <div ref={scrollContainerRef} className="flex-1 overflow-hidden">
        <ScrollArea className="h-full">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-5 w-5 animate-spin text-gray-400" />
            </div>
          ) : (
            <div className="p-2">
              {sortedGroups.map(({ major, presets: majorPresets }) => {
                const isOpen = openSections[major] ?? false;
                const hasActivePreset = majorPresets.some((p) => p.slug === currentSlug);

                return (
                  <Collapsible key={major} open={isOpen} onOpenChange={() => toggleSection(major)} className="mb-1">
                    <CollapsibleTrigger className="w-full">
                      <div
                        className={cn(
                          'flex items-center justify-between rounded-md px-2 py-2 text-left text-sm font-medium transition-colors hover:bg-slate-50',
                          hasActivePreset && 'text-blue-700',
                        )}
                      >
                        <span className="truncate">{major}</span>
                        <div className="flex items-center gap-1">
                          <span className="text-xs text-gray-400">{majorPresets.length}</span>
                          {isOpen ? (
                            <ChevronDown className="h-4 w-4 text-gray-400" />
                          ) : (
                            <ChevronRight className="h-4 w-4 text-gray-400" />
                          )}
                        </div>
                      </div>
                    </CollapsibleTrigger>
                    <CollapsibleContent>
                      <div className="ml-2 space-y-0.5 border-l border-slate-200 pl-2">
                        {majorPresets.map((preset) => {
                          const isActive = currentSlug === preset.slug;
                          const displayName =
                            TRACK_DISPLAY_NAMES[preset.slug] || preset.track || preset.name.replace(/_/g, ' ');

                          return (
                            <Link
                              key={preset.slug}
                              href={`/dashboard/roadmap/${preset.slug}`}
                              className="block"
                              onClick={handlePresetClick}
                            >
                              <div
                                className={cn(
                                  'rounded-md px-2 py-1.5 text-xs transition-colors',
                                  isActive
                                    ? 'bg-blue-50 font-medium text-blue-700'
                                    : 'text-gray-600 hover:bg-slate-50 hover:text-gray-900',
                                )}
                              >
                                {displayName}
                              </div>
                            </Link>
                          );
                        })}
                      </div>
                    </CollapsibleContent>
                  </Collapsible>
                );
              })}
            </div>
          )}
        </ScrollArea>
      </div>
    </div>
  );
}
