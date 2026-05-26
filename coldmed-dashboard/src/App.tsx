import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AppLayout } from './components/layout/AppLayout';
import { DashboardOverview } from './pages/DashboardOverview';
import { BatchSurveillance } from './pages/BatchSurveillance';
import { BatchDetail } from './pages/BatchDetail';
import { ThermalAnalysis } from './pages/ThermalAnalysis';
import { QualityReview } from './pages/QualityReview';
import { LogisticsTraceability } from './pages/LogisticsTraceability';
import { AuditReports } from './pages/AuditReports';
import { IoTExtension } from './pages/IoTExtension';
import { AnalyticalIntelligence } from './pages/AnalyticalIntelligence';
import { DataProvider } from './context/DataContext';

function App() {
  return (
    <BrowserRouter>
      <DataProvider>
        <Routes>
          <Route path="/" element={<AppLayout />}>
            <Route index element={<DashboardOverview />} />
            <Route path="surveillance" element={<BatchSurveillance />} />
            <Route path="lot/:id" element={<BatchDetail />} />
            <Route path="analyse" element={<ThermalAnalysis />} />
            <Route path="revue" element={<QualityReview />} />
            <Route path="tracabilite" element={<LogisticsTraceability />} />
            <Route path="intelligence-analytique" element={<AnalyticalIntelligence />} />
            <Route path="audit" element={<AuditReports />} />
            <Route path="iot" element={<IoTExtension />} />
          </Route>
        </Routes>
      </DataProvider>
    </BrowserRouter>
  );
}

export default App;
