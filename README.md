# DIP for Supply Chain

[English](README.md) | [中文](README.zh.md)

[![License](https://img.shields.io/badge/license-Apache%202.0-blue.svg)](LICENSE)

**DIP for Supply Chain** is a DIP-based supply chain decision intelligence system. The application is built with React + TypeScript + Vite. Its core supply chain knowledge network runs on **KWeaver AI Data Platform (ADP)**, and its Agents run on **KWeaver Decision Agent**. Before running this application, please ensure you have deployed the relevant [KWeaver](https://github.com/kweaver-ai/kweaver/) modules.

## Quick Links

- [Quick Start](#quick-start)
- [System Architecture](#system-architecture)
- [Feature Modules](#feature-modules)
- [Development Guide](#development-guide)
- [License](LICENSE) - Apache 2.0 License
- [Report Issues](https://github.com/kweaver-ai/dip-for-supply-chain/issues) - Report bugs or issues
- [Feature Requests](https://github.com/kweaver-ai/dip-for-supply-chain/issues) - Suggest new features

## Quick Start

### Prerequisites

- Node.js 18+
- npm or yarn
- Python 3.10+ (optional, for Prophet forecasting algorithm)
- DIP Platform running (see [KWeaver](https://github.com/kweaver-ai/kweaver/))

### Frontend Application Setup

#### Installation and Startup

```bash
npm install  # If not already installed
npm run dev
```

The frontend server will run on `http://127.0.0.1:5173`.

### Algorithm Service Setup (Optional)

If you need to use the Prophet demand forecasting algorithm, you'll need to start the backend Python service.

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

> **Note**: If the Prophet service is not started, the system will automatically use the built-in Holt-Winters algorithm as a fallback, ensuring basic functionality remains available.

## Directory Structure

- `src/`: Frontend Source Code (React + TypeScript)
- `backend/`: Forecast Services (Python + Prophet)
- `buildkit/`: DIP Application Packaging Tool
- `sample_data/`: Sample Data (SQL formatted for ontology)
- `public/`: Static Assets

## Data Models & Samples

Sample data conforming to the ontology definitions is available in the `sample_data/` directory:

- **Product BOM Information** (`产品bom信息_*.sql`): Product Bill of Materials structures
- **Product Information** (`产品信息_*.sql`): Product master data
- **Supplier Information** (`供应商信息_*.sql`): Supplier profiles with risk ratings
- **Material Information** (`物料信息_*.sql`): Material inventory data
- **Inventory Information** (`库存信息_*.sql`): Stock level data
- **Order Information** (`订单信息_*.sql`): Order records
- **Production Plan Information** (`生产计划信息_*.sql`): Production schedules
- **Demand Planning List** (`需求计划清单_*.sql`): Demand forecast data

## System Architecture

**DIP for Supply Chain** is an **Upper-Layer Decision Intelligence Application** built upon the KWeaver ecosystem. The architecture consists of the following core layers:

1.  **DIP (Decision Intelligence Platform)**
    *   **Role**: Foundation Platform Container
    *   **Function**: Manages the lifecycle, installation, and runtime environment of intelligent applications.

2.  **DIP Studio**
    *   **Role**: Identity & Access Management
    *   **Function**: Centralized account management and user authentication system ensuring enterprise-grade security.

3.  **AI Data Platform (ADP)**
    *   **Role**: Unified Data Foundation
    *   **Function**: Manages data assets including:
        *   **Data Ingestion**: Collection and integration of multi-source heterogeneous data.
        *   **Business Knowledge Network (Ontology)**: Construction of domain-specific ontology models and knowledge graphs.
        *   **Metric Models**: Definition and calculation of key business metrics.

4.  **Decision Agent**
    *   **Role**: Intelligent Agent Engine
    *   **Function**: Configuration, orchestration, and lifecycle management of intelligent agents, providing reasoning and execution capabilities.

5.  **DIP for Supply Chain (This Application)**
    *   **Role**: Vertical Decision Intelligence Application
    *   **Function**: Provides visualization, prediction, and decision support tailored for supply chain management.

### Code Structure

```
dip-for-supply-chain/
├── src/                        # Frontend source code
│   ├── components/            # React components
│   │   ├── product-supply-optimization/  # Product supply optimization module
│   │   ├── inventory/         # Inventory management module
│   │   ├── cockpit/          # Dashboard/cockpit module
│   │   ├── planning/         # Dynamic planning coordination module
│   │   ├── mps/              # Master Production Schedule component
│   │   ├── supplier-evaluation/ # Supplier evaluation views
│   │   ├── agents/           # AI agent integration components
│   │   ├── config-backend/   # Configuration backend interface
│   │   └── shared/           # Reusable shared components
│   ├── services/             # Business logic layer
│   │   ├── demandPlanningService.ts       # Demand planning service
│   │   ├── forecastAlgorithmService.ts    # Frontend forecast algorithms
│   │   ├── forecastOperatorService.ts     # Forecast operator service (API integration)
│   │   ├── bomInventoryService.ts         # BOM and inventory management
│   │   ├── ontologyApi.ts                 # Ontology/knowledge network queries
│   │   └── agentApi.ts                    # Agent API client
│   ├── api/                  # HTTP client layer
│   ├── config/               # Configuration files
│   ├── types/                # TypeScript type definitions
│   ├── hooks/                # React custom hooks
│   └── utils/                # Utility functions
├── backend/                   # Backend algorithm service (Python)
│   ├── app/
│   │   ├── main.py           # FastAPI application
│   │   ├── models.py         # Pydantic models
│   │   └── prophet_service.py # Prophet forecasting service
│   ├── requirements.txt      # Python dependencies
│   └── run.py               # Startup script
├── buildkit/                 # DIP application packaging toolkit
│   ├── scripts/              # Build automation scripts
│   ├── templates/            # Jinja2 templates (manifest, Dockerfile, nginx)
│   ├── resources/            # Injection resources (qiankun micro-app)
│   └── config.yaml           # Build configuration
├── sample_data/              # SQL sample data files
└── public/                   # Static assets
```

## Feature Modules

### Dashboard/Cockpit
Supply chain overview dashboard including:
- Key performance indicator monitoring
- Real-time alerts and warnings
- AI analysis assistant

### Product Supply Optimization
Intelligent demand forecasting and supply optimization, including:
- **Demand Forecasting**: Support for multiple forecasting algorithms
  - Simple Exponential Smoothing
  - Holt Linear Trend
  - Holt-Winters Triple Exponential Smoothing (seasonal forecasting)
  - Prophet Algorithm (developed by Meta, suitable for complex seasonality)
- **Order Analysis**: Order volume trends and cyclical analysis
- **Product Kit Analysis**: Gantt chart showing complete production patterns
- **AI Optimization Suggestions**: Intelligent optimization recommendations based on forecast results

### Dynamic Planning Coordination
Intelligent scheduling and collaborative management based on finite capacity:
- **Visual Scheduling**: Production plan Gantt chart, intuitively displaying the time sequence relationship of orders, work orders, and capacity utilization
- **Intelligent Scheduling Algorithm**: Automatic scheduling calculation based on multiple objectives such as delivery priority and capacity balancing
- **Multi-level Plan Linkage**: Real-time data coordination between sales plans, master production schedules, and material requirement plans

### Inventory Optimization
Inventory management and optimization analysis:
- Inventory level monitoring
- Safety stock calculation
- AI inventory optimization assistant
- **Slow-Moving Inventory Reverse Calculator**: Based on existing slow-moving materials, reverse calculate producible finished product combinations, providing two optimization strategies: maximizing consumption and minimizing residual materials, to activate stagnant assets by "turning waste into treasure"

### Order Delivery
Delivery management:
- Order status tracking
- Delivery timeliness analysis
- AI delivery optimization assistant

### Supplier Evaluation
Supplier risk assessment:
- Multi-dimensional evaluation system
- Risk early warning
- AI supplier analysis assistant

### Management Configuration
System configuration management:
- Data mode switching
- Knowledge network configuration
- API configuration management

## Algorithm Services

### Demand Forecasting Algorithms

The system supports 4 forecasting algorithms, choose based on data characteristics:

| Algorithm | Use Case | Parameters | Implementation |
|-----------|----------|-----------|----------------|
| **Simple Exponential Smoothing** | Stable data with no trend, no seasonality | α (smoothing coefficient) | Frontend |
| **Holt Linear** | Data with trend, no seasonality | α (level), β (trend) | Frontend |
| **Holt-Winters** | Data with trend and seasonality | α, β, γ (seasonal), seasonal period | Frontend |
| **Prophet** | Complex seasonality, long-term trends | Seasonality patterns, changepoint sensitivity, etc. | Backend (primary) / Frontend (fallback) |

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

#### Parameter Description

| Parameter | Type | Range | Default | Description |
|-----------|------|-------|---------|-------------|
| `seasonality_mode` | string | additive/multiplicative | multiplicative | Seasonality mode |
| `yearly_seasonality` | boolean | - | true | Annual seasonality |
| `changepoint_prior_scale` | float | 0.001-0.5 | 0.05 | Changepoint sensitivity, higher values are more sensitive to trend changes |
| `interval_width` | float | 0.5-0.99 | 0.95 | Confidence interval width |
| `growth` | string | linear/logistic/flat | linear | Trend growth mode |

#### Graceful Degradation

When the Prophet backend service is unavailable:
1. Frontend automatically detects API health status
2. Falls back to built-in Holt-Winters algorithm
3. Displays user notification: "Prophet forecasting service is temporarily unavailable, automatically switched to Holt-Winters algorithm"
4. Ensures continuous availability of forecasting functionality

## Agent API Integration

The frontend has completed full integration with the backend Agent API:

### Core Features
- **Streaming Conversations**: Support for real-time streaming responses, enhancing user experience
- **Session Management**: Automatic maintenance of conversation context and history
- **Multi-Agent Support**: Use corresponding specialized agents based on different pages
- **Error Handling**: Comprehensive error handling and retry mechanisms

### Supported Agents
- **Supplier Evaluation Assistant** (`supplier_evaluation_agent`)
- **Inventory Optimization Assistant** (`inventory_optimization_agent`)
- **Product Supply Optimization Assistant** (`product_supply_optimization_agent`)
- **Order Delivery Assistant** (`order_delivery_agent`)
- **Supply Chain Cockpit Assistant** (`supply_chain_cockpit_agent`)

### API Endpoints
- Chat Interface: `POST /api/agent-app/v1/app/{app_key}/chat/completion`
- Session Management: `GET|POST|PUT|DELETE /api/agent-app/v1/app/{app_key}/conversations`
- Debug Interface: `POST /api/agent-app/v1/app/{app_key}/api/debug`

## Development Mode

In development mode, the frontend connects directly to the ADP environment.

### 1. Prerequisites

- Node.js (v18+)
- Python (v3.10+)
- uv (Python Package Manager)

### 2. Environment Configuration

Copy `.env.example` to `.env.local` and configure your ADP Token:

```bash
cp .env.example .env.local
```

Set the following in `.env.local`:
```ini
VITE_AGENT_API_TOKEN=your_actual_token_here
VITE_AGENT_API_BASE_URL=your_adp_url
VITE_AGENT_APP_KEY=your_app_key
```

### 3. Start Application

Install dependencies and start the frontend development server:

```bash
npm install
npm run dev
```

Start the backend forecast service (optional):

```bash
cd backend
# Create and activate virtual environment
python -m venv venv
# Windows
.\venv\Scripts\activate
# Linux/Mac
source venv/bin/activate

pip install -r requirements.txt
python run.py
```

### 4. Verify Connection

1. Open browser and visit `http://127.0.0.1:5173`
2. Open browser console (F12)
3. Check for any connection errors or warnings

## User Mode

In user mode, the application is packaged as a `.dip` file and installed via the DIP App Store.

### 1. Package Application

This project uses `buildkit` for packaging. The buildkit transforms web applications into qiankun micro-apps and packages them as `.dip` files.

```bash
cd buildkit
uv venv
# Windows
.\.venv\Scripts\activate
# Linux/Mac
source .venv/bin/activate

# Build AMD64 Package
uv run scripts/build_package.py --arch=amd64

# Build ARM64 Package
uv run scripts/build_package.py --arch=arm64
```

### 2. Retrieve Package

After packaging, locate the generated `.dip` file in the `buildkit/.cache/<timestamp>/package/` directory.

The `.dip` package contains:
- `application.key` - Application identifier
- `manifest.yaml` - Application manifest
- `assets/` - Application assets and icons
- `packages/` - Docker images and Helm charts
- `ontologies/` - Ontology definitions (if applicable)
- `agents/` - Agent configurations (if applicable)

### 3. Installation

1. Log in to the DIP Platform.
2. Go to the App Store.
3. Upload and install the generated `.dip` file.
4. Configure the application according to your environment.

## Technology Stack

### Frontend
- React 19.2.0
- TypeScript 5.9.3
- Vite 7.2.4
- Tailwind CSS 4.1.17
- Lucide React (Icons)
- Recharts 3.5.0 (Charts)
- TanStack React Query 5.90.19 (State Management)
- qiankun (Micro-app Framework via vite-plugin-qiankun 1.0.15)
- reactflow 11.11.4 (Flow Visualization)

### Backend Algorithm Service
- Python 3.10+
- FastAPI 0.109.0
- Prophet 1.2.1 (Meta time series forecasting library)
- Pandas 2.1.4
- NumPy 1.26.3
- Uvicorn (ASGI server)

### Build & Quality
- ESLint 9.39.1 with TypeScript and React plugins
- TypeScript ESLint 8.46.4

## Development Guide

### Environment Requirements

**Frontend**:
- Node.js 18+
- npm or yarn

**Backend Algorithm Service** (Optional):
- Python 3.10+
- pip or uv

### Adding New Forecasting Algorithms

1. **Frontend Algorithms** (JavaScript/TypeScript):
   - Add algorithm implementation in `forecastAlgorithmService.ts`
   - Add parameter configuration UI in `AlgorithmParameterPanel.tsx`
   - Add invocation logic in `ProductDemandForecastPanelNew.tsx`

2. **Backend Algorithms** (Python):
   - Define request/response models in `backend/app/models.py`
   - Implement algorithm logic in `backend/app/prophet_service.py` (or new service file)
   - Add API endpoint in `backend/app/main.py`
   - Add frontend invocation interface in `forecastOperatorService.ts`

### Code Standards

- Use TypeScript strict mode
- Follow React Hooks best practices
- Use functional components + Hooks
- Unify API calls using `httpClient`
- Use try-catch for error handling with user-friendly error messages

### Build & Deployment

```bash
# Frontend build
npm run build

# Frontend preview
npm run preview

# Backend deployment
cd backend
gunicorn app.main:app -w 4 -k uvicorn.workers.UvicornWorker
```

## Frequently Asked Questions

**Q: API request failed with connection error**
- Check if the DIP Platform is running
- Verify API configuration in `.env.local`
- Ensure network connectivity to the platform

**Q: 401 Unauthorized error**
- Check if token is correctly configured in `.env.local`
- Confirm token has not expired
- Verify app_key is correct

**Q: 404 Not Found error**
- Check if API baseUrl is correctly configured
- Verify the endpoint paths are correct

**Q: Prophet forecasting unavailable**
- Confirm backend algorithm service is running (`http://localhost:8000`)
- System will automatically use Holt-Winters as fallback, basic functionality not affected
- Check frontend console for fallback notification messages

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

- **Issue Reporting**: [GitHub Issues](https://github.com/kweaver-ai/dip-for-supply-chain/issues)
- **License**: [Apache 2.0 License](LICENSE)

---

Built on [KWeaver Platform](https://github.com/kweaver-ai/kweaver/) - An open-source ecosystem for building Decision Intelligence AI applications.
