import React from 'react';
import { X, ChevronRight, ChevronDown, Package, AlertTriangle, Layers } from 'lucide-react';
import type { AssemblyNode } from '../../services/ProductAssemblyCalculator';

interface Props {
    isOpen: boolean;
    onClose: () => void;
    assemblyTree: AssemblyNode | null;
}

const TreeNode: React.FC<{ node: AssemblyNode; isRoot?: boolean }> = ({ node, isRoot = false }) => {
    const [expanded, setExpanded] = React.useState(isRoot || !!node.limitingFactor);

    // Is this node the limiting factor for its parent? (Logic handled by highlighting in usage context, 
    // but here we can check if it WAS the limiting factor of its parent. 
    // Actually the parent object has `limitingFactor` field pointing to the child.

    // Check if this node is a leaf (raw material or no data)
    const isLeaf = !node.children || node.children.length === 0;

    return (
        <div className="ml-4 border-l-2 border-slate-100 pl-2 py-1">
            <div
                className={`flex items-start gap-2 p-2 rounded-lg transition-colors cursor-pointer 
                    ${isRoot ? 'bg-purple-50 border border-purple-100' : 'hover:bg-slate-50'}
                    ${node.isAlternativeGroup ? 'bg-blue-50/50 border border-blue-100 border-dashed' : ''}
                `}
                onClick={(e) => {
                    e.stopPropagation();
                    setExpanded(!expanded);
                }}
            >
                <div className="mt-1">
                    {!isLeaf ? (
                        expanded ? <ChevronDown size={14} className="text-slate-400" /> : <ChevronRight size={14} className="text-slate-400" />
                    ) : (
                        <div className="w-3.5" />
                    )}
                </div>

                <div className="flex-1">
                    <div className="flex items-center gap-2">
                        {node.isAlternativeGroup ? (
                            <Layers size={14} className="text-blue-500" />
                        ) : (
                            <Package size={14} className={isRoot ? "text-purple-600" : "text-slate-500"} />
                        )}
                        <span className="font-medium text-sm text-slate-700">
                            {node.name}
                            <span className="text-slate-400 font-normal ml-1 text-xs">({node.code})</span>
                        </span>

                        {/* Badges */}
                        {!isRoot && (
                            <span className="text-xs text-slate-500 bg-slate-100 px-1.5 rounded">
                                需 {node.requiredPerSet} {node.unit}/套
                            </span>
                        )}
                    </div>

                    <div className="flex items-center gap-4 mt-1 text-xs text-slate-500">
                        <div className="flex items-center gap-1">
                            <span>库存:</span>
                            <span className="font-medium text-slate-700">{node.inventory}</span>
                        </div>
                        {!isLeaf && (
                            <div className="flex items-center gap-1">
                                <span>可生产:</span>
                                <span className="font-medium text-slate-700">{node.producible}</span>
                            </div>
                        )}
                        <div className="flex items-center gap-1 font-semibold text-emerald-600 bg-emerald-50 px-1.5 rounded">
                            <span>总可用:</span>
                            <span>{node.totalAvailable}</span>
                        </div>

                        {!isRoot && (
                            <div className="flex items-center gap-1 text-slate-400">
                                <span>支持父级:</span>
                                <span className={`font-medium ${node.maxSets === Infinity ? 'text-slate-400' : 'text-blue-600'}`}>
                                    {node.maxSets === Infinity ? '∞' : Math.floor(node.maxSets)} 套
                                </span>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {expanded && node.children && (
                <div className="mt-1">
                    {node.children.map((child, idx) => {
                        // Check if this child is the limiting factor
                        const isLimiting = node.limitingFactor && (node.limitingFactor.code === child.code);

                        return (
                            <div key={idx} className={`relative ${isLimiting ? 'bg-red-50/30 rounded-r-lg' : ''}`}>
                                {isLimiting && (
                                    <div className="absolute left-0 top-3 -ml-6 flex items-center justify-center">
                                        <AlertTriangle size={14} className="text-red-500 fill-red-100" />
                                    </div>
                                )}
                                <TreeNode node={child} />
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
};

export const AssemblyLogicModal: React.FC<Props> = ({ isOpen, onClose, assemblyTree }) => {
    if (!isOpen || !assemblyTree) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-3xl h-[80vh] flex flex-col md:h-[600px] overflow-hidden">
                {/* Header */}
                <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-white shrink-0">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                            <Layers className="text-purple-600" size={20} />
                        </div>
                        <div>
                            <h3 className="font-bold text-slate-800">组装逻辑分析</h3>
                            <p className="text-xs text-slate-500">分析 {assemblyTree.name} 的组装瓶颈</p>
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
                <div className="flex-1 overflow-y-auto p-4 bg-slate-50/50">
                    {/* Summary Card */}
                    <div className="bg-white p-4 rounded-lg border border-slate-100 shadow-sm mb-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <div className="text-sm text-slate-500 mb-1">当前可组装数量</div>
                                <div className="text-3xl font-bold text-purple-600">{assemblyTree.producible} <span className="text-sm font-normal text-slate-400">{assemblyTree.unit}</span></div>
                            </div>
                            <div className="h-10 w-px bg-slate-100 mx-4"></div>
                            <div>
                                <div className="text-sm text-slate-500 mb-1">直属库存</div>
                                <div className="text-3xl font-bold text-slate-700">{assemblyTree.inventory}</div>
                            </div>
                            <div className="h-10 w-px bg-slate-100 mx-4"></div>
                            <div>
                                <div className="text-sm text-slate-500 mb-1">总可用</div>
                                <div className="text-3xl font-bold text-emerald-600">{assemblyTree.totalAvailable}</div>
                            </div>
                        </div>
                        {assemblyTree.limitingFactor && (
                            <div className="mt-3 flex items-center gap-2 text-sm bg-red-50 text-red-700 px-3 py-2 rounded-lg border border-red-100">
                                <AlertTriangle size={16} />
                                <span>限制瓶颈: <strong>{assemblyTree.limitingFactor.name}</strong> (仅支持 {Math.floor(assemblyTree.limitingFactor.maxSets)} 套)</span>
                            </div>
                        )}
                    </div>

                    {/* Tree Visualization */}
                    <div className="bg-white p-4 rounded-lg border border-slate-100 shadow-sm">
                        <h4 className="font-semibold text-slate-800 mb-4 flex items-center gap-2">
                            <Layers size={16} className="text-slate-400" />
                            BOM 结构与库存分析
                        </h4>
                        <div className="-ml-4">
                            <TreeNode node={assemblyTree} isRoot />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
