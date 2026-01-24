# DIP for Supply Chain

**DIP for Supply Chain** is an intelligent decision support system based on Supply Chain Knowledge Network and Ontology modeling. The application is built with React + TypeScript + Vite. Its underlying Supply Chain Knowledge Network (Ontology) runs on **KWeaver AI Data Platform (ADP)**, and its Agents run on **KWeaver Decision Agent**. Before running this application, please ensure you have deployed the relevant [KWeaver](https://github.com/kweaver-ai/kweaver/) modules.

## Directory Structure

- `src/`: Frontend Source Code (React + Vite)
- `backend/`: Forecast Services (Python + Prophet)
- `buildkit/`: DIP Application Packaging Tool

- `sample_data/`: Sample Data (JSON formatted)

## Data Models & Samples

Sample data conforming to the ontology definitions is available in the `sample_data/` directory:

- **[suppliers.json](sample_data/suppliers.json)**: Supplier profiles with risk ratings and performance metrics.
- **[products.json](sample_data/products.json)**: Product data including BOM structures and inventory status.
- **[materials.json](sample_data/materials.json)**: Material inventory data.
- **[orders.json](sample_data/orders.json)**: Sample orders spanning production and delivery cycles.

## System Architecture

**DIP for Supply Chain** is an **Upper-Layer Decision Intelligence Application** built upon the KWeaver ecosystem. The architecture consists of the following core layers:

1.  **DIP (Decision Intelligence Platform)**
    *   **Role**: Foundation Platform
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
```

### 3. Start Application

Install dependencies and start the frontend development server:

```bash
npm install
npm run dev
```

Start the backend forecast service (application specific):

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

## User Mode

In user mode, the application is packaged as a `.dip` file and installed via the DIP App Store.

### 1. Package Application

This project uses `buildkit` for packaging.

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

### 3. Installation

1. Log in to the DIP Platform.
2. Go to the App Store.
3. Upload and install the generated `.dip` file.
