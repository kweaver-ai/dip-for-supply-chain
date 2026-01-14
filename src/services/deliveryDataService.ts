/**
 * 订单交付数据服务
 * 负责将原始CSV数据转换为DeliveryOrder格式
 */

import type { DeliveryOrder } from '../types/ontology';
import type { SalesOrderRaw, ShipmentRaw, ProductionOrderRaw } from './dataLoader';
import { loadDeliveryData } from './dataLoader';
import { loadHDDeliveryOrders } from './hdDeliveryDataLoader';


/**
 * 将销售订单原始数据转换为DeliveryOrder
 */
function convertSalesOrderToDeliveryOrder(
  salesOrder: SalesOrderRaw,
  shipments: ShipmentRaw[],
  productionOrders: ProductionOrderRaw[]
): DeliveryOrder {
  // 查找对应的发货记录
  const shipment = shipments.find(s => s.sales_order_number === salesOrder.sales_order_number);

  // 查找对应的生产订单（通过产品ID匹配）
  const productionOrder = productionOrders.find(
    po => po.output_id === salesOrder.product_id
  );

  // 确定订单状态 - 考虑真实企业运营情况
  let orderStatus = salesOrder.order_status;
  let deliveryStatus = shipment?.delivery_status;

  // 计算订单日期距今的时间
  const orderDate = new Date(salesOrder.document_date);
  const plannedDeliveryDate = new Date(salesOrder.planned_delivery_date);
  const today = new Date();
  const daysSinceOrder = Math.floor((today.getTime() - orderDate.getTime()) / (1000 * 60 * 60 * 24));
  const daysSincePlannedDelivery = Math.floor((today.getTime() - plannedDeliveryDate.getTime()) / (1000 * 60 * 60 * 24));

  // 状态映射逻辑
  if (salesOrder.order_status === '已取消') {
    orderStatus = '已取消';
  } else if (shipment) {
    // 有发货记录
    if (shipment.delivery_status === '已签收') {
      orderStatus = '已完成';
      deliveryStatus = '已签收';
    } else if (shipment.delivery_status === '运输中') {
      // 运输中超过30天的，自动标记为已完成（实际已签收但未更新状态）
      if (daysSincePlannedDelivery > 30) {
        orderStatus = '已完成';
        deliveryStatus = '已签收';
      } else {
        orderStatus = '运输中';
        deliveryStatus = '运输中';
      }
    } else if (shipment.delivery_status === '已发货') {
      // 已发货超过30天的，自动标记为已完成
      if (daysSincePlannedDelivery > 30) {
        orderStatus = '已完成';
        deliveryStatus = '已签收';
      } else {
        orderStatus = '运输中';
        deliveryStatus = '已发货';
      }
    }
  } else if (salesOrder.order_status === '已发货') {
    // 已发货但没有shipment记录的，超过30天标记为已完成
    if (daysSincePlannedDelivery > 30) {
      orderStatus = '已完成';
    } else if (daysSincePlannedDelivery > 0) {
      // 已经过了交付日期但未超过30天，标记为运输中
      orderStatus = '运输中';
    } else {
      orderStatus = '运输中';
    }
  } else if (productionOrder) {
    if (productionOrder.work_order_status === '已完工') {
      // 生产完工超过60天的，标记为已完成（假设已发货并签收）
      if (daysSincePlannedDelivery > 60) {
        orderStatus = '已完成';
      } else if (daysSincePlannedDelivery > 30) {
        // 超过30天标记为运输中
        orderStatus = '运输中';
      } else {
        orderStatus = '待发货';
      }
    } else {
      // 生产中超过90天的，标记为已完成
      if (daysSincePlannedDelivery > 90) {
        orderStatus = '已完成';
      } else {
        orderStatus = '生产中';
      }
    }
  } else {
    // 没有任何记录的订单，超过90天标记为已完成
    if (daysSincePlannedDelivery > 90) {
      orderStatus = '已完成';
    } else if (daysSincePlannedDelivery > 60) {
      orderStatus = '运输中';
    } else if (daysSincePlannedDelivery > 30) {
      orderStatus = '待发货';
    } else {
      orderStatus = '生产中';
    }
  }

  return {
    // 基础订单信息
    orderId: salesOrder.sales_order_id,
    orderNumber: salesOrder.sales_order_number,
    orderName: `${salesOrder.project_name || salesOrder.product_name}订单`,
    lineNumber: parseInt(salesOrder.line_number) || undefined,

    // 客户信息
    customerId: salesOrder.customer_id,
    customerName: salesOrder.customer_name,

    // 产品信息
    productId: salesOrder.product_id,
    productCode: salesOrder.product_code,
    productName: salesOrder.product_name,
    quantity: parseFloat(salesOrder.quantity) || 0,
    unit: salesOrder.unit,

    // 金额信息
    standardPrice: parseFloat(salesOrder.standard_price) || undefined,
    discountRate: parseFloat(salesOrder.discount_rate) || undefined,
    actualPrice: parseFloat(salesOrder.actual_price) || undefined,
    subtotalAmount: parseFloat(salesOrder.subtotal_amount) || undefined,
    taxAmount: parseFloat(salesOrder.tax_amount) || undefined,
    totalAmount: parseFloat(salesOrder.total_amount) || undefined,

    // 日期信息
    documentDate: salesOrder.document_date,
    orderDate: salesOrder.document_date,
    plannedDeliveryDate: salesOrder.planned_delivery_date,
    createdDate: salesOrder.created_date,

    // 状态信息
    orderStatus: orderStatus,
    documentStatus: salesOrder.document_status,
    deliveryStatus: deliveryStatus,

    // 业务信息
    transactionType: salesOrder.transaction_type,
    salesDepartment: salesOrder.sales_department,
    salesperson: salesOrder.salesperson,
    isUrgent: salesOrder.is_urgent === '是',
    contractNumber: salesOrder.contract_number || undefined,
    projectName: salesOrder.project_name || undefined,
    endCustomer: salesOrder.end_customer || undefined,

    // 物流信息
    shipmentId: shipment?.shipment_id,
    shipmentNumber: shipment?.shipment_number,
    shipmentDate: shipment?.shipment_date,
    warehouseId: shipment?.warehouse_id,
    warehouseName: shipment?.warehouse_name,
    consignee: shipment?.consignee,
    consigneePhone: shipment?.consignee_phone,
    deliveryAddress: shipment?.delivery_address,
    logisticsProvider: shipment?.logistics_provider,
    trackingNumber: shipment?.tracking_number,
    estimatedDeliveryDate: shipment?.estimated_delivery_date,
    actualDeliveryDate: shipment?.actual_delivery_date,

    // 生产信息
    productionOrderId: productionOrder?.production_order_id,
    productionOrderNumber: productionOrder?.production_order_number,
    factoryId: productionOrder?.factory_id,
    factoryName: productionOrder?.factory_name,
    productionLine: productionOrder?.production_line,
    plannedStartDate: productionOrder?.planned_start_date,
    plannedFinishDate: productionOrder?.planned_finish_date,
    workOrderStatus: productionOrder?.work_order_status,
    priority: productionOrder?.priority,

    // 备注
    notes: salesOrder.notes || undefined,

    // 状态标识
    status: salesOrder.status === 'Active' ? 'Active' : 'Inactive',
  };
}

