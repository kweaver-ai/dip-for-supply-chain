/**
 * Delivery Data Service
 * 
 * Provides delivery order data loading from API.
 * Replaces CSV-based data loading with API calls.
 */

import { ontologyApi } from '../api';
import type { DeliveryOrder } from '../types/ontology';

// Object type ID for delivery orders (sales orders)
const DELIVERY_ORDER_OBJECT_TYPE_ID = 'd56vh169olk4bpa66v80'; // Sales Order object type

/**
 * Load delivery orders from API
 * @returns Array of delivery orders
 * 
 * NOTE: Uses sales order object type as delivery orders
 */
export async function loadDeliveryOrders(): Promise<DeliveryOrder[]> {
  console.log('[DeliveryDataService] Loading delivery orders from API...');

  try {
    const response = await ontologyApi.queryObjectInstances(DELIVERY_ORDER_OBJECT_TYPE_ID, {
      limit: 10000,
      need_total: false,
    });

    const deliveryOrders: DeliveryOrder[] = response.entries.map((item: any) => ({
      // Basic order information
      orderId: item.sales_order_id || item.order_id || item.delivery_order_id || '',
      orderNumber: item.sales_order_number || item.order_number || item.delivery_order_number || '',
      orderName: item.order_name || item.sales_order_name || `订单-${item.sales_order_number || item.order_number || ''}`,
      lineNumber: item.line_number ? parseInt(item.line_number) : undefined,

      // Customer information
      customerId: item.customer_id || item.client_id || '',
      customerName: item.customer_name || item.customer || item.client || '',

      // Product information
      productId: item.product_id || item.product_code || '',
      productCode: item.product_code || item.product_id || '',
      productName: item.product_name || '',
      quantity: item.quantity || item.signing_quantity ? parseInt(item.quantity || item.signing_quantity) : 0,
      unit: item.unit || item.quantity_unit || '件',

      // Amount information (optional)
      standardPrice: item.standard_price ? parseFloat(item.standard_price) : undefined,
      discountRate: item.discount_rate ? parseFloat(item.discount_rate) : undefined,
      actualPrice: item.actual_price ? parseFloat(item.actual_price) : undefined,
      subtotalAmount: item.subtotal_amount ? parseFloat(item.subtotal_amount) : undefined,
      taxAmount: item.tax_amount ? parseFloat(item.tax_amount) : undefined,
      totalAmount: item.total_amount ? parseFloat(item.total_amount) : undefined,

      // Date information
      documentDate: item.document_date || item.order_date || new Date().toISOString().split('T')[0],
      orderDate: item.order_date || item.document_date || new Date().toISOString().split('T')[0],
      plannedDeliveryDate: item.planned_delivery_date || item.delivery_date || '',
      createdDate: item.created_date || item.create_time || new Date().toISOString().split('T')[0],

      // Status information
      orderStatus: item.order_status || item.status || '生产中',
      documentStatus: item.document_status || item.doc_status || '已确认',
      deliveryStatus: item.delivery_status || item.shipping_status,

      // Business information
      transactionType: item.transaction_type || item.business_type,
      salesDepartment: item.sales_department || item.department,
      salesperson: item.salesperson || item.sales_person,
      isUrgent: item.is_urgent === true || item.urgent === '是' || item.priority === 'high',
      contractNumber: item.contract_number || item.contract_no,
      projectName: item.project_name,
      endCustomer: item.end_customer || item.final_customer,

      // Logistics information
      shipmentId: item.shipment_id,
      shipmentNumber: item.shipment_number || item.shipping_number,
      shipmentDate: item.shipment_date || item.shipping_date,
      warehouseId: item.warehouse_id,
      warehouseName: item.warehouse_name,
      consignee: item.consignee || item.receiver,
      consigneePhone: item.consignee_phone || item.receiver_phone,
      deliveryAddress: item.delivery_address || item.address || item.shipping_address,
      logisticsProvider: item.logistics_provider || item.carrier,
      trackingNumber: item.tracking_number || item.logistics_number,
      estimatedDeliveryDate: item.estimated_delivery_date,
      actualDeliveryDate: item.actual_delivery_date || item.actual_shipping_date,

      // Production information
      productionOrderId: item.production_order_id,
      productionOrderNumber: item.production_order_number,
      factoryId: item.factory_id,
      factoryName: item.factory_name,
      productionLine: item.production_line,
      plannedStartDate: item.planned_start_date,
      plannedFinishDate: item.planned_finish_date,
      workOrderStatus: item.work_order_status,
      priority: item.priority,

      // Notes
      notes: item.notes || item.remark,

      // Status identifier
      status: (item.status === 'Active' || item.status === 'Inactive') ? item.status : 'Active',
    }));

    console.log(`[DeliveryDataService] Loaded ${deliveryOrders.length} delivery orders`);
    return deliveryOrders;
  } catch (error) {
    console.error('[DeliveryDataService] Failed to load delivery orders:', error);
    return [];
  }
}

