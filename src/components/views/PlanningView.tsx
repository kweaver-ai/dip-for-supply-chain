/**
 * Planning View Component
 * 
 * Main planning page that displays timeline and planning panels.
 * Manages active stage state and coordinates between timeline and panels.
 */

import { useState } from 'react';
import type { PlanningStage } from '../../types/ontology';
import PlanningTimeline from '../planning/PlanningTimeline';
import DemandPlanningPanel from '../planning/DemandPlanningPanel';
import ProductionPlanningPanel from '../planning/ProductionPlanningPanel';
import ProcurementPlanningPanel from '../planning/ProcurementPlanningPanel';

const PlanningView = () => {
  const [activeStage, setActiveStage] = useState<PlanningStage>('DP');

  const handleStageChange = (stage: PlanningStage) => {
    setActiveStage(stage);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-slate-800">供应链计划</h1>
      </div>

      {/* Timeline */}
      <div className="bg-white rounded-lg shadow-sm px-6 py-3">
        <PlanningTimeline activeStage={activeStage} onStageChange={handleStageChange} />
      </div>

      {/* Panel Container */}
      <div className="bg-white rounded-lg shadow-sm p-6 min-h-[200px]">
        <DemandPlanningPanel active={activeStage === 'DP'} />
        <ProductionPlanningPanel active={activeStage === 'MPS'} />
        <ProcurementPlanningPanel active={activeStage === 'MRP'} />
      </div>
    </div>
  );
};

export default PlanningView;

