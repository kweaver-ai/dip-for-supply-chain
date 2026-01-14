/**
 * Ontology Data Service
 * Loads and caches CSV data from datasource/finaldata/ontology
 */

import { loadCSV } from '../utils/csvParser';

// Base path for ontology data files
const ONTOLOGY_DATA_PATH = '/datasource/finaldata/ontology';

// Type definitions for ontology entities
export interface ProductEntity {
  product_id: string;
  product_code: string;
  product_name: string;
  product_type: string;
  main_unit: string;
  created_date: string;
  status: string;
}

export interface InventoryEvent {
  inventory_id: string;
  snapshot_month: string;
  item_type: string;
  item_id: string;
  item_code: string;
  item_name: string;
  warehouse_id: string;
  warehouse_name: string;
  batch_number: string;
  quantity: string;
  unit_price: string;
  total_price: string;
  earliest_storage_date: string;
  max_storage_age: string;
  storage_reason: string;
  storage_note: string;
  consumption_path: string;
  created_date: string;
  status: string;
}

export interface BOMEvent {
  bom_id: string;
  bom_version: string;
  parent_type: string;
  parent_id: string;
  parent_code: string;
  child_type: string;
  child_id: string;
  child_code: string;
  child_name: string;
  relationship_type: string;
  sequence: string;
  line_number: string;
  quantity: string;
  unit: string;
  child_quantity: string;
  child_unit: string;
  base_quantity: string;
  effective_date: string;
  expiry_date: string;
  bom_category: string;
  assembly_set: string;
  issue_method: string;
  scrap_rate: string;
  created_by: string;
  created_date: string;
  status: string;
}

export interface SupplierEntity {
  supplier_id: string;
  supplier_code: string;
  supplier_name: string;
  supplier_type: string;
  supplier_tier: string;
  country: string;
  city: string;
  contact_person: string;
  contact_phone: string;
  contact_email: string;
  cooperation_start_date: string;
  supplier_rating: string;
  status: string;
}

export interface MonthlySalesByProduct {
  product_id: string;
  product_name: string;
  month: string;
  quantity: string;
}

export interface MaterialProcurementEvent {
  procurement_id: string;
  procurement_code: string;
  material_id: string;
  material_code: string;
  material_name: string;
  supplier_id: string;
  supplier_name: string;
  quantity: string;
  unit: string;
  unit_price: string;
  total_amount: string;
  order_date: string;
  planned_arrival_date: string;
  actual_arrival_date?: string;
  warehouse_id: string;
  warehouse_name: string;
  buyer: string;
  procurement_type: string;
  payment_term: string;
  delivery_term: string;
  quality_status?: string;
  created_date: string;
  status: string;
}

export interface SupplierPerformanceScore {
  supplier_id: string;
  supplier_name: string;
  evaluation_month: string;
  overall_score: string;
  quality_score: string;
  delivery_score: string;
  price_score: string;
  service_score: string;
  otif_rate: string;
  defect_rate: string;
  response_time_hours: string;
  total_orders: string;
  on_time_orders: string;
  quality_issues: string;
  evaluator: string;
  evaluation_date: string;
  risk_level: string;
  remarks?: string;
}

export interface SalesOrderEvent {
  sales_order_id: string;
  sales_order_number: string;
  document_date: string;
  customer_id: string;
  customer_name: string;
  line_number: string;
  product_id: string;
  product_code: string;
  product_name: string;
  quantity: string;
  unit: string;
  standard_price: string;
  discount_rate: string;
  actual_price: string;
  subtotal_amount: string;
  tax_amount: string;
  total_amount: string;
  order_status: string;
  document_status: string;
  transaction_type: string;
  sales_department: string;
  salesperson: string;
  planned_delivery_date: string;
  is_urgent: string;
  contract_number?: string;
  project_name?: string;
  end_customer?: string;
  quotation_number?: string;
  notes?: string;
  created_date: string;
  status: string;
}

