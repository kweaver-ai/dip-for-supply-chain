/**
 * API调试工具
 * 用于测试和调试数据视图API调用
 */

import { httpClient } from '../api/httpClient';
import { DATA_VIEW_MAPPING } from '../api/dataViewApi';

export interface ApiTestResult {
  method: string;
  url: string;
  success: boolean;
  data?: any;
  error?: string;
  responseTime?: number;
}

/**
 * 测试数据视图API的不同调用方式
 */
export async function testDataViewApiMethods(dataViewId: string): Promise<ApiTestResult[]> {
  const results: ApiTestResult[] = [];
  const baseUrl = '/api/mdl-uniquery/v1';

  // 方式1: GET with query params
  try {
    const startTime = Date.now();
    const url = `${baseUrl}/data-views/${dataViewId}?offset=0&limit=5`;
    const response = await httpClient.get(url);
    results.push({
      method: 'GET with query params',
      url,
      success: true,
      data: response.data,
      responseTime: Date.now() - startTime,
    });
  } catch (err: any) {
    results.push({
      method: 'GET with query params',
      url: `${baseUrl}/data-views/${dataViewId}?offset=0&limit=5`,
      success: false,
      error: err.message || String(err),
    });
  }

  // 方式2: POST with body
  try {
    const startTime = Date.now();
    const url = `${baseUrl}/data-views/${dataViewId}`;
    const response = await httpClient.post(url, { offset: 0, limit: 5 });
    results.push({
      method: 'POST with body',
      url,
      success: true,
      data: response.data,
      responseTime: Date.now() - startTime,
    });
  } catch (err: any) {
    results.push({
      method: 'POST with body',
      url: `${baseUrl}/data-views/${dataViewId}`,
      success: false,
      error: err.message || String(err),
    });
  }

  // 方式3: POST as GET (当前使用的方式)
  try {
    const startTime = Date.now();
    const url = `${baseUrl}/data-views/${dataViewId}`;
    const response = await httpClient.postAsGet(url, { offset: 0, limit: 5 });
    results.push({
      method: 'POST as GET (current)',
      url,
      success: true,
      data: response.data,
      responseTime: Date.now() - startTime,
    });
  } catch (err: any) {
    results.push({
      method: 'POST as GET (current)',
      url: `${baseUrl}/data-views/${dataViewId}`,
      success: false,
      error: err.message || String(err),
    });
  }

  return results;
}

/**
 * 测试所有数据视图
 */
export async function testAllDataViews(): Promise<Record<string, ApiTestResult[]>> {
  const results: Record<string, ApiTestResult[]> = {};

  for (const [name, id] of Object.entries(DATA_VIEW_MAPPING)) {
    console.log(`Testing ${name} (${id})...`);
    results[name] = await testDataViewApiMethods(id);
  }

  return results;
}

/**
 * 打印测试结果
 */
export function printTestResults(results: ApiTestResult[]): void {
  console.group('API Test Results');
  results.forEach((result, index) => {
    console.group(`${index + 1}. ${result.method}`);
    console.log('URL:', result.url);
    console.log('Success:', result.success);
    if (result.success) {
      console.log('Response Time:', result.responseTime, 'ms');
      console.log('Data:', result.data);
    } else {
      console.error('Error:', result.error);
    }
    console.groupEnd();
  });
  console.groupEnd();
}

/**
 * 在浏览器控制台中运行测试
 * 使用方法: 在控制台输入 window.testDataViewApi()
 */
export function setupGlobalDebugger(): void {
  if (typeof window !== 'undefined') {
    (window as any).testDataViewApi = async (dataViewId?: string) => {
      const id = dataViewId || DATA_VIEW_MAPPING.SUPPLIER;
      console.log(`Testing data view: ${id}`);
      const results = await testDataViewApiMethods(id);
      printTestResults(results);
      return results;
    };

    (window as any).testAllDataViews = async () => {
      console.log('Testing all data views...');
      const results = await testAllDataViews();
      console.log('All Results:', results);
      return results;
    };

    console.log('API Debugger loaded. Available commands:');
    console.log('  - window.testDataViewApi(dataViewId) - Test a specific data view');
    console.log('  - window.testAllDataViews() - Test all data views');
  }
}

