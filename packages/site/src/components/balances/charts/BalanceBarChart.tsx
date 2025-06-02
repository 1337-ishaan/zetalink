import React from 'react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  Cell,
} from 'recharts';

import { PieData } from './BalancePie';

const BalanceBarChart = ({ data }: { data: PieData[] }) => {
  const COLORS = [
    '#0088FE',
    '#00C49F',
    '#FFBB28',
    '#FF8042',
    '#AF19FF',
    '#F83F21',
    '#FFC300',
    '#C70039',
    '#900C3F',
    '#581845',
  ];

  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart
        layout="vertical"
        data={data}
        margin={{ top: 20, right: 30, left: 100, bottom: 20 }}
      >
        <XAxis
          type="number"
          tick={{ fill: '#fff' }}
          axisLine={{ stroke: '#555' }}
        />
        <YAxis
          type="category"
          dataKey="label"
          tick={{ fill: '#fff' }}
          axisLine={{ stroke: '#555' }}
        />
        <Tooltip
          contentStyle={{
            backgroundColor: '#1a1a1a',
            border: 'none',
            borderRadius: '8px',
          }}
          itemStyle={{ color: '#fff' }}
          formatter={(value: number) => [`$${value.toFixed(2)}`, 'USD']}
        />
        <Legend
          layout="horizontal"
          align="center"
          verticalAlign="bottom"
          wrapperStyle={{ color: '#fff' }}
        />
        <Bar dataKey="usdPrice" barSize={20} isAnimationActive>
          {data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
};

export default BalanceBarChart;
