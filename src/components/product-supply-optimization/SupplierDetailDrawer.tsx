import React, { useMemo, useState } from 'react';
import type { SupplierDetailPanelModel, ExpandedMaterialRow, SupplierRow } from '../../services/productSupplyCalculator';
import { X, Filter } from 'lucide-react';

interface Props {
  open: boolean;
  onClose: () => void;
  model?: SupplierDetailPanelModel;
}

const Badge: React.FC<{ className?: string; children: React.ReactNode }> = ({ className = '', children }) => (
  <span className={`inline-flex items-center px-2 py-0.5 rounded border text-xs ${className}`}>{children}</span>
);

const SupplierTable: React.FC<{ suppliers: SupplierRow[] }> = ({ suppliers }) => {
  if (suppliers.length === 0) return null;
  return (
    <div className="overflow-x-auto rounded-lg border border-slate-200/70 bg-white/70">
      <table className="w-full text-sm">
        <thead>
          <tr className="text-left text-slate-600 border-b border-slate-200/70 bg-slate-50/60">
            <th className="py-2 pr-3">供应商编码</th>
            <th className="py-2 pr-3">供应商</th>
            <th className="py-2 pr-3">含税单价</th>
            <th className="py-2 pr-3">付款条款</th>
            <th className="py-2 pr-3">基础物料</th>
            <th className="py-2 pr-3">最低价替代</th>
          </tr>
        </thead>
        <tbody>
          {suppliers.map((s, idx) => (
            <tr key={`${s.supplier_code}-${idx}`} className="border-b border-slate-200/60 last:border-b-0">
              <td className="py-2 pr-3 text-slate-800">{s.supplier_code}</td>
              <td className="py-2 pr-3 text-slate-800">{s.supplier}</td>
              <td className="py-2 pr-3 text-slate-800">{s.unit_price_with_tax ?? '-'}</td>
              <td className="py-2 pr-3 text-slate-700">{s.payment_terms || '-'}</td>
              <td className="py-2 pr-3 text-slate-700">{s.is_basic_material || '-'}</td>
              <td className="py-2 pr-3 text-slate-700">{s.is_lowest_price_alternative || '-'}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

const MaterialRowHeader: React.FC<{ row: ExpandedMaterialRow }> = ({ row }) => {
  const typeBadge =
    row.material_type === '自制'
      ? 'bg-slate-50 text-slate-700 border-slate-200'
      : row.material_type === '外购'
        ? 'bg-blue-50 text-blue-700 border-blue-200'
        : row.material_type === '委外'
          ? 'bg-purple-50 text-purple-700 border-purple-200'
          : 'bg-amber-50 text-amber-700 border-amber-200';

  return (
    <div className="flex items-start justify-between gap-4">
      <div className="min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <div className="font-semibold text-slate-800 truncate">{row.material_code}</div>
          <Badge className={typeBadge}>{row.material_type}</Badge>
          {row.isMissingSupplier && <Badge className="bg-red-50 text-red-700 border-red-200">缺供</Badge>}
          {row.hasAlternatives && <Badge className="bg-emerald-50 text-emerald-700 border-emerald-200">有替代</Badge>}
          {row.alternativesAssociationApproximate && (
            <Badge className="bg-amber-50 text-amber-700 border-amber-200">关联不精确</Badge>
          )}
          {row.isBasicMaterial === true && <Badge className="bg-indigo-50 text-indigo-700 border-indigo-200">基础物料</Badge>}
        </div>
        <div className="text-sm text-slate-600 truncate">{row.material_name || '-'}</div>
      </div>
      <div className="text-xs text-slate-500 shrink-0">
        层级深度: {row.depth} | 供应商: {row.suppliers.length}
      </div>
    </div>
  );
};

export const SupplierDetailDrawer: React.FC<Props> = ({ open, onClose, model }) => {
  const [onlyMissing, setOnlyMissing] = useState(false);
  const [onlyNonSelfMade, setOnlyNonSelfMade] = useState(false);
  const [onlyHasAlternatives, setOnlyHasAlternatives] = useState(false);

  const materials = useMemo(() => {
    const rows = model?.materials ?? [];
    return rows.filter((r) => {
      if (onlyMissing && !r.isMissingSupplier) return false;
      if (onlyNonSelfMade && r.material_type === '自制') return false;
      if (onlyHasAlternatives && !r.hasAlternatives) return false;
      return true;
    });
  }, [model, onlyMissing, onlyNonSelfMade, onlyHasAlternatives]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50">
      <div className="absolute inset-0 bg-slate-900/30 backdrop-blur-[1px]" onClick={onClose} />
      <div className="absolute inset-y-0 right-0 w-full max-w-5xl bg-white shadow-2xl flex flex-col rounded-l-2xl overflow-hidden border-l border-slate-200/70">
        <div className="p-4 border-b border-indigo-100/80 bg-gradient-to-br from-indigo-50 to-purple-50 flex items-center justify-between gap-3">
          <div className="min-w-0">
            <div className="text-lg font-bold text-slate-800">供应商明细 / 物料展开</div>
            <div className="text-sm text-slate-600 truncate">
              {model ? `${model.product_name || ''} (${model.product_code})` : '暂无数据'}
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-white/60 text-slate-600"
            aria-label="关闭"
          >
            <X size={18} />
          </button>
        </div>

        <div className="p-4 border-b border-slate-200/70 bg-gradient-to-b from-slate-50 to-white">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
            <div className="bg-white/70 border border-slate-200/70 rounded-lg p-3 shadow-sm">
              <div className="text-slate-500 text-xs">展开物料总数（主料）</div>
              <div className="text-xl font-bold text-slate-800">{model?.totalMaterials ?? 0}</div>
            </div>
            <div className="bg-white/70 border border-slate-200/70 rounded-lg p-3 shadow-sm">
              <div className="text-slate-500 text-xs">非自制物料数</div>
              <div className="text-xl font-bold text-slate-800">{model?.nonSelfMadeMaterials ?? 0}</div>
            </div>
            <div className="bg-white/70 border border-slate-200/70 rounded-lg p-3 shadow-sm">
              <div className="text-slate-500 text-xs">供应商数（去重）</div>
              <div className="text-xl font-bold text-slate-800">{model?.supplierCount ?? 0}</div>
            </div>
            <div className="bg-white/70 border border-slate-200/70 rounded-lg p-3 shadow-sm">
              <div className="text-slate-500 text-xs">缺供物料数</div>
              <div className="text-xl font-bold text-slate-800">{model?.missingMaterials ?? 0}</div>
            </div>
          </div>

          <div className="mt-3 flex items-center gap-3 text-sm text-slate-700">
            <div className="flex items-center gap-2 text-slate-600">
              <Filter size={14} />
              筛选
            </div>
            <label className="flex items-center gap-2">
              <input type="checkbox" checked={onlyMissing} onChange={(e) => setOnlyMissing(e.target.checked)} />
              仅缺供
            </label>
            <label className="flex items-center gap-2">
              <input type="checkbox" checked={onlyNonSelfMade} onChange={(e) => setOnlyNonSelfMade(e.target.checked)} />
              仅非自制
            </label>
            <label className="flex items-center gap-2">
              <input type="checkbox" checked={onlyHasAlternatives} onChange={(e) => setOnlyHasAlternatives(e.target.checked)} />
              仅有替代
            </label>
          </div>
        </div>

        <div className="p-4 overflow-auto bg-gradient-to-b from-white to-indigo-50/30">
          {materials.length === 0 ? (
            <div className="text-slate-500 text-sm">暂无匹配结果</div>
          ) : (
            <div className="space-y-2">
              {materials.map((row) => (
                <details
                  key={row.material_code}
                  className="border border-slate-200/70 rounded-xl p-3 bg-white/70 hover:bg-white transition-colors shadow-sm"
                >
                  <summary className="cursor-pointer list-none">
                    <MaterialRowHeader row={row} />
                  </summary>

                  <div className="mt-3 space-y-4">
                    {row.material_type === '自制' ? (
                      <div className="text-sm text-slate-600">自制件：不展示外部供应商。</div>
                    ) : row.suppliers.length === 0 ? (
                      <div className="text-sm text-red-700 bg-red-50 border border-red-200 rounded p-3">
                        缺供：未匹配到任何供应商（提供物料编码）。
                      </div>
                    ) : (
                      <div>
                        <div className="text-sm font-semibold text-slate-800 mb-2">供应商</div>
                        <SupplierTable suppliers={row.suppliers} />
                      </div>
                    )}

                    {row.hasAlternatives && (
                      <div>
                        <div className="text-sm font-semibold text-slate-800 mb-2">替代件</div>
                        <div className="space-y-3">
                          {row.alternatives.map((alt) => (
                            <div key={alt.material_code} className="border border-slate-200/70 rounded-lg p-3 bg-slate-50/70">
                              <div className="flex items-center justify-between gap-3">
                                <div className="min-w-0">
                                  <div className="font-semibold text-slate-800 truncate">{alt.material_code}</div>
                                  <div className="text-sm text-slate-600 truncate">{alt.material_name || '-'}</div>
                                </div>
                                <Badge className="bg-slate-100 text-slate-700 border-slate-200">{alt.material_type}</Badge>
                              </div>
                              {alt.material_type === '自制' ? (
                                <div className="mt-2 text-sm text-slate-600">自制件：不展示外部供应商。</div>
                              ) : alt.suppliers.length === 0 ? (
                                <div className="mt-2 text-sm text-red-700 bg-red-50 border border-red-200 rounded p-2">
                                  缺供：替代件未匹配到供应商。
                                </div>
                              ) : (
                                <div className="mt-2">
                                  <SupplierTable suppliers={alt.suppliers} />
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </details>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
