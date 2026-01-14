/**
 * 调试所有实体数据
 * 统一检查所有实体类型的API返回和字段映射
 */

import { dataViewApi } from '../api/dataViewApi';
import type { EntityType } from '../types/ontology';

interface DebugResult {
  entityType: string;
  success: boolean;
  recordCount: number;
  fields: string[];
  firstRecord?: any;
  error?: string;
}

export async function debugAllEntities(): Promise<DebugResult[]> {
  console.log('🔍 开始调试所有实体数据...\n');
  
  const results: DebugResult[] = [];
  
  // 定义要测试的实体类型
  const tests = [
    { name: 'supplier', label: '供应商', api: () => dataViewApi.getSuppliers({ limit: 5 }) },
    { name: 'customer', label: '客户', api: () => dataViewApi.getCustomers({ limit: 5 }) },
    { name: 'material', label: '物料', api: () => dataViewApi.getMaterials({ limit: 5 }) },
    { name: 'product', label: '产品', api: () => dataViewApi.getProducts({ limit: 5 }) },
    { name: 'factory', label: '工厂', api: () => dataViewApi.getFactories({ limit: 5 }) },
    { name: 'order', label: '销售订单', api: () => dataViewApi.getSalesOrders({ limit: 5 }) },
  ];

  for (const test of tests) {
    console.log(`\n📦 测试 ${test.label} (${test.name})...`);
    console.log('━'.repeat(60));
    
    try {
      const response = await test.api();
      const recordCount = response.entries?.length || 0;
      
      if (recordCount > 0) {
        const firstRecord = response.entries[0];
        const fields = Object.keys(firstRecord);
        
        console.log(`✅ 成功返回 ${recordCount} 条记录`);
        console.log(`🔑 字段列表 (${fields.length}个):`, fields.join(', '));
        console.log(`📝 第一条记录:`, firstRecord);
        
        // 检查关键字段
        console.log('\n🔍 关键字段检查:');
        const keyFields = getKeyFieldsForEntity(test.name as EntityType);
        keyFields.forEach(field => {
          const value = firstRecord[field];
          const exists = value !== undefined && value !== null;
          console.log(`  ${exists ? '✅' : '❌'} ${field}: ${exists ? value : '(不存在)'}`);
        });
        
        results.push({
          entityType: test.name,
          success: true,
          recordCount,
          fields,
          firstRecord,
        });
      } else {
        console.warn(`⚠️ 返回了空数组`);
        results.push({
          entityType: test.name,
          success: false,
          recordCount: 0,
          fields: [],
          error: 'Empty response',
        });
      }
    } catch (error: any) {
      console.error(`❌ 调用失败:`, error.message);
      results.push({
        entityType: test.name,
        success: false,
        recordCount: 0,
        fields: [],
        error: error.message,
      });
    }
  }

  // 打印总结
  console.log('\n' + '='.repeat(60));
  console.log('📊 测试总结');
  console.log('='.repeat(60));
  
  results.forEach(result => {
    const status = result.success ? '✅' : '❌';
    const count = result.success ? `${result.recordCount}条` : '失败';
    console.log(`${status} ${result.entityType}: ${count}`);
  });
  
  return results;
}

function getKeyFieldsForEntity(entityType: EntityType): string[] {
  const fieldMap: Record<EntityType, string[]> = {
    supplier: ['supplier_id', 'supplier_code', 'supplier_name', 'contact_phone', 'contact_email'],
    customer: ['customer_id', 'customer_code', 'customer_name', 'contact_person', 'contact_phone'],
    material: ['material_id', 'material_code', 'material_name', 'material_type', 'unit'],
    product: ['product_id', 'product_code', 'product_name', 'product_type'],
    factory: ['factory_id', 'factory_code', 'factory_name', 'location'],
    order: ['sales_order_id', 'sales_order_number', 'customer_name', 'product_id'],
    warehouse: ['warehouse_id', 'warehouse_code', 'warehouse_name'],
    logistics: ['logistics_id', 'tracking_number'],
  };
  
  return fieldMap[entityType] || [];
}

// 在开发环境中自动暴露到window
if (import.meta.env.DEV && typeof window !== 'undefined') {
  (window as any).debugAllEntities = debugAllEntities;
  console.log('💡 调试工具已加载: window.debugAllEntities()');
}

