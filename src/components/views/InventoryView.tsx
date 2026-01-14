import { useState, useMemo, useEffect } from 'react';
import { MessageSquare } from 'lucide-react';
import { materialsData, productsData } from '../../utils/entityConfigService';
import { useDimensionMetricData } from '../../hooks/useMetricData';
import { metricModelApi, createCurrentYearRange, createLastDaysRange } from '../../api';
import type { Label } from '../../api/metricModelApi';
import type { Product, Material } from '../../types/ontology';
import { useDataMode } from '../../contexts/DataModeContext';
import { calculateAllProductInventory } from '../../services/productInventoryCalculator';

// Sub-components
import { ProductInventoryPanel } from './inventory/ProductInventoryPanel';
import { MaterialInventoryPanel } from './inventory/MaterialInventoryPanel';
import { FunctionCardSection } from './inventory/FunctionCardSection';
import { BOMInventoryTree } from './inventory/BOMInventoryTree';

// 验证指标模型ID是否存在
const validateMetricModel = async (modelId: string) => {
  try {
    const range = createLastDaysRange(1);
    const result = await metricModelApi.queryByModelId(
      modelId,
      { instant: true, start: range.start, end: range.end },
      { includeModel: true }
    );
    return { exists: true, model: result.model, error: null };
  } catch (err) {
    return { exists: false, model: null, error: err };
  }
};

const PRODUCT_INVENTORY_METRIC_IDS = {
  mock: 'd5167ptg5lk40hvh48b0',
  api: 'd58keb5g5lk40hvh48og',
};

const MATERIAL_INVENTORY_METRIC_IDS = {
  mock: 'd516r9lg5lk40hvh48cg',
  api: 'd58je8lg5lk40hvh48n0',
};

interface Props {
  toggleCopilot?: () => void;
}

