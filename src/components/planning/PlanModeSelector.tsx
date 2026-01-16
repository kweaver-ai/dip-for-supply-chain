/**
 * Plan Mode Selector Component
 *
 * Allows users to switch between production planning modes:
 * - Default: Simple fixed-time calculation (快速预览)
 * - Material Ready V2: Backward scheduling with material readiness check (齐套模式)
 */

import { Factory, Layers } from 'lucide-react';
import type { ProductionPlanMode } from '../../types/ontology';

interface PlanModeSelectorProps {
  currentMode: ProductionPlanMode;
  onModeChange: (mode: ProductionPlanMode) => void;
  disabled?: boolean;
}

const modeConfig: Array<{
  mode: ProductionPlanMode;
  label: string;
  description: string;
  icon: typeof Factory;
  color: string;
  activeColor: string;
}> = [
  {
    mode: 'default',
    label: '默认模式',
    description: '快速预览，固定时间计算',
    icon: Factory,
    color: 'text-slate-500 border-slate-200 bg-white hover:bg-slate-50',
    activeColor: 'text-indigo-600 border-indigo-500 bg-indigo-50',
  },
  {
    mode: 'material-ready-v2',
    label: '齐套模式',
    description: '倒排排程，物料齐套后生产（推荐）',
    icon: Layers,
    color: 'text-slate-500 border-slate-200 bg-white hover:bg-slate-50',
    activeColor: 'text-green-600 border-green-500 bg-green-50',
  },
];

export function PlanModeSelector({
  currentMode,
  onModeChange,
  disabled = false,
}: PlanModeSelectorProps) {
  return (
    <div className="bg-white rounded-lg shadow-sm p-4">
      <div className="flex items-center gap-4">
        <span className="text-sm text-slate-600 font-medium">计划模式:</span>
        <div className="flex gap-2">
          {modeConfig.map(({ mode, label, description, icon: Icon, color, activeColor }) => {
            const isActive = currentMode === mode;
            return (
              <button
                key={mode}
                onClick={() => !disabled && onModeChange(mode)}
                disabled={disabled}
                title={description}
                className={`
                  flex items-center gap-2 px-4 py-2 rounded-lg border text-sm
                  transition-all duration-200
                  ${isActive ? activeColor : color}
                  ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
                `}
              >
                <Icon className="w-4 h-4" />
                <span className="font-medium">{label}</span>
                {isActive && mode === 'material-ready-v2' && (
                  <span className="text-xs bg-green-100 text-green-700 px-1.5 py-0.5 rounded">推荐</span>
                )}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export default PlanModeSelector;
