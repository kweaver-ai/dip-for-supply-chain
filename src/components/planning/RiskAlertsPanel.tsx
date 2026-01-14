/**
 * Risk Alerts Panel Component
 * 
 * 风险提示面板组件，显示风险提示和AI建议
 */

import { AlertTriangle } from 'lucide-react';
import type { RiskAlert } from '../../types/ontology';

interface RiskAlertsPanelProps {
  risks: RiskAlert[];
}

export const RiskAlertsPanel = ({ risks }: RiskAlertsPanelProps) => {
  if (risks.length === 0) {
    return null;
  }

  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <div className="flex items-center gap-4 mb-4">
        <AlertTriangle className="text-red-500" size={20} />
        <h2 className="text-lg font-semibold text-slate-800">风险提示与AI建议</h2>
      </div>
      <div className="space-y-2">
        {risks.map((risk, index) => (
          <div
            key={index}
            className={`p-3 rounded-lg border ${
              risk.level === 'critical'
                ? 'bg-red-50 border-red-200'
                : 'bg-yellow-50 border-yellow-200'
            }`}
          >
            <div className="flex items-start gap-2">
              <AlertTriangle
                className={risk.level === 'critical' ? 'text-red-600' : 'text-yellow-600'}
                size={18}
              />
              <div className="flex-1">
                <div className={`text-sm font-medium ${
                  risk.level === 'critical' ? 'text-red-800' : 'text-yellow-800'
                }`}>
                  <span className="font-semibold">风险：</span>{risk.message}
                </div>
                {risk.aiSuggestion && (
                  <div className="text-xs text-slate-700 mt-2 pl-4 border-l-2 border-indigo-300">
                    <span className="font-semibold text-indigo-600">AI建议：</span> {risk.aiSuggestion}
                  </div>
                )}
                <div className="text-xs text-slate-600 mt-1">
                  影响项：{risk.itemName} ({risk.itemId})
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
