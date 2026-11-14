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
import { PendingApprovalView } from './components/auth/PendingApprovalView';

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
  const [currentView, setCurrentView] = useState<'landing' | 'onboarding' | 'dashboard' | 'pending-approval' | 'admin'>('landing');
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
  const [authModalMode, setAuthModalMode] = useState<'login' | 'register' | 'forgot'>('login');

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

  const routeUserBasedOnState = (userData: UserResponse) => {
    if (userData.role === 'admin') {
      setCurrentView('admin');
      fetchAdminData();
      return;
    }

    if (userData.status === 'pending' || userData.status === 'rejected') {
      setCurrentView('pending-approval');
      return;
    }

    if (!userData.onboarding_completed) {
      setCurrentView('onboarding');
      return;
    }

    setCurrentView('dashboard');
  };

  // Restore authenticated session on mount
  useEffect(() => {
    const initSession = async () => {
      const token = localStorage.getItem('nexora_token');
      if (token) {
        try {
          const userData = await api.getCurrentUser();
          setUser(userData);
          await fetchGlobalData();
          routeUserBasedOnState(userData);
        } catch (err) {
          console.warn('Session expired or invalid token:', err);
          localStorage.removeItem('nexora_token');
          setUser(null);
          setProfile(null);
          setProgress(null);
          setCurrentView('landing');
        }
      }
      setLoading(false);
    };

    initSession();
  }, []);

  const handleOpenAuth = (mode: 'login' | 'register' = 'login') => {
    setAuthModalMode(mode);
    setAuthModalOpen(true);
  };

  const handleAuthSuccess = async (authUser: UserResponse, onboardingCompleted: boolean) => {
    setUser(authUser);
    if (authUser.role === 'admin') {
      setCurrentView('admin');
      await fetchAdminData();
      return;
    }

    if (authUser.status === 'pending' || authUser.status === 'rejected') {
      setCurrentView('pending-approval');
      return;
    }

    if (!onboardingCompleted) {
      setCurrentView('onboarding');
    } else {
      await fetchGlobalData();
      setCurrentView('dashboard');
    }
  };

  const handleRefreshUser = async () => {
    try {
      const refreshed = await api.getCurrentUser();
      setUser(refreshed);
      routeUserBasedOnState(refreshed);
    } catch (err) {
      console.error('Failed to refresh user:', err);
    }
  };

  const handleSignOut = () => {
    localStorage.removeItem('nexora_token');
    setUser(null);
    setProfile(null);
    setProgress(null);
    setCurrentView('landing');
  };

  const handleLaunchDashboard = () => {
    if (!user) {
      handleOpenAuth('register');
      return;
    }
    routeUserBasedOnState(user);
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
    setCurrentView('dashboard');
    setCurrentTab('overview');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Admin Actions
  const handleApproveStudent = async (studentId: string) => {
    await api.approveStudent(studentId);
    await fetchAdminData();
  };

  const handleRejectStudent = async (studentId: string, reason: string) => {
    await api.rejectStudent(studentId, reason);
    await fetchAdminData();
  };

  const handleCreateResource = async (data: Partial<AdminResourceItem>) => {
    await api.createAdminResource(data);
    await fetchAdminData();
  };

  const handleDeleteResource = async (id: string) => {
    await api.deleteAdminResource(id);
    await fetchAdminData();
  };

  const pendingCount = adminStudents.filter(s => s.status === 'pending').length;

  return (
    <div className="min-h-screen bg-[#050608] text-[#F5F7F4] flex flex-col selection:bg-[#35D9F2] selection:text-[#050608]">
      {/* Top Universal Navbar */}
      <Navbar
        currentView={currentView}
        onNavigate={(v) => {
          if (v === 'admin' && user?.role === 'admin') {
            setCurrentView('admin');
            fetchAdminData();
          } else if (v === 'dashboard') {
            setCurrentView('dashboard');
          } else {
            setCurrentView(v);
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

      {currentView === 'pending-approval' && user && (
        <PendingApprovalView
          user={user}
          onRefreshUser={handleRefreshUser}
          onSignOut={handleSignOut}
        />
      )}

      {currentView === 'onboarding' && (
        <OnboardingWizard
          currentUser={user}
          onComplete={handleOnboardingComplete}
          onCancel={() => setCurrentView('landing')}
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
          pendingCount={pendingCount}
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
              pendingStudents={adminStudents.filter(s => s.status === 'pending')}
              loading={adminLoading}
              onApprove={handleApproveStudent}
              onReject={handleRejectStudent}
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
        onClose={() => setAuthModalOpen(false)}
        onSuccess={handleAuthSuccess}
      />
    </div>
  );
}

export default App;
