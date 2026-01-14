import React, { useState } from 'react';
import {
  LayoutDashboard, Search, Package, Truck, Layers, Users,
  Bell, Activity, ArrowRight, CheckCircle2, AlertTriangle,
  ShoppingCart, Factory, ClipboardList, TrendingUp, TrendingDown,
  MessageSquare, Send, Bot, User, X, Grid, List,
  Zap, Clock, ShieldAlert, Globe, ArrowRightLeft, Gavel,
  BarChart3, Archive, GitPullRequest, AlertOctagon,
  Plane, PackageCheck, DollarSign, Trash2, RefreshCw, Wrench,
  Calendar, FileText, ChevronRight, Target, Sparkles, Flame,
  AlertCircle, ChevronDown, Filter, Download, Share2, Eye,
  TrendingDown as TrendDown, Settings, MoreVertical, ExternalLink,
  MapPin, Percent, ThumbsUp, ThumbsDown, Star, Award, XCircle
} from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, AreaChart, Area, LineChart, Line,
  RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
  ComposedChart, Legend, CartesianGrid, ScatterChart, Scatter
} from 'recharts';
import ProductInventoryAgentCard from '../components/cockpit/ProductInventoryAgentCard';
import MaterialInventoryAgentCard from '../components/cockpit/MaterialInventoryAgentCard';
import AIAnalysisPanel from '../components/cockpit/AIAnalysisPanel';

// ============ SHARED COMPONENTS ============
const Badge = ({ type, children, size = 'md', className = '' }: { type: 'critical' | 'warning' | 'success' | 'neutral' | 'info' | 'purple'; children: React.ReactNode; size?: 'sm' | 'md'; className?: string }) => {
  const styles = {
    critical: 'bg-red-100 text-red-700 border-red-200',
    warning: 'bg-amber-100 text-amber-700 border-amber-200',
    success: 'bg-emerald-100 text-emerald-700 border-emerald-200',
    neutral: 'bg-slate-100 text-slate-600 border-slate-200',
    info: 'bg-blue-100 text-blue-700 border-blue-200',
    purple: 'bg-purple-100 text-purple-700 border-purple-200'
  };
  const sizeClass = size === 'sm' ? 'px-2 py-0.5 text-[10px]' : 'px-2.5 py-1 text-xs';
  return <span className={`${sizeClass} rounded-full font-bold border ${styles[type]} ${className}`}>{children}</span>;
};

const CopilotSidebar = ({ isOpen, onClose, title, initialMessages, suggestions }: {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  initialMessages: { type: string; text: string }[];
  suggestions: string[]
}) => {
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState(initialMessages);

  const handleSend = () => {
    if (!input.trim()) return;
    const newMsgs = [...messages, { type: 'user', text: input }];
    setMessages(newMsgs);
    setInput('');
    setTimeout(() => {
      setMessages([...newMsgs, { type: 'bot', text: '正在分析数据... 建议已生成，请查看详情。' }]);
    }, 800);
  };

  return (
    <div className={`fixed inset-y-0 right-0 w-96 bg-white border-l border-slate-200 shadow-2xl transform transition-transform duration-300 z-50 flex flex-col ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}>
      <div className="p-4 border-b flex justify-between items-center bg-gradient-to-r from-indigo-50 to-purple-50">
        <div className="flex items-center gap-2 font-bold text-slate-800">
          <div className="w-8 h-8 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-lg flex items-center justify-center">
            <Bot size={18} className="text-white" />
          </div>
          {title}
        </div>
        <button onClick={onClose} className="text-slate-400 hover:text-slate-600"><X size={18} /></button>
      </div>
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50/50">
        {messages.map((msg, idx) => (
          <div key={idx} className={`flex gap-3 ${msg.type === 'user' ? 'flex-row-reverse' : ''}`}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${msg.type === 'user' ? 'bg-indigo-100 text-indigo-600' : 'bg-white border border-slate-200 text-slate-600'}`}>
              {msg.type === 'user' ? <User size={14} /> : <Bot size={14} />}
            </div>
            <div className={`p-3 rounded-xl text-sm max-w-[85%] ${msg.type === 'user' ? 'bg-gradient-to-br from-indigo-600 to-indigo-500 text-white rounded-tr-none shadow-md' : 'bg-white border border-slate-200 text-slate-700 rounded-tl-none shadow-sm'}`}>
              {msg.text}
            </div>
          </div>
        ))}
      </div>
      <div className="p-4 border-t bg-white">
        <div className="relative">
          <input
            type="text"
            placeholder="输入问题..."
            className="w-full pl-4 pr-10 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
          />
          <button onClick={handleSend} className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 bg-gradient-to-br from-indigo-600 to-purple-600 text-white rounded-lg hover:shadow-md transition-shadow"><Send size={14} /></button>
        </div>
        <div className="mt-3 flex gap-2 overflow-x-auto">
          {suggestions.map((s, i) => (
            <button key={i} onClick={() => setInput(s)} className="whitespace-nowrap px-3 py-1 bg-white text-slate-600 text-xs rounded-full hover:bg-slate-100 border border-slate-200 transition-colors">{s}</button>
          ))}
        </div>
      </div>
    </div>
  );
};

