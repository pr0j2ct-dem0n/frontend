import { Routes, Route } from 'react-router-dom';
import DashboardPage from '../pages/DashboardPage';
import RainfallDetailPage from '../pages/RainfallDetailPage';
import SewerLevelDetailPage from '../pages/SewerLevelDetailPage';
import RiskZonesDetailPage from '../pages/RiskZonesDetailPage';
import HighestRiskAreaDetailPage from '../pages/HighestRiskAreaDetailPage';

export default function AppRouter() {
  return (
    <Routes>
      <Route path="/" element={<DashboardPage />} />
      <Route path="/rainfall" element={<RainfallDetailPage />} />
      <Route path="/sewer-level" element={<SewerLevelDetailPage />} />
      <Route path="/risk-zones" element={<RiskZonesDetailPage />} />
      <Route path="/highest-risk-area" element={<HighestRiskAreaDetailPage />} />
    </Routes>
  );
}
