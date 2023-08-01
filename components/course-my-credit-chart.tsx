import {
  Bar,
  BarChart,
  CartesianGrid,
  LabelList,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import React from 'react';

export default function CourseMyCreditChart({
  dataForTable,
}: {
  dataForTable: { name: string; 수강학점: number | undefined }[];
}) {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart width={300} height={100} data={dataForTable}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis
          dataKey="name"
          padding={{ left: 20 }}
          fontSize={12}
          tick={{ width: 30 }}
          tickSize={8}
          interval={1}
        />
        <YAxis dataKey="수강학점" />
        <Tooltip />
        <Bar type="monotone" dataKey="수강학점" fill="#4593fc">
          <LabelList dataKey="수강학점" position="top" />
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}
