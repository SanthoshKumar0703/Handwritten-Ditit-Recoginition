import { Suspense, lazy } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { ThemeProvider } from "./context/ThemeContext";
import { NotificationProvider } from "./context/NotificationContext";
import ProtectedRoute from "./components/ProtectedRoute";
import AdminRoute from "./components/AdminRoute";
import NotificationToaster from "./components/NotificationToaster";

import Landing from "./pages/Landing";

const Login = lazy(() => import("./pages/auth/Login"));
const Register = lazy(() => import("./pages/auth/Register"));
const ForgotPassword = lazy(() => import("./pages/auth/ForgotPassword"));
const ResetPassword = lazy(() => import("./pages/auth/ResetPassword"));
const DashboardLayout = lazy(() => import("./components/dashboard/DashboardLayout"));
const DashboardHome = lazy(() => import("./pages/dashboard/DashboardHome"));
const Recognize = lazy(() => import("./pages/dashboard/Recognize"));
const History = lazy(() => import("./pages/dashboard/History"));
const Analytics = lazy(() => import("./pages/dashboard/Analytics"));
const Reports = lazy(() => import("./pages/dashboard/Reports"));
const Profile = lazy(() => import("./pages/dashboard/Profile"));
const Settings = lazy(() => import("./pages/dashboard/Settings"));

const AdminLayout = lazy(() => import("./components/admin/AdminLayout"));
const AdminHome = lazy(() => import("./pages/admin/AdminHome"));
const AdminUsers = lazy(() => import("./pages/admin/AdminUsers"));
const AdminPredictions = lazy(() => import("./pages/admin/AdminPredictions"));
const AdminAnalytics = lazy(() => import("./pages/admin/AdminAnalytics"));
const AdminModelStats = lazy(() => import("./pages/admin/AdminModelStats"));
const AdminLogs = lazy(() => import("./pages/admin/AdminLogs"));

const NotFound = lazy(() => import("./pages/NotFound"));

function PageFallback() {
  return (
    <div className="min-h-screen bg-ink flex items-center justify-center">
      <div className="w-10 h-10 rounded-full border-2 border-violet/30 border-t-sky animate-spin" />
    </div>
  );
}

function App() {
  return (
    <BrowserRouter>
      <ThemeProvider>
        <AuthProvider>
          <NotificationProvider>
            <NotificationToaster />
            <Suspense fallback={<PageFallback />}>
              <Routes>
                <Route path="/" element={<Landing />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/forgot-password" element={<ForgotPassword />} />
                <Route path="/reset-password/:token" element={<ResetPassword />} />

                <Route
                  path="/dashboard"
                  element={
                    <ProtectedRoute>
                      <DashboardLayout />
                    </ProtectedRoute>
                  }
                >
                  <Route index element={<DashboardHome />} />
                  <Route path="recognize" element={<Recognize />} />
                  <Route path="history" element={<History />} />
                  <Route path="analytics" element={<Analytics />} />
                  <Route path="reports" element={<Reports />} />
                  <Route path="profile" element={<Profile />} />
                  <Route path="settings" element={<Settings />} />
                </Route>

                <Route
                  path="/admin"
                  element={
                    <AdminRoute>
                      <AdminLayout />
                    </AdminRoute>
                  }
                >
                  <Route index element={<AdminHome />} />
                  <Route path="users" element={<AdminUsers />} />
                  <Route path="predictions" element={<AdminPredictions />} />
                  <Route path="analytics" element={<AdminAnalytics />} />
                  <Route path="model" element={<AdminModelStats />} />
                  <Route path="logs" element={<AdminLogs />} />
                </Route>

                <Route path="*" element={<NotFound />} />
              </Routes>
            </Suspense>
          </NotificationProvider>
        </AuthProvider>
      </ThemeProvider>
    </BrowserRouter>
  );
}

export default App;
