/**
 * Production Plan Agent
 * 
 * 在大脑模式下显示基于CSV数据的智能计算生产计划
 */

import { useState, useEffect, useMemo } from 'react';
import { Factory, Loader2, Clock, Package, BarChart3, AlertCircle } from 'lucide-react';
import {
    loadProductionPlanData,
    calculateProductionStats,
    type ProductionPlan,
    type ProductionStats,
} from '../../services/productionPlanCalculator';

export const ProductionPlanAgent = () => {
    const [plans, setPlans] = useState<ProductionPlan[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // 加载CSV数据
    useEffect(() => {
        const loadData = async () => {
            try {
                setLoading(true);
                const data = await loadProductionPlanData();
                setPlans(data);
                setError(null);
            } catch (err) {
                console.error('[ProductionPlanAgent] 加载数据失败:', err);
                setError('加载生产计划数据失败');
            } finally {
                setLoading(false);
            }
        };

        loadData();
    }, []);

    // 计算统计数据
    const stats: ProductionStats | null = useMemo(() => {
        if (plans.length === 0) return null;
        return calculateProductionStats(plans);
    }, [plans]);

    if (loading) {
        return (
            <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center justify-center py-8">
                    <Loader2 className="animate-spin text-indigo-500" size={24} />
                    <span className="ml-2 text-slate-600">加载生产计划数据...</span>
                </div>
            </div>
        );
    }

    if (error || !stats) {
        return (
            <div className="bg-white rounded-lg shadow p-6">
                <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg flex items-center gap-2">
                    <AlertCircle className="text-yellow-600" size={20} />
                    <p className="text-sm text-yellow-700">
                        {error || '暂无生产计划数据'}
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-white rounded-lg shadow">
            <div className="p-6 border-b border-slate-200">
                <h2 className="text-lg font-semibold text-slate-800">生产计划面板</h2>
                <p className="text-xs text-slate-500 mt-1">
                    共{stats.totalOrders}个订单 • 总产量{stats.totalQuantity.toLocaleString()}
                </p>
            </div>

            <div className="p-6 space-y-6">
                {/* 1. 生产效率分析 */}
                <div>
                    <h3 className="text-sm font-semibold text-slate-700 mb-4 flex items-center gap-2">
                        <Clock className="text-indigo-500" size={18} />
                        生产效率分析
                    </h3>

                    {/* 总体统计 */}
                    <div className="grid grid-cols-3 gap-4 mb-4">
                        <div className="p-3 bg-indigo-50 rounded-lg">
                            <div className="text-xs text-indigo-600 mb-1">总产量</div>
                            <div className="text-2xl font-bold text-indigo-700">
                                {stats.totalQuantity.toLocaleString()}
                            </div>
                        </div>
                        <div className="p-3 bg-purple-50 rounded-lg">
                            <div className="text-xs text-purple-600 mb-1">订单数</div>
                            <div className="text-2xl font-bold text-purple-700">
                                {stats.totalOrders}
                            </div>
                        </div>
                        <div className="p-3 bg-blue-50 rounded-lg">
                            <div className="text-xs text-blue-600 mb-1">平均周期</div>
                            <div className="text-2xl font-bold text-blue-700">
                                {stats.avgCycleDays}天
                            </div>
                        </div>
                    </div>

                    {/* 产品详情 */}
                    <div>
                        <h4 className="text-xs font-medium text-slate-600 mb-2">产品生产详情</h4>
                        <div className="space-y-2">
                            {stats.productAnalysis.map((product, index) => (
                                <div key={index} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2">
                                            <Package className="text-slate-600" size={14} />
                                            <span className="text-sm font-medium text-slate-800">{product.code}</span>
                                            <span className={`text-xs px-2 py-0.5 rounded ${product.priority === 1 ? 'bg-red-100 text-red-700' :
                                                product.priority === 2 ? 'bg-yellow-100 text-yellow-700' :
                                                    'bg-slate-100 text-slate-700'
                                                }`}>
                                                优先级{product.priority}
                                            </span>
                                        </div>
                                        <div className="text-xs text-slate-500 mt-1">
                                            状态: {product.status}
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-4 text-xs text-slate-600">
                                        <span>产量: {product.quantity.toLocaleString()}</span>
                                        <span className="font-semibold text-indigo-600">
                                            周期: {product.cycleDays}天
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* 2. 产品组合分析 */}
                <div>
                    <h3 className="text-sm font-semibold text-slate-700 mb-4 flex items-center gap-2">
                        <Package className="text-indigo-500" size={18} />
                        产品组合分析
                    </h3>

                    {/* 优先级分布 */}
                    <div>
                        <h4 className="text-xs font-medium text-slate-600 mb-2">订单优先级分布</h4>
                        <div className="space-y-2">
                            {stats.priorityAnalysis.map((item, index) => (
                                <div key={index} className="flex items-center justify-between p-2 bg-slate-50 rounded">
                                    <span className={`text-sm font-medium ${item.priority === 1 ? 'text-red-600' :
                                        item.priority === 2 ? 'text-yellow-600' :
                                            'text-slate-600'
                                        }`}>
                                        优先级{item.priority}
                                    </span>
                                    <div className="flex items-center gap-3">
                                        <span className="text-xs text-slate-600">
                                            {item.quantity.toLocaleString()} ({item.orderCount}个订单)
                                        </span>
                                        <div className="w-24 h-2 bg-slate-200 rounded overflow-hidden">
                                            <div
                                                className={`h-full ${item.priority === 1 ? 'bg-red-500' :
                                                    item.priority === 2 ? 'bg-yellow-500' :
                                                        'bg-slate-400'
                                                    }`}
                                                style={{ width: `${item.percentage}%` }}
                                            />
                                        </div>
                                        <span className="text-xs font-semibold text-slate-600 w-12 text-right">
                                            {item.percentage}%
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* 状态分布 */}
                    <div className="mt-4">
                        <h4 className="text-xs font-medium text-slate-600 mb-2">订单状态分布</h4>
                        <div className="space-y-2">
                            {stats.statusDistribution.map((item, index) => (
                                <div key={index} className="flex items-center justify-between p-2 bg-slate-50 rounded">
                                    <span className="text-sm text-slate-700">{item.status}</span>
                                    <div className="flex items-center gap-3">
                                        <span className="text-xs text-slate-600">{item.count}个订单</span>
                                        <div className="w-24 h-2 bg-slate-200 rounded overflow-hidden">
                                            <div
                                                className="h-full bg-green-500"
                                                style={{ width: `${item.percentage}%` }}
                                            />
                                        </div>
                                        <span className="text-xs font-semibold text-green-600 w-12 text-right">
                                            {item.percentage}%
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* 3. 生产线优化分析 */}
                <div>
                    <h3 className="text-sm font-semibold text-slate-700 mb-4 flex items-center gap-2">
                        <BarChart3 className="text-indigo-500" size={18} />
                        生产线优化分析
                    </h3>

                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-slate-200">
                            <thead className="bg-slate-50">
                                <tr>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase">产品代码</th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase">产量</th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase">优先级</th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase">生产周期</th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase">状态</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-slate-200">
                                {stats.productAnalysis.map((product, index) => (
                                    <tr key={index}>
                                        <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-slate-900">
                                            {product.code}
                                        </td>
                                        <td className="px-4 py-3 whitespace-nowrap text-sm text-slate-600">
                                            {product.quantity.toLocaleString()}
                                        </td>
                                        <td className="px-4 py-3 whitespace-nowrap">
                                            <span className={`text-xs px-2 py-1 rounded ${product.priority === 1 ? 'bg-red-100 text-red-700' :
                                                product.priority === 2 ? 'bg-yellow-100 text-yellow-700' :
                                                    'bg-slate-100 text-slate-700'
                                                }`}>
                                                {product.priority}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3 whitespace-nowrap text-sm text-indigo-600 font-semibold">
                                            {product.cycleDays}天
                                        </td>
                                        <td className="px-4 py-3 whitespace-nowrap text-sm text-slate-600">
                                            {product.status}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProductionPlanAgent;
