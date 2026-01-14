/**
 * Production Planning Panel Component
 * 
 * Displays MPS (Master Production Schedule) prototype when active.
 */

import type { PlanningPanelProps } from '../../types/ontology';
import MPSPrototype from './MPSPrototype';

const ProductionPlanningPanel = ({ active }: PlanningPanelProps) => {
  if (!active) {
    return null;
  }

  return <MPSPrototype />;
};

export default ProductionPlanningPanel;

