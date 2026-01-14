import React from 'react';
import type { Product } from '../../types/ontology';
import { Lightbulb } from 'lucide-react';
import { calculateSuggestedActions, type SuggestedAction } from '../../services/productSupplyService';
import { executeAction } from '../../utils/entityConfigService';

interface Props {
  product: Product;
  productId: string;
}

export const ProductSuggestedActionsSection: React.FC<Props> = ({ product, productId }) => {
  const [suggestedActions, setSuggestedActions] = React.useState<SuggestedAction[]>([]);

  React.useEffect(() => {
    const fetchSuggestions = async () => {
      const actions = await calculateSuggestedActions(productId, product.stockQuantity || 0);
      setSuggestedActions(actions);
    };
    fetchSuggestions();
  }, [productId, product.stockQuantity]);

  if (suggestedActions.length === 0) return null;

  const handleActionClick = async (actionType: SuggestedAction) => {
    const actionName = actionType === 'promotion' ? '促销' : '市场销售提醒';
    try {
      await executeAction('product', productId, actionName);
      // Optionally show success message or refresh data
    } catch (error) {
      console.error(`Failed to execute action ${actionName}:`, error);
      // Optionally show error message
    }
  };

  return (
    <div className="mt-6 p-4 bg-gradient-to-br from-amber-50 to-amber-100/50 rounded-xl border border-amber-200">
      <h4 className="font-bold text-slate-800 mb-3 flex items-center gap-2">
        <Lightbulb className="text-amber-600" size={20} />
        产品建议动作
      </h4>
      <div className="flex flex-wrap gap-3">
        {suggestedActions.includes('promotion') && (
          <button
            onClick={() => handleActionClick('promotion')}
            className="px-4 py-2 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-lg text-sm font-medium hover:shadow-lg transition-all"
          >
            促销
          </button>
        )}
        {suggestedActions.includes('market_sales_reminder') && (
          <button
            onClick={() => handleActionClick('market_sales_reminder')}
            className="px-4 py-2 bg-gradient-to-r from-blue-500 to-indigo-500 text-white rounded-lg text-sm font-medium hover:shadow-lg transition-all"
          >
            市场销售提醒
          </button>
        )}
      </div>
    </div>
  );
};



