import {
  CartesianGrid,
  LabelList,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import React from 'react';

export default function CourseMyGradeChart({
  dataForLineChart,
}: {
  dataForLineChart: { period: string; 학점: number }[];
}) {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <LineChart width={300} height={100} data={dataForLineChart}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis
          dataKey="period"
          padding={{ left: 40, right: 40 }}
          fontSize={12}
          tick={{ width: 30 }}
          tickSize={8}
          interval={0}
        />
        <YAxis dataKey="학점" domain={[2.0, 4.5]} />
        <Tooltip />
        <Line type="monotone" dataKey="학점" stroke="#8884d8" dot={{ r: 6 }}>
          <LabelList dataKey="학점" position="top" />
        </Line>
      </LineChart>
    </ResponsiveContainer>
  );
}
