# Quick Start Guide: 供应链大脑配置后台

**Feature**: Supply Chain Configuration Backend  
**Date**: 2024-12-19  
**Status**: Complete

## Overview

This guide provides step-by-step instructions for implementing the Supply Chain Configuration Backend feature. Follow these steps in order, as later steps depend on earlier ones.

## Prerequisites

- TypeScript 5.9.3
- React 19.2.0
- Tailwind CSS v4.1.17
- Lucide React (icons)
- Existing codebase with `src/types/ontology.ts`, `src/data/mockData.ts`, `src/SupplyChainApp.tsx`

## Implementation Steps

### Step 1: Add Types to Ontology

**File**: `src/types/ontology.ts`

**Changes**: Add new type definitions at the end of the file.

```typescript
// Entity Type
export type EntityType = 
  | 'supplier'    // 供应商
  | 'material'    // 物料
  | 'factory'     // 工厂
  | 'product'     // 产品
  | 'warehouse'   // 仓库
  | 'order'       // 订单
  | 'logistics'   // 物流
  | 'customer';   // 客户

// Entity Relation
export interface EntityRelation {
  targetType: EntityType;
  relationType: '多对多' | '多对一' | '一对多';
  count: number;
  sampleItems: string[];
}

// Business Logic Rule
export interface BusinessLogicRule {
  ruleId: string;
  ruleType: 'validation' | 'calculation' | 'trigger';
  name: string;
  condition?: string;
  formula?: string;
  level?: 'warning' | 'critical';
  unit?: string;
  action?: string;
}

// Entity Action
export interface EntityAction {
  actionId: string;
  name: string;
  icon: string;
  color: string;
  description: string;
}

// Permission Config
export interface PermissionConfig {
  roles: string[];
  users: number[];
}

// Entity Config
export interface EntityConfig {
  entityId: string;
  entityType: EntityType;
  attributes: Record<string, any>;
  relations: EntityRelation[];
  logicRules: BusinessLogicRule[];
  actions: EntityAction[];
  permissions: PermissionConfig;
}

// User
export interface User {
  userId: number;
  name: string;
  role: string;
  email: string;
  phone: string;
  avatar: string;
  department: string;
  status: 'active' | 'inactive';
}

// Role
export interface Role {
  roleId: string;
  name: string;
  color: string;
  scope: string;
  description: string;
}
```

**Verification**: TypeScript compilation should succeed without errors.

---

### Step 2: Add Data to mockData.ts

**File**: `src/data/mockData.ts`

**Changes**: Add user data, role data, and entity configurations.

```typescript
import type { User, Role, EntityConfig } from '../types/ontology';

// User Data
export const usersData: User[] = [
  { userId: 1, name: '张伟', role: 'admin', email: 'zhang.wei@company.com', phone: '138-0000-0001', avatar: '👨‍💼', department: '供应链中心', status: 'active' },
  { userId: 2, name: '李娜', role: 'procurement', email: 'li.na@company.com', phone: '138-0000-0002', avatar: '👩‍💼', department: '采购部', status: 'active' },
  { userId: 3, name: '王强', role: 'production', email: 'wang.qiang@company.com', phone: '138-0000-0003', avatar: '👨‍🔧', department: '生产部', status: 'active' },
  { userId: 4, name: '刘芳', role: 'product', email: 'liu.fang@company.com', phone: '138-0000-0004', avatar: '👩‍💻', department: '产品部', status: 'active' },
  { userId: 5, name: '陈明', role: 'sales', email: 'chen.ming@company.com', phone: '138-0000-0005', avatar: '👨‍💻', department: '销售部', status: 'active' },
];

// Role Data
export const rolesData: Record<string, Role> = {
  admin: { roleId: 'admin', name: '供应链管理员', color: 'purple', scope: '全部对象', description: '拥有全部权限，可进入本体建模后台' },
  procurement: { roleId: 'procurement', name: '采购总监', color: 'blue', scope: '供应商、物料、采购订单', description: '负责供应商管理和采购执行' },
  production: { roleId: 'production', name: '生产总监', color: 'emerald', scope: '工厂、产品、生产计划', description: '负责工厂运营和生产排程' },
  product: { roleId: 'product', name: '产品总监', color: 'amber', scope: '产品、BOM、生命周期', description: '负责产品规划和研发管理' },
  sales: { roleId: 'sales', name: '销售总监', color: 'pink', scope: '客户、订单、物流', description: '负责客户关系和订单交付' },
};

// Entity Configurations (initialize with default configs for existing entities)
export const entityConfigs: Map<string, EntityConfig> = new Map([
  // Add default configs for existing entities
  // Example: ['product-PRD-001', { entityId: 'PRD-001', entityType: 'product', ... }],
]);
```

