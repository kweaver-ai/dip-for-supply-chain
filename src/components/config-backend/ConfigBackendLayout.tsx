import { useState, useEffect } from 'react';
import {
  Settings, UserCheck, Database, Users, Package, Warehouse,
  ShoppingCart, Award, ChevronDown, ChevronRight, Factory, GitBranch,
  Globe, Brain
} from 'lucide-react';
import GlobalObjectView from './GlobalObjectView';
import UserManagementView from './UserManagementView';
import EntityListPage from './EntityListPage';
import KnowledgeGraphView from './KnowledgeGraphView';
import type { EntityType } from '../../types/ontology';
import { recreateAllMockDataRecords } from '../../utils/entityConfigService';
import { useDataMode } from '../../contexts/DataModeContext';

type ConfigView = 'global-object' | 'knowledge-network' | 'knowledge-graph' | 'users' | 'global-settings';
type KnowledgeNetworkView = 'supplier' | 'material' | 'product' | 'warehouse' | 'order' | 'customer' | 'factory' | null;

interface Props {
  onBack: () => void;
}

const GlobalSettingsView = () => {
  const { mode, setMode, isApiMode } = useDataMode();

  return (
    <div className="p-6">
      <h2 className="text-lg font-semibold text-slate-800 mb-6">全局设置</h2>

      <div className="bg-white rounded-lg border border-slate-200 shadow-sm p-6 max-w-2xl">
        <h3 className="text-base font-medium text-slate-800 mb-4 flex items-center gap-2">
          <Database className="text-indigo-500" size={20} />
          数据源模式配置
        </h3>

        <div className="bg-slate-50 rounded-lg p-4 border border-slate-200">
          <div className="flex items-start gap-4">
            <div className="flex-1">
              <div className="font-medium text-slate-900 mb-1">
                当前模式: {isApiMode ? '惠达供应链大脑模式' : '通用模拟数据模式'}
              </div>
              <p className="text-sm text-slate-500 mb-3">
                {isApiMode
                  ? '系统将对接真实的惠达供应链数据API，展示实时业务数据。'
                  : '系统将使用本地生成的模拟数据，用于演示和开发测试。'}
              </p>
            </div>

            <button
              onClick={() => setMode(isApiMode ? 'mock' : 'api')}
              className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${isApiMode ? 'bg-indigo-600' : 'bg-slate-200'
                }`}
            >
              <span
                className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${isApiMode ? 'translate-x-5' : 'translate-x-0'
                  }`}
              />
            </button>
          </div>

          <div className="mt-4 pt-4 border-t border-slate-200 grid grid-cols-2 gap-4">
            <div className={`p-3 rounded border ${isApiMode ? 'bg-indigo-50 border-indigo-200' : 'bg-white border-slate-200 opacity-60'}`}>
              <div className="flex items-center gap-2 mb-2">
                <Brain className={isApiMode ? 'text-indigo-600' : 'text-slate-400'} size={18} />
                <span className={`font-medium ${isApiMode ? 'text-indigo-800' : 'text-slate-500'}`}>大脑模式</span>
              </div>
              <div className="text-xs text-slate-500">
                连接真实API端点<br />
                实时数据同步<br />
                用于生产环境
              </div>
            </div>

            <div className={`p-3 rounded border ${!isApiMode ? 'bg-purple-50 border-purple-200' : 'bg-white border-slate-200 opacity-60'}`}>
              <div className="flex items-center gap-2 mb-2">
                <Database className={!isApiMode ? 'text-purple-600' : 'text-slate-400'} size={18} />
                <span className={`font-medium ${!isApiMode ? 'text-purple-800' : 'text-slate-500'}`}>模拟模式</span>
              </div>
              <div className="text-xs text-slate-500">
                本地Mock数据<br />
                快速演示验证<br />
                用于开发测试
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

const ConfigBackendLayout = ({ onBack }: Props) => {
  const [currentView, setCurrentView] = useState<ConfigView>('knowledge-graph');
  const [knowledgeNetworkView, setKnowledgeNetworkView] = useState<KnowledgeNetworkView>(null);
  const [isKnowledgeNetworkExpanded, setIsKnowledgeNetworkExpanded] = useState(false);

  // Ensure data is initialized when config backend is opened
  useEffect(() => {
    recreateAllMockDataRecords();
  }, []);

  const sidebarMenu = [
    { id: 'global-settings' as const, label: '全局设置', icon: Globe },
    { id: 'knowledge-graph' as const, label: '业务知识网络预览', icon: GitBranch },
    {
      id: 'knowledge-network' as const,
      label: '供应链知识网络',
      icon: Database,
      children: [
        { id: 'supplier' as const, label: '供应商对象', icon: Users },
        { id: 'material' as const, label: '物料对象', icon: Package },
        { id: 'product' as const, label: '产品对象', icon: Package },
        { id: 'factory' as const, label: '产品BOM对象', icon: Factory },
        { id: 'warehouse' as const, label: '库存对象', icon: Warehouse },
        { id: 'order' as const, label: '订单对象', icon: ShoppingCart },
        { id: 'customer' as const, label: '生产计划对象', icon: Award },
      ]
    },
    { id: 'users' as const, label: '用户管理', icon: UserCheck },
  ];

  return (
    <div className="flex h-full bg-slate-50">
      <div className="w-64 bg-white border-r border-slate-200">
        <div className="p-4 border-b border-slate-200">
          <button
            onClick={onBack}
            className="flex items-center gap-2 text-slate-600 hover:text-slate-800 transition-colors"
          >
            <Settings size={20} />
            <span className="font-semibold">配置后台</span>
          </button>
        </div>
        <nav className="p-2 space-y-1">
          {sidebarMenu.map(item => {
            if ('children' in item) {
              const isActive = currentView === 'knowledge-network'; // Parent active if child view
              return (
                <div key={item.id}>
                  <button
                    onClick={() => {
                      setIsKnowledgeNetworkExpanded(!isKnowledgeNetworkExpanded);
                      if (!isKnowledgeNetworkExpanded) {
                        setCurrentView('knowledge-network');
                        setKnowledgeNetworkView('supplier'); // Default child
                      }
                    }}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-md text-sm transition-colors ${isActive
                      ? 'bg-indigo-50 text-indigo-600'
                      : 'text-slate-600 hover:bg-slate-50'
                      }`}
                  >
                    <div className="flex items-center gap-2">
                      <item.icon size={16} />
                      {item.label}
                    </div>
                    {isKnowledgeNetworkExpanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                  </button>
                  {isKnowledgeNetworkExpanded && item.children && (
                    <div className="ml-6 mt-1 space-y-1">
                      {item.children.map(child => (
                        <button
                          key={child.id}
                          onClick={() => {
                            setKnowledgeNetworkView(child.id);
                            setCurrentView('knowledge-network');
                          }}
                          className={`w-full flex items-center gap-2 px-3 py-2 rounded-md text-sm transition-colors ${knowledgeNetworkView === child.id
                            ? 'bg-indigo-50 text-indigo-600'
                            : 'text-slate-600 hover:bg-slate-50'
                            }`}
                        >
                          <child.icon size={14} />
                          {child.label}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              );
            }
            return (
              <button
                key={item.id}
                onClick={() => {
                  setCurrentView(item.id);
                  setKnowledgeNetworkView(null);
                }}
                className={`w-full flex items-center gap-2 px-3 py-2 rounded-md text-sm transition-colors ${currentView === item.id
                  ? 'bg-indigo-50 text-indigo-600'
                  : 'text-slate-600 hover:bg-slate-50'
                  }`}
              >
                <item.icon size={16} />
                {item.label}
              </button>
            );
          })}
        </nav>
      </div>

      <div className="flex-1 overflow-auto">
        {currentView === 'global-settings' && <GlobalSettingsView />}
        {currentView === 'global-object' && <GlobalObjectView />}
        {currentView === 'knowledge-graph' && <KnowledgeGraphView />}
        {currentView === 'knowledge-network' && knowledgeNetworkView && (
          <EntityListPage entityType={knowledgeNetworkView as EntityType} />
        )}
        {currentView === 'knowledge-network' && !knowledgeNetworkView && (
          <div className="flex items-center justify-center h-full text-slate-400">
            请从左侧选择一个对象类型
          </div>
        )}
        {currentView === 'users' && <UserManagementView />}
      </div>
    </div>
  );
};

export default ConfigBackendLayout;
