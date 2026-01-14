/**
 * Planning Timeline Component
 * 
 * Displays horizontal timeline with three planning stages (DP, MPS, MRP)
 * connected by arrows. Allows user to click stages to switch between them.
 */

import { type PlanningStage, type PlanningStageConfig } from '../../types/ontology';

interface PlanningTimelineProps {
  activeStage: PlanningStage;
  onStageChange: (stage: PlanningStage) => void;
}

const PLANNING_STAGES: PlanningStageConfig[] = [
  { id: 'DP', label: '需求计划DP', shortLabel: 'DP', order: 1 },
  { id: 'MPS', label: '生产计划MPS', shortLabel: 'MPS', order: 2 },
  { id: 'MRP', label: '采购计划MRP', shortLabel: 'MRP', order: 3 },
];

const PlanningTimeline = ({ activeStage, onStageChange }: PlanningTimelineProps) => {
  return (
    <div className="w-full py-2">
      <div className="relative flex items-center justify-center">
        {/* Timeline Container */}
        <div className="flex items-center gap-6 relative z-10">
          {PLANNING_STAGES.map((stage, index) => {
            const isActive = activeStage === stage.id;
            const isFirst = index === 0;
            const isLast = index === PLANNING_STAGES.length - 1;

            return (
              <div key={stage.id} className="flex items-center">
                {/* Stage Node */}
                <button
                  onClick={() => onStageChange(stage.id)}
                  className={`
                    relative z-20 flex flex-col items-center gap-1 px-4 py-2 rounded-lg transition-all
                    ${isActive 
                      ? 'bg-indigo-600 text-white shadow-lg scale-105' 
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }
                  `}
                >
                  <div className={`
                    w-10 h-10 rounded-full flex items-center justify-center font-bold text-base
                    ${isActive ? 'bg-white text-indigo-600' : 'bg-slate-300 text-slate-700'}
                  `}>
                    {stage.shortLabel}
                  </div>
                  <span className={`text-xs font-medium ${isActive ? 'text-white' : 'text-slate-700'}`}>
                    {stage.label}
                  </span>
                </button>

                {/* Arrow Connection */}
                {!isLast && (
                  <div className="relative mx-4" style={{ width: '80px', height: '2px' }}>
                    <svg
                      width="80"
                      height="20"
                      className="absolute top-0 left-0"
                    >
                      <defs>
                        <marker
                          id={`arrow-${stage.id}`}
                          markerWidth="10"
                          markerHeight="10"
                          refX="9"
                          refY="3"
                          orient="auto"
                        >
                          <path
                            d="M0,0 L0,6 L9,3 z"
                            className={isActive || activeStage === PLANNING_STAGES[index + 1].id ? 'fill-indigo-600' : 'fill-slate-300'}
                          />
                        </marker>
                      </defs>
                      <line
                        x1="0"
                        y1="10"
                        x2="80"
                        y2="10"
                        className={isActive || activeStage === PLANNING_STAGES[index + 1].id ? 'stroke-indigo-600' : 'stroke-slate-300'}
                        strokeWidth="2"
                        markerEnd={`url(#arrow-${stage.id})`}
                      />
                    </svg>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default PlanningTimeline;

