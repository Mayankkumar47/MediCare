import React from 'react';
import { Route, Routes, Outlet, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar/Navbar';
import Footer from './components/Footer/Footer';
import Home from './pages/Home';
import DoctorsPage from './components/DoctorsPage/DoctorsPage';
import DoctorDetail from './pages/DoctorDetail/DoctorDetail';
import ServicePage from './components/ServicePage/ServicePage';
import ServiceDetail from './pages/ServiceDetailPage/ServiceDetailPage';
import ContactPage from './components/ContactPage/ContactPage';
import AppointmentPage from './components/AppointmentPage/AppointmentPage';
import LoginPage from './components/LoginPage/LoginPage';
import CheckoutSuccessPage from './pages/CheckoutSuccessPage';
import CheckoutCancelPage from './pages/CheckoutCancelPage';

// Doctor admin portal pages
import DoctorNavbar from './doctor/Navbar/Navbar';
import DoctorDashboard from './doctor/DashboardPage/DashboardPage';
import DoctorAppointments from './doctor/ListPage/ListPage';
import DoctorEditProfile from './doctor/EditProfilePage/EditProfilePage';

// Client layouts wrapping common Header & Footer
const ClientLayout = () => {
  return (
    <div className="flex flex-col min-h-screen bg-slate-50">
      <Navbar />
      <div className="flex-1">
        <Outlet />
      </div>
      <Footer />
    </div>
  );
};

// Doctor layouts wrapping the floating top Navbar
const DoctorLayout = () => {
  return (
    <div className="flex flex-col min-h-screen bg-slate-100">
      <DoctorNavbar />
      <div className="flex-1">
        <Outlet />
      </div>
    </div>
  );
};

const App = () => {
  return (
    <div>
      <Routes>
        {/* Client Routes */}
        <Route element={<ClientLayout />}>
          <Route path="/" element={<Home />} />
          <Route path="/doctors" element={<DoctorsPage />} />
          <Route path="/doctors/:id" element={<DoctorDetail />} />
          <Route path="/services" element={<ServicePage />} />
          <Route path="/services/:id" element={<ServiceDetail />} />
          <Route path="/contact" element={<ContactPage />} />
          <Route path="/appointments" element={<AppointmentPage />} />
          <Route path="/appointment/success" element={<CheckoutSuccessPage />} />
          <Route path="/appointment/cancel" element={<CheckoutCancelPage />} />
          <Route path="/service-appointment/success" element={<CheckoutSuccessPage />} />
          <Route path="/service-appointment/cancel" element={<CheckoutCancelPage />} />
        </Route>

        {/* Doctor Login */}
        <Route path="/doctor-admin/login" element={<LoginPage />} />
        <Route path="/login" element={<Navigate to="/doctor-admin/login" replace />} />

        {/* Doctor Admin Portal Routes */}
        <Route element={<DoctorLayout />}>
          <Route path="/doctor-admin/:id" element={<DoctorDashboard />} />
          <Route path="/doctor-admin/:id/appointments" element={<DoctorAppointments />} />
          <Route path="/doctor-admin/:id/profile/edit" element={<DoctorEditProfile />} />
        </Route>

        {/* Catch-all redirect */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </div>
  );
};

export default App;
