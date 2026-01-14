import { MessageSquare } from 'lucide-react';
import SupplyChainGraphPanel from '../cockpit/SupplyChainGraphPanel';
import AIAnalysisPanel from '../cockpit/AIAnalysisPanel';
import ProductInventoryPanel from '../cockpit/ProductInventoryPanel';
import MaterialInventoryPanel from '../cockpit/MaterialInventoryPanel';
import ProcurementPanel from '../cockpit/ProcurementPanel';
import OrderRiskPanel from '../cockpit/OrderRiskPanel';
import ProductionPlanPanel from '../cockpit/ProductionPlanPanel';

interface Props {
  onNavigate?: (view: string) => void;
  toggleCopilot?: () => void;
}

const CockpitView = ({ onNavigate, toggleCopilot }: Props) => {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-slate-800">供应链驾驶舱</h1>
      </div>

      {/* Supply Chain Graph Panel */}
      <SupplyChainGraphPanel onNavigate={onNavigate} />

      {/* AI Analysis Panel */}
      <AIAnalysisPanel />

      {/* New Panels Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ProductInventoryPanel onNavigate={onNavigate} />
        <MaterialInventoryPanel onNavigate={onNavigate} />
        <ProcurementPanel onNavigate={onNavigate} />
        <OrderRiskPanel onNavigate={onNavigate} />
      </div>

      {/* Production Plan Panel - Full Width */}
      <ProductionPlanPanel onNavigate={onNavigate} />

      {/* Floating Chat Bubble Button */}
      {toggleCopilot && (
        <button
          onClick={toggleCopilot}
          className="fixed bottom-8 right-8 w-14 h-14 bg-gradient-to-br from-indigo-600 to-purple-600 text-white rounded-full shadow-lg hover:shadow-xl transition-all flex items-center justify-center z-40"
          aria-label="打开AI助手"
        >
          <MessageSquare size={24} />
        </button>
      )}
    </div>
  );
};

export default CockpitView;
