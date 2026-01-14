/**
 * Procurement Planning Panel Component
 * 
 * Displays procurement planning panel content.
 * Shows "建设中" placeholder when active.
 */

import type { PlanningPanelProps } from '../../types/ontology';

const ProcurementPlanningPanel = ({ active }: PlanningPanelProps) => {
  if (!active) {
    return null;
  }

  return (
    <div className="w-full flex items-center justify-center py-12">
      <p className="text-slate-500 text-lg">建设中</p>
    </div>
  );
};

export default ProcurementPlanningPanel;

