# DIP Token 集成改造方案

## 一、改造目标

将当前手动更新全局配置的token管理方式，改造为符合DIP应用规范的token获取方式：
- DIP模式下：使用平台注入的 `token.accessToken()`、`token.refreshToken()` 方法
- 独立模式下：保留现有手动配置功能
- 401错误时：自动刷新token并重试1次，失败后调用 `logout()`

## 二、改造范围

### 需要新建的文件
| 文件 | 说明 |
|------|------|
| `src/services/dipEnvironmentService.ts` | DIP环境管理服务，核心模块 |

### 需要修改的文件
| 文件 | 改动说明 |
|------|----------|
| `src/main.tsx` | 在qiankun生命周期中初始化/清理DIP服务 |
| `src/api/httpClient.ts` | 添加401响应拦截和token刷新重试机制 |
| `src/services/globalSettingsService.ts` | 改造getApiToken()优先使用DIP token |
| `src/components/config-backend/GlobalSettingsView.tsx` | 根据运行模式显示/隐藏token配置 |

## 三、详细设计

### 3.1 DIP环境管理服务 (dipEnvironmentService.ts)

```typescript
// 核心职责：
// 1. 存储DIP注入的token方法和logout方法
// 2. 提供环境检测 isDipMode()
// 3. 提供token获取/刷新/登出功能
// 4. 生命周期管理（initialize/cleanup）

interface DipTokenMethods {
  accessToken: () => string;
  refreshToken: () => Promise<{ accessToken: string }>;
  onTokenExpired: (code?: number) => void;
}

class DipEnvironmentService {
  private tokenMethods: DipTokenMethods | null = null;
  private logoutMethod: (() => void) | null = null;

  initialize(props?: MicroAppProps): void;  // 在mount时调用
  cleanup(): void;                           // 在unmount时调用
  isDipMode(): boolean;                      // 检测是否在DIP容器中
  getToken(): string | null;                 // 获取DIP token
  refreshToken(): Promise<string | null>;    // 刷新token
  logout(): void;                            // 调用DIP登出
}
```

### 3.2 HTTP客户端改造 (httpClient.ts)

**新增成员变量：**
```typescript
private isRefreshing: boolean = false;  // 防止并发刷新
private refreshQueue: Array<(token: string | null) => void> = [];  // 等待队列
```

**新增方法：**
```typescript
// 处理401响应，尝试刷新token并重试（仅1次）
private async handle401Response(
  url: string,
  options: RequestInit,
  config?: RequestConfig
): Promise<Response | null>;
```

**改造逻辑：**
1. 在 `get/post/put/delete/postStream` 方法中检测401响应
2. 仅在DIP模式下触发token刷新
3. 使用队列机制处理并发401请求
4. 刷新成功：用新token重试请求
5. 刷新失败：调用 `dipEnvironmentService.logout()`

### 3.3 Token获取优先级改造 (globalSettingsService.ts)

```typescript
getApiToken(): string {
  // Priority 1: DIP注入的token（仅DIP模式）
  if (dipEnvironmentService.isDipMode()) {
    const dipToken = dipEnvironmentService.getToken();
    if (dipToken) return dipToken;
  }

  // Priority 2: localStorage (独立模式)
  // Priority 3: 默认配置
  // ...保持现有逻辑
}
```

### 3.4 UI适配 (GlobalSettingsView.tsx)

```typescript
const isDipMode = dipEnvironmentService.isDipMode();

return (
  <div>
    {/* DIP模式提示 */}
    {isDipMode && (
      <div className="bg-blue-50 p-3 rounded-lg">
        当前运行在DIP容器中，认证由平台统一管理
      </div>
    )}

    {/* Token配置 - 仅独立模式显示 */}
    {!isDipMode && (
      <div>{/* 现有token配置UI */}</div>
    )}

    {/* 其他配置项保持不变 */}
  </div>
);
```

## 四、401处理流程

```
HTTP请求 → 返回401
    ↓
检测是否DIP模式？
    ├─ 否 → 直接抛出ApiError（保持现有行为）
    └─ 是 → 进入刷新流程
              ↓
        是否正在刷新？
          ├─ 是 → 加入等待队列
          └─ 否 → 开始刷新token
                    ↓
              调用 refreshToken()
                    ↓
              刷新成功？
                ├─ 是 → 用新token重试请求，通知队列
                └─ 否 → 调用 logout()，通知队列失败
```

## 五、实施步骤

### 步骤1：创建 dipEnvironmentService.ts
- 实现DIP环境管理服务
- 导出单例实例

### 步骤2：改造 main.tsx
- 在 `mount` 中调用 `dipEnvironmentService.initialize(props)`
- 在 `unmount` 中调用 `dipEnvironmentService.cleanup()`
- 在 `update` 中重新初始化（支持props更新）

### 步骤3：改造 httpClient.ts
- 添加并发控制变量
- 实现 `handle401Response` 方法
- 改造所有HTTP方法添加401检测

### 步骤4：改造 globalSettingsService.ts
- 导入 dipEnvironmentService
- 改造 `getApiToken()` 方法添加DIP优先级

### 步骤5：改造 GlobalSettingsView.tsx
- 添加DIP模式检测
- 条件渲染token配置区域
- 添加DIP模式提示信息

## 六、测试要点

1. **DIP模式测试**
   - 验证token从DIP注入获取
   - 验证401自动刷新和重试
   - 验证刷新失败触发logout
   - 验证并发401只触发一次刷新

2. **独立模式测试**
   - 验证手动配置token正常工作
   - 验证401不触发刷新（保持现有行为）
   - 验证UI正常显示token配置

3. **模式切换测试**
   - 验证从独立模式进入DIP模式
   - 验证从DIP模式退出（unmount清理）

## 七、风险控制

1. **向后兼容**：独立模式完全保持现有行为
2. **错误fallback**：DIP token获取失败时降级到localStorage
3. **日志埋点**：关键节点添加console.log便于调试
4. **单次重试限制**：避免无限循环

## 八、预计改动量

- 新增代码：~150行（dipEnvironmentService.ts）
- 修改代码：~100行（httpClient.ts核心改动）
- UI调整：~30行（GlobalSettingsView.tsx）
- 总计：~300行代码
