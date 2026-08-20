import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import Navbar from './components/Navbar';

import Dashboard from './pages/Dashboard';
import RevenueRadar from './pages/RevenueRadar';
import RecoveryTwinLab from './pages/RecoveryTwinLab';
import DecisionReceiptPage from './pages/DecisionReceiptPage';
import ControlCenter from './pages/ControlCenter';
import AuditTrailPage from './pages/AuditTrailPage';
import BatchAnalytics from './pages/BatchAnalytics';
import SettingsPage from './pages/SettingsPage';

export default function App() {
  return (
    <BrowserRouter>
      <div className="flex min-h-screen bg-[#0B0F19] text-gray-100 font-sans">
        <Sidebar />
        <div className="flex-1 flex flex-col min-w-0">
          <Navbar />
          <main className="flex-1 p-8 overflow-y-auto">
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/revenue-radar" element={<RevenueRadar />} />
              <Route path="/twin-lab" element={<RecoveryTwinLab />} />
              <Route path="/receipt" element={<DecisionReceiptPage />} />
              <Route path="/control-center" element={<ControlCenter />} />
              <Route path="/audit" element={<AuditTrailPage />} />
              <Route path="/analytics" element={<BatchAnalytics />} />
              <Route path="/settings" element={<SettingsPage />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </main>
        </div>
      </div>
    </BrowserRouter>
  );
}
