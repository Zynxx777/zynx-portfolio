import { useState, useEffect } from "react";
import { Navbar, type EcosystemView } from "./components/Navbar";
import { PortfolioPage } from "./pages/PortfolioPage";
import { BedroomSpacePage } from "./pages/BedroomSpacePage";
import { CommunityMusicPage } from "./pages/CommunityMusicPage";
import { Footer } from "./components/Footer";
import { ResumeModal } from "./components/ResumeModal";

export default function App() {
  const [currentView, setCurrentView] = useState<EcosystemView>(() => {
    const hash = window.location.hash.toLowerCase();
    if (hash.includes("space") || hash.includes("bedroom") || hash.includes("room")) return "space";
    if (hash.includes("community") || hash.includes("7ynx") || hash.includes("music") || hash.includes("gaming")) return "community";
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
    <div className="min-h-screen bg-[#030306] text-zinc-100 bg-cyber-grid relative selection:bg-cyan-400 selection:text-black">
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

      {/* Footer */}
      <Footer />

      {/* ATS Resume Modal & Print Engine */}
      <ResumeModal
        isOpen={isResumeOpen}
        onClose={() => setIsResumeOpen(false)}
      />
    </div>
  );
}
