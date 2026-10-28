import { useState, useEffect } from 'react';
import { BedroomDesk3D } from './components/BedroomDesk3D';
import { ShowcaseCarousel3D } from './components/ShowcaseCarousel3D';
import { DiaryModal } from './components/DiaryModal';
import { ProjectDetailModal } from './components/ProjectDetailModal';
import { ProfileSphereModal } from './components/ProfileSphereModal';
import { NewsletterModal } from './components/NewsletterModal';
import { AnatomyDissectionModal } from './components/AnatomyDissectionModal';
import { type Project, PROJECTS } from './data/portfolioData';

export default function App() {
  const [currentView, setCurrentView] = useState<'desk' | 'showcase'>(() => {
    const hash = window.location.hash.toLowerCase();
    if (hash.includes('showcase') || hash.includes('ribbon')) return 'showcase';
    return 'desk';
  });

  const [isDiaryOpen, setIsDiaryOpen] = useState(false);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isNewsletterOpen, setIsNewsletterOpen] = useState(false);
  const [isAnatomyOpen, setIsAnatomyOpen] = useState(false);

  // Sync hash changes with browser navigation
  useEffect(() => {
    const handleHash = () => {
      const hash = window.location.hash.toLowerCase();
      if (hash.includes('showcase') || hash.includes('ribbon')) {
        setCurrentView('showcase');
      } else {
        setCurrentView('desk');
      }
    };
    window.addEventListener('hashchange', handleHash);
    return () => window.removeEventListener('hashchange', handleHash);
  }, []);

  const handleOpenProjectById = (projectId: string) => {
    const found = PROJECTS.find((p) => p.id === projectId) || PROJECTS[0];
    setSelectedProject(found);
  };

  const handleSwitchToShowcase = () => {
    setCurrentView('showcase');
    window.location.hash = 'showcase';
  };

  const handleSwitchToDesk = () => {
    setCurrentView('desk');
    window.location.hash = '';
  };

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-[#050608] text-white selection:bg-cyan-400 selection:text-black">
      {/* ── Active 3D Experience (pradiplabs.dev 3D Desk vs jesperlandberg.com GLSL Ribbon) ── */}
      {currentView === 'desk' ? (
        <BedroomDesk3D
          onOpenDiary={() => setIsDiaryOpen(true)}
          onOpenProject={handleOpenProjectById}
          onSwitchToShowcase={handleSwitchToShowcase}
          onOpenAnatomy={() => setIsAnatomyOpen(true)}
        />
      ) : (
        <ShowcaseCarousel3D
          onSelectProject={(project) => setSelectedProject(project)}
          onOpenProfile={() => setIsProfileOpen(true)}
          onOpenNewsletter={() => setIsNewsletterOpen(true)}
          onSwitchToBedroom={handleSwitchToDesk}
          onOpenAnatomy={() => setIsAnatomyOpen(true)}
        />
      )}

      {/* ── Interactive Modals ── */}
      <DiaryModal
        isOpen={isDiaryOpen}
        onClose={() => setIsDiaryOpen(false)}
      />

      <ProjectDetailModal
        project={selectedProject}
        onClose={() => setSelectedProject(null)}
        onOpenAnatomy={() => setIsAnatomyOpen(true)}
      />

      <ProfileSphereModal
        isOpen={isProfileOpen}
        onClose={() => setIsProfileOpen(false)}
      />

      <NewsletterModal
        isOpen={isNewsletterOpen}
        onClose={() => setIsNewsletterOpen(false)}
      />

      <AnatomyDissectionModal
        isOpen={isAnatomyOpen}
        onClose={() => setIsAnatomyOpen(false)}
      />
    </div>
  );
}
