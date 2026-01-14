/**
 * EvaluationRadarChart Component
 * 
 * Displays 7 evaluation dimensions in a radar chart using Recharts.
 * 
 * Principle 1: Types imported from ontology.ts
 * Principle 2: Uses semantic color variables
 */

import { RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer } from 'recharts';
import type { EvaluationDimension } from '../../types/ontology';

interface EvaluationRadarChartProps {
  dimensions: EvaluationDimension[];
  size?: 'sm' | 'md' | 'lg';
}

const EvaluationRadarChart = ({ dimensions, size = 'md' }: EvaluationRadarChartProps) => {
  const dimensionLabels: Record<string, string> = {
    quality: '质量',
    delivery: '交付',
    price: '价格',
    service: '服务',
    compliance: '合规性',
    technical: '技术能力',
    financial: '财务健康',
  };

  const chartData = dimensions.map(dim => ({
    dimension: dimensionLabels[dim.dimensionName] || dim.dimensionName,
    score: dim.score,
    fullMark: 100,
  }));

  const sizeConfig = {
    sm: { height: 200 },
    md: { height: 300 },
    lg: { height: 400 },
  };

  const { height } = sizeConfig[size];

  return (
    <ResponsiveContainer width="100%" height={height}>
      <RadarChart data={chartData}>
        <PolarGrid />
        <PolarAngleAxis 
          dataKey="dimension" 
          tick={{ fontSize: 12, fill: '#94a3b8' }}
        />
        <PolarRadiusAxis 
          angle={90} 
          domain={[0, 100]} 
          tick={{ fontSize: 10, fill: '#64748b' }}
        />
        <Radar
          name="评估分数"
          dataKey="score"
          stroke="#6366f1"
          fill="#6366f1"
          fillOpacity={0.6}
        />
      </RadarChart>
    </ResponsiveContainer>
  );
};

export default EvaluationRadarChart;

