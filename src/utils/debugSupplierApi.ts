/**
 * 调试供应商API
 * 在浏览器控制台中使用
 */

import { dataViewApi } from '../api/dataViewApi';

export async function debugSupplierApi() {
  console.log('🔍 开始调试供应商API...');
  
  try {
    // 1. 测试API调用
    console.log('📡 调用 getSuppliers()...');
    const response = await dataViewApi.getSuppliers({ limit: 10 });
    
    console.log('✅ API响应:', response);
    console.log('📊 返回记录数:', response.entries?.length || 0);
    
    if (response.entries && response.entries.length > 0) {
      console.log('📝 第一条记录:', response.entries[0]);
      console.log('🔑 可用字段:', Object.keys(response.entries[0]));
      
      // 检查关键字段
      const firstEntry = response.entries[0];
      console.log('\n🔍 关键字段检查:');
      console.log('  - supplier_id:', firstEntry.supplier_id);
      console.log('  - supplier_code:', firstEntry.supplier_code);
      console.log('  - supplier_name:', firstEntry.supplier_name);
      console.log('  - material_name:', firstEntry.material_name);
      console.log('  - material_code:', firstEntry.material_code);
      
      // 检查是否有supplierId字段（可能的命名差异）
      console.log('\n🔍 检查可能的字段名:');
      console.log('  - supplierId:', firstEntry.supplierId);
      console.log('  - supplierCode:', firstEntry.supplierCode);
      console.log('  - supplierName:', firstEntry.supplierName);
    } else {
      console.warn('⚠️ API返回了空数组');
    }
    
    return response;
  } catch (error) {
    console.error('❌ API调用失败:', error);
    throw error;
  }
}

// 在开发环境中自动暴露到window
if (import.meta.env.DEV && typeof window !== 'undefined') {
  (window as any).debugSupplierApi = debugSupplierApi;
  console.log('💡 调试工具已加载: window.debugSupplierApi()');
}