**Verification**: Data should be accessible via imports.

---

### Step 3: Create Entity Config Service

**File**: `src/utils/entityConfigService.ts`

**Changes**: Create service layer with CRUD operations.

```typescript
import type { EntityType, EntityConfig, BusinessLogicRule, User, Role } from '../types/ontology';
import { productsData, suppliersData, materialsData } from '../data/mockData';
import { entityConfigs, usersData, rolesData } from '../data/mockData';

// Entity CRUD operations
export const getEntitiesByType = (type: EntityType): any[] => {
  // Map entity types to data arrays
  const dataMap: Record<EntityType, any[]> = {
    supplier: suppliersData,
    material: materialsData,
    product: productsData,
    // Add other entity types as needed
    factory: [],
    warehouse: [],
    order: [],
    logistics: [],
    customer: [],
  };
  return dataMap[type] || [];
};

export const getEntityById = (type: EntityType, id: string): any | null => {
  const entities = getEntitiesByType(type);
  return entities.find((e: any) => e[`${type}Id`] === id || e.id === id) || null;
};

export const createEntity = (type: EntityType, data: Partial<any>): any => {
  // Implementation: Add entity to appropriate data array
  // Generate ID, validate data, add to array
  throw new Error('Not implemented');
};

export const updateEntity = (type: EntityType, id: string, data: Partial<any>): any => {
  // Implementation: Update entity in data array
  throw new Error('Not implemented');
};

export const deleteEntity = (type: EntityType, id: string): boolean => {
  // Implementation: Remove entity from data array
  throw new Error('Not implemented');
};

// Entity Configuration operations
export const getEntityConfig = (entityType: EntityType, entityId: string): EntityConfig | null => {
  const key = `${entityType}-${entityId}`;
  return entityConfigs.get(key) || null;
};

export const updateEntityConfig = (
  entityType: EntityType,
  entityId: string,
  config: Partial<EntityConfig>
): EntityConfig => {
  const key = `${entityType}-${entityId}`;
  const existing = entityConfigs.get(key);
  if (!existing) {
    throw new Error(`Entity config not found: ${key}`);
  }
  const updated = { ...existing, ...config };
  entityConfigs.set(key, updated);
  return updated;
};

// User Management operations
export const getUsers = (): User[] => usersData;
export const getUserById = (userId: number): User | null => usersData.find(u => u.userId === userId) || null;

// Role Management operations
export const getRoles = (): Role[] => Object.values(rolesData);
export const getRoleById = (roleId: string): Role | null => rolesData[roleId] || null;

// AI Assistant operations
export const generateBusinessRule = (input: string, entityType: EntityType): BusinessLogicRule | null => {
  // Pattern matching implementation
  if (input.includes('库存') && input.includes('预警')) {
    return {
      ruleId: `rule-${Date.now()}`,
      ruleType: 'validation',
      name: '库存预警',
      condition: 'stock < 100',
      level: 'warning',
    };
  }
  // Add more patterns
  return null;
};
```

**Verification**: Service functions should be importable and callable.

---

### Step 4: Create Config Backend Layout

**File**: `src/components/config-backend/ConfigBackendLayout.tsx`

**Changes**: Create main layout component with sidebar navigation.

