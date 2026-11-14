import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { HeroSection } from './components/landing/HeroSection';
import { PlatformShowcase } from './components/landing/PlatformShowcase';
import { HowItWorks } from './components/landing/HowItWorks';
import { AgentEcosystem } from './components/landing/AgentEcosystem';
import { ComparisonSection } from './components/landing/ComparisonSection';
import { CtaBanner } from './components/landing/CtaBanner';

import { DashboardLayout, DashboardTab } from './components/dashboard/DashboardLayout';
import { OverviewView } from './components/dashboard/OverviewView';
import { CareerTwinView } from './components/dashboard/CareerTwinView';
import { CareerReadinessView } from './components/dashboard/CareerReadinessView';
import { SkillDependencyGraph } from './components/dashboard/SkillDependencyGraph';
import { ProjectRecommendationEngine } from './components/dashboard/ProjectRecommendationEngine';
import { IndustrySkillTrends } from './components/dashboard/IndustrySkillTrends';
import { SkillProfileView } from './components/dashboard/SkillProfileView';
import { CareerIntelligenceView } from './components/dashboard/CareerIntelligenceView';
import { LearningCenterView } from './components/dashboard/LearningCenterView';
import { RoadmapView } from './components/dashboard/RoadmapView';
import { AssessmentView } from './components/dashboard/AssessmentView';
import { CodingLabView } from './components/dashboard/CodingLabView';
import { ProjectStudioView } from './components/dashboard/ProjectStudioView';
import { InterviewSimulatorView } from './components/dashboard/InterviewSimulatorView';
import { ResumeAnalyzerView } from './components/dashboard/ResumeAnalyzerView';
import { MentorView } from './components/dashboard/MentorView';
import { AchievementsView } from './components/dashboard/AchievementsView';
import { AnalyticsView } from './components/dashboard/AnalyticsView';
import { AgentTelemetryView } from './components/dashboard/AgentTelemetryView';
import { SettingsView } from './components/dashboard/SettingsView';

import { OnboardingWizard } from './components/onboarding/OnboardingWizard';
import { AuthModal } from './components/auth/AuthModal';

// Admin Portal Components
import { AdminPortalLayout, AdminTab } from './components/admin/AdminPortalLayout';
import { AdminDashboardView } from './components/admin/AdminDashboardView';
import { AdminRegistrationsView } from './components/admin/AdminRegistrationsView';
import { AdminStudentsView } from './components/admin/AdminStudentsView';
import { AdminCurriculumView } from './components/admin/AdminCurriculumView';
import { AdminAuditLogsView } from './components/admin/AdminAuditLogsView';

import { api } from './api/client';
import { 
  LearnerProfile, 
  ProgressOverview, 
  UserResponse,
  AdminStats,
  AdminStudentItem,
  AdminAuditLogItem,
  AdminResourceItem
} from './types';

