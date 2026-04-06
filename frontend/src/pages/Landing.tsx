import { useEffect, useState } from "react";
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

useEffect(() => {
  const existingToken = localStorage.getItem("access_token");
  if (existingToken) return; // already logged in

    const initAuthCheck = async () => {
      try {
        // 1. Wake up the listener because we are on the landing page
        await fetch("http://127.0.0.1:8000/api/home/hardware-listener-state/", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ active: true })
        });
      } catch (err) {
        console.error("Failed to wake up listener", err);
      }
    };
    initAuthCheck();

    const interval = setInterval(async () => {
      try {
        const res = await fetch(
          "http://127.0.0.1:8000/api/home/hardware-auth-status/"
        );
      const data = await res.json();

      if (data.access) {
        localStorage.setItem("access_token", data.access);
        localStorage.setItem("refresh_token", data.refresh);

        const payload = JSON.parse(atob(data.access.split(".")[1]));

        localStorage.setItem(
          "user",
          JSON.stringify({
            id: payload.user_id,
            is_staff: payload.is_staff,
            is_superuser: payload.is_superuser,
            is_hod: payload.is_hod,
          })
        );

        await fetch(
          "http://127.0.0.1:8000/api/home/delete-hardware-auth/"
        );

        clearInterval(interval);

        if (payload.is_staff) {
          window.location.href = "/staff";
        } else {
          window.location.href = "/student";
        }
      }
    } catch (error) {
      console.error("Error during hardware auth check:", error);
    }
  }, 50);

  return () => clearInterval(interval);
}, []);

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