/**
 * 加载并转换所有订单交付数据
 */
export async function loadDeliveryOrders(): Promise<DeliveryOrder[]> {
  try {
    const { salesOrders, shipments, productionOrders } = await loadDeliveryData();

    // 按订单编号分组销售订单（一个订单可能有多行）
    const orderMap = new Map<string, SalesOrderRaw[]>();
    salesOrders.forEach(order => {
      const key = order.sales_order_number;
      if (!orderMap.has(key)) {
        orderMap.set(key, []);
      }
      orderMap.get(key)!.push(order);
    });

    // 转换为DeliveryOrder数组
    const deliveryOrders: DeliveryOrder[] = [];
    orderMap.forEach((orderLines) => {
      // 对于多行订单，每行都创建一个DeliveryOrder
      orderLines.forEach(orderLine => {
        const deliveryOrder = convertSalesOrderToDeliveryOrder(
          orderLine,
          shipments,
          productionOrders
        );
        deliveryOrders.push(deliveryOrder);
      });
    });

    // 按创建日期降序排序
    deliveryOrders.sort((a, b) => {
      return new Date(b.createdDate).getTime() - new Date(a.createdDate).getTime();
    });

    return deliveryOrders;
  } catch (error) {
    console.error('Error loading delivery orders:', error);
    return [];
  }
}

