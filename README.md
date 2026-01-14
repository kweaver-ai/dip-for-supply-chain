# SupplyChainBrain - 供应链大脑前端应用

The supply chain Brain is an AI-assisted analysis and decision-making system based on the supply chain knowledge network and the ontology modeling method.

这是一个基于 React + TypeScript + Vite 的供应链管理系统前端应用。

## 启动开发服务器

### ⚠️ 重要：必须先启动代理服务器

前端通过代理服务器转发API请求，**必须先启动代理服务器**才能正常连接API。

### 方法1：使用一键启动脚本（推荐）

```bash
# Windows
start-all.bat

# 这会自动：
# 1. 检查并启动代理服务器（如果未运行）
# 2. 启动前端开发服务器
```

### 方法2：手动启动

**步骤1：启动代理服务器**

打开第一个终端窗口：

```bash
cd frontend
node proxy-server.js
# 或使用批处理文件
start-proxy.bat
```

代理服务器将在 `http://127.0.0.1:30777` 上运行。

**步骤2：启动前端开发服务器**

打开第二个终端窗口：

```bash
cd frontend
npm install  # 如果还没安装依赖
npm run dev
```

前端服务器将在 `http://127.0.0.1:5173` 上运行。

### 验证连接

1. 打开浏览器访问 `http://127.0.0.1:5173`
2. 打开浏览器控制台（F12）
3. 在控制台运行以下代码进行连接诊断：

```javascript
// 导入诊断工具
import { runAllTests, printTestResults } from './src/utils/apiConnectionTest';

// 运行测试
const results = await runAllTests();
printTestResults(results);
```

### 常见问题

**Q: API请求失败，提示连接错误**
- ✅ 检查代理服务器是否运行（应该能看到代理服务器的日志输出）
- ✅ 检查端口30777是否被占用
- ✅ 确认代理服务器窗口没有报错

**Q: 返回401 Unauthorized**
- ✅ 检查token是否正确配置在 `src/config/apiConfig.ts`
- ✅ 确认token未过期

**Q: 返回404 Not Found**
- ✅ 检查API baseUrl配置是否正确
- ✅ 确认代理服务器正在运行

## 可用功能

- 🏠 **驾驶舱** - 供应链整体概览
- 📦 **库存优化** - 库存管理和优化分析
- 📈 **产品供应优化** - 供应优化和预测
- 🚚 **订单交付** - 交付管理
- 👥 **供应商评估** - 供应商风险评估
- ⚙️ **管理配置** - 系统配置管理
- 🤖 **AI 助手** - 集成 Agent API 的智能对话助手

## Agent API 集成

前端已完成与后端 Agent API 的完整对接：

### 核心特性
- **流式对话**: 支持实时流式响应，提升用户体验
- **会话管理**: 自动维护对话上下文和历史记录
- **多 Agent 支持**: 根据不同页面使用对应的专业 Agent
- **错误处理**: 完善的错误处理和重试机制

### 支持的 Agent
- **供应商评估助手** (`supplier_evaluation_agent`)
- **库存优化助手** (`inventory_optimization_agent`)
- **产品供应优化助手** (`product_supply_optimization_agent`)
- **订单交付助手** (`order_delivery_agent`)
- **供应链驾驶舱助手** (`supply_chain_cockpit_agent`)

### API 端点
- 对话接口: `POST /api/agent-app/v1/app/{app_key}/chat/completion`
- 会话管理: `GET|POST|PUT|DELETE /api/agent-app/v1/app/{app_key}/conversations`
- 调试接口: `POST /api/agent-app/v1/app/{app_key}/api/debug`

## 数据模式说明 (Data Modes)

系统支持两种数据处理模式，可通过右上角的切换开关（或管理配置页面）进行切换：

### 1. 通用模式 (`huida-legacy`)
- **用途**: 展示完整的、经过验证的业务场景数据。
- **数据源**: `src/data/mockData.ts` 结合基础 API 服务。
- **场景**: 演示、演示开发和稳定性测试。

### 2. 惠达供应链大脑模式 (`huida-new`)
- **用途**: 对接最新、真实的惠达供应链 API 数据。
- **数据源**: 真实的指标查询 API (`/proxy-metric/v1`)。
- **场景**: 实际业务分析、指标下钻和实时预警。

## 供应链知识网络配置

系统集成了 **供应链知识网络** 配置功能，支持根据不同场景切换本体模型：
- **动态 ID 绑定**: 可在管理页面实时选择当前激活的 `knowledgeNetworkId`。
- **模式联动**: 切换数据模式时，系统会自动推荐最适合该模式的知识网络（如大脑模式自动切换到 `d56v...`）。
- **本体路由**: 所有的本体查询均通过 `ontologyApi` 动态构建路由，支持跨网络、跨环境调用。

## 技术栈

- React 19.2.0
- TypeScript
- Vite
- Tailwind CSS v4
- Lucide React (图标)
- Recharts (图表)
- Agent API 客户端 (自定义)

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend updating the configuration to enable type-aware lint rules:

```js
export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...

      // Remove tseslint.configs.recommended and replace with this
      tseslint.configs.recommendedTypeChecked,
      // Alternatively, use this for stricter rules
      tseslint.configs.strictTypeChecked,
      // Optionally, add this for stylistic rules
      tseslint.configs.stylisticTypeChecked,

      // Other configs...
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```

You can also install [eslint-plugin-react-x](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-x) and [eslint-plugin-react-dom](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-dom) for React-specific lint rules:

```js
// eslint.config.js
import reactX from 'eslint-plugin-react-x'
import reactDom from 'eslint-plugin-react-dom'

export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...
      // Enable lint rules for React
      reactX.configs['recommended-typescript'],
      // Enable lint rules for React DOM
      reactDom.configs.recommended,
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```
