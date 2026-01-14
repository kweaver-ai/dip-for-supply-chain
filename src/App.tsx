import SupplyChainApp from './SupplyChainApp'
import { I18nProvider } from './i18n/context'

function App() {
  return (
    <I18nProvider>
      <div className="w-full h-screen">
        <SupplyChainApp />
      </div>
    </I18nProvider>
  )
}

export default App
