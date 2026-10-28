import { useState, useEffect, lazy, Suspense } from "react";
import { Navbar, type EcosystemView } from "./components/Navbar";
import { PortfolioPage } from "./pages/PortfolioPage";
import { Footer } from "./components/Footer";
import { ResumeModal } from "./components/ResumeModal";
import { AmbientCosmicCanvas } from "./components/AmbientCosmicCanvas";
import { CustomAuraCursor } from "./components/CustomAuraCursor";

const SkillsUniversePage = lazy(() => import("./pages/SkillsUniversePage").then((module) => ({ default: module.SkillsUniversePage })));
const BedroomSpacePage = lazy(() => import("./pages/BedroomSpacePage").then((module) => ({ default: module.BedroomSpacePage })));
const CommunityMusicPage = lazy(() => import("./pages/CommunityMusicPage").then((module) => ({ default: module.CommunityMusicPage })));
const ShowcasePage = lazy(() => import("./pages/ShowcasePage").then((module) => ({ default: module.ShowcasePage })));

export default function App() {
  const [currentView, setCurrentView] = useState<EcosystemView>(() => {
    const hash = window.location.hash.toLowerCase();
    if (hash.includes("space") || hash.includes("bedroom") || hash.includes("room") || hash.includes("desk")) return "space";
    if (hash.includes("community") || hash.includes("7ynx") || hash.includes("music") || hash.includes("gaming")) return "community";
    if (hash.includes("skills") || hash.includes("arsenal") || hash.includes("tech")) return "skills";
    if (hash.includes("showcase") || hash.includes("index")) return "showcase";
    return "portfolio";
  });

  const [isResumeOpen, setIsResumeOpen] = useState<boolean>(false);

  // Sync hash changes (browser back/forward button)
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.toLowerCase();
      if (hash.includes("space") || hash.includes("bedroom") || hash.includes("room") || hash.includes("desk")) {
        setCurrentView("space");
      } else if (hash.includes("community") || hash.includes("7ynx") || hash.includes("music") || hash.includes("gaming")) {
        setCurrentView("community");
      } else if (hash.includes("skills") || hash.includes("arsenal") || hash.includes("tech")) {
        setCurrentView("skills");
      } else if (hash.includes("showcase") || hash.includes("index")) {
        setCurrentView("showcase");
      } else if (!hash || hash === "#") {
        setCurrentView("portfolio");
      }
    };

    window.addEventListener("hashchange", handleHashChange);
    return () => window.removeEventListener("hashchange", handleHashChange);
  }, []);

  const handleNavigate = (view: EcosystemView) => {
    setCurrentView(view);
    window.location.hash = view === "portfolio" ? "" : view === "space" ? "desk" : view;
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className="min-h-screen bg-[#07080d] text-zinc-100 relative selection:bg-cyan-400 selection:text-black">
      {/* Living Cosmic Noir Background & Film Grain Overlay (Replaces flat black) */}
      {currentView !== "space" && currentView !== "showcase" && <AmbientCosmicCanvas />}

      {/* Non-intrusive interactive magnetic cursor aura */}
      {currentView !== "space" && currentView !== "showcase" && <CustomAuraCursor />}

      {/* Top Universal Navbar & Ecosystem Switcher */}
      {currentView !== "space" && currentView !== "showcase" && (
        <Navbar
          currentView={currentView}
          setCurrentView={handleNavigate}
          openResume={() => setIsResumeOpen(true)}
        />
      )}

      {/* Main Active Independent Website / Webpage */}
      <main>
        <Suspense fallback={<div aria-live="polite" className="flex min-h-[60vh] items-center justify-center px-6 text-sm text-zinc-400">Loading page…</div>}>
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

          {currentView === "showcase" && (
            <ShowcasePage
              openResume={() => setIsResumeOpen(true)}
              onNavigatePortfolio={() => handleNavigate("portfolio")}
              onNavigateSkills={() => handleNavigate("skills")}
              onNavigateSpace={() => handleNavigate("space")}
              onNavigateCommunity={() => handleNavigate("community")}
            />
          )}

          {currentView === "space" && (
            <BedroomSpacePage
              onNavigatePortfolio={() => handleNavigate("portfolio")}
              onNavigateCommunity={() => handleNavigate("community")}
              onNavigateShowcase={() => handleNavigate("showcase")}
            />
          )}

          {currentView === "community" && (
            <CommunityMusicPage
              onNavigatePortfolio={() => handleNavigate("portfolio")}
              onNavigateSpace={() => handleNavigate("space")}
            />
          )}
        </Suspense>
      </main>

      {/* Footer (Rendered on standard pages, hidden in full-screen 3D sanctuary) */}
      {currentView !== "space" && currentView !== "showcase" && (
        <Footer
          onNavigatePortfolio={() => handleNavigate("portfolio")}
          onNavigateSpace={() => handleNavigate("space")}
          onNavigateCommunity={() => handleNavigate("community")}
          onNavigateSkills={() => handleNavigate("skills")}
          onNavigateShowcase={() => handleNavigate("showcase")}
        />
      )}

      {/* ATS Resume Modal & Print Engine */}
      <ResumeModal
        isOpen={isResumeOpen}
        onClose={() => setIsResumeOpen(false)}
      />
    </div>
  );
}