// ============ MODULE 1: ENHANCED COCKPIT ============
const EnhancedCockpitView = ({ onNavigate }: { onNavigate: (view: string) => void }) => {
  const kpiData = [
    { label: '供应链健康度', value: 92, target: 95, trend: '+3', status: 'good', icon: Activity, color: 'emerald' },
    { label: '准交率', value: 94.8, target: 98, trend: '+2.3%', status: 'good', icon: Target, color: 'blue' },
    { label: '库存周转天数', value: 45, target: 40, trend: '-5', status: 'warning', icon: Package, color: 'amber' },
    { label: '采购达成率', value: 78, target: 90, trend: '-2%', status: 'critical', icon: ShoppingCart, color: 'red' },
  ];

  const supplyChainNodes = [
    { id: 'demand', label: '需求预测', count: '1,240', risk: 12, icon: Target, nav: 'delivery', metrics: { accuracy: '87%', variance: '+12%' }, status: 'warning' },
    { id: 'product', label: '产成品', count: '580', risk: 45, icon: Package, nav: 'inventory', metrics: { turnover: '45天', obsolete: '¥320w' }, status: 'critical' },
    { id: 'warehouse', label: '仓储物流', count: '4', risk: 0, icon: Factory, nav: 'inventory', metrics: { utilization: '85%', accuracy: '99.2%' }, status: 'good' },
    { id: 'material', label: '原材料', count: '8,500', risk: 128, icon: ClipboardList, nav: 'inventory', metrics: { dos: '95天', obsolete: '128 SKU' }, status: 'critical' },
    { id: 'supplier', label: '供应商', count: '32', risk: 2, icon: Users, nav: 'supplier', metrics: { qualified: '30/32', risk: '2 高危' }, status: 'warning' },
  ];

  const trendData = [
    { month: 'Jun', health: 88, delivery: 92, inventory: 48, procurement: 82 },
    { month: 'Jul', health: 89, delivery: 93, inventory: 47, procurement: 80 },
    { month: 'Aug', health: 87, delivery: 91, inventory: 49, procurement: 79 },
    { month: 'Sep', health: 90, delivery: 94, inventory: 46, procurement: 78 },
    { month: 'Oct', health: 91, delivery: 94, inventory: 45, procurement: 78 },
    { month: 'Nov', health: 92, delivery: 95, inventory: 45, procurement: 78 },
  ];

  const productStockData = [
    { name: 'T20', stock: 120, order: 150, value: 600, status: 'excess' },
    { name: 'T40', stock: 80, order: 60, value: 400, status: 'normal' },
    { name: 'M3E', stock: 200, order: 220, value: 1200, status: 'shortage' },
    { name: 'M30', stock: 45, order: 10, value: 225, status: 'obsolete' },
  ];

  const productionData = [
    { name: '深圳一厂', value: 45, capacity: 50, efficiency: 90 },
    { name: '东莞二厂', value: 30, capacity: 40, efficiency: 75 },
    { name: '越南工厂', value: 25, capacity: 35, efficiency: 71 }
  ];
  const COLORS = ['#6366f1', '#8b5cf6', '#ec4899'];

  const procurementDetails = [
    { name: 'M-202 电机', percent: 90, supplier: 'TechMotor', eta: '2天', status: 'ontrack' },
    { name: 'F90 飞控', percent: 50, supplier: 'ChipX', eta: '5天', status: 'delayed' },
    { name: '机身外壳', percent: 93, supplier: 'PlasticPro', eta: '1天', status: 'ontrack' },
    { name: '视觉传感器', percent: 20, supplier: 'VisionTech', eta: '10天', status: 'critical' },
  ];

  const orderRisks = [
    { id: 'SO-005', client: '黑龙江农垦', product: 'T20', delay: 7, amount: 250, stage: 'procurement', priority: 'high' },
    { id: 'SO-009', client: '新疆兵团', product: 'T40', delay: 3, amount: 120, stage: 'production', priority: 'medium' },
    { id: 'SO-012', client: '中粮集团', product: 'M3E', delay: 5, amount: 180, stage: 'shipping', priority: 'high' },
  ];

  return (
    <div className="space-y-6 pb-10">
      <div className="flex justify-between items-start">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <h2 className="text-3xl font-extrabold text-slate-800">供应链驾驶舱</h2>
            <div className="flex items-center gap-2 px-3 py-1 bg-emerald-50 border border-emerald-200 rounded-full">
              <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
              <span className="text-xs font-bold text-emerald-700">实时监控</span>
            </div>
          </div>
          <p className="text-slate-500 text-sm">最后更新: 2023-11-26 18:30 | 数据源: ERP + WMS + OMS</p>
        </div>
        <div className="flex gap-2">
          <button className="px-3 py-2 bg-white border rounded-lg text-xs font-bold flex items-center gap-2 hover:bg-slate-50"><Filter size={14} /> 筛选</button>
          <button className="px-3 py-2 bg-white border rounded-lg text-xs font-bold flex items-center gap-2 hover:bg-slate-50"><Download size={14} /> 导出</button>
          <button className="px-3 py-2 bg-white border rounded-lg text-xs font-bold flex items-center gap-2 hover:bg-slate-50"><Calendar size={14} /> 本月 <ChevronDown size={14} /></button>
          <button className="px-4 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg text-xs font-bold hover:shadow-lg transition-shadow"><FileText size={14} className="inline mr-1" /> 生成月报</button>
        </div>
      </div>

      <div className="grid grid-cols-4 gap-4">
        {kpiData.map((kpi, idx) => (
          <div key={idx} className="bg-white rounded-xl border-2 border-slate-200 p-5 hover:shadow-lg transition-all cursor-pointer group">
            <div className="flex justify-between items-start mb-3">
              <div className={`p-2 rounded-lg ${kpi.color === 'emerald' ? 'bg-emerald-100 text-emerald-600' : kpi.color === 'blue' ? 'bg-blue-100 text-blue-600' : kpi.color === 'amber' ? 'bg-amber-100 text-amber-600' : 'bg-red-100 text-red-600'}`}>
                <kpi.icon size={20} />
              </div>
              <div className={`px-2 py-0.5 rounded-full text-[10px] font-bold flex items-center gap-1 ${kpi.status === 'good' ? 'bg-emerald-50 text-emerald-600' : kpi.status === 'warning' ? 'bg-amber-50 text-amber-600' : 'bg-red-50 text-red-600'}`}>
                {kpi.status === 'good' ? <TrendingUp size={10} /> : <TrendingDown size={10} />}
                {kpi.trend}
              </div>
            </div>
            <div className="text-xs text-slate-500 mb-1 uppercase tracking-wide">{kpi.label}</div>
            <div className="flex items-end gap-2 mb-2">
              <div className="text-3xl font-extrabold text-slate-800">{kpi.value}</div>
              <div className="text-sm text-slate-400 mb-1">/ {kpi.target}</div>
            </div>
            <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
              <div className={`h-1.5 rounded-full ${kpi.status === 'good' ? 'bg-emerald-500' : kpi.status === 'warning' ? 'bg-amber-500' : 'bg-red-500'}`} style={{ width: `${(kpi.value / kpi.target) * 100}%` }}></div>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-xl border shadow-sm p-6">
        <div className="flex justify-between items-center mb-6">
          <h3 className="font-bold text-slate-800 flex items-center gap-2 text-lg"><Activity className="text-indigo-500" /> 全链路健康图谱</h3>
          <div className="flex items-center gap-4 text-xs">
            <span className="flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-emerald-500"></span> 健康</span>
            <span className="flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-amber-500"></span> 预警</span>
            <span className="flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></span> 异常</span>
          </div>
        </div>
        <div className="relative">
          <div className="absolute top-20 left-0 w-full h-1 bg-gradient-to-r from-slate-200 via-slate-300 to-slate-200 -z-10"></div>
          <div className="grid grid-cols-5 gap-4">
            {supplyChainNodes.map((node, idx) => (
              <div key={idx} onClick={() => onNavigate(node.nav)} className="bg-white border-2 border-slate-200 rounded-xl p-4 hover:border-indigo-400 hover:shadow-lg transition-all cursor-pointer group relative">
                <div className={`absolute -top-2 -right-2 w-6 h-6 rounded-full border-4 border-white flex items-center justify-center ${node.status === 'good' ? 'bg-emerald-500' : node.status === 'warning' ? 'bg-amber-500' : 'bg-red-500'}`}>
                  {node.risk > 0 && <span className="text-white text-[10px] font-bold">{node.risk}</span>}
                </div>
                <div className="mb-3 p-3 bg-slate-50 rounded-xl text-slate-500 group-hover:bg-indigo-50 group-hover:text-indigo-600 transition-colors mx-auto w-fit">
                  <node.icon size={28} />
                </div>
                <div className="text-center mb-3">
                  <div className="text-xs font-bold text-slate-500 mb-1 uppercase tracking-wide">{node.label}</div>
                  <div className="text-2xl font-extrabold text-slate-800">{node.count}</div>
                </div>
                <div className="space-y-1 bg-slate-50 rounded-lg p-2">
                  {Object.entries(node.metrics).map(([key, value]) => (
                    <div key={key} className="flex justify-between text-[10px]">
                      <span className="text-slate-500 capitalize">{key}:</span>
                      <span className="font-bold text-slate-700">{value}</span>
                    </div>
                  ))}
                </div>
                {node.risk > 0 && (
                  <div className="mt-2 px-2 py-1 bg-red-50 text-red-600 text-[10px] font-bold rounded-full flex items-center justify-center gap-1 animate-pulse">
                    <AlertTriangle size={10} /> {node.risk} 异常
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* AI Analysis Panel */}
      <div className="mb-6">
        <AIAnalysisPanel />
      </div>

      <div className="bg-white rounded-xl border shadow-sm p-6">
        <div className="flex justify-between items-center mb-6">
          <h3 className="font-bold text-slate-800 flex items-center gap-2 text-lg"><TrendingUp className="text-emerald-500" /> 关键指标趋势</h3>
        </div>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={trendData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="month" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip contentStyle={{ backgroundColor: 'white', border: '1px solid #e2e8f0', borderRadius: '8px', fontSize: '12px' }} />
              <Legend />
              <Area type="monotone" dataKey="health" name="健康度" fill="#d1fae5" stroke="#10b981" />
              <Line type="monotone" dataKey="delivery" name="准交率" stroke="#3b82f6" strokeWidth={2} />
              <Line type="monotone" dataKey="procurement" name="采购达成" stroke="#f59e0b" strokeWidth={2} />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-6">
        <div className="bg-white rounded-xl border shadow-sm p-5">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-bold text-slate-800 flex items-center gap-2"><Package className="text-indigo-600" size={18} /> 产品库存</h3>
            <button onClick={() => onNavigate('inventory')} className="text-xs text-indigo-600 font-bold hover:underline flex items-center gap-1">详情 <ChevronRight size={12} /></button>
          </div>
          <div className="grid grid-cols-2 gap-3 mb-4">
            <div className="bg-slate-50 p-3 rounded-lg"><div className="text-[10px] text-slate-500 uppercase mb-1">总货值</div><div className="text-lg font-bold text-slate-800">¥ 4,500w</div></div>
            <div className="bg-red-50 p-3 rounded-lg border border-red-100"><div className="text-[10px] text-red-500 uppercase mb-1">呆滞</div><div className="text-lg font-bold text-red-700">¥ 320w</div></div>
          </div>
          <div className="space-y-2">
            {productStockData.map((item, idx) => (
              <div key={idx} className="flex items-center justify-between p-2 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors">
                <div className="flex items-center gap-2">
                  <div className={`w-1 h-8 rounded-full ${item.status === 'excess' ? 'bg-amber-500' : item.status === 'shortage' ? 'bg-red-500' : item.status === 'obsolete' ? 'bg-slate-400' : 'bg-emerald-500'}`}></div>
                  <div><div className="text-xs font-bold text-slate-700">{item.name}</div><div className="text-[10px] text-slate-500">{item.stock} / {item.order}</div></div>
                </div>
                <div className="text-xs font-bold text-slate-700">¥{item.value}w</div>
              </div>
            ))}
          </div>
          <div className="mt-4 p-3 bg-indigo-50 border border-indigo-100 rounded-lg flex gap-2 items-start">
            <Sparkles size={14} className="text-indigo-600 shrink-0 mt-0.5" />
            <span className="text-xs text-indigo-700"><strong>AI:</strong> M30 积压，建议促销</span>
          </div>
        </div>

        <div className="bg-white rounded-xl border shadow-sm p-5">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-bold text-slate-800 flex items-center gap-2"><Truck className="text-emerald-600" size={18} /> 采购执行</h3>
            <div className="text-xs"><span className="text-slate-500">进度:</span><span className="font-bold text-indigo-600 ml-1">78%</span></div>
          </div>
          <div className="space-y-3">
            {procurementDetails.map((item, idx) => (
              <div key={idx} className="space-y-2">
                <div className="flex justify-between items-center">
                  <div><div className="text-xs font-bold text-slate-700">{item.name}</div><div className="text-[10px] text-slate-500">{item.supplier} · {item.eta}</div></div>
                  <div className="flex items-center gap-2">
                    <span className={`text-xs font-bold ${item.status === 'critical' ? 'text-red-600' : item.status === 'delayed' ? 'text-amber-600' : 'text-emerald-600'}`}>{item.percent}%</span>
                    {item.status === 'critical' && <Flame size={14} className="text-red-500" />}
                  </div>
                </div>
                <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                  <div className={`h-2 rounded-full ${item.status === 'critical' ? 'bg-red-500' : item.status === 'delayed' ? 'bg-amber-500' : 'bg-emerald-500'}`} style={{ width: `${item.percent}%` }}></div>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-4 p-3 bg-red-50 border border-red-100 rounded-lg flex gap-2 items-start">
            <AlertCircle size={14} className="text-red-600 shrink-0 mt-0.5" />
            <span className="text-xs text-red-700"><strong>预警:</strong> 视觉传感器严重延期</span>
          </div>
        </div>

        <div className="bg-white rounded-xl border shadow-sm p-5 cursor-pointer hover:border-indigo-300 transition-all" onClick={() => onNavigate('delivery')}>
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-bold text-slate-800 flex items-center gap-2"><Clock className="text-red-600" size={18} /> 订单风险</h3>
            <Badge type="critical" size="sm">12 延期</Badge>
          </div>
          <div className="space-y-2">
            {orderRisks.map((order, idx) => (
              <div key={idx} className="p-3 bg-slate-50 rounded-lg hover:bg-white hover:shadow-sm transition-all">
                <div className="flex justify-between items-start mb-2">
                  <div><div className="text-xs font-bold text-slate-700">{order.client}</div><div className="text-[10px] text-slate-500">{order.id} · {order.product}</div></div>
                  <div className="flex items-center gap-1">
                    {order.priority === 'high' && <Flame size={12} className="text-red-500" />}
                    <span className="text-xs font-bold text-red-600">+{order.delay}天</span>
                  </div>
                </div>
                <div className="flex justify-between items-center">
                  <div className="text-[10px] text-slate-500">¥{order.amount}w</div>
                  <Badge type={order.stage === 'procurement' ? 'info' : order.stage === 'production' ? 'purple' : 'success'} size="sm">{order.stage === 'procurement' ? '采购' : order.stage === 'production' ? '生产' : '发货'}</Badge>
                </div>
              </div>
            ))}
          </div>
          <button className="mt-4 w-full py-2 bg-indigo-50 text-indigo-600 rounded-lg text-xs font-bold hover:bg-indigo-100 transition-colors flex items-center justify-center gap-2">进入作战室 <ArrowRight size={14} /></button>
        </div>
      </div>
    </div>
  );
};

// ============ MODULE 2: ENHANCED SEARCH ============
const EnhancedSearchView = () => {
  const [mode, setMode] = useState('list');
  const [filter, setFilter] = useState('all');

  const results = [
    { id: 1, type: 'material', name: 'M-202 无刷电机', code: 'MAT-2023-001', status: 'critical' as const, data: { stock: '2,000', dos: '95天', pending: '500', supplier: 'TechMotor' }, logic: '关联成品 T20 已退市，但采购仍在继续，判定为呆滞风险。库龄已超过 180 天，建议立即处理。', actions: ['取消采购 (ERP)', '转为备件 (WMS)', '联系供应商退货'], impact: '影响金额: ¥52w', priority: 'high' },
    { id: 2, type: 'order', name: 'SO-20231105 黑龙江农垦', code: 'ORD-HLJ-998', status: 'warning' as const, data: { amount: '¥250w', delay: '+7天', stage: '采购', customer: '黑龙江农垦' }, logic: '核心组件液压阀延期，导致关键路径受阻，预计违约。供应商 HydraulicCo 产能不足，建议切换备选供应商。', actions: ['催采购 (Ding)', '拆分订单 (OMS)', '切换供应商'], impact: '违约金: ¥12.5w', priority: 'high' },
    { id: 3, type: 'supplier', name: 'TechMotor Inc.', code: 'SUP-US-002', status: 'warning' as const, data: { score: '85', risk: 'Medium', spend: '¥450w', ontime: '78%' }, logic: '近期交付准时率下降至 78%（目标 95%），质量问题增加（3 起转子裂纹），外部征信显示法人被限高，建议降低采购份额。', actions: ['查看绩效报告', '发起询价', '寻找替代供应商'], impact: '影响 5 个在途订单', priority: 'medium' },
    { id: 4, type: 'product', name: 'Mavic 3E 企业版', code: 'PRD-M3E-2023', status: 'neutral' as const, data: { stock: '200', orders: '220', roi: '18.5%', lifecycle: '成熟期' }, logic: '产品处于成熟期，ROI 稳定在 18.5%，市场份额健康。建议引入 V2.0 版本以保持竞争力。', actions: ['查看产品详情', '启动 V2.0 研发', '市场调研'], impact: '预计年营收: ¥1200w', priority: 'low' },
  ];

  const filteredResults = filter === 'all' ? results : results.filter(r => r.type === filter);

  return (
    <div className="h-full flex flex-col">
      <div className="bg-white border-b p-6">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-2xl font-bold text-slate-800 mb-1">全局搜索中心</h2>
            <p className="text-sm text-slate-500">跨系统智能搜索 · Data-Logic-Action 三段式分析</p>
          </div>
          <div className="flex gap-2">
            <button className="px-3 py-2 bg-white border rounded-lg text-xs font-bold flex items-center gap-2 hover:bg-slate-50"><Filter size={14} /> 高级筛选</button>
            <button className="px-3 py-2 bg-white border rounded-lg text-xs font-bold flex items-center gap-2 hover:bg-slate-50"><Download size={14} /> 导出结果</button>
          </div>
        </div>

        <div className="flex gap-4 mb-4">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
            <input type="text" placeholder="搜索订单、物料、供应商、客户... (支持模糊搜索、编码搜索)" className="w-full pl-12 pr-4 py-3 bg-slate-50 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 shadow-sm" />
          </div>
          <div className="flex bg-slate-100 p-1 rounded-xl">
            <button onClick={() => setMode('list')} className={`p-2 rounded-lg transition-all ${mode === 'list' ? 'bg-white shadow text-indigo-600' : 'text-slate-400'}`}><List size={20} /></button>
            <button onClick={() => setMode('card')} className={`p-2 rounded-lg transition-all ${mode === 'card' ? 'bg-white shadow text-indigo-600' : 'text-slate-400'}`}><Grid size={20} /></button>
          </div>
        </div>

        <div className="flex gap-6 text-sm border-b pb-1">
          {[
            { id: 'all', label: '全部结果', count: results.length },
            { id: 'material', label: '物料', count: results.filter(r => r.type === 'material').length },
            { id: 'order', label: '订单', count: results.filter(r => r.type === 'order').length },
            { id: 'supplier', label: '供应商', count: results.filter(r => r.type === 'supplier').length },
            { id: 'product', label: '产品', count: results.filter(r => r.type === 'product').length },
          ].map(tab => (
            <button key={tab.id} onClick={() => setFilter(tab.id)} className={`px-3 py-2 font-bold transition-colors ${filter === tab.id ? 'text-indigo-600 border-b-2 border-indigo-600' : 'text-slate-500 hover:text-indigo-600'}`}>
              {tab.label} ({tab.count})
            </button>
          ))}
        </div>
      </div>

      <div className="p-6 flex-1 overflow-y-auto bg-slate-50/50">
        {mode === 'list' ? (
          <div className="bg-white rounded-xl border shadow-sm overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 border-b">
                <tr>
                  <th className="p-4 text-left font-medium text-slate-600">对象信息</th>
                  <th className="p-4 text-left font-medium text-slate-600">关键数据 (Data)</th>
                  <th className="p-4 text-left font-medium text-slate-600">AI 逻辑分析 (Logic)</th>
                  <th className="p-4 text-left font-medium text-slate-600">建议行动 (Action)</th>
                </tr>
              </thead>
              <tbody>
                {filteredResults.map(r => (
                  <tr key={r.id} className="border-b hover:bg-slate-50 transition-colors group">
                    <td className="p-4 align-top">
                      <div className="flex gap-3">
                        <div className={`p-2 rounded-lg h-fit ${r.status === 'critical' ? 'bg-red-100 text-red-600' : r.status === 'warning' ? 'bg-amber-100 text-amber-600' : 'bg-slate-100 text-slate-600'}`}>
                          {r.type === 'material' ? <Zap size={18} /> : r.type === 'order' ? <ShoppingCart size={18} /> : r.type === 'supplier' ? <Users size={18} /> : <Package size={18} />}
                        </div>
                        <div>
                          <div className="font-bold text-slate-800 mb-1">{r.name}</div>
                          <div className="text-xs text-slate-400 font-mono bg-slate-100 px-2 py-0.5 rounded inline-block">{r.code}</div>
                          <div className="mt-2">
                            <Badge type={r.status} size="sm">{r.status}</Badge>
                            {r.priority === 'high' && <Badge type="critical" size="sm" className="ml-2">高优先级</Badge>}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="p-4 align-top">
                      <div className="space-y-2">
                        {Object.entries(r.data).map(([k, v]) => (
                          <div key={k} className="flex gap-3 text-xs">
                            <span className="text-slate-500 capitalize w-20">{k}:</span>
                            <span className="font-medium text-slate-700">{v}</span>
                          </div>
                        ))}
                        <div className="pt-2 border-t border-slate-100 text-xs text-amber-600 font-medium">{r.impact}</div>
                      </div>
                    </td>
                    <td className="p-4 align-top max-w-sm">
                      <div className="text-xs text-slate-600 leading-relaxed bg-slate-50 p-3 rounded border border-slate-100">{r.logic}</div>
                    </td>
                    <td className="p-4 align-top">
                      <div className="flex flex-col gap-2">
                        {r.actions.map(a => (
                          <button key={a} className="px-3 py-2 border border-slate-200 rounded-lg text-xs font-medium hover:bg-indigo-50 hover:text-indigo-600 hover:border-indigo-200 text-left flex justify-between items-center group-btn transition-all bg-white">
                            {a} <ArrowRight size={12} className="opacity-0 group-hover:opacity-100 text-indigo-400" />
                          </button>
                        ))}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-6">
            {filteredResults.map(r => (
              <div key={r.id} className="bg-white p-6 rounded-xl border shadow-sm hover:shadow-md transition-all flex flex-col">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex gap-3">
                    <div className={`p-2 rounded-lg ${r.status === 'critical' ? 'bg-red-100 text-red-600' : r.status === 'warning' ? 'bg-amber-100 text-amber-600' : 'bg-slate-100 text-slate-600'}`}>
                      {r.type === 'material' ? <Zap size={20} /> : r.type === 'order' ? <ShoppingCart size={20} /> : r.type === 'supplier' ? <Users size={20} /> : <Package size={20} />}
                    </div>
                    <div>
                      <div className="font-bold text-slate-800 line-clamp-1 mb-1">{r.name}</div>
                      <div className="text-xs text-slate-400 font-mono bg-slate-100 px-2 py-0.5 rounded inline-block">{r.code}</div>
                    </div>
                  </div>
                  <Badge type={r.status}>{r.status}</Badge>
                </div>

                <div className="grid grid-cols-2 gap-2 mb-4">
                  {Object.entries(r.data).map(([k, v]) => (
                    <div key={k} className="bg-slate-50 p-2 rounded border border-slate-100">
                      <div className="text-[10px] text-slate-400 capitalize mb-1">{k}</div>
                      <div className="text-sm font-bold text-slate-700">{v}</div>
                    </div>
                  ))}
                </div>

                <div className="mb-4 p-3 bg-indigo-50/50 border border-indigo-100 rounded-lg">
                  <div className="text-[10px] text-indigo-600 font-bold uppercase mb-1 flex items-center gap-1"><Sparkles size={10} /> AI 分析</div>
                  <div className="text-xs text-slate-600 leading-relaxed">{r.logic}</div>
                </div>

                <div className="text-xs text-amber-600 font-medium mb-3 flex items-center gap-1">
                  <AlertCircle size={12} /> {r.impact}
                </div>

                <div className="mt-auto space-y-2">
                  {r.actions.map(a => (
                    <button key={a} className="w-full py-2 border border-slate-200 rounded-lg text-xs font-bold hover:bg-indigo-50 hover:text-indigo-600 hover:border-indigo-200 transition-colors bg-white">{a}</button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

// ============ MODULE 3: ENHANCED INVENTORY ============
const EnhancedInventoryView = ({ toggleCopilot, mode }: { toggleCopilot: () => void; mode: string }) => {
  const risks = [
    { id: 'P-01', name: 'T20 植保无人机', stock: 120, val: '¥600w', reason: '生命周期衰退 (已发T40)', age: '>180天', turnover: 180, category: '呆滞', act: [{ l: '定向促销', i: DollarSign, c: 'blue' }, { l: '拆解回收', i: Wrench, c: 'slate' }, { l: '转租赁', i: RefreshCw, c: 'emerald' }] },
    { id: 'P-02', name: 'Matrice 30', stock: 45, val: '¥225w', reason: '预测偏差 (订单取消)', age: '90-120天', turnover: 105, category: '低速', act: [{ l: '转租赁机', i: RefreshCw, c: 'emerald' }, { l: '内部调拨', i: ArrowRight, c: 'indigo' }] }
  ];

  const matRisks = [
    { id: 'M-202', name: 'M-202 无刷电机', stock: 2000, val: '¥52w', reason: 'BOM变更 (T20停产)', age: '>365天', supplier: 'TechMotor', category: '呆滞', act: [{ l: '替代复用', i: RefreshCw, c: 'emerald' }, { l: '退货', i: ArrowRight, c: 'blue' }, { l: '报废', i: Trash2, c: 'red' }] },
    { id: 'M-505', name: '旧版飞控 V1', stock: 500, val: '¥15w', reason: '技术淘汰', age: '>500天', supplier: 'ChipX', category: '呆滞', act: [{ l: '折价处理', i: DollarSign, c: 'amber' }, { l: '申请报废', i: Trash2, c: 'red' }] }
  ];

  const PIE_DATA = [{ name: '正常', value: 65, color: '#10b981' }, { name: '低速', value: 25, color: '#f59e0b' }, { name: '呆滞', value: 10, color: '#ef4444' }];

  const RiskCard = ({ r, type }: { r: { id: string; name: string; stock: number; val: string; reason: string; age: string; turnover?: number; supplier?: string; category: string; act: { l: string; i: React.ElementType; c: string }[] }; type: 'prod' | 'mat' }) => (
    <div className="bg-white border-2 border-slate-200 rounded-xl p-5 hover:shadow-lg hover:border-indigo-300 transition-all group">
      <div className="flex justify-between items-start mb-4">
        <div className="flex gap-3">
          <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${type === 'prod' ? 'bg-gradient-to-br from-indigo-100 to-indigo-50 text-indigo-600' : 'bg-gradient-to-br from-amber-100 to-amber-50 text-amber-600'}`}>
            {type === 'prod' ? <Package size={24} /> : <ClipboardList size={24} />}
          </div>
          <div>
            <div className="font-bold text-slate-800 mb-1">{r.name}</div>
            <div className="text-xs text-slate-500 font-mono bg-slate-100 px-2 py-0.5 rounded inline-block">{r.id}</div>
            {r.supplier && <div className="text-[10px] text-slate-400 mt-1">供应商: {r.supplier}</div>}
          </div>
        </div>
        <div className="text-right">
          <div className="font-bold text-slate-800 text-lg">{r.stock}</div>
          <div className="text-xs text-slate-500">库存</div>
          <div className="text-xs font-bold text-slate-600 mt-1">{r.val}</div>
        </div>
      </div>

      <div className="bg-gradient-to-br from-slate-50 to-slate-100 p-4 rounded-lg text-xs space-y-2 mb-4 border border-slate-200">
        <div className="flex justify-between items-center">
          <span className="text-slate-600">呆滞原因</span>
          <span className="font-bold text-slate-800">{r.reason}</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-slate-600">库龄</span>
          <Badge type="critical" size="sm">{r.age}</Badge>
        </div>
        {r.turnover && (
          <div className="flex justify-between items-center">
            <span className="text-slate-600">周转天数</span>
            <span className="font-bold text-red-600">{r.turnover} 天</span>
          </div>
        )}
        <div className="flex justify-between items-center pt-2 border-t border-slate-200">
          <span className="text-slate-600">分类</span>
          <Badge type={r.category === '呆滞' ? 'critical' : 'warning'} size="sm">{r.category}</Badge>
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        {r.act.map((a, k) => (
          <button key={k} className={`flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-xs font-bold border transition-all ${a.c === 'red' ? 'bg-red-50 text-red-600 border-red-200 hover:bg-red-100' : a.c === 'blue' ? 'bg-blue-50 text-blue-600 border-blue-200 hover:bg-blue-100' : a.c === 'emerald' ? 'bg-emerald-50 text-emerald-600 border-emerald-200 hover:bg-emerald-100' : a.c === 'indigo' ? 'bg-indigo-50 text-indigo-600 border-indigo-200 hover:bg-indigo-100' : a.c === 'amber' ? 'bg-amber-50 text-amber-600 border-amber-200 hover:bg-amber-100' : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'}`}>
            <a.i size={14} /> {a.l}
          </button>
        ))}
      </div>
    </div>
  );

  return (
    <div className="p-8 pb-20">
      <div className="flex justify-between items-end mb-8">
        <div>
          <h2 className="text-3xl font-extrabold text-slate-800 mb-2">库存优化中心</h2>
          <p className="text-slate-500 text-sm">AI 驱动的呆滞库存诊断与处理 · 双智能体协同分析</p>
        </div>
        <div className="flex items-center gap-6">
          <div className="bg-white px-5 py-3 rounded-xl border-2 border-slate-200 shadow-sm">
            <div className="text-xs text-slate-500 uppercase mb-1">呆滞总额</div>
            <div className="font-extrabold text-red-600 text-2xl">¥ 837w</div>
          </div>
          <div className="bg-white p-3 rounded-xl border-2 border-slate-200 shadow-sm">
            <div className="h-16 w-16">
              <ResponsiveContainer>
                <PieChart>
                  <Pie data={PIE_DATA} innerRadius={0} outerRadius={30} dataKey="value" stroke="none">
                    {PIE_DATA.map((e, i) => <Cell key={i} fill={e.color} />)}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-8">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-slate-800 flex items-center gap-2 text-lg">
              <div className="p-2 bg-indigo-100 rounded-lg"><Package className="text-indigo-600" size={20} /></div>
              产品库存智能体
            </h3>
            {mode === 'api' ? (
              <Badge type="success">智能计算</Badge>
            ) : (
              <Badge type="info">2 待处理</Badge>
            )}
          </div>
          {mode === 'api' ? (
            <ProductInventoryAgentCard />
          ) : (
            risks.map((r, i) => <RiskCard key={i} r={r} type="prod" />)
          )}
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-slate-800 flex items-center gap-2 text-lg">
              <div className="p-2 bg-amber-100 rounded-lg"><ClipboardList className="text-amber-600" size={20} /></div>
              物料库存智能体
            </h3>
            {mode === 'api' ? (
              <Badge type="success">API数据</Badge>
            ) : (
              <Badge type="warning">2 待处理</Badge>
            )}
          </div>
          {mode === 'api' ? (
            <MaterialInventoryAgentCard />
          ) : (
            matRisks.map((r, i) => <RiskCard key={i} r={r} type="mat" />)
          )}
        </div>
      </div>

      <div className="mt-8 bg-gradient-to-br from-indigo-50 to-purple-50 border-2 border-indigo-200 rounded-xl p-6">
        <div className="flex items-start gap-4">
          <div className="p-3 bg-white rounded-xl shadow-sm">
            <Sparkles size={24} className="text-indigo-600" />
          </div>
          <div className="flex-1">
            <h4 className="font-bold text-slate-800 mb-2 flex items-center gap-2">
              AI 综合建议
              <Badge type="info" size="sm">基于历史数据分析</Badge>
            </h4>
            <div className="text-sm text-slate-700 space-y-2">
              <p>• 检测到 <strong>M-202 电机</strong> 可复用至新品 T22 BOM，预计节省成本 <strong className="text-emerald-600">¥52w</strong></p>
              <p>• <strong>T20 无人机</strong> 建议启动定向促销（目标客户：中小农场），预计 30 天内清理 60% 库存</p>
              <p>• <strong>M30</strong> 转租赁方案已生成，预计年化收益率 <strong className="text-indigo-600">12%</strong>，优于直接折价处理</p>
            </div>
            <button className="mt-4 px-4 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg text-sm font-bold hover:shadow-lg transition-shadow">
              查看完整优化方案
            </button>
          </div>
        </div>
      </div>

      <button onClick={toggleCopilot} className="fixed bottom-8 right-8 bg-gradient-to-br from-indigo-600 to-purple-600 text-white p-4 rounded-full shadow-lg hover:scale-110 transition-transform z-40">
        <MessageSquare size={24} />
      </button>
    </div>
  );
};

// ============ MODULE 4: ENHANCED DELIVERY ============
const EnhancedDeliveryView = ({ toggleCopilot }: { toggleCopilot: () => void }) => {
  const orders = [
    { id: 'SO-20231105', c: '黑龙江农垦总局', p: 'T20 (50台)', amt: '¥250w', d: 7, eta: '11-20', s: 'procurement', b: '液压阀 (供应商缺货)', priority: 'critical', customer_level: 'VIP', act: ['催采购', '切换供应商', '客户沟通'] },
    { id: 'SO-20231109', c: '新疆建设兵团', p: 'T40 (20台)', amt: '¥120w', d: 3, eta: '11-15', s: 'production', b: '产线排程冲突', priority: 'high', customer_level: 'A', act: ['催生产', '调整优先级'] },
    { id: 'SO-20231112', c: '中粮集团', p: 'Mavic 3E (100台)', amt: '¥180w', d: 2, eta: '11-14', s: 'shipping', b: '物流揽收延误', priority: 'medium', customer_level: 'VIP', act: ['催发货', '更换物流'] }
  ];

  const steps = [
    { id: 'procurement', l: '采购', i: ShoppingCart },
    { id: 'production', l: '生产', i: Factory },
    { id: 'qc', l: '质检', i: PackageCheck },
    { id: 'shipping', l: '发货', i: Plane }
  ];

  const trendData = [{ m: 'Jun', r: 92 }, { m: 'Jul', r: 93 }, { m: 'Aug', r: 91 }, { m: 'Sep', r: 94 }, { m: 'Oct', r: 95 }, { m: 'Nov', r: 94 }];

  return (
    <div className="p-8 pb-20">
      <div className="flex justify-between items-end mb-6">
        <div>
          <h2 className="text-3xl font-extrabold text-slate-800 mb-2">交付保障中心</h2>
          <p className="text-slate-500 text-sm">全流程可视化监控 · 延期订单作战室</p>
        </div>
        <div className="flex gap-2">
          <button className="px-3 py-2 bg-white border rounded-lg text-xs font-bold flex items-center gap-2 hover:bg-slate-50"><Filter size={14} /> 筛选</button>
          <button className="px-3 py-2 bg-white border rounded-lg text-xs font-bold flex items-center gap-2 hover:bg-slate-50"><Download size={14} /> 导出</button>
        </div>
      </div>

      <div className="grid grid-cols-4 gap-6 mb-8">
        <div className="bg-white p-5 rounded-xl border-2 border-slate-200 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 bg-emerald-100 rounded-lg"><Target size={20} className="text-emerald-600" /></div>
            <div className="text-sm text-slate-500">今年准交率</div>
          </div>
          <div className="text-3xl font-extrabold text-emerald-600 mb-1">94.8%</div>
          <div className="text-xs text-emerald-600 font-bold flex items-center gap-1"><TrendingUp size={12} /> 同比 +2.3%</div>
        </div>

        <div className="bg-white p-5 rounded-xl border-2 border-slate-200 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 bg-emerald-100 rounded-lg"><CheckCircle2 size={20} className="text-emerald-600" /></div>
            <div className="text-sm text-slate-500">本季延误率</div>
          </div>
          <div className="text-3xl font-extrabold text-emerald-600 mb-1">3.2%</div>
          <div className="text-xs text-emerald-600 font-bold flex items-center gap-1"><TrendingDown size={12} /> 环比 -0.5%</div>
        </div>

        <div className="bg-white p-5 rounded-xl border-2 border-red-200 shadow-sm hover:shadow-md transition-shadow bg-red-50/30">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 bg-red-100 rounded-lg"><AlertTriangle size={20} className="text-red-600" /></div>
            <div className="text-sm text-slate-500">延期订单</div>
          </div>
          <div className="text-3xl font-extrabold text-red-600 mb-1">12</div>
          <div className="text-xs text-red-600 font-bold">影响金额: ¥550w</div>
        </div>

        <div className="bg-white p-4 rounded-xl border-2 border-slate-200 shadow-sm">
          <div className="text-xs text-slate-400 mb-2">准交率趋势 (6月)</div>
          <div className="h-16">
            <ResponsiveContainer>
              <AreaChart data={trendData}>
                <defs>
                  <linearGradient id="colorRate" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <Area type="monotone" dataKey="r" stroke="#10b981" fillOpacity={1} fill="url(#colorRate)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl border shadow-sm overflow-hidden">
        <div className="p-4 border-b flex justify-between items-center">
          <h3 className="font-bold text-slate-800 flex items-center gap-2"><Clock className="text-red-600" size={18} /> 延期订单作战室</h3>
          <Badge type="critical">12 待处理</Badge>
        </div>
        <div className="divide-y">
          {orders.map((order, idx) => (
            <div key={idx} className="p-5 hover:bg-slate-50 transition-colors">
              <div className="flex justify-between items-start mb-4">
                <div className="flex gap-4">
                  <div className={`p-3 rounded-xl ${order.priority === 'critical' ? 'bg-red-100 text-red-600' : order.priority === 'high' ? 'bg-amber-100 text-amber-600' : 'bg-blue-100 text-blue-600'}`}>
                    <AlertTriangle size={20} />
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-bold text-slate-800">{order.c}</span>
                      <Badge type={order.customer_level === 'VIP' ? 'purple' : 'neutral'} size="sm">{order.customer_level}</Badge>
                    </div>
                    <div className="text-xs text-slate-500">{order.id} · {order.p}</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-lg font-bold text-red-600">+{order.d}天</div>
                  <div className="text-xs text-slate-500">ETA: {order.eta}</div>
                </div>
              </div>

              <div className="flex items-center gap-2 mb-4">
                {steps.map((step, i) => (
                  <React.Fragment key={step.id}>
                    <div className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold ${order.s === step.id ? 'bg-red-100 text-red-600 border-2 border-red-300' : steps.findIndex(s => s.id === order.s) > i ? 'bg-emerald-100 text-emerald-600' : 'bg-slate-100 text-slate-400'}`}>
                      <step.i size={14} />
                      {step.l}
                    </div>
                    {i < steps.length - 1 && <ChevronRight size={14} className="text-slate-300" />}
                  </React.Fragment>
                ))}
              </div>

              <div className="bg-red-50 border border-red-100 rounded-lg p-3 mb-4">
                <div className="text-xs text-red-600 font-bold flex items-center gap-1 mb-1"><AlertCircle size={12} /> 阻塞原因</div>
                <div className="text-sm text-slate-700">{order.b}</div>
              </div>

              <div className="flex gap-2">
                {order.act.map((a, i) => (
                  <button key={i} className="px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs font-bold hover:bg-indigo-50 hover:text-indigo-600 hover:border-indigo-200 transition-colors">{a}</button>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      <button onClick={toggleCopilot} className="fixed bottom-8 right-8 bg-gradient-to-br from-indigo-600 to-purple-600 text-white p-4 rounded-full shadow-lg hover:scale-110 transition-transform z-40">
        <MessageSquare size={24} />
      </button>
    </div>
  );
};

// ============ MAIN APP ============
const SupplyChainApp = () => {
  const [view, setView] = useState('cockpit');
  const [copilotOpen, setCopilotOpen] = useState(false);
  const [mode, setMode] = useState('demo');

  const navItems = [
    { id: 'cockpit', label: '驾驶舱', icon: LayoutDashboard },
    { id: 'search', label: '全局搜索', icon: Search },
    { id: 'inventory', label: '库存优化', icon: Package },
    { id: 'delivery', label: '交付保障', icon: Truck },
  ];

  const copilotData = {
    cockpit: { title: '供应链助手', messages: [{ type: 'bot', text: '欢迎使用供应链智能助手，我可以帮您分析数据、生成报告、提供决策建议。' }], suggestions: ['生成月报', '分析趋势', '风险预警'] },
    inventory: { title: '库存优化专家', messages: [{ type: 'bot', text: '我是库存优化专家，可帮您分析呆滞库存、制定处理方案。当前检测到 4 个高风险物料。' }], suggestions: ['分析呆滞原因', '生成处理方案', '计算回收价值'] },
    delivery: { title: '交付保障专家', messages: [{ type: 'bot', text: '我是交付保障专家，可帮您追踪延期订单、分析瓶颈、协调资源。当前有 12 个延期订单需要关注。' }], suggestions: ['分析延期原因', '制定追赶计划', '客户沟通建议'] },
  };

  const currentCopilot = copilotData[view as keyof typeof copilotData] || copilotData.cockpit;

  return (
    <div className="min-h-screen bg-slate-50 flex">
      <div className="w-20 bg-slate-900 flex flex-col items-center py-6 fixed h-full z-50">
        <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center mb-8">
          <Layers className="text-white" size={20} />
        </div>
        <nav className="flex-1 space-y-2">
          {navItems.map(item => (
            <button key={item.id} onClick={() => setView(item.id)} className={`w-12 h-12 rounded-xl flex items-center justify-center transition-all ${view === item.id ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/30' : 'text-slate-400 hover:bg-slate-800 hover:text-white'}`}>
              <item.icon size={22} />
            </button>
          ))}
        </nav>
        <div className="space-y-2">
          <button onClick={() => setMode(mode === 'demo' ? 'api' : 'demo')} className={`w-12 h-12 rounded-xl flex items-center justify-center transition-all ${mode === 'api' ? 'bg-emerald-600 text-white' : 'text-slate-400 hover:bg-slate-800 hover:text-white'}`}>
            <Settings size={22} />
          </button>
          <button className="w-12 h-12 rounded-xl flex items-center justify-center text-slate-400 hover:bg-slate-800 hover:text-white transition-all relative">
            <Bell size={22} />
            <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full"></span>
          </button>
        </div>
      </div>

      <div className="flex-1 ml-20">
        {view === 'cockpit' && <EnhancedCockpitView onNavigate={setView} />}
        {view === 'search' && <EnhancedSearchView />}
        {view === 'inventory' && <EnhancedInventoryView toggleCopilot={() => setCopilotOpen(true)} mode={mode} />}
        {view === 'delivery' && <EnhancedDeliveryView toggleCopilot={() => setCopilotOpen(true)} />}
      </div>

      <CopilotSidebar isOpen={copilotOpen} onClose={() => setCopilotOpen(false)} title={currentCopilot.title} initialMessages={currentCopilot.messages} suggestions={currentCopilot.suggestions} />
    </div>
  );
};

export default SupplyChainApp;