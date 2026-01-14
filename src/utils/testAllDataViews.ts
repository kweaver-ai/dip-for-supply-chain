/**
 * 测试所有14个数据视图，找出正确的ID映射
 */

import { httpClient } from '../api/httpClient';

// 所有14个数据视图ID
const ALL_DATA_VIEW_IDS = {
  '物料领料单': '2000819229596147715',
  '采购订单': '2000819229600342017',
  '销售订单': '2000819229600342018',
  '产品发货物流单': '2000819229596147714',
  '客户': '2000819229587759105',
  '工厂': '2000819229600342018',
  '产品生产单': '2000819229579370498',
  '物料采购事件': '2000819229587759106',
  '供应商': '2000819229591953409',
  'BOM事件': '2000819229591953409',
  '产品': '2000819229579370497',
  '物料': '2000819229575176194',
  '库存事件': '2000819229575176194',
  '供应商绩效评分': '2000819229591953410',
  '仓库': '2000819229591953410',
  '订单': '2000819229587759106',
};

interface TestResult {
  name: string;
  id: string;
  success: boolean;
  recordCount: number;
  fields: string[];
  firstRecord?: any;
  error?: string;
  actualType?: string; // 根据字段推断的实际类型
}

/**
 * 根据字段名推断数据类型
 */
function inferDataType(fields: string[]): string {
  const fieldSet = new Set(fields);

  // 检查供应商字段
  if (fieldSet.has('supplier_id') || fieldSet.has('supplier_code') || fieldSet.has('supplier_name')) {
    return '✅ 供应商数据';
  }

  // 检查客户字段
  if (fieldSet.has('customer_id') || fieldSet.has('customer_code') || fieldSet.has('customer_name')) {
    return '✅ 客户数据';
  }

  // 检查物料字段
  if (fieldSet.has('material_id') || fieldSet.has('material_code') || fieldSet.has('material_name')) {
    return '✅ 物料数据';
  }

  // 检查产品字段
  if (fieldSet.has('product_id') || fieldSet.has('product_code') || fieldSet.has('product_name')) {
    return '✅ 产品数据';
  }

  // 检查工厂字段
  if (fieldSet.has('factory_id') || fieldSet.has('factory_code') || fieldSet.has('factory_name')) {
    return '✅ 工厂数据';
  }

  // 检查销售订单字段
  if (fieldSet.has('sales_order_id') || fieldSet.has('sales_order_number')) {
    return '✅ 销售订单数据';
  }

  // 检查采购订单字段
  if (fieldSet.has('purchase_order_id') || fieldSet.has('purchase_order_number')) {
    return '✅ 采购订单数据';
  }

  // 检查库存字段
  if (fieldSet.has('inventory_id') || fieldSet.has('warehouse_name') || fieldSet.has('item_id')) {
    return '⚠️ 库存事件数据';
  }

  // 检查BOM字段
  if (fieldSet.has('bom_id') || fieldSet.has('parent_item') || fieldSet.has('child_item')) {
    return '⚠️ BOM事件数据';
  }

  // 检查绩效字段
  if (fieldSet.has('overall_score') || fieldSet.has('quality_score') || fieldSet.has('delivery_score')) {
    return '⚠️ 绩效评分数据';
  }

  return '❓ 未知类型';
}

/**
 * 测试单个数据视图
 */
async function testDataView(name: string, id: string): Promise<TestResult> {
  try {
    const url = `/api/mdl-uniquery/v1/data-views/${id}`;
    const response = await httpClient.postAsGet<any>(url, {
      offset: 0,
      limit: 3, // 只取3条测试
    });

    const entries = response.data?.entries || [];
    const recordCount = entries.length;

    if (recordCount > 0) {
      const firstRecord = entries[0];
      const fields = Object.keys(firstRecord);
      const actualType = inferDataType(fields);

      return {
        name,
        id,
        success: true,
        recordCount,
        fields,
        firstRecord,
        actualType,
      };
    } else {
      return {
        name,
        id,
        success: false,
        recordCount: 0,
        fields: [],
        error: 'Empty response',
      };
    }
  } catch (error: any) {
    return {
      name,
      id,
      success: false,
      recordCount: 0,
      fields: [],
      error: error.message,
    };
  }
}

