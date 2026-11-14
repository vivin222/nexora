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
import { RoadmapView } from './components/dashboard/RoadmapView';
import { AssessmentView } from './components/dashboard/AssessmentView';
import { MentorView } from './components/dashboard/MentorView';
import { AgentTelemetryView } from './components/dashboard/AgentTelemetryView';
import { SettingsView } from './components/dashboard/SettingsView';

import { api } from './api/client';
import { LearnerProfile, ProgressOverview } from './types';

export function App() {
  const [currentView, setCurrentView] = useState<'landing' | 'dashboard'>('landing');
  const [currentTab, setCurrentTab] = useState<DashboardTab>('overview');
  
  const [profile, setProfile] = useState<LearnerProfile | null>(null);
  const [progress, setProgress] = useState<ProgressOverview | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  const fetchGlobalData = async () => {
    try {
      const [profData, progData] = await Promise.all([
        api.getProfile(),
        api.getProgressOverview()
      ]);
      setProfile(profData);
      setProgress(progData);
    } catch (err) {
      console.error('Error fetching global application data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGlobalData();
  }, []);

  const handleLaunchDashboard = () => {
    setCurrentView('dashboard');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleExplorePlatform = () => {
    const el = document.getElementById('platform-showcase');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="min-h-screen bg-[#050507] text-white flex flex-col selection:bg-rose-600 selection:text-white">
      {/* Top Universal Navbar */}
      <Navbar
        currentView={currentView}
        onNavigate={setCurrentView}
      />

      {/* Main View Router */}
      {currentView === 'landing' ? (
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
      ) : (
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

          {currentTab === 'mentor' && (
            <MentorView 
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
    </div>
  );
}

export default App;
