/**
 * 库存优化器 - 主容器组件
 * 
 * 简化的两步流程：
 * 1. 自动分析 + 方案推荐
 * 2. 方案详情 + 确认执行
 */

import { useState, useEffect, useMemo } from 'react';
import { X, ArrowLeft } from 'lucide-react';
import { OptimizationRecommendations } from './OptimizationRecommendations';
import { ProductionPlanComparison } from './ProductionPlanComparison';
import type {
    MaterialData,
    ProductData,
    ProductionPlan,
} from '../../../types/stagnantInventory';
import { dataLoader } from '../../../services/csvDataLoader';
import { parseSubstitutionRelations } from '../../../services/substitutionParser';
import { productionCalculator } from '../../../services/reverseProductionCalculator';
import {
    inventoryOptimizationAnalyzer,
} from '../../../services/inventoryOptimizationAnalyzer';
import type { ProductOptimizationResult } from '../../../services/inventoryOptimizationAnalyzer';

interface StagnantInventoryOptimizerProps {
    onClose: () => void;
}

type OptimizerStep = 1 | 2;

export const StagnantInventoryOptimizer = ({ onClose }: StagnantInventoryOptimizerProps) => {
    const [step, setStep] = useState<OptimizerStep>(1);
    const [loading, setLoading] = useState(true);
    const [analyzing, setAnalyzing] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // 数据状态
    const [allMaterials, setAllMaterials] = useState<Map<string, MaterialData>>(new Map());
    const [allProducts, setAllProducts] = useState<ProductData[]>([]);
    const [bomData, setBomData] = useState<any[]>([]);
    const [substitutionRelations, setSubstitutionRelations] = useState<any[]>([]);

    // 分析结果
    const [optimizationResults, setOptimizationResults] = useState<ProductOptimizationResult[]>([]);

    // 选中的方案
    const [selectedResult, setSelectedResult] = useState<ProductOptimizationResult | null>(null);

    // 计算结果
    const [planA, setPlanA] = useState<ProductionPlan | null>(null);
    const [planB, setPlanB] = useState<ProductionPlan | null>(null);

    // 计算库存统计
    const inventoryStats = useMemo(() => {
        const materialsWithStock = Array.from(allMaterials.values())
            .filter(m => (m.currentStock || 0) > 0);
        const totalValue = materialsWithStock.reduce(
            (sum, m) => sum + (m.currentStock || 0) * m.unitPrice,
            0
        );
        return {
            count: materialsWithStock.length,
            totalValue,
        };
    }, [allMaterials]);

    // 加载数据并自动分析
    useEffect(() => {
        const loadAndAnalyze = async () => {
            try {
                setLoading(true);
                setError(null);

                // 加载所有数据
                await dataLoader.loadAll();

                const materials = await dataLoader.loadMaterials();
                const products = dataLoader.getAllProducts();
                const boms = dataLoader.getBOMs();

                // 解析替代料关系
                const relations = parseSubstitutionRelations(boms, materials);

                setAllMaterials(materials);
                setAllProducts(products);
                setBomData(boms);
                setSubstitutionRelations(relations);

                console.log('✅ 数据加载完成');
                setLoading(false);

                // 自动分析
                setAnalyzing(true);
                const results = inventoryOptimizationAnalyzer.analyzeAllProducts(
                    materials,
                    products,
                    boms
                );
                setOptimizationResults(results);
                setAnalyzing(false);

                console.log('✅ 自动分析完成，生成', results.length, '个优化方案');
            } catch (err) {
                console.error('❌ 加载/分析失败:', err);
                setError('数据加载失败，请刷新页面重试');
                setLoading(false);
                setAnalyzing(false);
            }
        };

        loadAndAnalyze();
    }, []);

    // 选择方案
    const handleSelectPlan = (result: ProductOptimizationResult) => {
        setSelectedResult(result);

        // 使用所有有库存的物料（不再是手动选择）
        const materialsWithStock = Array.from(allMaterials.values())
            .filter(m => (m.currentStock || 0) > 0);

        // 计算两种方案
        try {
            const planAResult = productionCalculator.calculateMaxConsumption(
                materialsWithStock,
                result.product,
                bomData,
                allMaterials,
                substitutionRelations,
                Infinity
            );

            const planBResult = productionCalculator.calculateMinWaste(
                materialsWithStock,
                result.product,
                bomData,
                allMaterials,
                substitutionRelations
            );

            setPlanA(planAResult);
            setPlanB(planBResult);
            setStep(2);
        } catch (err) {
            console.error('❌ 计算失败:', err);
            setError('方案计算失败，请重试');
        }
    };

    // 返回上一步
    const handleBack = () => {
        setStep(1);
        setSelectedResult(null);
        setPlanA(null);
        setPlanB(null);
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-96">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                    <p className="text-slate-600">加载数据中...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex items-center justify-center h-96">
                <div className="text-center">
                    <p className="text-red-600 mb-4">{error}</p>
                    <button
                        onClick={() => window.location.reload()}
                        className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                    >
                        刷新页面
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6">
            {/* 标题栏 */}
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-4">
                    {step === 2 && (
                        <button
                            onClick={handleBack}
                            className="p-2 hover:bg-slate-100 rounded-md transition-colors"
                        >
                            <ArrowLeft className="w-5 h-5 text-slate-500" />
                        </button>
                    )}
                    <div>
                        <h2 className="text-2xl font-bold text-slate-900">库存优化</h2>
                        <p className="text-sm text-slate-500">
                            {step === 1 ? '系统已自动分析，请选择优化方案' : `产品: ${selectedResult?.product.name}`}
                        </p>
                    </div>
                </div>
                <button
                    onClick={onClose}
                    className="p-2 hover:bg-slate-100 rounded-md transition-colors"
                >
                    <X className="w-5 h-5 text-slate-500" />
                </button>
            </div>

            {/* 步骤内容 */}
            <div className="mt-4">
                {step === 1 && (
                    <OptimizationRecommendations
                        results={optimizationResults}
                        totalInventoryValue={inventoryStats.totalValue}
                        totalMaterialCount={inventoryStats.count}
                        onSelectPlan={handleSelectPlan}
                        loading={analyzing}
                    />
                )}

                {step === 2 && planA && planB && (
                    <ProductionPlanComparison
                        planA={planA}
                        planB={planB}
                        onBack={handleBack}
                    />
                )}
            </div>
        </div>
    );
};
