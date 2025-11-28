// pages/graduation/parse.tsx
import React, { useState, useEffect } from 'react';
import { Paper, Text, Group, Button } from '@mantine/core';
import { useRouter } from 'next/router';

import {
  gradStatusFetchFn,
  inferEntryYear,
  toTakenCourses,
} from '@utils/graduation/grad-status-helper';
import type { EditableCourseRow } from '@lib/types/graduation-editable';
import { v4 as uuid } from 'uuid';
import { useGraduationStore } from '../../../lib/stores/useGraduationStore';
import {
  applyEditableRowsToUserStatus,
  toEditableRows,
} from '@utils/graduation/parse-to-editable-rows';
import { ParsedCourseEditableTable } from '@components/graduation/parse-course-editable-table';
import { GradUploadPanel } from '@components/graduation/upload-panel';

export default function GraduationParsePage() {
  const router = useRouter();
  const { parsed, setFromParsed } = useGraduationStore();
  const [rows, setRows] = useState<EditableCourseRow[]>([]);
  const [saving, setSaving] = useState(false);

  // parsed가 바뀌면 editable rows 초기화
  useEffect(() => {
    if (parsed) {
      setRows(toEditableRows(parsed));
    } else {
      setRows([]);
    }
  }, [parsed]);

  const handleChangeRow = (id: string, patch: Partial<EditableCourseRow>) => {
    setRows((prev) => prev.map((r) => (r.id === id ? { ...r, ...patch } : r)));
  };

  const handleAddRow = () => {
    setRows((prev) => [
      ...prev,
      {
        id: uuid(),
        year: '',
        semester: '',
        courseType: '',
        courseCode: '',
        courseName: '',
        credit: '',
        grade: '',
      },
    ]);
  };

  const handleRemoveRow = (id: string) => {
    setRows((prev) => prev.filter((r) => r.id !== id));
  };

  const handleApplyAndGo = async () => {
    if (!parsed) return;
    setSaving(true);

    try {
      const updated = applyEditableRowsToUserStatus(parsed, rows);
      const entryYear = inferEntryYear(updated);
      const userMajor = (updated as any).major || (updated as any).department || undefined;
      const takenCourses = toTakenCourses(updated);

      const payload = {
        entryYear: entryYear ?? new Date().getFullYear(),
        takenCourses,
        userMajor,
        userMinors: [],
      };

      const grad = await gradStatusFetchFn(payload);

      setFromParsed({
        parsed: updated,
        takenCourses,
        gradStatus: grad,
      });

      router.push('/dashboard/graduation');
    } finally {
      setSaving(false);
    }
  };

  return (
    <GradUploadPanel title="졸업요건 파서 · 파싱 결과 확인 및 수정">
      {({ parsed }) => {
        if (!parsed) {
          return (
            <Text c="dimmed">
              아직 파싱된 데이터가 없습니다. 파일을 업로드하고 &quot;파싱 및 졸업요건 계산&quot;을
              눌러 주세요.
            </Text>
          );
        }

        return (
          <>
            <Text size="sm" c="dimmed" mb="xs">
              아래에서 파싱된 수강 내역을 확인하고, 필요하다면 직접 수정하거나 행을 추가/삭제할 수
              있습니다.
            </Text>

            <Paper withBorder radius="md" p="md">
              <ParsedCourseEditableTable
                rows={rows}
                onChangeRow={handleChangeRow}
                onAddRow={handleAddRow}
                onRemoveRow={handleRemoveRow}
              />
            </Paper>

            <Group position="right" mt="md" mb={40}>
              <Button onClick={handleApplyAndGo} loading={saving} color="teal">
                수정 내용 적용 & 졸업요건 페이지로 이동
              </Button>
            </Group>
          </>
        );
      }}
    </GradUploadPanel>
  );
}
