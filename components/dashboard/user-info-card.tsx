'use client';

import { IconUser, IconSchool, IconBook, IconCalendar } from '@tabler/icons-react';
import { Card, CardContent } from '@components/ui/card';
import { Badge } from '@components/ui/badge';
import { MAJOR_OPTIONS, MINOR_OPTIONS } from '@const/major-minor-options';

interface UserInfoCardProps {
  entryYear: number | null;
  userMajor: string;
  userMinors: string[];
  className?: string;
}

// value를 label로 변환하는 헬퍼
function getMajorLabel(value: string): string {
  return MAJOR_OPTIONS.find((opt) => opt.value === value)?.label || value || '미선택';
}

function getMinorLabels(values: string[]): string[] {
  return values.map((v) => MINOR_OPTIONS.find((opt) => opt.value === v)?.label || v);
}

export function UserInfoCard({ entryYear, userMajor, userMinors, className }: UserInfoCardProps) {
  const minorLabels = getMinorLabels(userMinors);

  return (
    <Card className={className}>
      <CardContent className="p-5">
        <div className="mb-4 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100">
            <IconUser size={20} className="text-blue-600" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-gray-900">내 정보</h3>
            <p className="text-xs text-gray-500">학적 정보</p>
          </div>
        </div>

        <div className="space-y-3">
          {/* 학번 */}
          <div className="flex items-center gap-2">
            <IconCalendar size={16} className="text-gray-400" />
            <span className="w-14 text-sm text-gray-600">학번</span>
            <span className="text-sm font-medium text-gray-900">{entryYear ? `${entryYear}학번` : '미입력'}</span>
          </div>

          {/* 전공 */}
          <div className="flex items-center gap-2">
            <IconBook size={16} className="text-gray-400" />
            <span className="w-14 text-sm text-gray-600">전공</span>
            <Badge variant="outline" className="border-blue-200 bg-blue-50 text-blue-700">
              {getMajorLabel(userMajor)}
            </Badge>
          </div>

          {/* 부전공 */}
          <div className="flex items-start gap-2">
            <IconSchool size={16} className="mt-0.5 text-gray-400" />
            <span className="w-14 text-sm text-gray-600">부전공</span>
            <div className="flex flex-wrap gap-1">
              {minorLabels.length > 0 ? (
                minorLabels.map((label) => (
                  <Badge key={label} variant="secondary" className="text-xs">
                    {label}
                  </Badge>
                ))
              ) : (
                <span className="text-sm text-gray-400">없음</span>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
