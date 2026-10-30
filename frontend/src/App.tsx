import React, { useState, useEffect } from 'react';
import { useAuth, AuthProvider } from './context/AuthContext';
import { Sidebar } from './components/Sidebar';
import { Navbar } from './components/Navbar';
import { LandingPage } from './views/LandingPage';
import { LoginView } from './views/auth/LoginView';
import { RegisterView } from './views/auth/RegisterView';
import { VerifyOtpView } from './views/auth/VerifyOtpView';
import { ForgotPasswordView } from './views/auth/ForgotPasswordView';
import { OnboardingWizard } from './views/OnboardingWizard';
import { OverviewDashboard } from './views/OverviewDashboard';
import { ProfileView } from './views/ProfileView';
import { AnalysisView } from './views/AnalysisView';
import { RiskAssessmentView } from './views/RiskAssessmentView';
import { SmartGovView } from './views/SmartGovView';
import { MentorsView } from './views/MentorsView';
import { BusinessPlanView } from './views/BusinessPlanView';
import { RoadmapView } from './views/RoadmapView';
import { ProgressTrackerView } from './views/ProgressTrackerView';
import { LearningView } from './views/LearningView';
import { SDGImpactView } from './views/SDGImpactView';
import { CommunityView } from './views/CommunityView';
import { AdminDashboardView } from './views/AdminDashboardView';
import { SettingsView } from './views/SettingsView';
import { ExplainableAIModal } from './views/ExplainableAIModal';
import { api } from './api';
import { BusinessAnalysis } from './types';

