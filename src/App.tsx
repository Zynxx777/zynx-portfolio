import { useState } from "react";
import { Navbar } from "./components/Navbar";
import { Hero } from "./components/Hero";
import { Projects3D } from "./components/Projects3D";
import { Room3DStudio } from "./components/Room3DStudio";
import { SoundLab } from "./components/SoundLab";
import { SkillsMatrix } from "./components/SkillsMatrix";
import { ExperienceTimeline } from "./components/ExperienceTimeline";
import { ContactTerminal } from "./components/ContactTerminal";
import { Footer } from "./components/Footer";
import { ResumeModal } from "./components/ResumeModal";

export default function App() {
  const [activeTab, setActiveTab] = useState<string>("hero");
  const [isResumeOpen, setIsResumeOpen] = useState<boolean>(false);

  const scrollToSection = (id: string) => {
    setActiveTab(id);
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <div className="min-h-screen bg-[#030306] text-zinc-100 bg-cyber-grid relative selection:bg-cyan-400 selection:text-black">
      {/* Top Navbar */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        openResume={() => setIsResumeOpen(true)}
      />

      {/* Main Experience Stream */}
      <main>
        {/* Origin / Hero with Lusion Fluid Particles */}
        <Hero
          openResume={() => setIsResumeOpen(true)}
          scrollToSection={scrollToSection}
        />

        {/* 01 // Projects 3D with moto-card Tilt */}
        <Projects3D />

        {/* 02 // 3D Digital Room & Workstation with Three.js (aengel.io / CGTrader style) */}
        <Room3DStudio />

        {/* 03 // 7YNX Sound Lab with Web Audio FFT Visualizer */}
        <SoundLab />

        {/* 04 // Technical Capabilities Arsenal */}
        <SkillsMatrix />

        {/* 05 // Career & Academic Timeline */}
        <ExperienceTimeline />

        {/* 06 // Contact Transmission Terminal */}
        <ContactTerminal />
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