/**
 * 测试所有数据视图
 */
export async function testAllDataViews(): Promise<TestResult[]> {
  console.log('🔍 开始测试所有14个数据视图...\n');
  console.log('='.repeat(80));

  const results: TestResult[] = [];

  for (const [name, id] of Object.entries(ALL_DATA_VIEW_IDS)) {
    console.log(`\n📦 测试: ${name} (${id})`);
    console.log('─'.repeat(80));

    const result = await testDataView(name, id);
    results.push(result);

    if (result.success) {
      console.log(`✅ 成功: ${result.recordCount} 条记录`);
      console.log(`🔑 字段 (${result.fields.length}个):`, result.fields.slice(0, 10).join(', '), '...');
      console.log(`🎯 推断类型: ${result.actualType}`);

      // 如果推断类型与名称不符，高亮显示
      if (result.actualType && !result.actualType.includes('未知') && !result.actualType.includes(name)) {
        console.log(`⚠️⚠️⚠️ 警告: 名称是"${name}"，但数据看起来是"${result.actualType}"！`);
      }
    } else {
      console.log(`❌ 失败:`, result.error);
    }
  }

  // 打印汇总
  console.log('\n' + '='.repeat(80));
  console.log('📊 测试汇总');
  console.log('='.repeat(80));

  console.log('\n✅ 成功的数据视图:');
  results.filter(r => r.success).forEach(r => {
    console.log(`  - ${r.name} (${r.id}): ${r.recordCount}条 → ${r.actualType}`);
  });

  console.log('\n❌ 失败的数据视图:');
  results.filter(r => !r.success).forEach(r => {
    console.log(`  - ${r.name} (${r.id}): ${r.error}`);
  });

  // 找出映射错误
  console.log('\n⚠️ 可能的映射错误:');
  results.filter(r => r.success && r.actualType && !r.actualType.includes('未知')).forEach(r => {
    const nameMatch = r.actualType?.includes('供应商') && r.name.includes('供应商') ||
      r.actualType?.includes('客户') && r.name.includes('客户') ||
      r.actualType?.includes('物料') && r.name.includes('物料') ||
      r.actualType?.includes('产品') && r.name.includes('产品') ||
      r.actualType?.includes('工厂') && r.name.includes('工厂') ||
      r.actualType?.includes('销售订单') && r.name.includes('销售订单') ||
      r.actualType?.includes('采购订单') && r.name.includes('采购订单');

    if (!nameMatch) {
      console.log(`  ⚠️ "${r.name}" (${r.id}) 实际返回: ${r.actualType}`);
    }
  });

  // 生成正确的映射建议
  console.log('\n💡 建议的正确映射:');
  console.log('```typescript');
  console.log('export const DATA_VIEW_MAPPING = {');

  const typeToId: Record<string, string> = {};
  results.filter(r => r.success && r.actualType).forEach(r => {
    if (r.actualType?.includes('供应商数据')) {
      typeToId['SUPPLIER'] = r.id;
    } else if (r.actualType?.includes('客户数据')) {
      typeToId['CUSTOMER'] = r.id;
    } else if (r.actualType?.includes('物料数据')) {
      typeToId['MATERIAL'] = r.id;
    } else if (r.actualType?.includes('产品数据')) {
      typeToId['PRODUCT'] = r.id;
    } else if (r.actualType?.includes('工厂数据')) {
      typeToId['FACTORY'] = r.id;
    } else if (r.actualType?.includes('销售订单')) {
      typeToId['SALES_ORDER'] = r.id;
    } else if (r.actualType?.includes('采购订单')) {
      typeToId['PURCHASE_ORDER'] = r.id;
    }
  });

  Object.entries(typeToId).forEach(([key, id]) => {
    console.log(`  ${key}: '${id}',`);
  });
  console.log('};');
  console.log('```');

  return results;
}

// 在开发环境中自动暴露到window
if (import.meta.env.DEV && typeof window !== 'undefined') {
  (window as any).testAllDataViews = testAllDataViews;
  console.log('💡 数据视图测试工具已加载: window.testAllDataViews()');
}

