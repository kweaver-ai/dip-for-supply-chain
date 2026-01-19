import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'

// Debug configuration in development
if (import.meta.env.DEV) {
  import('./utils/configDebug')
  import('./utils/apiDebugger').then(module => {
    module.setupGlobalDebugger()
  })
  import('./utils/debugSupplierApi')
  import('./utils/debugAllEntities')
  // import('./utils/testAllDataViews') // 文件不存在，已注释
  import('./utils/showRawData')
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