export interface MaterialEntity {
  material_id: string;
  material_code: string;
  material_name: string;
  material_type: string;
  unit: string;
  is_virtual: string;
  is_assembly: string;
  created_date: string;
  status: string;
}

export interface AlternativeSupplierCSV {
  material_code: string;
  material_name: string;
  primary_supplier_id: string;
  primary_supplier_name: string;
  alternative_supplier_id: string;
  alternative_supplier_name: string;
  similarity_score: string;
  recommendation_reason: string;
  quality_comparison: string;
  delivery_comparison: string;
  price_comparison: string;
  risk_level: string;
  availability: string;
  notes: string;
}

// Cache for loaded data
let cachedProductEntities: ProductEntity[] | null = null;
let cachedInventoryEvents: InventoryEvent[] | null = null;
let cachedBOMEvents: BOMEvent[] | null = null;
let cachedSupplierEntities: SupplierEntity[] | null = null;
let cachedMonthlySales: MonthlySalesByProduct[] | null = null;
let cachedMaterialProcurements: MaterialProcurementEvent[] | null = null;
let cachedSupplierPerformances: SupplierPerformanceScore[] | null = null;
let cachedSalesOrders: SalesOrderEvent[] | null = null;
let cachedMaterialEntities: MaterialEntity[] | null = null;
let cachedAlternativeSuppliers: AlternativeSupplierCSV[] | null = null;

/**
 * Load product entities from CSV
 */
export async function loadProductEntities(forceReload = false): Promise<ProductEntity[]> {
  if (cachedProductEntities && !forceReload) {
    return cachedProductEntities;
  }

  try {
    const data = await loadCSV<ProductEntity>(`${ONTOLOGY_DATA_PATH}/product_entity.csv`);
    cachedProductEntities = data;
    return data;
  } catch (error) {
    console.error('Failed to load product entities:', error);
    return [];
  }
}

/**
 * Load inventory events from CSV
 */
export async function loadInventoryEvents(forceReload = false): Promise<InventoryEvent[]> {
  if (cachedInventoryEvents && !forceReload) {
    return cachedInventoryEvents;
  }

  try {
    const data = await loadCSV<InventoryEvent>(`${ONTOLOGY_DATA_PATH}/inventory_event.csv`);
    cachedInventoryEvents = data;
    return data;
  } catch (error) {
    console.error('Failed to load inventory events:', error);
    return [];
  }
}

/**
 * Load BOM events from CSV
 */
export async function loadBOMEvents(forceReload = false): Promise<BOMEvent[]> {
  if (cachedBOMEvents && !forceReload) {
    return cachedBOMEvents;
  }

  try {
    const data = await loadCSV<BOMEvent>(`${ONTOLOGY_DATA_PATH}/bom_event.csv`);
    cachedBOMEvents = data;
    return data;
  } catch (error) {
    console.error('Failed to load BOM events:', error);
    return [];
  }
}

/**
 * Load supplier entities from CSV
 */
export async function loadSupplierEntities(forceReload = false): Promise<SupplierEntity[]> {
  if (cachedSupplierEntities && !forceReload) {
    return cachedSupplierEntities;
  }

  try {
    const timestamp = new Date().getTime();
    const data = await loadCSV<SupplierEntity>(`${ONTOLOGY_DATA_PATH}/supplier_entity.csv?v=${timestamp}`);
    console.log('Loaded supplier entities:', data.length, 'records');
    cachedSupplierEntities = data;
    return data;
  } catch (error) {
    console.error('Failed to load supplier entities:', error);
    return [];
  }
}

/**
 * Load monthly sales by product from CSV
 */
export async function loadMonthlySalesByProduct(forceReload = false): Promise<MonthlySalesByProduct[]> {
  if (cachedMonthlySales && !forceReload) {
    return cachedMonthlySales;
  }

  try {
    const data = await loadCSV<MonthlySalesByProduct>(`${ONTOLOGY_DATA_PATH}/monthly_sales_by_product.csv`);
    cachedMonthlySales = data;
    return data;
  } catch (error) {
    console.error('Failed to load monthly sales:', error);
    return [];
  }
}

