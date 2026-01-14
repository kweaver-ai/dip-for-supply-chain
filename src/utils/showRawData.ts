/**
 * 显示原始API数据的调试工具
 * 直接展示API返回的原始数据，不做任何处理
 */

import { dataViewApi } from '../api/dataViewApi';

export async function showRawSupplierData() {
  console.log('🔍 显示供应商原始API数据...');
  try {
    const response = await dataViewApi.getSuppliers({ limit: 3 });
    console.log('📦 供应商API响应:', response);
    console.log('📋 前3条原始数据:', response.entries);
    if (response.entries?.[0]) {
      console.log('🔑 字段列表:', Object.keys(response.entries[0]));
    }
  } catch (error) {
    console.error('❌ 供应商API错误:', error);
  }
}

export async function showRawMaterialData() {
  console.log('🔍 显示物料原始API数据...');
  try {
    const response = await dataViewApi.getMaterials({ limit: 3 });
    console.log('📦 物料API响应:', response);
    console.log('📋 前3条原始数据:', response.entries);
    if (response.entries?.[0]) {
      console.log('🔑 字段列表:', Object.keys(response.entries[0]));
    }
  } catch (error) {
    console.error('❌ 物料API错误:', error);
  }
}

export async function showRawCustomerData() {
  console.log('🔍 显示客户原始API数据...');
  try {
    const response = await dataViewApi.getCustomers({ limit: 3 });
    console.log('📦 客户API响应:', response);
    console.log('📋 前3条原始数据:', response.entries);
    if (response.entries?.[0]) {
      console.log('🔑 字段列表:', Object.keys(response.entries[0]));
    }
  } catch (error) {
    console.error('❌ 客户API错误:', error);
  }
}

export async function showRawProductData() {
  console.log('🔍 显示产品原始API数据...');
  try {
    const response = await dataViewApi.getProducts({ limit: 3 });
    console.log('📦 产品API响应:', response);
    console.log('📋 前3条原始数据:', response.entries);
    if (response.entries?.[0]) {
      console.log('🔑 字段列表:', Object.keys(response.entries[0]));
    }
  } catch (error) {
    console.error('❌ 产品API错误:', error);
  }
}

export async function showRawFactoryData() {
  console.log('🔍 显示工厂原始API数据...');
  try {
    const response = await dataViewApi.getFactories({ limit: 3 });
    console.log('📦 工厂API响应:', response);
    console.log('📋 前3条原始数据:', response.entries);
    if (response.entries?.[0]) {
      console.log('🔑 字段列表:', Object.keys(response.entries[0]));
    }
  } catch (error) {
    console.error('❌ 工厂API错误:', error);
  }
}

export async function showRawSalesOrderData() {
  console.log('🔍 显示销售订单原始API数据...');
  try {
    const response = await dataViewApi.getSalesOrders({ limit: 3 });
    console.log('📦 销售订单API响应:', response);
    console.log('📋 前3条原始数据:', response.entries);
    if (response.entries?.[0]) {
      console.log('🔑 字段列表:', Object.keys(response.entries[0]));
    }
  } catch (error) {
    console.error('❌ 销售订单API错误:', error);
  }
}

// 在开发环境中自动暴露到window
if (import.meta.env.DEV && typeof window !== 'undefined') {
  (window as any).showRawSupplierData = showRawSupplierData;
  (window as any).showRawMaterialData = showRawMaterialData;
  (window as any).showRawCustomerData = showRawCustomerData;
  (window as any).showRawProductData = showRawProductData;
  (window as any).showRawFactoryData = showRawFactoryData;
  (window as any).showRawSalesOrderData = showRawSalesOrderData;

  console.log('💡 原始数据显示工具已加载:');
  console.log('  - window.showRawSupplierData()');
  console.log('  - window.showRawMaterialData()');
  console.log('  - window.showRawCustomerData()');
  console.log('  - window.showRawProductData()');
  console.log('  - window.showRawFactoryData()');
  console.log('  - window.showRawSalesOrderData()');
}