```typescript
import { useState } from 'react';
import { Settings, Network, Database, UserCheck, Package, Users, Factory, ShoppingCart, Warehouse, Truck, MapPin } from 'lucide-react';
import KnowledgeGraphView from './KnowledgeGraphView';
import EntityListView from './EntityListView';
import UserManagementView from './UserManagementView';

type ConfigView = 'knowledge-graph' | 'entities' | 'users';
type EntityType = 'supplier' | 'material' | 'factory' | 'product' | 'warehouse' | 'order' | 'logistics' | 'customer';

interface Props {
  onBack: () => void;
}

const ConfigBackendLayout = ({ onBack }: Props) => {
  const [currentView, setCurrentView] = useState<ConfigView>('knowledge-graph');
  const [selectedEntityType, setSelectedEntityType] = useState<EntityType | null>(null);

  const sidebarMenu = [
    { id: 'knowledge-graph' as const, label: '知识图谱', icon: Network },
    { id: 'entities' as const, label: '实体列表', icon: Database, children: [
      { id: 'supplier' as const, label: '供应商', icon: Users },
      { id: 'material' as const, label: '物料', icon: Package },
      { id: 'factory' as const, label: '工厂', icon: Factory },
      { id: 'product' as const, label: '产品', icon: Package },
      { id: 'warehouse' as const, label: '仓库', icon: Warehouse },
      { id: 'order' as const, label: '订单', icon: ShoppingCart },
      { id: 'logistics' as const, label: '物流', icon: Truck },
      { id: 'customer' as const, label: '客户', icon: MapPin },
    ]},
    { id: 'users' as const, label: '用户管理', icon: UserCheck },
  ];

  return (
    <div className="flex h-screen bg-slate-50">
      {/* Sidebar */}
      <div className="w-64 bg-white border-r border-slate-200">
        <div className="p-4 border-b border-slate-200">
          <button onClick={onBack} className="flex items-center gap-2 text-slate-600 hover:text-slate-800">
            <Settings size={20} />
            <span className="font-semibold">配置后台</span>
          </button>
        </div>
        <nav className="p-2">
          {sidebarMenu.map(item => (
            <div key={item.id}>
              <button
                onClick={() => {
                  setCurrentView(item.id);
                  if (item.id === 'entities') setSelectedEntityType(null);
                }}
                className={`w-full flex items-center gap-2 px-3 py-2 rounded-md text-sm ${
                  currentView === item.id ? 'bg-indigo-50 text-indigo-600' : 'text-slate-600 hover:bg-slate-50'
                }`}
              >
                <item.icon size={16} />
                {item.label}
              </button>
              {item.children && currentView === 'entities' && (
                <div className="ml-6 mt-1">
                  {item.children.map(child => (
                    <button
                      key={child.id}
                      onClick={() => setSelectedEntityType(child.id)}
                      className={`w-full flex items-center gap-2 px-3 py-2 rounded-md text-sm ${
                        selectedEntityType === child.id ? 'bg-indigo-50 text-indigo-600' : 'text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      <child.icon size={14} />
                      {child.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
          ))}
        </nav>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-auto">
        {currentView === 'knowledge-graph' && <KnowledgeGraphView />}
        {currentView === 'entities' && selectedEntityType && <EntityListView entityType={selectedEntityType} />}
        {currentView === 'users' && <UserManagementView />}
      </div>
    </div>
  );
};

export default ConfigBackendLayout;
```

**Verification**: Layout should render with sidebar navigation.

---

### Step 5: Create Knowledge Graph View

**File**: `src/components/config-backend/KnowledgeGraphView.tsx`

**Changes**: Create SVG-based knowledge graph visualization.

```typescript
import { Network } from 'lucide-react';
import { getKnowledgeGraphData } from '../../utils/entityConfigService';

const KnowledgeGraphView = () => {
  const graphData = getKnowledgeGraphData();

  // Simple grid layout for 8 entity types
  const positions = [
    { x: 150, y: 100 }, // supplier
    { x: 300, y: 100 }, // material
    { x: 450, y: 100 }, // factory
    { x: 150, y: 250 }, // product
    { x: 300, y: 250 }, // warehouse
    { x: 450, y: 250 }, // order
    { x: 300, y: 400 }, // logistics
    { x: 150, y: 400 }, // customer
  ];

  return (
    <div className="p-8">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
          <Network size={24} />
          知识图谱
        </h2>
        <p className="text-slate-500 mt-1">可视化展示供应链实体类型及其关系</p>
      </div>
      <div className="bg-white rounded-xl border shadow-sm p-8">
        <svg className="w-full h-[600px] border border-slate-200 rounded-lg">
          {graphData.nodes.map((node, index) => (
            <g key={node.type}>
              <circle cx={positions[index].x} cy={positions[index].y} r={40} fill="white" stroke="#3b82f6" strokeWidth="2" />
              <text x={positions[index].x} y={positions[index].y - 50} textAnchor="middle" className="text-sm font-semibold fill-slate-800">
                {node.name}
              </text>
              <text x={positions[index].x} y={positions[index].y + 5} textAnchor="middle" className="text-xs fill-slate-600">
                {node.count}
              </text>
            </g>
          ))}
        </svg>
      </div>
    </div>
  );
};

