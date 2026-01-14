/**
 * 数据加载服务
 * 负责从 datasource/finaldata 加载CSV数据并转换为前端可用的格式
 */

export interface SalesOrderRaw {
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
  contract_number: string;
  project_name: string;
  end_customer: string;
  quotation_number: string;
  notes: string;
  created_date: string;
  status: string;
}

export interface ShipmentRaw {
  shipment_id: string;
  shipment_number: string;
  shipment_date: string;
  warehouse_id: string;
  warehouse_name: string;
  customer_id: string;
  customer_code: string;
  customer_name: string;
  product_id: string;
  product_code: string;
  product_name: string;
  quantity: string;
  unit_price: string;
  total_amount: string;
  consignee: string;
  consignee_phone: string;
  delivery_address: string;
  logistics_provider: string;
  tracking_number: string;
  estimated_delivery_date: string;
  actual_delivery_date: string;
  delivery_status: string;
  sales_order_number: string;
  notes: string;
  created_date: string;
  status: string;
}

export interface ProductionOrderRaw {
  production_order_id: string;
  production_order_number: string;
  line_number: string;
  output_type: string;
  output_id: string;
  output_code: string;
  output_name: string;
  production_quantity: string;
  factory_id: string;
  factory_name: string;
  production_line: string;
  process_sequence: string;
  planned_start_date: string;
  planned_finish_date: string;
  work_order_status: string;
  priority: string;
  created_date: string;
  status: string;
}

/**
 * 解析CSV文本为对象数组
 */
function parseCSV<T>(csvText: string): T[] {
  const lines = csvText.trim().split('\n');
  if (lines.length < 2) return [];
  
  const headers = lines[0].split(',');
  const result: T[] = [];
  
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i];
    if (!line.trim()) continue;
    
    const values = line.split(',');
    const obj: any = {};
    
    headers.forEach((header, index) => {
      obj[header.trim()] = values[index]?.trim() || '';
    });
    
    result.push(obj as T);
  }
  
  return result;
}

/**
 * 加载销售订单数据
 */
export async function loadSalesOrders(): Promise<SalesOrderRaw[]> {
  try {
    const response = await fetch('/datasource/finaldata/ontology/sales_order_event.csv');
    if (!response.ok) {
      console.error('Failed to load sales orders:', response.statusText);
      return [];
    }
    const csvText = await response.text();
    return parseCSV<SalesOrderRaw>(csvText);
  } catch (error) {
    console.error('Error loading sales orders:', error);
    return [];
  }
}

/**
 * 加载发货数据
 */
export async function loadShipments(): Promise<ShipmentRaw[]> {
  try {
    const response = await fetch('/datasource/finaldata/ontology/shipment_event.csv');
    if (!response.ok) {
      console.error('Failed to load shipments:', response.statusText);
      return [];
    }
    const csvText = await response.text();
    return parseCSV<ShipmentRaw>(csvText);
  } catch (error) {
    console.error('Error loading shipments:', error);
    return [];
  }
}

/**
 * 加载生产订单数据
 */
export async function loadProductionOrders(): Promise<ProductionOrderRaw[]> {
  try {
    const response = await fetch('/datasource/finaldata/ontology/production_order_event.csv');
    if (!response.ok) {
      console.error('Failed to load production orders:', response.statusText);
      return [];
    }
    const csvText = await response.text();
    return parseCSV<ProductionOrderRaw>(csvText);
  } catch (error) {
    console.error('Error loading production orders:', error);
    return [];
  }
}

/**
 * 加载所有订单交付相关数据
 */
export async function loadDeliveryData() {
  const [salesOrders, shipments, productionOrders] = await Promise.all([
    loadSalesOrders(),
    loadShipments(),
    loadProductionOrders(),
  ]);
  
  return {
    salesOrders,
    shipments,
    productionOrders,
  };
}