/**
 * Calculate delivery statistics
 */
export function calculateDeliveryStats(orders: DeliveryOrder[]) {
  const total = orders.length;

  // Status counts
  const completed = orders.filter(o => o.orderStatus === '已完成').length;
  const inProduction = orders.filter(o => o.orderStatus === '生产中').length;
  // Use deliveryStatus '运输中' or orderStatus '运输中'
  const inTransit = orders.filter(o => o.deliveryStatus === '运输中' || o.orderStatus === '运输中').length;

  // Performance stats
  const onTime = orders.filter(o => o.deliveryStatus === '已签收' && !o.actualDeliveryDate).length; // Note: logic from existing code seems odd (no actualDeliveryDate?), preserving onTime logic but checking below
  // Wait, existing onTime logic: `o.deliveryStatus === '已签收' && !o.actualDeliveryDate`. 
  // If actualDeliveryDate exists, it might be late? 
  // Actually, let's fix onTime logic to be more robust if possible, but for now stick to fixing missing props.
  // Existing delayed logic: actual > planned.
  const delayed = orders.filter(o => {
    if (!o.plannedDeliveryDate || !o.actualDeliveryDate) return false;
    return new Date(o.actualDeliveryDate) > new Date(o.plannedDeliveryDate);
  }).length;

  // Overdue (not yet delivered and passed planned date)
  const today = new Date();
  const overdue = orders.filter(o => {
    if (o.orderStatus === '已完成' || o.orderStatus === '已取消' || !o.plannedDeliveryDate) return false;
    return new Date(o.plannedDeliveryDate) < today;
  }).length;

  const pending = orders.filter(o => o.orderStatus === '生产中' || o.orderStatus === '待发货').length;
  const urgent = orders.filter(o => o.isUrgent).length;

  return {
    total,
    completed,
    inProduction,
    inTransit,
    onTime,
    delayed,
    overdue,
    urgent,
    pending,
    onTimeRate: completed > 0 ? (((completed - delayed) / completed) * 100).toFixed(1) : '100', // Adjusted calculation to use completed
  };
}

/**
 * Filter delivery orders by criteria
 */
interface DeliveryOrderFilters {
  status?: string;
  riskLevel?: string;
  productId?: string;
  dateFrom?: Date;
  dateTo?: Date;
  isUrgent?: boolean;
  searchText?: string;
}

export function filterDeliveryOrders(orders: DeliveryOrder[], filters: DeliveryOrderFilters) {
  return orders.filter(order => {
    // Status filter
    if (filters.status && filters.status !== 'all' && order.orderStatus !== filters.status && order.deliveryStatus !== filters.status) {
      return false;
    }

    // Risk Level filter
    // if (filters.riskLevel && filters.riskLevel !== 'all' && order.riskLevel !== filters.riskLevel) {
    //   return false;
    // }

    // Product ID filter
    if (filters.productId && order.productId !== filters.productId) {
      return false;
    }

    // Date Range filter (using plannedDeliveryDate)
    if (filters.dateFrom || filters.dateTo) {
      if (!order.plannedDeliveryDate) return false;
      const orderDate = new Date(order.plannedDeliveryDate);

      if (filters.dateFrom) {
        // Reset time part for comparison if needed, or just compare dates
        const fromDate = new Date(filters.dateFrom);
        if (orderDate < fromDate) return false;
      }

      if (filters.dateTo) {
        const toDate = new Date(filters.dateTo);
        // Set to end of day for inclusive comparison
        toDate.setHours(23, 59, 59, 999);
        if (orderDate > toDate) return false;
      }
    }

    // Urgent filter
    if (filters.isUrgent !== undefined && order.isUrgent !== filters.isUrgent) {
      return false;
    }

    // Search Text filter
    if (filters.searchText) {
      const searchLower = filters.searchText.toLowerCase();
      // Ensure properties exist before calling toLowerCase
      const orderNo = order.orderNumber || '';
      const prodName = order.productName || '';
      const custName = order.customerName || '';

      return (
        orderNo.toLowerCase().includes(searchLower) ||
        prodName.toLowerCase().includes(searchLower) ||
        custName.toLowerCase().includes(searchLower)
      );
    }

    return true;
  });
}
