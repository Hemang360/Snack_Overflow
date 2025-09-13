# Ayurvedic Herbs Traceability - Web Frontend

A modern React-based web frontend for the Ayurvedic Herbs Blockchain Traceability System. This application provides multiple interfaces for different user types including consumers, regulators, stakeholders, and administrators.

## Features

### Consumer Portal (Public-Facing)
- **QR Code Scanner**: Web-based scanner for product verification
- **Interactive Provenance Timeline**: Complete journey from farm to shelf
- **Collection Location Maps**: Geo-tagged harvest data visualization
- **Lab Certificates**: Moisture, pesticide, DNA barcode test results
- **Sustainability Badges**: Compliance and fair-trade indicators
- **Farmer Profiles**: Information about farmers and communities
- **Recall Notifications**: Warning system for flagged products

### Government & Regulator Dashboard
- **Maps & Geo-Analytics**: Harvesting region heatmaps and alerts
- **Compliance Reporting**: Automated NMPB and AYUSH compliance
- **Environmental Metrics**: Species conservation tracking
- **Traceability Explorer**: Complete audit trail and transaction logs

### Supply Chain Stakeholder View
- **Real-Time Dashboards**: Harvest volumes and batch statuses
- **QA Results Summary**: Pass/fail rates and quality metrics
- **Analytics**: Performance and compliance analytics
- **Export Capabilities**: JSON/CSV report generation

### Blockchain Explorer
- **Transaction Timeline**: Complete blockchain transaction history
- **Provenance Verification**: Smart contract validation results
- **Audit Logs**: Immutable transaction records

## Technology Stack

- **Frontend**: React 18 + Vite
- **Styling**: Tailwind CSS
- **State Management**: Zustand
- **Maps**: Leaflet + React Leaflet
- **Charts**: Recharts
- **QR Scanner**: html5-qrcode
- **HTTP Client**: Axios
- **Routing**: React Router
- **Icons**: Heroicons
- **Animations**: Framer Motion

## Quick Start

### Prerequisites
- Node.js 16+ and npm
- Backend API running on port 3000

### Installation

```bash
# Navigate to frontend directory
cd web-frontend

# Install dependencies
npm install

# Copy environment configuration
cp .env.example .env

# Start development server
npm run dev
```

The application will be available at `http://localhost:5173`

### Production Build

```bash
# Create production build
npm run build

# Preview production build
npm run preview
```

## Project Structure

```
web-frontend/
├── public/              # Static assets
├── src/
│   ├── components/      # Reusable components
│   │   ├── Layout.jsx
│   │   ├── Navigation.jsx
│   │   ├── Sidebar.jsx
│   │   ├── TraceabilityTimeline.jsx
│   │   ├── LocationMap.jsx
│   │   ├── QualityCertificates.jsx
│   │   ├── SustainabilityBadges.jsx
│   │   └── FarmerProfile.jsx
│   ├── pages/           # Page components
│   │   ├── HomePage.jsx
│   │   ├── ConsumerPortal.jsx
│   │   ├── QRScanner.jsx
│   │   ├── ProductStory.jsx
│   │   ├── RegulatorDashboard.jsx
│   │   ├── StakeholderDashboard.jsx
│   │   ├── BlockchainExplorer.jsx
│   │   ├── AdminDashboard.jsx
│   │   ├── LoginPage.jsx
│   │   └── NotFound.jsx
│   ├── services/        # API services
│   │   └── api.js
│   ├── stores/          # State management
│   │   └── index.js
│   ├── App.jsx          # Main app component
│   ├── main.jsx         # Entry point
│   └── index.css        # Global styles
├── index.html           # HTML template
├── package.json         # Dependencies
├── vite.config.js       # Vite configuration
├── tailwind.config.js   # Tailwind configuration
└── README.md           # This file
```

## Key Features

### QR Code Scanning
- Camera-based scanning using device camera
- Manual entry for QR codes or batch IDs
- Scan history tracking
- Real-time product verification

### Product Traceability
- Interactive timeline showing complete journey
- GPS-based location mapping
- Quality test results and certificates
- Sustainability and compliance badges
- Farmer and collector profiles

### Dashboards
- Role-based access control
- Real-time analytics and metrics
- Compliance monitoring and reporting
- Export functionality for reports

### User Authentication
- JWT-based authentication
- Role-based permissions
- Demo credentials for testing
- Secure logout functionality

## Environment Variables

```bash
# API Configuration
VITE_API_BASE_URL=http://localhost:3000

# App Configuration
VITE_APP_NAME="AyurTrace - Ayurvedic Herbs Traceability"
VITE_APP_VERSION=1.0.0

# Feature Flags
VITE_ENABLE_QR_SCANNER=true
VITE_ENABLE_MAPS=true
VITE_ENABLE_ANALYTICS=true
```

## User Roles & Access

### Public Access
- QR code scanning
- Product verification
- Traceability viewing
- Consumer portal

### Authenticated Access
- **Super Admin**: Full system access
- **Regulator**: Compliance monitoring and reporting
- **Lab Manager**: Quality test management
- **Manufacturer**: Product batch creation
- **Farmer**: Collection event recording
- **Auditor**: Read-only access for auditing

## API Integration

The frontend integrates with the backend API for:
- Authentication and authorization
- Product batch retrieval
- Traceability data fetching
- Analytics and reporting
- Real-time dashboard updates

## Development

### Code Style
- ESLint for code linting
- Consistent component structure
- Tailwind CSS for styling
- Mobile-first responsive design

### Component Architecture
- Functional components with hooks
- Zustand for state management
- Modular component design
- Reusable utility components

### Performance
- Vite for fast development and builds
- Code splitting and lazy loading
- Optimized bundle size
- Image optimization

## Deployment

### Production Deployment
1. Build the application: `npm run build`
2. Deploy the `dist` folder to your web server
3. Configure reverse proxy for API calls
4. Set up SSL certificates for HTTPS

### Docker Deployment
```dockerfile
FROM node:16-alpine as builder
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

## Contributing

1. Follow the existing code style and structure
2. Create feature branches from main
3. Write comprehensive tests for new features
4. Update documentation as needed
5. Submit pull requests for review

## Support

For issues or questions:
1. Check the existing documentation
2. Review the API documentation at `/api/openapi.json`
3. Check the backend logs for API errors
4. Create detailed issue reports with steps to reproduce

## License

This project is part of the Ayurvedic Herbs Blockchain Traceability System.