/**
 * 计算订单统计信息
 */
export function calculateDeliveryStats(orders: DeliveryOrder[]) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  return {
    // 状态统计
    inTransit: orders.filter(o => o.orderStatus === '运输中').length,
    inProduction: orders.filter(o => o.orderStatus === '生产中').length,
    completed: orders.filter(o => o.orderStatus === '已完成').length,
    cancelled: orders.filter(o => o.orderStatus === '已取消').length,

    // 逾期订单（只统计30天内的逾期订单，符合真实企业运营）
    overdue: orders.filter(o => {
      if (o.orderStatus === '已完成' || o.orderStatus === '已取消') return false;
      const dueDate = new Date(o.plannedDeliveryDate);
      const daysSinceDue = Math.floor((today.getTime() - dueDate.getTime()) / (1000 * 60 * 60 * 24));
      return daysSinceDue > 0 && daysSinceDue <= 30;  // 只统计30天内的逾期
    }).length,

    // 紧急订单（未来5天内到期、标记为紧急、或逾期的订单）
    urgent: orders.filter(o => {
      if (o.orderStatus === '已完成' || o.orderStatus === '已取消') return false;
      // 标记为紧急的订单
      if (o.isUrgent === true) return true;
      // 逾期订单也算紧急
      const dueDate = new Date(o.plannedDeliveryDate);
      const daysDiff = Math.ceil((dueDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
      // 5天内到期或已逾期（30天内）
      return (daysDiff >= 0 && daysDiff <= 5) || (daysDiff < 0 && daysDiff >= -30);
    }).length,

    // 总订单数
    total: orders.length,

    // 活跃订单数
    active: orders.filter(o => o.status === 'Active').length,
  };
}

/**
 * 过滤订单
 */
export function filterDeliveryOrders(
  orders: DeliveryOrder[],
  filters: {
    status?: string;
    customer?: string;
    product?: string;
    dateFrom?: string;
    dateTo?: string;
    isUrgent?: boolean;
    searchText?: string;
  }
): DeliveryOrder[] {
  let filtered = [...orders];

  if (filters.status) {
    filtered = filtered.filter(o => o.orderStatus === filters.status);
  }

  if (filters.customer) {
    filtered = filtered.filter(o => o.customerName.includes(filters.customer!));
  }

  if (filters.product) {
    filtered = filtered.filter(o => o.productName.includes(filters.product!));
  }

  if (filters.dateFrom) {
    filtered = filtered.filter(o => o.orderDate >= filters.dateFrom!);
  }

  if (filters.dateTo) {
    filtered = filtered.filter(o => o.orderDate <= filters.dateTo!);
  }

  if (filters.isUrgent !== undefined) {
    filtered = filtered.filter(o => o.isUrgent === filters.isUrgent);
  }

  if (filters.searchText) {
    const searchLower = filters.searchText.toLowerCase();
    filtered = filtered.filter(o =>
      o.orderNumber.toLowerCase().includes(searchLower) ||
      o.customerName.toLowerCase().includes(searchLower) ||
      o.productName.toLowerCase().includes(searchLower) ||
      o.orderName.toLowerCase().includes(searchLower)
    );
  }

  return filtered;
}

/**
 * 根据模式加载订单数据
 * @param mode 数据模式: 'api' 使用惠达真实数据, 'mock' 使用Mock数据
 */
export async function loadDeliveryOrdersByMode(mode: 'mock' | 'api'): Promise<DeliveryOrder[]> {
  console.log(`[订单交付] 加载数据，模式: ${mode}`);

  if (mode === 'api') {
    // 大脑模式：使用惠达供应链真实数据
    const orders = await loadHDDeliveryOrders();
    console.log(`[订单交付-大脑模式] 加载惠达订单数据: ${orders.length} 条`);
    return orders;
  }

  // Mock模式：使用原有的Mock数据
  const orders = await loadDeliveryOrders();
  console.log(`[订单交付-Mock模式] 加载Mock订单数据: ${orders.length} 条`);
  return orders;
}
