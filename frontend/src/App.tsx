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

import { api } from './api/client';
import { LearnerProfile, ProgressOverview, UserResponse } from './types';

export function App() {
  const [currentView, setCurrentView] = useState<'landing' | 'onboarding' | 'dashboard'>('landing');
  const [currentTab, setCurrentTab] = useState<DashboardTab>('overview');
  
  const [user, setUser] = useState<UserResponse | null>(null);
  const [profile, setProfile] = useState<LearnerProfile | null>(null);
  const [progress, setProgress] = useState<ProgressOverview | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

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

  // Restore authenticated session on mount
  useEffect(() => {
    const initSession = async () => {
      const token = localStorage.getItem('nexora_token');
      if (token) {
        try {
          const userData = await api.getCurrentUser();
          setUser(userData);
          const data = await fetchGlobalData();
          
          if (!userData.onboarding_completed) {
            setCurrentView('onboarding');
          } else {
            // User has completed onboarding, remain or go to dashboard
            setCurrentView('dashboard');
          }
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
    if (!onboardingCompleted) {
      setCurrentView('onboarding');
    } else {
      await fetchGlobalData();
      setCurrentView('dashboard');
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
    if (!user.onboarding_completed) {
      setCurrentView('onboarding');
      return;
    }
    setCurrentView('dashboard');
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
    // Update local user state
    if (user) {
      setUser({ ...user, onboarding_completed: true });
    }
    setCurrentView('dashboard');
    setCurrentTab('overview');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-[#050608] text-[#F5F7F4] flex flex-col selection:bg-[#35D9F2] selection:text-[#050608]">
      {/* Top Universal Navbar */}
      <Navbar
        currentView={currentView}
        onNavigate={setCurrentView}
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
          onCancel={() => setCurrentView('landing')}
        />
      )}

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
