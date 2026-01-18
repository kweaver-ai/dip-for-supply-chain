# SupplyChainBrain

[中文](README.zh.md) | English

[![License](https://img.shields.io/badge/license-Apache%202.0-blue.svg)](LICENSE)

SupplyChainBrain is an AI-powered supply chain analysis and decision support system built on the DIP platform. It leverages supply chain knowledge networks and ontology modeling to provide intelligent analysis, forecasting, and optimization recommendations for supply chain operations.

The system is built with React + TypeScript + Vite and integrates with the DIP platform (see [KWeaver](https://github.com/kweaver-ai/kweaver/)) for knowledge network and Agent services.

## 📚 Quick Links

- 🚀 [Quick Start](#quick-start)
- 📖 [System Architecture](#system-architecture)
- 🎯 [Features](#features)
- 🔧 [Development Guide](#development-guide)
- 📄 [License](LICENSE) - Apache License 2.0
- 🐛 [Report Bug](https://github.com/your-org/supply-chain-brain/issues) - Report a bug or issue
- 💡 [Request Feature](https://github.com/your-org/supply-chain-brain/issues) - Suggest a new feature

## Quick Start

### Prerequisites

- Node.js 16+
- npm or yarn
- Python 3.11+ (optional, for Prophet forecast algorithm)
- DIP platform running (see [KWeaver](https://github.com/kweaver-ai/kweaver/))

### Frontend Application

#### ⚠️ Important: Start Proxy Server First

The frontend forwards API requests through a proxy server. **You must start the proxy server first** to connect to APIs properly.

**Method 1: One-click Start Script (Recommended)**

```bash
# Windows
start-all.bat

# This will automatically:
# 1. Check and start the proxy server (if not running)
# 2. Start the frontend development server
```

**Method 2: Manual Start**

**Step 1: Start Proxy Server**

Open the first terminal window:

```bash
node proxy-server.js
```

The proxy server will run on `http://127.0.0.1:30777`.

**Step 2: Start Frontend Development Server**

Open the second terminal window:

```bash
npm install  # If dependencies are not installed
npm run dev
```

The frontend server will run on `http://127.0.0.1:5173`.

### Algorithm Service (Optional)

If you need to use the Prophet demand forecasting algorithm, start the backend Python service.

**Step 1: Install Python Dependencies**

```bash
cd backend
python3 -m venv venv
source venv/bin/activate  # Linux/Mac
# or venv\Scripts\activate  # Windows

pip install -r requirements.txt
```

**Step 2: Start Algorithm Service**

```bash
python run.py
```

The service will start on `http://localhost:8000`.

**Verify Service**

```bash
curl http://localhost:8000/health
# Should return: {"status":"healthy","service":"prophet-forecast","version":"1.0.0"}
```

> **Note**: If the Prophet service is not started, the system will automatically use the built-in Holt-Winters algorithm as a fallback, which does not affect basic functionality.

### Verify Connection

1. Open browser and visit `http://127.0.0.1:5173`
2. Open browser console (F12)
3. Run the following code in the console for connection diagnostics:

```javascript
// Import diagnostic tools
import { runAllTests, printTestResults } from './src/utils/apiConnectionTest';

// Run tests
const results = await runAllTests();
printTestResults(results);
```

## System Architecture

```
SupplyChainBrain/
├── src/                        # Frontend source code
│   ├── components/            # React components
│   │   ├── product-supply-optimization/  # Product supply optimization module
│   │   ├── inventory/         # Inventory management module
│   │   ├── cockpit/          # Cockpit module
│   │   └── ...
│   ├── services/             # API service layer
│   │   ├── demandPlanningService.ts       # Demand planning service
│   │   ├── forecastAlgorithmService.ts    # Frontend forecast algorithms
│   │   └── forecastOperatorService.ts     # Forecast operator service (API integration)
│   ├── api/                  # HTTP client
│   ├── config/               # Configuration files
│   └── types/                # TypeScript type definitions
├── backend/                   # Backend algorithm service (Python)
│   ├── app/
│   │   ├── main.py           # FastAPI application
│   │   ├── models.py         # Pydantic models
│   │   └── prophet_service.py # Prophet forecast service
│   ├── requirements.txt      # Python dependencies
│   └── run.py               # Startup script
├── docs/                     # Documentation
└── public/                   # Static resources
```

## Features

### 🏠 Cockpit
Supply chain overview dashboard, including:
- Key metrics monitoring
- Real-time alerts
- AI analysis assistant

### 📈 Product Supply Optimization
Intelligent demand forecasting and supply optimization, including:
- **Demand Forecasting**: Supports multiple forecasting algorithms
  - Simple Exponential Smoothing
  - Holt Linear Exponential Smoothing
  - Holt-Winters Triple Exponential Smoothing (seasonal forecasting)
  - Prophet Algorithm (Meta-developed, suitable for complex seasonality)
- **Order Analysis**: Order volume trends and cyclical analysis
- **Product Kitting Analysis**: Gantt chart showing complete production mode
- **AI Optimization Suggestions**: Intelligent optimization recommendations based on forecast results

### 📦 Inventory Optimization
Inventory management and optimization analysis:
- Inventory level monitoring
- Safety stock calculation
- AI inventory optimization assistant

### 🚚 Order Delivery
Delivery management:
- Order status tracking
- Delivery time analysis
- AI delivery optimization assistant

### 👥 Supplier Evaluation
Supplier risk assessment:
- Multi-dimensional evaluation system
- Risk alerts
- AI supplier analysis assistant

### ⚙️ Management Configuration
System configuration management:
- Data mode switching
- Knowledge network configuration
- API configuration management

## Algorithm Services

### Demand Forecasting Algorithms

The system supports 4 forecasting algorithms, selected based on data characteristics:

| Algorithm | Use Case | Parameters | Implementation |
|-----------|----------|------------|----------------|
| **Simple Exponential Smoothing** | Stable data without trend or seasonality | α (smoothing coefficient) | Frontend |
| **Holt Linear** | Data with trend, no seasonality | α (level), β (trend) | Frontend |
| **Holt-Winters** | Data with trend and seasonality | α, β, γ (seasonal), season length | Frontend |
| **Prophet** | Complex seasonality, long-term trends | Seasonality mode, changepoint sensitivity, etc. | Backend (preferred) / Frontend (fallback) |

### Prophet Algorithm Service

#### Architecture Design

```
Frontend → forecastOperatorService → Prophet Backend API
                                     ↓ (failure)
                                 Holt-Winters Fallback
```

#### API Specification

**Endpoint**: `POST /api/v1/forecast/prophet`

**Request Example**:
```json
{
  "product_id": "PROD-001",
  "historical_data": [
    {"month": "2024-01", "quantity": 100},
    {"month": "2024-02", "quantity": 120}
  ],
  "forecast_periods": 12,
  "parameters": {
    "seasonality_mode": "multiplicative",
    "yearly_seasonality": true,
    "changepoint_prior_scale": 0.05,
    "interval_width": 0.95,
    "growth": "linear"
  }
}
```

**Response Example**:
```json
{
  "product_id": "PROD-001",
  "algorithm": "prophet",
  "forecast_values": [125, 130, 135, ...],
  "confidence_intervals": [
    {"lower": 110, "upper": 140},
    ...
  ],
  "metrics": {
    "mape": 5.2,
    "rmse": 12.5,
    "mae": 10.3
  },
  "generated_at": "2024-01-15T10:30:00.000Z"
}
```

#### Graceful Degradation

When the Prophet backend service is unavailable:
1. Frontend automatically detects API health status
2. Falls back to built-in Holt-Winters algorithm
3. Displays user notification: "Prophet forecast service temporarily unavailable, automatically switched to Holt-Winters algorithm"
4. Ensures forecast functionality remains available

## Data Modes

The system supports two data processing modes, switchable via the toggle in the top-right corner (or management configuration page):

### 1. General Mode (`huida-legacy`)
- **Purpose**: Display complete, validated business scenario data
- **Data Source**: `src/data/mockData.ts` combined with basic API services
- **Use Case**: Demos, development, and stability testing

### 2. Huida Supply Chain Brain Mode (`huida-new`)
- **Purpose**: Connect to the latest, real Huida supply chain API data
- **Data Source**: Real metric query API (`/proxy-metric/v1`)
- **Use Case**: Actual business analysis, metric drill-down, and real-time alerts

## Agent API Integration

The frontend has complete integration with the backend Agent API:

### Core Features
- **Streaming Conversations**: Supports real-time streaming responses for better user experience
- **Conversation Management**: Automatically maintains conversation context and history
- **Multi-Agent Support**: Uses corresponding professional agents for different pages
- **Error Handling**: Comprehensive error handling and retry mechanisms

### Supported Agents
- **Supplier Evaluation Assistant** (`supplier_evaluation_agent`)
- **Inventory Optimization Assistant** (`inventory_optimization_agent`)
- **Product Supply Optimization Assistant** (`product_supply_optimization_agent`)
- **Order Delivery Assistant** (`order_delivery_agent`)
- **Supply Chain Cockpit Assistant** (`supply_chain_cockpit_agent`)

### API Endpoints
- Conversation: `POST /api/agent-app/v1/app/{app_key}/chat/completion`
- Session Management: `GET|POST|PUT|DELETE /api/agent-app/v1/app/{app_key}/conversations`
- Debug: `POST /api/agent-app/v1/app/{app_key}/api/debug`

## Supply Chain Knowledge Network Configuration

The system integrates **Supply Chain Knowledge Network** configuration functionality, supporting ontology model switching for different scenarios:
- **Dynamic ID Binding**: Can select the currently active `knowledgeNetworkId` in real-time on the management page
- **Mode Linkage**: When switching data modes, the system automatically recommends the most suitable knowledge network for that mode
- **Ontology Routing**: All ontology queries are dynamically routed through `ontologyApi`, supporting cross-network and cross-environment calls

## Tech Stack

### Frontend
- React 19.2.0
- TypeScript
- Vite
- Tailwind CSS v4
- Lucide React (icons)
- Recharts (charts)
- Agent API Client (custom)

### Backend Algorithm Service
- Python 3.11+
- FastAPI 0.109.0
- Prophet 1.1.5 (Meta time series forecasting library)
- Pandas 2.1.4
- NumPy 1.26.3
- Uvicorn (ASGI server)

## Development Guide

### Environment Requirements

**Frontend**:
- Node.js 16+
- npm or yarn

**Backend Algorithm Service** (optional):
- Python 3.11+
- pip

### Project Structure

```
src/
├── components/          # React components
│   ├── product-supply-optimization/
│   │   ├── ProductDemandForecastPanelNew.tsx  # Demand forecast main panel
│   │   ├── AlgorithmParameterPanel.tsx        # Algorithm parameter configuration
│   │   └── ProductSupplyOptimizationPage.tsx  # Page entry
├── services/
│   ├── forecastAlgorithmService.ts   # Frontend forecast algorithm implementation
│   ├── forecastOperatorService.ts    # Forecast operator service (API integration)
│   └── demandPlanningService.ts      # Demand planning service
├── api/
│   └── httpClient.ts                 # HTTP client
└── config/
    └── apiConfig.ts                  # API configuration

backend/
├── app/
│   ├── main.py              # FastAPI application entry
│   ├── models.py            # Pydantic data models
│   └── prophet_service.py   # Prophet forecast core logic
├── requirements.txt         # Python dependencies
└── run.py                  # Startup script
```

### Adding New Forecasting Algorithms

1. **Frontend Algorithm** (JavaScript/TypeScript):
   - Add algorithm implementation in `forecastAlgorithmService.ts`
   - Add parameter configuration UI in `AlgorithmParameterPanel.tsx`
   - Add calling logic in `ProductDemandForecastPanelNew.tsx`

2. **Backend Algorithm** (Python):
   - Define request/response models in `backend/app/models.py`
   - Implement algorithm logic in `backend/app/prophet_service.py`
   - Add API endpoint in `backend/app/main.py`
   - Add frontend calling interface in `forecastOperatorService.ts`

### Code Standards

- Use TypeScript strict mode
- Follow React Hooks best practices
- Components use functional components + Hooks
- API calls uniformly use `httpClient`
- Error handling uses try-catch and user-friendly error messages

### Build & Deploy

```bash
# Frontend build
npm run build

# Frontend preview
npm run preview

# Backend deployment
cd backend
gunicorn app.main:app -w 4 -k uvicorn.workers.UvicornWorker
```

## Troubleshooting

**Q: API request fails with connection error**
- ✅ Check if proxy server is running (you should see proxy server log output)
- ✅ Check if port 30777 is occupied
- ✅ Confirm proxy server window has no errors

**Q: Returns 401 Unauthorized**
- ✅ Check if token is correctly configured in `src/config/apiConfig.ts`
- ✅ Confirm token is not expired

**Q: Returns 404 Not Found**
- ✅ Check if API baseUrl configuration is correct
- ✅ Confirm proxy server is running

**Q: Prophet forecast unavailable**
- ✅ Confirm backend algorithm service is started (`http://localhost:8000`)
- ✅ System will automatically use Holt-Winters as fallback, does not affect basic functionality
- ✅ Check frontend console, will display fallback notification

## Related Documentation

- [Product Supply Optimization Design](docs/product-supply-optimization-design.md)
- [Product Supply Optimization Implementation](docs/product-supply-optimization-implementation.md)
- [Prophet Algorithm Service README](backend/README.md)
- [API Configuration Guide](src/config/README.md)

## Contributing

We welcome contributions! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Create a Pull Request

## License

This project is licensed under the Apache License 2.0. See the [LICENSE](LICENSE) file for details.

## Support & Contact

- **Issues**: [GitHub Issues](https://github.com/your-org/supply-chain-brain/issues)
- **License**: [Apache License 2.0](LICENSE)

---

Built on the [DIP Platform](https://github.com/kweaver-ai/kweaver/) - An open-source ecosystem for building decision intelligence AI applications.
