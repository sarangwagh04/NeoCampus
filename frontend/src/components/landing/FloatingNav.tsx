import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { GraduationCap, LogIn, MessageSquare, ArrowUp, Sun, Moon, Droplets } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTheme } from "next-themes";
import { motion, AnimatePresence } from "framer-motion";


interface FloatingNavProps {
  splashCursorEnabled: boolean;
  onToggleSplashCursor: () => void;
}

export const FloatingNav = ({ splashCursorEnabled, onToggleSplashCursor }: FloatingNavProps) => {
  const [isScrolled, setIsScrolled] = useState(false);
  const { theme, setTheme } = useTheme();

  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY;
      setIsScrolled(scrollY > 300);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth"
    });
  };

  const toggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark");
  };

  return (
    <>
      {/* Top Left - Logo Capsule (only shows when scrolled) */}
      <AnimatePresence>
        {isScrolled && (
          <motion.div
            className="fixed top-4 left-4 z-50"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
          >
            <Link to="/">
              <div className="flex items-center gap-2 bg-background/80 backdrop-blur-md border border-border/50 rounded-full px-3 py-2 h-10 shadow-lg hover:bg-background/90 transition-all duration-300">
                <div className="w-6 h-6 bg-primary rounded-lg flex items-center justify-center">
                  <GraduationCap className="w-3.5 h-3.5 text-primary-foreground" />
                </div>
                <span className="text-sm font-bold text-foreground pr-1">NeoCampus</span>
              </div>
            </Link>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Top Right - Controls Capsule */}
      <motion.div
        className="fixed top-4 right-4 z-50 flex items-center gap-2"
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5 }}
      >
        {/* Ask Neo - appears when scrolled (leftmost when visible) */}
        <AnimatePresence>
          {isScrolled && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              transition={{ duration: 0.3 }}
            >
              <Button
                asChild
                size="sm"
                variant="outline"
                className="rounded-full h-10 w-10 bg-background/80 backdrop-blur-md border-border/50 shadow-lg hover:bg-background/90 text-foreground"
              >
                <Link to="/chatbot">
                  <MessageSquare className="h-4 w-4" />
                </Link>
              </Button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Combined Toggle Capsule */}
        <div className="flex items-center bg-background/80 backdrop-blur-md border border-border/50 rounded-full shadow-lg h-10 px-1">
          {/* Splash Effect Toggle */}
          <Button
            variant="ghost"
            size="sm"
            onClick={onToggleSplashCursor}
            className={`rounded-full h-8 w-8 p-0 transition-colors ${
              splashCursorEnabled 
                ? "text-primary bg-primary/10" 
                : "text-muted-foreground hover:text-foreground"
            }`}
            title={splashCursorEnabled ? "Disable splash effect" : "Enable splash effect"}
          >
            <Droplets className="h-4 w-4" />
          </Button>

          {/* Divider */}
          <div className="w-px h-5 bg-border/50 mx-0.5" />

          {/* Theme Toggle */}
          <Button
            variant="ghost"
            size="sm"
            onClick={toggleTheme}
            className="rounded-full h-8 w-8 p-0 text-muted-foreground hover:text-foreground transition-colors"
            title={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
          >
            {theme === "dark" ? (
              <Sun className="h-4 w-4" />
            ) : (
              <Moon className="h-4 w-4" />
            )}
          </Button>
        </div>

        {/* Login Button */}
        <Button
          asChild
          size="sm"
          className="rounded-full shadow-lg h-10 w-10 p-0"
        >
          <Link to="/login">
            <LogIn className="h-4 w-4" />
          </Link>
        </Button>
      </motion.div>

      {/* Bottom Right - Ask Neo / Scroll to Top */}
      <motion.div
        className="fixed bottom-6 right-6 z-50"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        <AnimatePresence mode="wait">
          {isScrolled ? (
            <motion.div
              key="scroll-top"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
            >
              <Button
                onClick={scrollToTop}
                size="sm"
                className="rounded-full shadow-lg h-10 w-10 p-0"
                aria-label="Scroll to top"
              >
                <ArrowUp className="w-4 h-4" />
              </Button>
            </motion.div>
          ) : (
            <motion.div
              key="ask-neo"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
            >
              <Button
                asChild
                size="sm"
                className="rounded-full shadow-lg h-10 px-4 gap-2"
              >
                <Link to="/chatbot">
                  <MessageSquare className="w-4 h-4" />
                  <span className="text-sm font-medium">Ask Neo</span>
                </Link>
              </Button>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </>
  );
};
