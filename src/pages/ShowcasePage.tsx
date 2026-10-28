import React, { useState } from 'react';
import { ShowcaseCarousel3D } from '../components/ShowcaseCarousel3D';
import { ProjectDetailModal } from '../components/ProjectDetailModal';
import { ProfileSphereModal } from '../components/ProfileSphereModal';
import { NewsletterModal } from '../components/NewsletterModal';
import { AnatomyDissectionModal } from '../components/AnatomyDissectionModal';
import { type Project } from '../data/portfolioData';

interface ShowcasePageProps {
  openResume: () => void;
  onNavigatePortfolio: () => void;
  onNavigateSkills: () => void;
  onNavigateSpace: () => void;
  onNavigateCommunity: () => void;
}

export const ShowcasePage: React.FC<ShowcasePageProps> = ({
  onNavigatePortfolio,
  onNavigateSpace
}) => {
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isNewsletterOpen, setIsNewsletterOpen] = useState(false);
  const [isAnatomyOpen, setIsAnatomyOpen] = useState(false);

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-[#020305]">
      {/* 3D Cylindrical Curved Showcase Carousel (jesperlandberg.com replica dedicated to Z Card) */}
      <ShowcaseCarousel3D
        onSelectProject={(p) => setSelectedProject(p)}
        onOpenProfile={() => setIsProfileOpen(true)}
        onOpenNewsletter={() => setIsNewsletterOpen(true)}
        onSwitchToBedroom={onNavigatePortfolio || onNavigateSpace}
        onOpenAnatomy={() => setIsAnatomyOpen(true)}
      />

      {/* Modals */}
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
};