export default KnowledgeGraphView;
```

**Verification**: Knowledge graph should display 8 entity types with counts.

---

### Step 6: Create Entity List View

**File**: `src/components/config-backend/EntityListView.tsx`

**Changes**: Create generic entity list component with CRUD operations.

```typescript
import { useState } from 'react';
import { Plus, Search, Edit2, Trash2 } from 'lucide-react';
import { getEntitiesByType } from '../../utils/entityConfigService';
import type { EntityType } from '../../types/ontology';
import NewObjectModal from './NewObjectModal';
import RightPanel from './RightPanel';

interface Props {
  entityType: EntityType;
}

const EntityListView = ({ entityType }: Props) => {
  const [entities, setEntities] = useState(getEntitiesByType(entityType));
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedEntity, setSelectedEntity] = useState<any>(null);
  const [showNewModal, setShowNewModal] = useState(false);

  const filteredEntities = entities.filter((e: any) => {
    const name = e[`${entityType}Name`] || e.name || '';
    return name.toLowerCase().includes(searchQuery.toLowerCase());
  });

  return (
    <div className="flex h-full">
      {/* Entity List */}
      <div className="flex-1 p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold text-slate-800">实体列表 - {entityType}</h2>
          <button
            onClick={() => setShowNewModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
          >
            <Plus size={16} />
            新建
          </button>
        </div>
        <div className="mb-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" size={16} />
            <input
              type="text"
              placeholder="搜索实体..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
        </div>
        <div className="bg-white rounded-xl border shadow-sm">
          <table className="w-full">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-semibold text-slate-700">ID</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-slate-700">名称</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-slate-700">操作</th>
              </tr>
            </thead>
            <tbody>
              {filteredEntities.map((entity: any) => (
                <tr key={entity.id || entity[`${entityType}Id`]} className="border-t border-slate-200 hover:bg-slate-50">
                  <td className="px-4 py-3 text-sm text-slate-600">{entity.id || entity[`${entityType}Id`]}</td>
                  <td className="px-4 py-3 text-sm text-slate-800">{entity.name || entity[`${entityType}Name`]}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setSelectedEntity(entity)}
                        className="p-1 text-indigo-600 hover:bg-indigo-50 rounded"
                      >
                        <Edit2 size={16} />
                      </button>
                      <button className="p-1 text-red-600 hover:bg-red-50 rounded">
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Right Panel */}
      {selectedEntity && (
        <RightPanel entity={selectedEntity} entityType={entityType} onClose={() => setSelectedEntity(null)} />
      )}

      {/* New Object Modal */}
      {showNewModal && (
        <NewObjectModal entityType={entityType} onClose={() => setShowNewModal(false)} />
      )}
    </div>
  );
};

export default EntityListView;
```

**Verification**: Entity list should display entities with search and CRUD operations.

---

### Step 7: Add "管理配置" Button to Header

**File**: `src/SupplyChainApp.tsx`

**Changes**: Add "管理配置" button and config view.

```typescript
import { Settings } from 'lucide-react';
import ConfigBackendLayout from './components/config-backend/ConfigBackendLayout';

// Update ViewType
type ViewType = 'cockpit' | 'search' | 'inventory' | 'optimization' | 'delivery' | 'evaluation' | 'config';

// In header section, add button:
<div className="flex items-center gap-4">
  {/* ... existing navigation ... */}
  <button
    onClick={() => setCurrentView('config')}
    className="flex items-center gap-2 px-4 py-2 text-slate-600 hover:text-slate-800 hover:bg-slate-50 rounded-lg"
  >
    <Settings size={18} />
    <span>管理配置</span>
  </button>
</div>

// In main content section:
{currentView === 'config' && <ConfigBackendLayout onBack={() => setCurrentView('cockpit')} />}
```

**Verification**: "管理配置" button should appear in header, clicking should show config backend.

---

## Next Steps

After completing these steps, continue with:
1. Implement RightPanel component (5 tabs: attributes, relations, logic, actions, permissions)
2. Implement NewObjectModal component
3. Implement ConfigAIAssistant component
4. Implement UserManagementView component
5. Add more entity types to mockData.ts
6. Implement full CRUD operations in entityConfigService.ts
7. Add validation and error handling
8. Polish UI and add edge case handling

See `tasks.md` for detailed task breakdown.





