import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import Navbar from "./components/Navbar/Navbar";
import DashboardPage from "./components/DashboardPage/DashboardPage";
import AddPage from "./components/AddPage/AddPage";
import ListPage from "./components/ListPage/ListPage";
import AppointmentsPage from "./components/AppointmentsPage/AppointmentsPage";
import ServiceDashboard from "./components/ServiceDashboard/ServiceDashboard";
import AddService from "./components/AddService/AddService";
import ListServicePage from "./components/ListServicePage/ListServicePage";
import ServiceAppointmentsPage from "./components/ServiceAppointmentsPage/ServiceAppointmentsPage";

function App() {
  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <Navbar />
      <div className="flex-1">
        <Routes>
          <Route path="/" element={<Navigate to="/h" replace />} />
          <Route path="/h" element={<DashboardPage />} />
          <Route path="/add" element={<AddPage />} />
          <Route path="/list" element={<ListPage />} />
          <Route path="/appointments" element={<AppointmentsPage />} />
          <Route path="/service-dashboard" element={<ServiceDashboard />} />
          <Route path="/add-service" element={<AddService />} />
          <Route path="/list-service" element={<ListServicePage />} />
          <Route path="/service-appointments" element={<ServiceAppointmentsPage />} />
          <Route path="*" element={<Navigate to="/h" replace />} />
        </Routes>
      </div>
    </div>
  );
}

export default App;
