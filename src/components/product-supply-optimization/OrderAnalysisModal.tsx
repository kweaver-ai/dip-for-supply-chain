import React, { useEffect, useState } from 'react';
import { ShoppingCart, X, CheckCircle2, Clock, CalendarRange, Truck, Loader2, AlertTriangle } from 'lucide-react';
import { metricModelApi, createLastDaysRange } from '../../api';

// 产品 ID 到指标模型 ID 的映射
const PRODUCT_MODEL_MAP: Record<string, string> = {
    'T01-000055': 'd59kpctg5lk40hvh48pg',
    'T01-000167': 'd59ksulg5lk40hvh48qg',
    'T01-000173': 'd59kqndg5lk40hvh48q0',
};

// 订单分析结果类型
interface OrderAnalysisData {
    productId: string;
    totalOrders: number;
    totalQuantity: number;
    deliveredQuantity: number;
    pendingQuantity: number;
    completionRate: number;
}

interface Props {
    isOpen: boolean;
    onClose: () => void;
    productId: string;
    productName?: string;
}

export const OrderAnalysisModal: React.FC<Props> = ({ isOpen, onClose, productId, productName }) => {
    const [analysis, setAnalysis] = useState<OrderAnalysisData | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!isOpen || !productId) return;

        async function fetchData() {
            const modelId = PRODUCT_MODEL_MAP[productId];
            if (!modelId) {
                setError(`未找到产品 ${productId} 的指标模型配置`);
                return;
            }

            try {
                setLoading(true);
                setError(null);

                const timeRange = createLastDaysRange(30);

                // 使用 signing_quantity 和 shipping_quantity 分析维度
                const result = await metricModelApi.queryByModelId(
                    modelId,
                    {
                        instant: true,
                        start: timeRange.start,
                        end: timeRange.end,
                        analysis_dimensions: ['signing_quantity', 'shipping_quantity'],
                    },
                    { includeModel: true }
                );

                console.log('[OrderAnalysisModal] API result:', JSON.stringify(result, null, 2));

                // 转换 API 数据
                // 总签约数量 = sum(signing_quantity)
                // 已交付数量 = sum(shipping_quantity)
                // 待交付数量 = 总签约数量 - 已交付数量
                let totalQuantity = 0;
                let deliveredQuantity = 0;
                let totalOrders = 0;

                if (result.datas && result.datas.length > 0) {
                    totalOrders = result.datas.length;
                    for (const series of result.datas) {
                        // 从 labels 获取 signing_quantity 和 shipping_quantity
                        const signingLabel = series.labels?.signing_quantity;
                        const shippingLabel = series.labels?.shipping_quantity;
                        
                        // 安全解析数值，处理 undefined/null/空字符串
                        const signingQty = signingLabel ? parseFloat(signingLabel) : 0;
                        const shippingQty = shippingLabel ? parseFloat(shippingLabel) : 0;

                        // 确保不是 NaN
                        totalQuantity += isNaN(signingQty) ? 0 : signingQty;
                        deliveredQuantity += isNaN(shippingQty) ? 0 : shippingQty;
                    }
                }

                console.log('[OrderAnalysisModal] Calculated:', { totalQuantity, deliveredQuantity, totalOrders });

                const pendingQuantity = Math.max(0, totalQuantity - deliveredQuantity);
                const completionRate = totalQuantity > 0 ? (deliveredQuantity / totalQuantity) * 100 : 0;

                setAnalysis({
                    productId,
                    totalOrders,
                    totalQuantity: Math.floor(totalQuantity),
                    deliveredQuantity: Math.floor(deliveredQuantity),
                    pendingQuantity: Math.floor(pendingQuantity),
                    completionRate,
                });
            } catch (err) {
                console.error('[OrderAnalysisModal] API call failed:', err);
                setError(err instanceof Error ? err.message : '获取订单数据失败');
            } finally {
                setLoading(false);
            }
        }

        fetchData();
    }, [isOpen, productId]);

    if (!isOpen) return null;

    // 加载中状态
    if (loading) {
        return (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
                <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl p-8 text-center">
                    <Loader2 className="animate-spin text-indigo-600 mx-auto mb-4" size={40} />
                    <p className="text-slate-600">加载订单数据中...</p>
                </div>
            </div>
        );
    }

    // 错误状态
    if (error) {
        return (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
                <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl p-8">
                    <div className="text-center">
                        <AlertTriangle className="text-red-500 mx-auto mb-4" size={40} />
                        <p className="text-red-600 mb-4">{error}</p>
                        <button onClick={onClose} className="px-4 py-2 bg-slate-100 hover:bg-slate-200 rounded-lg">
                            关闭
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    if (!analysis) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl overflow-hidden">
                {/* Header */}
                <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-indigo-50/30">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center">
                            <ShoppingCart className="text-indigo-600" size={20} />
                        </div>
                        <div>
                            <h3 className="font-bold text-slate-800">订单交付分析</h3>
                            <p className="text-xs text-slate-500">
                                {productName || analysis.productId} 交付进度详情
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-slate-100 rounded-full transition-colors text-slate-500"
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* Content */}
                <div className="p-6 space-y-6">
                    {/* Main Progress Ring / Stat */}
                    <div className="flex items-center justify-between bg-slate-50 rounded-xl p-6 border border-slate-100">
                        <div>
                            <div className="text-sm text-slate-500 mb-1">总签约数量</div>
                            <div className="text-4xl font-extrabold text-slate-800">{analysis.totalQuantity.toLocaleString()} <span className="text-base font-normal text-slate-400">台</span></div>
                            <div className="text-xs text-indigo-500 mt-2 font-medium flex items-center gap-1">
                                <CalendarRange size={12} />
                                共涉及 {analysis.totalOrders} 笔订单
                            </div>
                        </div>

                        {/* Visual Circle Percentage */}
                        <div className="relative w-24 h-24 flex items-center justify-center">
                            <svg className="w-full h-full transform -rotate-90">
                                <circle cx="48" cy="48" r="40" stroke="currentColor" strokeWidth="8" fill="transparent" className="text-slate-200" />
                                <circle
                                    cx="48" cy="48" r="40"
                                    stroke="currentColor" strokeWidth="8" fill="transparent"
                                    strokeDasharray={251.2}
                                    strokeDashoffset={251.2 - (251.2 * analysis.completionRate) / 100}
                                    className="text-indigo-600 transition-all duration-1000 ease-out"
                                />
                            </svg>
                            <span className="absolute text-lg font-bold text-indigo-700">{Math.round(analysis.completionRate)}%</span>
                        </div>
                    </div>

                    {/* Detail Cards */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="bg-emerald-50 rounded-lg p-4 border border-emerald-100 relative overflow-hidden">
                            <Truck className="absolute right-2 top-2 text-emerald-200 opacity-50" size={48} />
                            <div className="relative z-10">
                                <div className="flex items-center gap-2 text-emerald-700 mb-2">
                                    <CheckCircle2 size={18} />
                                    <span className="font-semibold">已交付数量</span>
                                </div>
                                <div className="text-2xl font-bold text-slate-800">{analysis.deliveredQuantity.toLocaleString()}</div>
                                <div className="w-full bg-emerald-200/50 h-1.5 rounded-full mt-3">
                                    <div className="bg-emerald-500 h-1.5 rounded-full" style={{ width: `${analysis.completionRate}%` }}></div>
                                </div>
                            </div>
                        </div>

                        <div className="bg-amber-50 rounded-lg p-4 border border-amber-100 relative overflow-hidden">
                            <Clock className="absolute right-2 top-2 text-amber-200 opacity-50" size={48} />
                            <div className="relative z-10">
                                <div className="flex items-center gap-2 text-amber-700 mb-2">
                                    <Clock size={18} />
                                    <span className="font-semibold">待交付数量</span>
                                </div>
                                <div className="text-2xl font-bold text-slate-800">{analysis.pendingQuantity.toLocaleString()}</div>
                                <div className="w-full bg-amber-200/50 h-1.5 rounded-full mt-3">
                                    <div className="bg-amber-500 h-1.5 rounded-full" style={{ width: `${100 - analysis.completionRate}%` }}></div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Hint */}
                    <div className="text-xs text-slate-400 text-center">

                    </div>
                </div>
            </div>
        </div>
    );
};
