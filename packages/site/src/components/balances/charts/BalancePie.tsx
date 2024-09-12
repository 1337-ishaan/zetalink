import React, { useState } from 'react';
import { PieChart, Pie, Sector, ResponsiveContainer } from 'recharts';
import Decimal from 'decimal.js';

// Define the structure of the pie segment data
interface PieData {
  label: string; // Segment label
  value: number; // Segment value
}

// Props for the BalancePie component
interface BalancePieProps {
  data: PieData[]; // Array of pie data
}

// Props for the active shape rendering function
interface RenderActiveShapeProps {
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
}

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
      height="50%" // Responsive height
    >
      <PieChart width={600}>
        <Pie
          activeIndex={activeIndex} // Highlight active segment
          // @ts-ignore
          
          activeShape={renderActiveShape} // Custom active shape
          data={data} // Pie data
          innerRadius={50} // Inner radius
          outerRadius={75} // Outer radius
          cy={105} // Center Y position
          fill="#4db852" // Default fill color
          dataKey="usdPrice" // Key for data values
          onMouseEnter={onPieEnter} // Mouse enter handler
        />
      </PieChart>
    </ResponsiveContainer>
  );
};

export default BalancePie; // Export the component
