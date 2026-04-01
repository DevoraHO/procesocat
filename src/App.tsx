import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes, Navigate, useNavigate } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/contexts/AuthContext";
import { ValidationProvider } from "@/contexts/ValidationContext";
import { supabase } from "@/integrations/supabase/client";
import '@/i18n';
import { useState, useEffect, lazy, Suspense } from 'react';
import { safeStorage } from '@/utils/safeStorage';

import AppLayout from "@/components/AppLayout";
import ProtectedRoute from "@/components/ProtectedRoute";
import ErrorBoundary from "@/components/ErrorBoundary";
import OfflineBanner from "@/components/OfflineBanner";
import LoadingScreen from "@/components/LoadingScreen";
import LoadingSpinner from "@/components/LoadingSpinner";
import OnboardingFlow from "@/components/OnboardingFlow";
import GDPRModal from "@/components/GDPRModal";

// Lazy-loaded pages
const MapPage = lazy(() => import("@/pages/MapPage"));
const InfoPage = lazy(() => import("@/pages/InfoPage"));
const RankingPage = lazy(() => import("@/pages/RankingPage"));
const AlertsPage = lazy(() => import("@/pages/AlertsPage"));
const ProfilePage = lazy(() => import("@/pages/ProfilePage"));
const AdminPage = lazy(() => import("@/pages/AdminPage"));
const LoginPage = lazy(() => import("@/pages/LoginPage"));
const RegisterPage = lazy(() => import("@/pages/RegisterPage"));
const PrivacyPage = lazy(() => import("@/pages/PrivacyPage"));
const TermsPage = lazy(() => import("@/pages/TermsPage"));
const ReportSharePage = lazy(() => import("@/pages/ReportSharePage"));
const PricingPage = lazy(() => import("@/pages/PricingPage"));
const PlansPage = lazy(() => import("@/pages/PlansPage"));
const AnalyticsPage = lazy(() => import("@/pages/AnalyticsPage"));
const ForgotPasswordPage = lazy(() => import("@/pages/ForgotPasswordPage"));
const NotFound = lazy(() => import("@/pages/NotFound"));
const ReportsPage = lazy(() => import("@/pages/ReportsPage"));
const MunicipiDashboard = lazy(() => import("@/pages/MunicipiDashboard"));
const PDFPreview = lazy(() => import("@/pages/PDFPreview"));
const OnboardingPage = lazy(() => import("@/pages/OnboardingPage"));
const AuthCallbackPage = lazy(() => import("@/pages/AuthCallbackPage"));

const queryClient = new QueryClient();

const App = () => {
  const [showLoading, setShowLoading] = useState(true);
  const [showOnboarding, setShowOnboarding] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowLoading(false);
      if (!safeStorage.getItem('onboarding_done')) {
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
              <OAuthCallbackHandler />
              <Suspense fallback={<LoadingSpinner />}>
                <Routes>
                  <Route path="/" element={<Navigate to="/map" replace />} />
                  <Route path="/login" element={<LoginPage />} />
                  <Route path="/register" element={<RegisterPage />} />
                  <Route path="/forgot-password" element={<ForgotPasswordPage />} />
                  <Route path="/privacy" element={<AppLayout><PrivacyPage /></AppLayout>} />
                  <Route path="/terms" element={<AppLayout><TermsPage /></AppLayout>} />
                  <Route path="/auth/callback" element={<AuthCallbackPage />} />
                  <Route path="/r/:id" element={<ReportSharePage />} />
                  <Route path="/info" element={<AppLayout><InfoPage /></AppLayout>} />
                  <Route path="/pricing" element={<AppLayout><PricingPage /></AppLayout>} />
                  <Route path="/plans" element={<AppLayout><ProtectedRoute><PlansPage /></ProtectedRoute></AppLayout>} />
                  <Route path="/map" element={<AppLayout><ProtectedRoute><MapPage /></ProtectedRoute></AppLayout>} />
                  <Route path="/analytics" element={<AppLayout><ProtectedRoute><AnalyticsPage /></ProtectedRoute></AppLayout>} />
                  <Route path="/ranking" element={<AppLayout><ProtectedRoute><RankingPage /></ProtectedRoute></AppLayout>} />
                  <Route path="/alerts" element={<AppLayout><ProtectedRoute><AlertsPage /></ProtectedRoute></AppLayout>} />
                  <Route path="/profile" element={<AppLayout><ProtectedRoute><ProfilePage /></ProtectedRoute></AppLayout>} />
                  <Route path="/admin" element={<AppLayout><ProtectedRoute><AdminPage /></ProtectedRoute></AppLayout>} />
                  <Route path="/reports" element={<AppLayout><ProtectedRoute><ReportsPage /></ProtectedRoute></AppLayout>} />
                  <Route path="/municipi" element={<AppLayout><ProtectedRoute><MunicipiDashboard /></ProtectedRoute></AppLayout>} />
                  <Route path="/pdf-preview" element={<AppLayout><ProtectedRoute><PDFPreview /></ProtectedRoute></AppLayout>} />
                  <Route path="/onboarding" element={<ProtectedRoute><OnboardingPage /></ProtectedRoute>} />
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </Suspense>
            </BrowserRouter>
          </TooltipProvider>
          </ValidationProvider>
        </AuthProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  );
};

// Handles OAuth redirect (access_token in URL hash)
function OAuthCallbackHandler() {
  const navigate = useNavigate();

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN' && session) {
        const currentPath = window.location.pathname;
        if (currentPath === '/login' || currentPath === '/register' || currentPath === '/') {
          // Check if new user needs onboarding
          setTimeout(async () => {
            const { data: profile } = await supabase
              .from('profiles')
              .select('municipality_id, pet_name, points')
              .eq('id', session.user.id)
              .single();

            const isNewUser = profile && !profile.municipality_id && !profile.pet_name && (profile.points === 0 || profile.points === null);
            const onboardingDone = safeStorage.getItem('onboarding_profile_done');

            if (isNewUser && !onboardingDone) {
              navigate('/onboarding', { replace: true });
            } else {
              navigate('/map', { replace: true });
            }
          }, 500);
        }
      }
      if (event === 'SIGNED_OUT') {
        navigate('/login', { replace: true });
      }
    });
    return () => subscription.unsubscribe();
  }, [navigate]);

  return null;
}

export default App;
