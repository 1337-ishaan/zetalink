import Decimal from 'decimal.js';
import React, { useState } from 'react';
import {
  PieChart,
  Pie,
  Sector,
  ResponsiveContainer,
  Legend,
  Tooltip,
  Cell,
} from 'recharts';

// Define the structure of the pie segment data
export type PieData = {
  label: string; // Segment label
  value: number; // Segment value
  usdPrice?: number | null; // USD value for segment
};

// Props for the BalancePie component
type BalancePieProps = {
  data: PieData[]; // Array of pie data
};

// Props for the active shape rendering function
type RenderActiveShapeProps = {
  cx: number; // Center X coordinate
  cy: number; // Center Y coordinate
  midAngle: number; // Midpoint angle
  innerRadius: number; // Inner radius
  outerRadius: number; // Outer radius
  startAngle: number; // Starting angle
  endAngle: number; // Ending angle
  fill: string; // Fill color
  payload: PieData; // Data for the segment
  percent: number; // Percentage of the segment
  value: number; // Value of the segment
  stroke: string; // Stroke color for the segment
  strokeWidth: number; // Stroke width for the segment
};

// Function to render the active shape of the pie segment
const renderActiveShape = (props: RenderActiveShapeProps) => {
  const RADIAN = Math.PI / 180;
  const {
    cx,
    cy,
    midAngle,
    innerRadius,
    outerRadius,
    startAngle,
    endAngle,
    fill,
    payload,
    percent,
    value,
  } = props;

  // Calculate position for labels and lines
  const sin = Math.sin(-RADIAN * midAngle);
  const cos = Math.cos(-RADIAN * midAngle);
  const sx = cx + (outerRadius + 10) * cos; // Start x
  const sy = cy + (outerRadius + 10) * sin; // Start y
  const mx = cx + (outerRadius + 30) * cos; // Mid x
  const my = cy + (outerRadius + 30) * sin; // Mid y
  const ex = mx + (cos >= 0 ? 1 : -1) * 22; // End x
  const ey = my; // End y
  const textAnchor = cos >= 0 ? 'start' : 'end'; // Text alignment

  return (
    <g>
      <text x={cx} y={cy} dy={8} textAnchor="middle" fill={fill}>
        {payload.label}
      </text>
      <Sector
        cx={cx}
        cy={cy}
        innerRadius={innerRadius}
        outerRadius={outerRadius}
        startAngle={startAngle}
        endAngle={endAngle}
        fill={fill} // Fill segment
      />
      <Sector
        cx={cx}
        cy={cy}
        z={2}
        startAngle={startAngle}
        endAngle={endAngle}
        innerRadius={outerRadius + 6}
        outerRadius={outerRadius + 10}
        fill={fill} // Shadow effect
      />
      <path
        d={`M${sx},${sy}L${mx},${my}L${ex},${ey}`} // Connecting line
        stroke={fill}
        fill="none"
      />
      <circle cx={ex} cy={ey} r={2} fill={fill} stroke="none" />{' '}
      {/* End point */}
      <text
        x={ex + (cos >= 0 ? 1 : -1) * 12}
        y={ey}
        z={2}
        textAnchor={textAnchor}
        fill="#fff6f6" // Value label color
      >
        ${parseFloat(new Decimal(value).toFixed(3))}
      </text>
      <text
        x={ex + (cos >= 0 ? 1 : -1) * 12}
        y={ey}
        dy={18}
        textAnchor={textAnchor}
        fill="#999" // Percentage label color
      >
        {new Decimal(percent).times(100).toFixed(2)}%
      </text>
    </g>
  );
};

// Main component for the balance pie chart
const BalancePie = ({ data }: BalancePieProps) => {
  const [activeIndex, setActiveIndex] = useState(0); // Track active segment
  // Modern color palette for pie segments
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
  // Total USD value for center label

  // Handle mouse enter event
  const onPieEnter = (
    _: React.MouseEvent<HTMLButtonElement>,
    index: number,
  ) => {
    setActiveIndex(index); // Update active index
  };

  return (
    <ResponsiveContainer
      width="100%" // Responsive width
      height={250} // Fixed height for chart visibility
    >
      <PieChart width={500}>
        <defs>
          {COLORS.map((color, index) => (
            <linearGradient
              id={`colorGrad${index}`}
              key={index}
              x1="0%"
              y1="0%"
              x2="0%"
              y2="100%"
            >
              <stop offset="0%" stopColor={color} stopOpacity={0.9} />
              <stop offset="100%" stopColor={color} stopOpacity={0.6} />
            </linearGradient>
          ))}
        </defs>
        <Pie
          activeIndex={activeIndex}
          // @ts-ignore
          activeShape={renderActiveShape}
          data={data}
          innerRadius={50}
          outerRadius={75}
          cy={105}
          dataKey="usdPrice"
          nameKey="label"
          onMouseEnter={onPieEnter}
          isAnimationActive={true}
          animationDuration={800}
          animationEasing="ease-out"
          label={({ cx, cy }) => (
            <text
              x={cx}
              y={cy}
              dy={8}
              textAnchor="middle"
              fill="#fff"
              style={{ fontSize: '16px', fontWeight: 'bold' }}
            >
              {/* {`$${totalUsd.toFixed(2)}`} */}
            </text>
          )}
          labelLine={false}
        >
          {data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={`url(#colorGrad${index})`} />
          ))}
        </Pie>
        <Tooltip
          contentStyle={{
            backgroundColor: '#1a1a1a',
            border: 'none',
            borderRadius: '8px',
            boxShadow: '0 0 10px rgba(0, 0, 0, 0.5)',
          }}
          itemStyle={{ color: '#fff' }}
          cursor={{ fill: 'rgba(255, 255, 255, 0.1)' }}
          formatter={(value: number) => [`$${value.toFixed(2)}`, 'USD Value']}
        />
        <Legend
          layout="horizontal"
          align="center"
          verticalAlign="bottom"
          iconType="circle"
          iconSize={8}
          wrapperStyle={{ paddingTop: 16 }}
          formatter={(value: any) => (
            <span style={{ color: '#fff', marginRight: 8 }}>{value}</span>
          )}
        />
      </PieChart>
    </ResponsiveContainer>
  );
};

export default BalancePie; // Export the component