const MainApp: React.FC = () => {
  const { user, profile, loading } = useAuth();
  
  // HTML5 History & URL Navigation state
  const [currentPath, setCurrentPath] = useState<string>(() => window.location.pathname || '/');
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [explainModalOpen, setExplainModalOpen] = useState(false);
  const [modalAnalysis, setModalAnalysis] = useState<BusinessAnalysis | null>(null);

  // Synchronize browser history and popstate events
  const navigate = (toPath: string) => {
    if (toPath !== window.location.pathname) {
      window.history.pushState({}, '', toPath);
    }
    setCurrentPath(toPath);
    window.scrollTo(0, 0);
  };

  useEffect(() => {
    const handlePopState = () => {
      setCurrentPath(window.location.pathname || '/');
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const handleOpenExplainability = async () => {
    try {
      const an = await api.getLatestAnalysis();
      setModalAnalysis(an);
      setExplainModalOpen(true);
    } catch (e) {
      console.error('Failed to load explainability analysis:', e);
    }
  };

  // 1. Loading State
  if (loading) {
    return (
      <div className="min-h-screen bg-cream flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-12 h-12 border-4 border-plum border-t-transparent rounded-full animate-spin" />
          <h2 className="text-sm font-bold font-heading text-plum">RiseHer Intelligence Engine Loading...</h2>
          <p className="text-xs text-charcoal-muted">Initializing decision matrices and verified schemes...</p>
        </div>
      </div>
    );
  }

  // 2. Unauthenticated User Routes & Route Guarding
  if (!user) {
    if (currentPath === '/login') {
      return <LoginView onNavigate={navigate} />;
    }
    if (currentPath === '/register') {
      return <RegisterView onNavigate={navigate} />;
    }
    if (currentPath === '/verify-otp') {
      return <VerifyOtpView onNavigate={navigate} />;
    }
    if (currentPath === '/forgot-password') {
      return <ForgotPasswordView onNavigate={navigate} />;
    }

    // If unauthenticated user tries to access /dashboard or /profile/setup directly, redirect to /login
    if (currentPath.startsWith('/dashboard') || currentPath === '/profile/setup') {
      return <LoginView onNavigate={navigate} />;
    }

    // Default first page is the public Landing Page with Inspiration Section & login/register actions
    return (
      <LandingPage
        onNavigate={navigate}
        onStartOnboarding={() => navigate('/register')}
        onExploreDashboard={() => navigate('/dashboard')}
      />
    );
  }

  // 3. Authenticated User - Profile Completion Guard
  // If user is an entrepreneur but has not completed profile setup
  const isProfileIncomplete = user.role === 'entrepreneur' && (!profile || !profile.business_idea);

  if (isProfileIncomplete) {
    // If user is at /profile/setup, render wizard
    if (currentPath === '/profile/setup') {
      return (
        <OnboardingWizard
          onComplete={() => navigate('/dashboard')}
          onCancel={() => navigate('/dashboard')}
        />
      );
    }

    // If user attempts to enter dashboard without completing setup, route them to /profile/setup
    if (currentPath.startsWith('/dashboard')) {
      return (
        <OnboardingWizard
          onComplete={() => navigate('/dashboard')}
          onCancel={() => navigate('/dashboard')}
        />
      );
    }

    // If user navigates to public landing page while logged in
    if (currentPath === '/') {
      return (
        <LandingPage
          onNavigate={navigate}
          onStartOnboarding={() => navigate('/profile/setup')}
          onExploreDashboard={() => navigate('/dashboard')}
        />
      );
    }
  }

  // 4. Authenticated User with Completed Profile (or Mentor/Admin)
  // If visiting / or /login or /register, allow them to view landing or redirect to /dashboard
  if (currentPath === '/login' || currentPath === '/register') {
    // Already authenticated, redirect to /dashboard
    navigate('/dashboard');
  }

  if (currentPath === '/') {
    return (
      <LandingPage
        onNavigate={navigate}
        onStartOnboarding={() => navigate('/dashboard')}
        onExploreDashboard={() => navigate('/dashboard')}
      />
    );
  }

  if (currentPath === '/profile/setup') {
    return (
      <OnboardingWizard
        onComplete={() => navigate('/dashboard')}
        onCancel={() => navigate('/dashboard')}
      />
    );
  }

  // Derive current view from pathname
  const cleanPath = currentPath.startsWith('/dashboard/')
    ? currentPath.replace('/dashboard/', '')
    : currentPath === '/dashboard' ? 'overview' : currentPath.replace('/', '');

  const currentView = cleanPath || 'overview';

  const handleDashboardNavigate = (viewId: string) => {
    if (viewId === 'landing') {
      navigate('/');
    } else if (viewId === 'onboarding') {
      navigate('/profile/setup');
    } else if (viewId === 'overview') {
      navigate('/dashboard');
    } else {
      navigate(`/dashboard/${viewId}`);
    }
  };

  const renderDashboardModule = () => {
    switch (currentView) {
      case 'overview':
        return (
          <OverviewDashboard
            onNavigate={handleDashboardNavigate}
            onOpenExplainability={handleOpenExplainability}
          />
        );
      case 'onboarding':
        return (
          <OnboardingWizard
            onComplete={() => handleDashboardNavigate('overview')}
            onCancel={() => handleDashboardNavigate('overview')}
          />
        );
      case 'profile':
        return <ProfileView />;
      case 'analysis':
        return <AnalysisView onNavigate={handleDashboardNavigate} />;
      case 'risk':
        return <RiskAssessmentView onNavigate={handleDashboardNavigate} />;
      case 'schemes':
        return <SmartGovView />;
      case 'mentors':
        return <MentorsView />;
      case 'business-plan':
        return <BusinessPlanView onNavigate={handleDashboardNavigate} />;
      case 'roadmap':
        return <RoadmapView />;
      case 'progress':
        return <ProgressTrackerView />;
      case 'learning':
        return <LearningView />;
      case 'sdg':
        return <SDGImpactView />;
      case 'community':
        return <CommunityView />;
      case 'admin':
        return <AdminDashboardView />;
      case 'settings':
        return <SettingsView />;
      default:
        return (
          <OverviewDashboard
            onNavigate={handleDashboardNavigate}
            onOpenExplainability={handleOpenExplainability}
          />
        );
    }
  };

  return (
    <div className="flex h-screen overflow-hidden bg-cream font-sans">
      {/* Sidebar Navigation */}
      <Sidebar
        currentView={currentView}
        onNavigate={handleDashboardNavigate}
        isOpenMobile={isMobileSidebarOpen}
        onCloseMobile={() => setIsMobileSidebarOpen(false)}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col h-screen overflow-y-auto">
        <Navbar
          currentView={currentView}
          onNavigate={handleDashboardNavigate}
          onOpenMobileSidebar={() => setIsMobileSidebarOpen(true)}
        />

        <main className="flex-1 pb-16">
          {renderDashboardModule()}
        </main>
      </div>

      {/* Global Explainable AI Modal */}
      <ExplainableAIModal
        analysis={modalAnalysis}
        isOpen={explainModalOpen}
        onClose={() => setExplainModalOpen(false)}
      />
    </div>
  );
};

export const App: React.FC = () => {
  return (
    <AuthProvider>
      <MainApp />
    </AuthProvider>
  );
};

export default App;
