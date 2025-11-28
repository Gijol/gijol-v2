import React from 'react';
import {
  Table,
  ScrollArea,
  NumberInput,
  TextInput,
  Select,
  Group,
  ActionIcon,
} from '@mantine/core';
import { IconTrash, IconPlus } from '@tabler/icons-react';
import type { EditableCourseRow } from '@lib/types/graduation-editable';

type Props = {
  rows: EditableCourseRow[];
  onChangeRow: (id: string, patch: Partial<EditableCourseRow>) => void;
  onAddRow: () => void;
  onRemoveRow: (id: string) => void;
};

const SEMESTER_OPTIONS = [
  { value: '1학기', label: '1학기' },
  { value: '2학기', label: '2학기' },
  { value: '여름학기', label: '여름학기' },
  { value: '겨울학기', label: '겨울학기' },
];

export function ParsedCourseEditableTable({ rows, onChangeRow, onAddRow, onRemoveRow }: Props) {
  return (
    <>
      <ScrollArea h={420}>
        <Table striped highlightOnHover verticalSpacing="xs" withBorder>
          <thead>
            <tr>
              <th style={{ width: 100 }}>연도</th>
              <th style={{ width: 110 }}>학기</th>
              <th style={{ width: 120 }}>구분</th>
              <th style={{ width: 130 }}>과목코드</th>
              <th>과목명</th>
              <th style={{ width: 80 }}>학점</th>
              <th style={{ width: 90 }}>성적</th>
              <th style={{ width: 60 }}>삭제</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.id}>
                <td>
                  <NumberInput
                    hideControls
                    value={row.year}
                    onChange={(v) => onChangeRow(row.id, { year: Number(v) || '' })}
                    placeholder="연도"
                    min={2000}
                    max={2100}
                    size="xs"
                  />
                </td>
                <td>
                  <Select
                    data={SEMESTER_OPTIONS}
                    value={row.semester}
                    onChange={(v) => onChangeRow(row.id, { semester: v || '' })}
                    placeholder="학기"
                    size="xs"
                  />
                </td>
                <td>
                  <TextInput
                    value={row.courseType}
                    onChange={(e) => onChangeRow(row.id, { courseType: e.currentTarget.value })}
                    placeholder="전공/교양 등"
                    size="xs"
                  />
                </td>
                <td>
                  <TextInput
                    value={row.courseCode}
                    onChange={(e) => onChangeRow(row.id, { courseCode: e.currentTarget.value })}
                    placeholder="예: CS101"
                    size="xs"
                  />
                </td>
                <td>
                  <TextInput
                    value={row.courseName}
                    onChange={(e) => onChangeRow(row.id, { courseName: e.currentTarget.value })}
                    placeholder="과목명"
                    size="xs"
                  />
                </td>
                <td>
                  <NumberInput
                    hideControls
                    value={row.credit}
                    onChange={(v) => onChangeRow(row.id, { credit: Number(v) || '' })}
                    placeholder="학점"
                    min={0}
                    max={10}
                    size="xs"
                  />
                </td>
                <td>
                  <TextInput
                    value={row.grade ?? ''}
                    onChange={(e) => onChangeRow(row.id, { grade: e.currentTarget.value })}
                    placeholder="A+, B0 등"
                    size="xs"
                  />
                </td>
                <td>
                  <Group position="center">
                    <ActionIcon color="red" variant="subtle" onClick={() => onRemoveRow(row.id)}>
                      <IconTrash size={16} />
                    </ActionIcon>
                  </Group>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      </ScrollArea>

      <Group position="right" mt="xs">
        <ActionIcon onClick={onAddRow} variant="light">
          <IconPlus size={18} />
        </ActionIcon>
      </Group>
    </>
  );
}