export function App() {
  const [currentView, setCurrentView] = useState<'landing' | 'onboarding' | 'dashboard' | 'admin'>('landing');
  const [currentTab, setCurrentTab] = useState<DashboardTab>('overview');
  const [adminTab, setAdminTab] = useState<AdminTab>('dashboard');
  
  const [user, setUser] = useState<UserResponse | null>(null);
  const [profile, setProfile] = useState<LearnerProfile | null>(null);
  const [progress, setProgress] = useState<ProgressOverview | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  // Admin Portal State
  const [adminStats, setAdminStats] = useState<AdminStats | null>(null);
  const [adminStudents, setAdminStudents] = useState<AdminStudentItem[]>([]);
  const [adminResources, setAdminResources] = useState<AdminResourceItem[]>([]);
  const [adminLogs, setAdminLogs] = useState<AdminAuditLogItem[]>([]);
  const [adminLoading, setAdminLoading] = useState<boolean>(false);

  // Auth Modal State
  const [authModalOpen, setAuthModalOpen] = useState<boolean>(false);
  const [authModalMode, setAuthModalMode] = useState<'login' | 'register' | 'forgot' | 'admin-login'>('login');

  const fetchGlobalData = async () => {
    try {
      const [profData, progData] = await Promise.all([
        api.getProfile(),
        api.getProgressOverview()
      ]);
      setProfile(profData);
      setProgress(progData);
      return { profData, progData };
    } catch (err) {
      console.error('Error fetching global application data:', err);
      return null;
    }
  };

  const fetchAdminData = async () => {
    setAdminLoading(true);
    try {
      const [stats, students, resources, logs] = await Promise.all([
        api.getAdminStats(),
        api.getAdminStudents(),
        api.getAdminResources(),
        api.getAdminAuditLogs()
      ]);
      setAdminStats(stats);
      setAdminStudents(students);
      setAdminResources(resources);
      setAdminLogs(logs);
    } catch (err) {
      console.error('Error fetching admin data:', err);
    } finally {
      setAdminLoading(false);
    }
  };

  const handleOpenAuth = (mode: 'login' | 'register' | 'admin-login' = 'login') => {
    setAuthModalMode(mode);
    setAuthModalOpen(true);
    if (mode === 'admin-login' && window.location.pathname !== '/admin/login') {
      window.history.pushState({}, '', '/admin/login');
    }
  };

  const navigateToView = (view: 'landing' | 'onboarding' | 'dashboard' | 'admin') => {
    setCurrentView(view);
    if (view === 'admin') {
      window.history.pushState({}, '', '/admin');
      fetchAdminData();
    } else if (view === 'dashboard') {
      window.history.pushState({}, '', '/dashboard');
    } else if (view === 'landing') {
      window.history.pushState({}, '', '/');
    }
  };

  // Restore authenticated session on mount & handle browser path routing
  useEffect(() => {
    const initSession = async () => {
      const path = window.location.pathname;
      const token = localStorage.getItem('nexora_token');

      let currentUser: UserResponse | null = null;
      if (token) {
        try {
          currentUser = await api.getCurrentUser();
          setUser(currentUser);
        } catch (err) {
          console.warn('Session expired or invalid token:', err);
          localStorage.removeItem('nexora_token');
          currentUser = null;
        }
      }

      // Check routes
      if (path === '/admin/login') {
        if (currentUser && currentUser.role === 'admin') {
          navigateToView('admin');
        } else {
          setCurrentView('landing');
          handleOpenAuth('admin-login');
        }
      } else if (path.startsWith('/admin')) {
        if (currentUser && currentUser.role === 'admin') {
          navigateToView('admin');
        } else {
          setCurrentView('landing');
          handleOpenAuth('admin-login');
        }
      } else if (currentUser) {
        await fetchGlobalData();
        if (currentUser.role === 'admin') {
          navigateToView('admin');
        } else if (!currentUser.onboarding_completed) {
          setCurrentView('onboarding');
        } else {
          navigateToView('dashboard');
        }
      } else {
        if (path === '/login') {
          handleOpenAuth('login');
        } else if (path === '/register') {
          handleOpenAuth('register');
        }
        setCurrentView('landing');
      }

      setLoading(false);
    };

    initSession();

    const handlePopState = () => {
      const p = window.location.pathname;
      if (p === '/admin/login') {
        handleOpenAuth('admin-login');
      } else if (p.startsWith('/admin')) {
        if (user?.role === 'admin') {
          setCurrentView('admin');
        } else {
          handleOpenAuth('admin-login');
        }
      } else if (p === '/dashboard' && user) {
        setCurrentView('dashboard');
      } else if (p === '/') {
        setCurrentView('landing');
      }
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const handleAuthSuccess = async (authUser: UserResponse, onboardingCompleted: boolean) => {
    setUser(authUser);
    if (authUser.role === 'admin') {
      navigateToView('admin');
      return;
    }

    // Regular student: active immediately!
    if (!onboardingCompleted) {
      setCurrentView('onboarding');
    } else {
      await fetchGlobalData();
      navigateToView('dashboard');
    }
  };

  const handleSignOut = () => {
    localStorage.removeItem('nexora_token');
    setUser(null);
    setProfile(null);
    setProgress(null);
    navigateToView('landing');
  };

  const handleLaunchDashboard = () => {
    if (!user) {
      handleOpenAuth('register');
      return;
    }
    if (user.role === 'admin') {
      navigateToView('admin');
      return;
    }
    if (!user.onboarding_completed) {
      setCurrentView('onboarding');
      return;
    }
    navigateToView('dashboard');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleExplorePlatform = () => {
    const el = document.getElementById('platform-showcase');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleOnboardingComplete = async () => {
    await fetchGlobalData();
    if (user) {
      setUser({ ...user, onboarding_completed: true, status: 'approved' });
    }
    navigateToView('dashboard');
    setCurrentTab('overview');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleCreateResource = async (data: Partial<AdminResourceItem>) => {
    await api.createAdminResource(data);
    await fetchAdminData();
  };

  const handleDeleteResource = async (id: string) => {
    await api.deleteAdminResource(id);
    await fetchAdminData();
  };

  return (
    <div className="min-h-screen bg-[#050608] text-[#F5F7F4] flex flex-col selection:bg-[#35D9F2] selection:text-[#050608]">
      {/* Top Universal Navbar */}
      <Navbar
        currentView={currentView}
        onNavigate={(v) => {
          if (v === 'admin' && user?.role === 'admin') {
            navigateToView('admin');
          } else if (v === 'dashboard') {
            navigateToView('dashboard');
          } else {
            navigateToView('landing');
          }
        }}
        user={user}
        onOpenAuth={handleOpenAuth}
        onSignOut={handleSignOut}
      />

      {/* Main View Router */}
      {currentView === 'landing' && (
        <div className="flex-1 flex flex-col">
          <HeroSection 
            onStart={handleLaunchDashboard} 
            onExplore={handleExplorePlatform} 
          />
          <PlatformShowcase onLaunch={handleLaunchDashboard} />
          <HowItWorks />
          <AgentEcosystem />
          <ComparisonSection />
          <CtaBanner onStart={handleLaunchDashboard} />
        </div>
      )}

      {currentView === 'onboarding' && (
        <OnboardingWizard
          currentUser={user}
          onComplete={handleOnboardingComplete}
          onCancel={() => navigateToView('landing')}
        />
      )}

      {/* Student Portal Dashboard */}
      {currentView === 'dashboard' && (
        <DashboardLayout
          currentTab={currentTab}
          onTabChange={setCurrentTab}
          profile={profile}
          progress={progress}
        >
          {currentTab === 'overview' && (
            <OverviewView
              progress={progress}
              profile={profile}
              onNavigateTab={setCurrentTab}
            />
          )}

          {currentTab === 'career-twin' && (
            <CareerTwinView
              profile={profile}
              onNavigateTab={setCurrentTab}
              onRefreshAll={fetchGlobalData}
            />
          )}

          {currentTab === 'readiness' && (
            <CareerReadinessView
              onNavigateTab={setCurrentTab}
            />
          )}

          {currentTab === 'skill-graph' && (
            <SkillDependencyGraph
              onNavigateTab={setCurrentTab}
            />
          )}

          {currentTab === 'project-recommendations' && (
            <ProjectRecommendationEngine
              onNavigateTab={setCurrentTab}
            />
          )}

          {currentTab === 'industry-trends' && (
            <IndustrySkillTrends
              onNavigateTab={setCurrentTab}
            />
          )}

          {currentTab === 'skills' && (
            <SkillProfileView 
              onRefreshProgress={fetchGlobalData} 
            />
          )}

          {currentTab === 'careers' && (
            <CareerIntelligenceView
              currentCareerId={profile?.target_career_id}
              onRefreshAll={fetchGlobalData}
            />
          )}

          {currentTab === 'learning' && (
            <LearningCenterView />
          )}

          {currentTab === 'roadmap' && (
            <RoadmapView 
              onRefreshAll={fetchGlobalData} 
            />
          )}

          {currentTab === 'assessments' && (
            <AssessmentView
              onRefreshAll={fetchGlobalData}
              onNavigateTab={setCurrentTab}
            />
          )}

          {currentTab === 'coding-lab' && (
            <CodingLabView />
          )}

          {currentTab === 'project-studio' && (
            <ProjectStudioView />
          )}

          {currentTab === 'interview-sim' && (
            <InterviewSimulatorView />
          )}

          {currentTab === 'resume-analyzer' && (
            <ResumeAnalyzerView />
          )}

          {currentTab === 'mentor' && (
            <MentorView 
              progress={progress} 
            />
          )}

          {currentTab === 'achievements' && (
            <AchievementsView />
          )}

          {currentTab === 'analytics' && (
            <AnalyticsView 
              progress={progress}
            />
          )}

          {currentTab === 'agents' && (
            <AgentTelemetryView 
              onRefreshAll={fetchGlobalData} 
            />
          )}

          {currentTab === 'settings' && (
            <SettingsView
              profile={profile}
              onRefreshAll={fetchGlobalData}
            />
          )}
        </DashboardLayout>
      )}

      {/* Admin Portal */}
      {currentView === 'admin' && user && user.role === 'admin' && (
        <AdminPortalLayout
          currentTab={adminTab}
          onTabChange={setAdminTab}
          user={user}
          pendingCount={adminStats?.new_registrations_today || 0}
          onSignOut={handleSignOut}
          onSwitchToStudentView={() => setCurrentView('dashboard')}
        >
          {adminTab === 'dashboard' && (
            <AdminDashboardView
              stats={adminStats}
              loading={adminLoading}
              onNavigateTab={setAdminTab}
            />
          )}

          {adminTab === 'registrations' && (
            <AdminRegistrationsView
              students={adminStudents}
              loading={adminLoading}
              onRefresh={fetchAdminData}
            />
          )}

          {adminTab === 'students' && (
            <AdminStudentsView
              students={adminStudents}
              loading={adminLoading}
              onRefresh={fetchAdminData}
            />
          )}

          {adminTab === 'curriculum' && (
            <AdminCurriculumView
              resources={adminResources}
              loading={adminLoading}
              onCreateResource={handleCreateResource}
              onDeleteResource={handleDeleteResource}
              onRefresh={fetchAdminData}
            />
          )}

          {adminTab === 'audit-logs' && (
            <AdminAuditLogsView
              logs={adminLogs}
              loading={adminLoading}
              onRefresh={fetchAdminData}
            />
          )}
        </AdminPortalLayout>
      )}

      {/* Universal Footer */}
      <Footer />

      {/* Authentication Modal */}
      <AuthModal
        isOpen={authModalOpen}
        initialMode={authModalMode}
        onClose={() => {
          setAuthModalOpen(false);
          if (window.location.pathname === '/admin/login' || window.location.pathname === '/login' || window.location.pathname === '/register') {
            window.history.pushState({}, '', '/');
          }
        }}
        onSuccess={handleAuthSuccess}
      />
    </div>
  );
}

export default App;
