/**
 * Product Forecast Section Component
 * 
 * Displays a single product's demand forecast with title "XX产品需求预测"
 * and the DemandForecastTable component.
 */

import type { ProductDemandForecast } from '../../types/ontology';
import DemandForecastTable from './DemandForecastTable';

export interface ProductForecastSectionProps {
  productForecast: ProductDemandForecast;
  loading?: boolean;
}

const ProductForecastSection = ({ productForecast, loading }: ProductForecastSectionProps) => {
  return (
    <div className="mt-6">
      <h3 className="text-lg font-semibold text-slate-800 mb-4">
        {productForecast.productName}需求预测
      </h3>
      <DemandForecastTable
        productForecast={productForecast}
        loading={loading}
      />
    </div>
  );
};

export default ProductForecastSection;

