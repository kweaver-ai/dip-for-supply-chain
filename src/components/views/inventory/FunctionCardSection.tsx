/**
 * Function Card Section
 * 
 * Displays interactive cards for accessing key inventory optimization tools:
 * - Reverse Production Calculator
 * - MOQ Analysis Tool
 * - Order Delivery Timeline
 */

import { Calculator, TrendingUp, Clock } from 'lucide-react';

interface FunctionCardSectionProps {
    onOpenReverseCalculator?: () => void;
    onOpenMOQAnalysis?: () => void;
    onOpenDeliveryTimeline?: () => void;
}

export const FunctionCardSection = ({
    onOpenReverseCalculator = () => { },
    onOpenMOQAnalysis = () => { },
    onOpenDeliveryTimeline = () => { }
}: FunctionCardSectionProps = {}) => {
    const cards = [
        {
            id: 'reverse-calculator',
            title: '逆向生产计算器',
            description: '基于现有库存计算可生产数量',
            icon: Calculator,
            gradient: 'from-blue-500 to-indigo-600',
            onClick: onOpenReverseCalculator
        },
        {
            id: 'moq-analysis',
            title: 'MOQ影响分析',
            description: '起订量对成本的影响分析',
            icon: TrendingUp,
            gradient: 'from-purple-500 to-pink-600',
            onClick: onOpenMOQAnalysis
        },
        {
            id: 'delivery-timeline',
            title: '订单交期预警',
            description: '预测交付时间及风险点',
            icon: Clock,
            gradient: 'from-orange-500 to-red-600',
            onClick: onOpenDeliveryTimeline
        }
    ];

    return (
        <div className="mb-6">
            <h2 className="text-lg font-semibold text-slate-800 mb-4">功能工具</h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {cards.map((card) => {
                    const Icon = card.icon;

                    return (
                        <button
                            key={card.id}
                            onClick={card.onClick}
                            className="group relative bg-white rounded-lg border border-slate-200 p-6 text-left hover:shadow-lg transition-all duration-300 overflow-hidden"
                        >
                            {/* Gradient background on hover */}
                            <div className={`absolute inset-0 bg-gradient-to-br ${card.gradient} opacity-0 group-hover:opacity-5 transition-opacity duration-300`}></div>

                            {/* Content */}
                            <div className="relative z-10">
                                <div className={`inline-flex items-center justify-center w-12 h-12 rounded-lg bg-gradient-to-br ${card.gradient} mb-4 group-hover:scale-110 transition-transform duration-300`}>
                                    <Icon className="text-white" size={24} />
                                </div>

                                <h3 className="text-lg font-semibold text-slate-800 mb-2 group-hover:text-indigo-600 transition-colors">
                                    {card.title}
                                </h3>

                                <p className="text-sm text-slate-600 mb-4">
                                    {card.description}
                                </p>

                                <div className="flex items-center text-sm font-medium text-indigo-600 group-hover:translate-x-1 transition-transform">
                                    打开工具
                                    <svg className="ml-1 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                    </svg>
                                </div>
                            </div>
                        </button>
                    );
                })}
            </div>
        </div>
    );
};
