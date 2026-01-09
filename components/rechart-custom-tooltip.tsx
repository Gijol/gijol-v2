import React from 'react';

export default function CustomTooltip({ active, payload, label }: any) {
  if (!active || !payload) return null;
  return (
    <div className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-gray-800 p-3 rounded-md shadow-sm">
      <p className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">{label}</p>
      <p className="text-base font-bold text-gray-900 dark:text-white">{payload[0].value} 학점</p>
    </div>
  );
}