const InventoryView = ({ toggleCopilot }: Props) => {
  const { mode } = useDataMode();
  const productInventoryMetricId = PRODUCT_INVENTORY_METRIC_IDS[mode];
  const materialInventoryMetricId = MATERIAL_INVENTORY_METRIC_IDS[mode];

  // Modal state for BOM Inventory Tree
  const [showBOMInventoryTree, setShowBOMInventoryTree] = useState(false);



  // --- Data Fetching Logic (Products) ---
  const [productAvailableDimensions, setProductAvailableDimensions] = useState<string[]>([]);
  const [productModelLoading, setProductModelLoading] = useState(true);

  useEffect(() => {
    const fetchProductModelInfo = async () => {
      if (mode === 'api') {
        setProductAvailableDimensions([]);
        setProductModelLoading(false);
        return;
      }
      try {
        const validation = await validateMetricModel(productInventoryMetricId);
        if (!validation.exists) {
          setProductAvailableDimensions(['item_id', 'item_name', 'warehouse_name']);
          setProductModelLoading(false);
          return;
        }
        const range = createCurrentYearRange();
        const result = await metricModelApi.queryByModelId(
          productInventoryMetricId,
          { instant: true, start: range.start, end: range.end },
          { includeModel: true }
        );
        if (result.model?.analysis_dimensions) {
          const dimensions = result.model.analysis_dimensions.map((dim: Label | string) =>
            typeof dim === 'string' ? dim : dim.name
          );
          setProductAvailableDimensions(dimensions);
        } else {
          setProductAvailableDimensions(['item_id', 'item_name', 'warehouse_name']);
        }
      } catch (err) {
        setProductAvailableDimensions(['item_id', 'item_name', 'warehouse_name']);
      } finally {
        setProductModelLoading(false);
      }
    };
    fetchProductModelInfo();
  }, [productInventoryMetricId, mode]);

  const productDimensionsToUse = useMemo(() => {
    if (productAvailableDimensions.length === 0) return [];
    const preferredDimensions = ['item_id', 'item_name', 'product_id', 'product_name', 'material_code', 'material_name', 'warehouse_name', 'max_storage_age', 'storage_reason', 'storage_note', 'unit_price', 'total_price'];
    const selectedDimensions = preferredDimensions.filter(dim =>
      productAvailableDimensions.some(avail => avail.toLowerCase().includes(dim.toLowerCase()) || dim.toLowerCase().includes(avail.toLowerCase()))
    );
    return selectedDimensions.length > 0 ? selectedDimensions.slice(0, 10) : productAvailableDimensions.slice(0, 10);
  }, [productAvailableDimensions]);

  const [brainModeProducts, setBrainModeProducts] = useState<any[]>([]);
  const [brainModeLoading, setBrainModeLoading] = useState(false);

  useEffect(() => {
    if (mode === 'api') {
      const calculate = async () => {
        try {
          setBrainModeLoading(true);
          const results = await calculateAllProductInventory();
          setBrainModeProducts(results);
        } catch (err) {
          console.error(err);
        } finally {
          setBrainModeLoading(false);
        }
      };
      calculate();
    }
  }, [mode]);

  const {
    items: productInventoryItems,
    loading: productInventoryLoading,
  } = useDimensionMetricData(
    productInventoryMetricId,
    mode === 'mock' ? productDimensionsToUse : [],
    { instant: true, immediate: mode === 'mock' }
  );

  const productsDataFromApi = useMemo(() => {
    if (!productInventoryItems) return null;
    return productInventoryItems.map((item) => {
      const labels = item.labels || {};
      const stockQuantity = item.value ?? 0;
      const inventoryQuantity = labels.inventory_data || labels.available_quantity || labels.quantity;
      const actualStockQuantity = inventoryQuantity ? parseFloat(inventoryQuantity) : stockQuantity;
      const productId = labels.product_id || labels.item_id || labels.id || '';
      const productName = labels.product_name || labels.item_name || labels.name || '';
      const userId = productId || `PROD-API-${productInventoryItems.indexOf(item) + 1}`;
      const userName = productName || `产品 ${productInventoryItems.indexOf(item) + 1}`;
      const mockProduct = productsData.find(p => p.productId === userId || p.productName === userName || p.productId === productId || p.productName === productName);

      return {
        ...item,
        productId: userId,
        productName: userName,
        stockQuantity: actualStockQuantity,
        stockUnit: mockProduct?.stockUnit || '套',
        bomId: mockProduct?.bomId || 'BOM-UNKNOWN',
        status: mockProduct?.status || '销售中',
        inventoryStatus: mockProduct?.inventoryStatus || '正常',
        inventoryDistribution: mockProduct?.inventoryDistribution || {
          available: Math.floor(actualStockQuantity * 0.6),
          locked: Math.floor(actualStockQuantity * 0.3),
          inTransit: Math.floor(actualStockQuantity * 0.1),
          scrapped: 0
        },
        materialCodes: mockProduct?.materialCodes || []
      } as Product;
    });
  }, [productInventoryItems, productsData]);

  // --- Data Fetching Logic (Materials) ---
  const [materialAvailableDimensions, setMaterialAvailableDimensions] = useState<string[]>([]);
  const [materialModelLoading, setMaterialModelLoading] = useState(true);

  useEffect(() => {
    const fetchMaterialModelInfo = async () => {
      try {
        const validation = await validateMetricModel(materialInventoryMetricId);
        if (!validation.exists) {
          setMaterialAvailableDimensions(['item_id', 'item_code', 'item_name', 'warehouse_name']);
          setMaterialModelLoading(false);
          return;
        }
        const range = createLastDaysRange(1);
        const result = await metricModelApi.queryByModelId(
          materialInventoryMetricId,
          { instant: true, start: range.start, end: range.end },
          { includeModel: true }
        );
        if (result.model?.analysis_dimensions) {
          const dimensions = result.model.analysis_dimensions.map((dim: Label | string) =>
            typeof dim === 'string' ? dim : dim.name
          );
          setMaterialAvailableDimensions(dimensions);
        } else {
          setMaterialAvailableDimensions(['item_id', 'item_code', 'item_name', 'warehouse_name']);
        }
      } catch (err) {
        setMaterialAvailableDimensions(['item_id', 'item_code', 'item_name', 'warehouse_name']);
      } finally {
        setMaterialModelLoading(false);
      }
    };
    fetchMaterialModelInfo();
  }, [materialInventoryMetricId]);

  const materialDimensionsToUse = useMemo(() => {
    if (materialAvailableDimensions.length === 0) return [];
    const preferredDimensions = ['item_id', 'item_code', 'item_name', 'material_name', 'material_code', 'warehouse_name', 'max_storage_age'];
    const selectedDimensions = preferredDimensions.filter(dim =>
      materialAvailableDimensions.some(avail => avail.toLowerCase().includes(dim.toLowerCase()) || dim.toLowerCase().includes(avail.toLowerCase()))
    );
    return selectedDimensions.length > 0 ? selectedDimensions.slice(0, 9) : materialAvailableDimensions.slice(0, 9);
  }, [materialAvailableDimensions]);

  const {
    items: materialInventoryItems,
    loading: materialInventoryLoading,
  } = useDimensionMetricData(
    materialInventoryMetricId,
    (mode === 'mock' || mode === 'api') ? materialDimensionsToUse : [],
    { instant: true, immediate: mode === 'mock' || mode === 'api' }
  );

  const materialsDataFromApi = useMemo(() => {
    if (!materialInventoryItems || materialInventoryItems.length === 0) return null;
    return materialInventoryItems.map((item) => {
      const labels = item.labels || {};
      const currentStock = item.value ?? 0;
      const materialCode = labels.item_code || labels.code || labels.material_code || '';
      const materialName = labels.item_name || labels.name || labels.material_name || '';
      const finalCode = materialCode || `MAT-API-${materialInventoryItems.indexOf(item)}`;
      const finalName = materialName || `物料 ${materialInventoryItems.indexOf(item)}`;
      const mockMaterial = materialsData.find(m => m.materialCode === finalCode || m.materialName === finalName);

      return {
        materialCode: finalCode,
        materialName: finalName,
        currentStock,
        bomId: mockMaterial?.bomId || 'BOM-M-UNKNOWN',
        status: mockMaterial?.status || '正常',
        inventoryDistribution: mockMaterial?.inventoryDistribution || {
          available: Math.floor(currentStock * 0.7),
          locked: Math.floor(currentStock * 0.2),
          inTransit: Math.floor(currentStock * 0.08),
          scrapped: Math.floor(currentStock * 0.02)
        }
      } as Material;
    });
  }, [mode, materialInventoryItems, materialsData]);

  // --- Final Data Aggregation ---
  const finalProductsData = useMemo(() => {
    if (mode === 'api' && brainModeProducts.length > 0) {
      return brainModeProducts.map(p => ({
        productId: p.productCode,
        productName: p.productName,
        stockQuantity: p.calculatedStock,
        stockUnit: '件',
        status: '销售中',
        bomId: 'BOM-P-API',
        inventoryDistribution: { available: p.calculatedStock, locked: 0, inTransit: 0, scrapped: 0 }
      } as Product));
    }
    return productsDataFromApi ?? productsData;
  }, [mode, brainModeProducts, productsDataFromApi]);

  const finalMaterialsData = materialsDataFromApi ?? materialsData;

  const productInventoryData = useMemo(() => {
    return finalProductsData.map(product => {
      let inventoryStatus = product.inventoryStatus || '正常';
      if (!inventoryStatus) {
        const isStagnant = (product.status === '停止服务' && (product.stockQuantity || 0) > 0);
        if (isStagnant) inventoryStatus = '呆滞';
      }
      return { ...product, inventoryStatus };
    });
  }, [finalProductsData]);

  const isActuallyLoading = mode === 'api' ? brainModeLoading : (productModelLoading || productInventoryLoading);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-slate-800">库存优化</h1>
      </div>

      {/* Function Card Section */}
      <FunctionCardSection
        onOpenReverseCalculator={() => setShowBOMInventoryTree(true)}
      />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-[600px]">
        <ProductInventoryPanel />
        <MaterialInventoryPanel />
      </div>

      {/* BOM Inventory Tree Modal */}
      {showBOMInventoryTree && (
        <div className="fixed inset-0 backdrop-blur-md bg-slate-900/20 flex items-center justify-center z-50 p-4">
          <div className="bg-white/95 backdrop-blur-sm rounded-xl shadow-2xl w-full max-w-6xl max-h-[90vh] overflow-hidden border border-white/50">
            <BOMInventoryTree onClose={() => setShowBOMInventoryTree(false)} />
          </div>
        </div>
      )}

      {toggleCopilot && (
        <button
          onClick={toggleCopilot}
          className="fixed bottom-8 right-8 w-14 h-14 bg-gradient-to-br from-indigo-600 to-purple-600 text-white rounded-full shadow-lg hover:shadow-xl transition-all flex items-center justify-center z-40"
        >
          <MessageSquare size={24} />
        </button>
      )}
    </div>
  );
};

export default InventoryView;
