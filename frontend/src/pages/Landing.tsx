import { useState } from "react";
import { HeroSection } from "@/components/landing/HeroSection";
import { FeaturesSection } from "@/components/landing/FeaturesSection";
import { RoleBenefitsSection } from "@/components/landing/RoleBenefitsSection";
import { WorkflowSection } from "@/components/landing/WorkflowSection";
import { TeamSection } from "@/components/landing/TeamSection";
import { SecuritySection } from "@/components/landing/SecuritySection";
import { ResponsiveSection } from "@/components/landing/ResponsiveSection";
import { Footer } from "@/components/landing/Footer";
import { FloatingNav } from "@/components/landing/FloatingNav";
import SplashCursor from "@/components/landing/SplashCursor";
import { AuroraBackground } from "@/components/landing/aurora-background";

const Landing = () => {
  const [splashCursorEnabled, setSplashCursorEnabled] = useState(true);

  return (
    <AuroraBackground className="!h-auto !min-h-screen">
      <div className="min-h-screen w-full relative z-10">
        {splashCursorEnabled && (
          <SplashCursor 
            SPLAT_RADIUS={0.35}
            SPLAT_FORCE={8000}
            DYE_RESOLUTION={1440}
            DENSITY_DISSIPATION={2.5}
            VELOCITY_DISSIPATION={1.5}
            COLOR_UPDATE_SPEED={15}
          />
        )}
        <FloatingNav 
          splashCursorEnabled={splashCursorEnabled} 
          onToggleSplashCursor={() => setSplashCursorEnabled(!splashCursorEnabled)} 
        />
        <main>
          <HeroSection />
          <FeaturesSection />
          <RoleBenefitsSection />
          <WorkflowSection />
          <TeamSection />
          <SecuritySection />
          <ResponsiveSection />
        </main>
        <Footer />
      </div>
    </AuroraBackground>
  );
};

export default Landing;