/**
 * Load material procurement events from CSV
 */
export async function loadMaterialProcurementEvents(forceReload = false): Promise<MaterialProcurementEvent[]> {
  if (cachedMaterialProcurements && !forceReload) {
    return cachedMaterialProcurements;
  }

  try {
    const data = await loadCSV<MaterialProcurementEvent>(`${ONTOLOGY_DATA_PATH}/material_procurement_event.csv`);
    cachedMaterialProcurements = data;
    return data;
  } catch (error) {
    console.error('Failed to load material procurement events:', error);
    return [];
  }
}

/**
 * Load supplier performance scores from CSV
 */
export async function loadSupplierPerformanceScores(forceReload = false): Promise<SupplierPerformanceScore[]> {
  if (cachedSupplierPerformances && !forceReload) {
    return cachedSupplierPerformances;
  }

  try {
    const timestamp = new Date().getTime();
    const data = await loadCSV<SupplierPerformanceScore>(`${ONTOLOGY_DATA_PATH}/supplier_performance_scores.csv?v=${timestamp}`);
    console.log('Loaded supplier performance scores:', data.length, 'records');
    if (data.length > 0) {
      console.log('Sample supplier performance:', data[0]);
    }
    cachedSupplierPerformances = data;
    return data;
  } catch (error) {
    console.error('Failed to load supplier performance scores:', error);
    return [];
  }
}

/**
 * Load sales order events from CSV
 */
export async function loadSalesOrderEvents(forceReload = false): Promise<SalesOrderEvent[]> {
  if (cachedSalesOrders && !forceReload) {
    return cachedSalesOrders;
  }

  try {
    const data = await loadCSV<SalesOrderEvent>(`${ONTOLOGY_DATA_PATH}/sales_order_event.csv`);
    cachedSalesOrders = data;
    return data;
  } catch (error) {
    console.error('Failed to load sales order events:', error);
    return [];
  }
}

/**
 * Load material entities from CSV
 */
export async function loadMaterialEntities(forceReload = false): Promise<MaterialEntity[]> {
  if (cachedMaterialEntities && !forceReload) {
    return cachedMaterialEntities;
  }

  try {
    const data = await loadCSV<MaterialEntity>(`${ONTOLOGY_DATA_PATH}/material_entity.csv`);
    cachedMaterialEntities = data;
    return data;
  } catch (error) {
    console.error('Failed to load material entities:', error);
    return [];
  }
}

/**
 * Load alternative suppliers from CSV
 */
export async function loadAlternativeSuppliers(forceReload = false): Promise<AlternativeSupplierCSV[]> {
  if (cachedAlternativeSuppliers && !forceReload) {
    return cachedAlternativeSuppliers;
  }

  try {
    // Add timestamp to force cache bypass
    const timestamp = new Date().getTime();
    const data = await loadCSV<AlternativeSupplierCSV>(`${ONTOLOGY_DATA_PATH}/alternative_suppliers.csv?v=${timestamp}`);
    cachedAlternativeSuppliers = data;
    console.log('Loaded alternative suppliers with timestamp:', timestamp);
    return data;
  } catch (error) {
    console.error('Failed to load alternative suppliers:', error);
    return [];
  }
}

/**
 * Clear all caches
 */
export function clearCache(): void {
  cachedProductEntities = null;
  cachedInventoryEvents = null;
  cachedBOMEvents = null;
  cachedSupplierEntities = null;
  cachedMonthlySales = null;
  cachedMaterialProcurements = null;
  cachedSupplierPerformances = null;
  cachedSalesOrders = null;
  cachedMaterialEntities = null;
  cachedAlternativeSuppliers = null;
}
