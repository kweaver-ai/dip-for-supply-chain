/**
 * 惠达供应链订单数据加载器
 * 负责从 HD供应链/订单信息_fixed.csv 加载并转换为 DeliveryOrder 格式
 */

import type { DeliveryOrder } from '../types/ontology';
import { httpClient } from '../api/httpClient';
import { dataViewApi } from '../api/dataViewApi';

/**
 * 惠达订单原始数据结构
 */
export interface HDOrderRaw {
    id: string;
    signing_date: string;
    contract_number: string;
    product_category: string;
    product_code: string;
    product_name: string;
    signing_quantity: string;
    shipping_quantity: string;
    shipping_date: string;
    promised_delivery_date: string;
}

/**
 * 判断订单状态
 */
function determineOrderStatus(order: HDOrderRaw): string {
    const today = new Date();
    const signingQty = parseFloat(order.signing_quantity) || 0;
    const shippingQty = parseFloat(order.shipping_quantity) || 0;
    const promisedDate = order.promised_delivery_date ? new Date(order.promised_delivery_date) : null;
    const shippingDate = order.shipping_date ? new Date(order.shipping_date) : null;

    // 负数订单（退货/取消）
    if (signingQty < 0) {
        return '已取消';
    }

    // 完全发货
    if (shippingQty >= signingQty && shippingQty > 0) {
        return '已完成';
    }

    // 部分发货 - 运输中
    if (shippingQty > 0 && shippingQty < signingQty) {
        return '运输中';
    }

    // 未发货或发货数量为0
    if (!shippingQty || shippingQty === 0) {
        // 有发货日期但发货数量为空，可能是待发货
        if (shippingDate) {
            return '待发货';
        }
        // 无发货记录，生产中
        return '生产中';
    }

    return '待确认';
}

/**
 * 判断订单是否逾期
 */
function isOrderOverdue(order: HDOrderRaw): boolean {
    if (!order.promised_delivery_date) return false;

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const promisedDate = new Date(order.promised_delivery_date);
    const signingQty = parseFloat(order.signing_quantity) || 0;
    const shippingQty = parseFloat(order.shipping_quantity) || 0;

    // 已完成的订单不算逾期
    if (shippingQty >= signingQty && signingQty > 0) return false;

    // 取消的订单不算逾期
    if (signingQty < 0) return false;

    return today > promisedDate;
}

/**
 * 判断订单是否紧急
 */
