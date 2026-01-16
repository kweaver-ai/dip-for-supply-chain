/**
 * Legend Panel Component
 *
 * 甘特图颜色图例说明
 *
 * 齐套模式V2颜色编码：
 * - 绿色: 就绪（库存充足）
 * - 黄色: 未就绪（需采购/生产）
 * - 红色: 超期（超出计划结束时间）
 * - 蓝色: 产品/正常
 */

interface LegendItem {
  color: string;
  label: string;
  description?: string;
}

interface LegendPanelProps {
  mode?: 'default' | 'material-ready-v2';
}

const defaultLegendItems: LegendItem[] = [
  { color: 'bg-indigo-600', label: '产品', description: '最终成品' },
  { color: 'bg-blue-500', label: '模块', description: '一级组件' },
  { color: 'bg-purple-500', label: '组件', description: '二级组件' },
  { color: 'bg-green-500', label: '物料', description: '原材料' },
  { color: 'bg-yellow-500', label: '警告', description: '库存不足' },
  { color: 'bg-red-500', label: '严重', description: '无库存' },
];

const materialReadyV2LegendItems: LegendItem[] = [
  { color: 'bg-blue-500', label: '产品', description: '最终成品' },
  { color: 'bg-green-500', label: '就绪', description: '库存充足' },
  { color: 'bg-yellow-500', label: '未就绪', description: '需采购/生产' },
  { color: 'bg-red-500', label: '超期', description: '超出计划时间' },
];

export function LegendPanel({ mode = 'default' }: LegendPanelProps) {
  const legendItems = mode === 'material-ready-v2' ? materialReadyV2LegendItems : defaultLegendItems;

  return (
    <div className="flex items-center gap-4 text-xs text-slate-400 mt-2">
      <span className="text-slate-500">图例:</span>
      {legendItems.map((item, index) => (
        <div key={index} className="flex items-center gap-1.5">
          <div className={`w-3 h-3 rounded ${item.color}`} />
          <span>{item.label}</span>
          {item.description && (
            <span className="text-slate-500 hidden sm:inline">({item.description})</span>
          )}
        </div>
      ))}
    </div>
  );
}

export default LegendPanel;
