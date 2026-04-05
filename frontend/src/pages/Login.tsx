import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { GraduationCap, Eye, EyeOff, Loader2, ArrowLeft } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import SplashCursor from "@/components/landing/SplashCursor";
import { AuroraBackground } from "@/components/landing/aurora-background";
import { ThemeToggle } from "@/components/ThemeToggle";
import { motion } from "framer-motion";
import api from "@/api/axios";


const Login = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await api.post("/auth/login/", {
        username,
        password,
      });

      // ✅ Save tokens
      localStorage.setItem("access_token", response.data.access);
      localStorage.setItem("refresh_token", response.data.refresh);

      // ✅ Decode token
      const payload = JSON.parse(
        atob(response.data.access.split(".")[1])
      );

      localStorage.setItem(
        "user",
        JSON.stringify({
          id: payload.user_id,
          is_staff: payload.is_staff,
          is_superuser: payload.is_superuser,
          is_hod: payload.is_hod,
        })
      );

      toast({
        title: "Login Successful",
        description: "Redirecting to dashboard",
      });

      // ✅ Redirect
      if (payload.is_staff) {
        navigate("/staff");
      } else {
        navigate("/student");
      }

    } catch (error) {
      toast({
        title: "Login Failed",
        description: "Invalid credentials",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuroraBackground className="!h-screen">
      <SplashCursor />
      {/* Navigation and Actions */}
      <div className="fixed top-4 left-4 z-50">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => navigate("/")}
          className="rounded-full"
        >
          <ArrowLeft className="h-5 w-5 text-primary" />
          <span className="sr-only">Go back</span>
        </Button>
      </div>

      <div className="fixed top-4 right-4 z-50">
        <ThemeToggle />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="w-full max-w-md relative z-10 p-4"
      >
        {/* Logo and Brand */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="text-center mb-8"
        >
          <motion.div
            className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-primary to-primary/70 rounded-3xl mb-4 shadow-xl shadow-primary/25"
            whileHover={{ scale: 1.05, rotate: 5 }}
            transition={{ type: "spring", stiffness: 300 }}
          >
            <GraduationCap className="w-10 h-10 text-primary-foreground" />
          </motion.div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
            NeoCampus
          </h1>
        </motion.div>

        {/* Login Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <Card className="border-border/50 shadow-2xl backdrop-blur-md bg-card/80 dark:bg-card/60 overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-primary/5 pointer-events-none" />
            <CardHeader className="text-center pb-4 relative">
              <CardTitle className="text-2xl font-bold">Welcome Back</CardTitle>
              <CardDescription className="text-base">
                Sign in to access your dashboard
              </CardDescription>
            </CardHeader>
            <CardContent className="relative">
              <form onSubmit={handleLogin} className="space-y-5">
                <motion.div
                  className="space-y-2"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 }}
                >
                  <Label htmlFor="collegeId" className="text-sm font-medium">College ID</Label>
                  <Input
                    id="collegeId"
                    type="text"
                    placeholder="Enter your college ID"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    required
                    className="h-12 bg-background/50 border-border/50 focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
                  />
                </motion.div>

                <motion.div
                  className="space-y-2"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.4 }}
                >
                  <Label htmlFor="password" className="text-sm font-medium">Password</Label>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="Enter your password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      className="h-12 pr-12 bg-background/50 border-border/50 focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors p-1 rounded-md hover:bg-muted/50"
                    >
                      {showPassword ? (
                        <EyeOff className="w-5 h-5" />
                      ) : (
                        <Eye className="w-5 h-5" />
                      )}
                    </button>
                  </div>
                </motion.div>


                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.6 }}
                >
                  <Button
                    type="submit"
                    className="w-full h-12 text-base font-semibold bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary shadow-lg shadow-primary/25 transition-all duration-300"
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                        Signing in...
                      </>
                    ) : (
                      "Sign In"
                    )}
                  </Button>
                </motion.div>

                {/* Quick Login Buttons */}
                <motion.div
                  className="flex flex-wrap gap-2 justify-center pt-2"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.65 }}
                >
                  <span className="w-full text-center text-xs text-muted-foreground mb-1">Quick Demo Login</span>
                  <button
                    type="button"
                    onClick={() => { setUsername("rushi"); setPassword("Pass@123"); }}
                    className="px-3 py-1.5 text-xs font-medium rounded-full bg-primary/10 text-primary hover:bg-primary/20 border border-primary/20 transition-all"
                  >
                    Student
                  </button>
                  <button
                    type="button"
                    onClick={() => { setUsername("sarang"); setPassword("sarang"); }}
                    className="px-3 py-1.5 text-xs font-medium rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/20 border border-emerald-500/20 transition-all"
                  >
                    Staff
                  </button>
                  <button
                    type="button"
                    onClick={() => { setUsername("Tambe"); setPassword("Pass@123"); }}
                    className="px-3 py-1.5 text-xs font-medium rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 hover:bg-amber-500/20 border border-amber-500/20 transition-all"
                  >
                    HOD
                  </button>
                </motion.div>
              </form>

              {/* Admin Note */}
              <motion.div
                className="mt-6 p-4 bg-muted/30 dark:bg-muted/20 rounded-xl border border-border/30"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.7 }}
              >
                <p className="text-xs text-muted-foreground text-center leading-relaxed">
                  <span className="font-semibold text-foreground/80">Admin?</span> Use <a href="http://127.0.0.1:8000/admin/" className="text-primary hover:underline font-medium">admin portal</a> for administrative access.
                </p>
              </motion.div>
            </CardContent>
          </Card>
        </motion.div>

      </motion.div>
    </AuroraBackground>
  );
};

export default Login;