function isOrderUrgent(order: HDOrderRaw): boolean {
    if (!order.promised_delivery_date) return false;

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const promisedDate = new Date(order.promised_delivery_date);
    const signingQty = parseFloat(order.signing_quantity) || 0;
    const shippingQty = parseFloat(order.shipping_quantity) || 0;

    // 已完成的订单不算紧急
    if (shippingQty >= signingQty && signingQty > 0) return false;

    // 5天内到期或已逾期
    const daysDiff = Math.ceil((promisedDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    return daysDiff <= 5;
}

/**
 * 将惠达订单转换为DeliveryOrder格式
 */
function convertHDOrderToDeliveryOrder(order: HDOrderRaw, index: number): DeliveryOrder {
    const orderStatus = determineOrderStatus(order);
    const signingQty = parseFloat(order.signing_quantity) || 0;
    const shippingQty = parseFloat(order.shipping_quantity) || 0;

    // 计算剩余天数
    let daysUntilDue = 0;
    if (order.promised_delivery_date) {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const promisedDate = new Date(order.promised_delivery_date);
        daysUntilDue = Math.ceil((promisedDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    }

    // 安全获取合同编号
    const contractNumber = order.contract_number || '';

    // 根据合同编号前缀生成客户名称
    const customerName = contractNumber.startsWith('HDKJ') ? '惠达科技客户' : '惠达供应链客户';

    return {
        // 基础订单信息
        orderId: `HD-${order.id || index}`,
        orderNumber: contractNumber,
        orderName: `${order.product_name || '未知产品'}订单`,
        lineNumber: parseInt(order.id) || index + 1,

        // 客户信息 - 使用完整的合同编号作为客户ID
        customerId: contractNumber,
        customerName: customerName,

        // 产品信息
        productId: order.product_code,
        productCode: order.product_code,
        productName: order.product_name,
        quantity: signingQty,
        unit: '台',

        // 金额信息（惠达数据无金额，留空）
        standardPrice: undefined,
        discountRate: undefined,
        actualPrice: undefined,
        subtotalAmount: undefined,
        taxAmount: undefined,
        totalAmount: undefined,

        // 日期信息
        documentDate: order.signing_date,
        orderDate: order.signing_date,
        plannedDeliveryDate: order.promised_delivery_date || order.shipping_date || order.signing_date,
        createdDate: order.signing_date,

        // 状态信息
        orderStatus: orderStatus,
        documentStatus: '已审核',
        deliveryStatus: shippingQty > 0 ? '已发货' : undefined,

        // 业务信息
        transactionType: '标准销售',
        salesDepartment: '销售部',
        salesperson: undefined,
        isUrgent: isOrderUrgent(order),
        contractNumber: contractNumber,
        projectName: undefined,
        endCustomer: undefined,

        // 物流信息
        shipmentId: shippingQty > 0 ? `SH-${order.id}` : undefined,
        shipmentNumber: undefined,
        shipmentDate: order.shipping_date || undefined,
        warehouseId: undefined,
        warehouseName: undefined,
        consignee: undefined,
        consigneePhone: undefined,
        deliveryAddress: undefined,
        logisticsProvider: undefined,
        trackingNumber: undefined,
        estimatedDeliveryDate: order.promised_delivery_date || undefined,
        actualDeliveryDate: shippingQty >= signingQty ? order.shipping_date : undefined,

        // 生产信息
        productionOrderId: undefined,
        productionOrderNumber: undefined,
        factoryId: undefined,
        factoryName: undefined,
        productionLine: undefined,
        plannedStartDate: undefined,
        plannedFinishDate: undefined,
        workOrderStatus: undefined,
        priority: isOrderUrgent(order) ? '紧急' : '普通',

        // 备注
        notes: `产品类别: ${order.product_category}, 签约数量: ${signingQty}, 发货数量: ${shippingQty}`,

        // 状态标识
        status: signingQty >= 0 ? 'Active' : 'Inactive',

        // 扩展属性（用于UI显示）
        daysUntilDue: daysUntilDue,
        isOverdue: isOrderOverdue(order),
    } as DeliveryOrder & { daysUntilDue: number; isOverdue: boolean };
}

/**
 * 从API加载惠达订单数据
 */
async function loadHDOrdersFromAPI(): Promise<HDOrderRaw[]> {
    try {
        console.log('[HD数据加载] 尝试从API加载数据 (Direct HttpClient)...');

        // 使用用户指定的完整 API 路径 (通常通过 Proxy 转发)
        // 目标: https://dip.aishu.cn/api/mdl-uniquery/v1/data-views/2004376134629285890?include_view=true
        // 代理: /proxy-metric -> /api/mdl-uniquery
        const viewId = '2004376134629285890';
        const url = `/proxy-metric/v1/data-views/${viewId}?include_view=true`;

        const requestBody = {
            limit: 1000,
            offset: 0
        };

        // 使用 HttpClient 发送请求 (自动处理 Auth Token 和 Headers)
        const response = await httpClient.postAsGet<any>(url, requestBody);

        // 兼容不同的响应结构 (DataViewResponse vs Direct Array)
        const rawData = response.data?.entries || response.data || [];

        console.log(`[HD数据加载] API返回 ${Array.isArray(rawData) ? rawData.length : 0} 条记录`);
        if (Array.isArray(rawData) && rawData.length > 0) {
            console.log('[HD数据加载] 第一条数据示例:', rawData[0]);
        }

        if (!Array.isArray(rawData)) {
            console.warn('[HD数据加载] API响应数据格式不正确:', response.data);
            return [];
        }

        return rawData.map((item: any) => {
            // 映射字段 (尝试兼容 snake_case 和 camelCase)
            return {
                id: String(item.id || item._id || ''),
                signing_date: item.signing_date || item.signingDate || item.order_date || item.orderDate || '',
                contract_number: item.contract_number || item.contractNumber || item.order_number || item.orderNumber || '',
                product_category: item.product_category || item.productCategory || '',
                product_code: item.product_code || item.productCode || item.item_code || '',
                product_name: item.product_name || item.productName || item.item_name || '',
                signing_quantity: String(item.signing_quantity || item.signingQuantity || item.quantity || 0),
                shipping_quantity: String(item.shipping_quantity || item.shippingQuantity || item.delivered_quantity || 0),
                shipping_date: item.shipping_date || item.shippingDate || '',
                promised_delivery_date: item.promised_delivery_date || item.promisedDeliveryDate || ''
            } as HDOrderRaw;
        });

    } catch (error) {
        console.error('[HD数据加载] API加载异常 (HttpClient Direct):', error);
        // 不抛出错误，允许回退到CSV
        return [];
    }
}

/**
 * 加载并转换所有惠达订单交付数据
 */
export async function loadHDDeliveryOrders(): Promise<DeliveryOrder[]> {
    try {
        // 优先尝试从API加载
        let hdOrders = await loadHDOrdersFromAPI();

        if (hdOrders.length === 0) {
            console.warn('[HD数据加载] 未加载到订单数据');
            return [];
        }

        // 转换为DeliveryOrder数组
        const deliveryOrders = hdOrders.map((order, index) =>
            convertHDOrderToDeliveryOrder(order, index)
        );

        // 按日期降序排序
        deliveryOrders.sort((a, b) => {
            return new Date(b.orderDate).getTime() - new Date(a.orderDate).getTime();
        });

        console.log('[HD数据加载] 转换完成:', {
            total: deliveryOrders.length,
            completed: deliveryOrders.filter(o => o.orderStatus === '已完成').length,
            inTransit: deliveryOrders.filter(o => o.orderStatus === '运输中').length,
            inProduction: deliveryOrders.filter(o => o.orderStatus === '生产中').length,
            cancelled: deliveryOrders.filter(o => o.orderStatus === '已取消').length,
        });

        return deliveryOrders;
    } catch (error) {
        console.error('[HD数据加载] 转换订单数据失败:', error);
        return [];
    }
}
