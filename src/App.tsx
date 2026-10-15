import { useState, useEffect } from "react";
import { Navbar, type EcosystemView } from "./components/Navbar";
import { PortfolioPage } from "./pages/PortfolioPage";
import { SkillsUniversePage } from "./pages/SkillsUniversePage";
import { BedroomSpacePage } from "./pages/BedroomSpacePage";
import { CommunityMusicPage } from "./pages/CommunityMusicPage";
import { Footer } from "./components/Footer";
import { ResumeModal } from "./components/ResumeModal";
import { AmbientCosmicCanvas } from "./components/AmbientCosmicCanvas";
import { CustomAuraCursor } from "./components/CustomAuraCursor";

export default function App() {
  const [currentView, setCurrentView] = useState<EcosystemView>(() => {
    const hash = window.location.hash.toLowerCase();
    if (hash.includes("space") || hash.includes("bedroom") || hash.includes("room")) return "space";
    if (hash.includes("community") || hash.includes("7ynx") || hash.includes("music") || hash.includes("gaming")) return "community";
    if (hash.includes("skills") || hash.includes("arsenal") || hash.includes("tech")) return "skills";
    return "portfolio";
  });

  const [isResumeOpen, setIsResumeOpen] = useState<boolean>(false);

  // Sync hash changes (browser back/forward button)
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.toLowerCase();
      if (hash.includes("space") || hash.includes("bedroom") || hash.includes("room")) {
        setCurrentView("space");
      } else if (hash.includes("community") || hash.includes("7ynx") || hash.includes("music") || hash.includes("gaming")) {
        setCurrentView("community");
      } else if (hash.includes("skills") || hash.includes("arsenal") || hash.includes("tech")) {
        setCurrentView("skills");
      } else {
        setCurrentView("portfolio");
      }
    };

    window.addEventListener("hashchange", handleHashChange);
    return () => window.removeEventListener("hashchange", handleHashChange);
  }, []);

  const handleNavigate = (view: EcosystemView) => {
    setCurrentView(view);
    window.location.hash = view === "portfolio" ? "" : view;
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className="min-h-screen bg-[#07080d] text-zinc-100 relative selection:bg-cyan-400 selection:text-black">
      {/* Living Cosmic Noir Background & Film Grain Overlay (Replaces flat black) */}
      {currentView !== "space" && <AmbientCosmicCanvas />}

      {/* Non-intrusive interactive magnetic cursor aura */}
      {currentView !== "space" && <CustomAuraCursor />}

      {/* Top Universal Navbar & Ecosystem Switcher */}
      <Navbar
        currentView={currentView}
        setCurrentView={handleNavigate}
        openResume={() => setIsResumeOpen(true)}
      />

      {/* Main Active Independent Website / Webpage */}
      <main>
        {currentView === "portfolio" && (
          <PortfolioPage
            openResume={() => setIsResumeOpen(true)}
            onNavigateSpace={() => handleNavigate("space")}
            onNavigateCommunity={() => handleNavigate("community")}
            onNavigateSkills={() => handleNavigate("skills")}
          />
        )}

        {currentView === "skills" && (
          <SkillsUniversePage
            onNavigatePortfolio={() => handleNavigate("portfolio")}
            onNavigateSpace={() => handleNavigate("space")}
            onNavigateCommunity={() => handleNavigate("community")}
          />
        )}

        {currentView === "space" && (
          <BedroomSpacePage
            onNavigatePortfolio={() => handleNavigate("portfolio")}
            onNavigateCommunity={() => handleNavigate("community")}
          />
        )}

        {currentView === "community" && (
          <CommunityMusicPage
            onNavigatePortfolio={() => handleNavigate("portfolio")}
            onNavigateSpace={() => handleNavigate("space")}
          />
        )}
      </main>

      {/* Footer (Rendered on standard pages, hidden in full-screen 3D sanctuary) */}
      {currentView !== "space" && <Footer />}

      {/* ATS Resume Modal & Print Engine */}
      <ResumeModal
        isOpen={isResumeOpen}
        onClose={() => setIsResumeOpen(false)}
      />
    </div>
  );
}
