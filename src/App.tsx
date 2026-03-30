import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes, Navigate } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/contexts/AuthContext";
import { ValidationProvider } from "@/contexts/ValidationContext";
import '@/i18n';
import { useState, useEffect } from 'react';

import AppLayout from "@/components/AppLayout";
import ProtectedRoute from "@/components/ProtectedRoute";
import ErrorBoundary from "@/components/ErrorBoundary";
import OfflineBanner from "@/components/OfflineBanner";
import LoadingScreen from "@/components/LoadingScreen";
import OnboardingFlow from "@/components/OnboardingFlow";

import MapPage from "@/pages/MapPage";
import InfoPage from "@/pages/InfoPage";
import RankingPage from "@/pages/RankingPage";
import AlertsPage from "@/pages/AlertsPage";
import ProfilePage from "@/pages/ProfilePage";
import AdminPage from "@/pages/AdminPage";
import LoginPage from "@/pages/LoginPage";
import RegisterPage from "@/pages/RegisterPage";
import PrivacyPage from "@/pages/PrivacyPage";
import TermsPage from "@/pages/TermsPage";
import ReportSharePage from "@/pages/ReportSharePage";
import PricingPage from "@/pages/PricingPage";
import AnalyticsPage from "@/pages/AnalyticsPage";
import ForgotPasswordPage from "@/pages/ForgotPasswordPage";
import GDPRModal from "@/components/GDPRModal";
import NotFound from "@/pages/NotFound";
import ReportsPage from "@/pages/ReportsPage";
import MunicipiDashboard from "@/pages/MunicipiDashboard";
import PDFPreview from "@/pages/PDFPreview";

const queryClient = new QueryClient();

const App = () => {
  const [showLoading, setShowLoading] = useState(true);
  const [showOnboarding, setShowOnboarding] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowLoading(false);
      if (!localStorage.getItem('onboarding_done')) {
        setShowOnboarding(true);
      }
    }, 1500);
    return () => clearTimeout(timer);
  }, []);

  if (showLoading) {
    return <LoadingScreen onDone={() => {}} />;
  }

  if (showOnboarding) {
    return <OnboardingFlow onComplete={() => setShowOnboarding(false)} />;
  }

  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <ValidationProvider>
          <TooltipProvider>
            <Toaster />
            <Sonner />
            <OfflineBanner />
            <GDPRModal />
            <BrowserRouter>
              <Routes>
                <Route path="/" element={<Navigate to="/map" replace />} />
                <Route path="/login" element={<LoginPage />} />
                <Route path="/register" element={<RegisterPage />} />
                <Route path="/forgot-password" element={<ForgotPasswordPage />} />
                <Route path="/privacy" element={<AppLayout><PrivacyPage /></AppLayout>} />
                <Route path="/terms" element={<AppLayout><TermsPage /></AppLayout>} />
                <Route path="/r/:id" element={<ReportSharePage />} />
                <Route path="/info" element={<AppLayout><InfoPage /></AppLayout>} />
                <Route path="/pricing" element={<AppLayout><PricingPage /></AppLayout>} />
                <Route path="/map" element={<AppLayout><ProtectedRoute><MapPage /></ProtectedRoute></AppLayout>} />
                <Route path="/analytics" element={<AppLayout><ProtectedRoute><AnalyticsPage /></ProtectedRoute></AppLayout>} />
                <Route path="/ranking" element={<AppLayout><ProtectedRoute><RankingPage /></ProtectedRoute></AppLayout>} />
                <Route path="/alerts" element={<AppLayout><ProtectedRoute><AlertsPage /></ProtectedRoute></AppLayout>} />
                <Route path="/profile" element={<AppLayout><ProtectedRoute><ProfilePage /></ProtectedRoute></AppLayout>} />
                <Route path="/admin" element={<AppLayout><ProtectedRoute><AdminPage /></ProtectedRoute></AppLayout>} />
                <Route path="/reports" element={<AppLayout><ProtectedRoute><ReportsPage /></ProtectedRoute></AppLayout>} />
                <Route path="/municipi" element={<AppLayout><ProtectedRoute><MunicipiDashboard /></ProtectedRoute></AppLayout>} />
                <Route path="/pdf-preview" element={<AppLayout><ProtectedRoute><PDFPreview /></ProtectedRoute></AppLayout>} />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </BrowserRouter>
          </TooltipProvider>
        </AuthProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  );
};

export default App;
