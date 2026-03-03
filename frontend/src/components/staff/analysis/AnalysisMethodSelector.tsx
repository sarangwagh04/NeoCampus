import { useState, useRef } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { FileText, Sparkles, Check, Lock, Zap, Brain, TrendingUp, BarChart3, FlaskConical, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { SparkleParticles } from "@/components/ui/sparkle-particles";
import type { AnalysisMethod } from "@/hooks/useResultAnalysis";
// import * as XLSX from "xlsx";

interface AnalysisMethodSelectorProps {
  onSelect: (method: AnalysisMethod) => void;
}

export function AnalysisMethodSelector({ onSelect }: AnalysisMethodSelectorProps) {
  const [isHoveringAI, setIsHoveringAI] = useState(false);
  
  const [isTryoutProcessing, setIsTryoutProcessing] = useState(false);
  const tryoutFileRef = useRef<HTMLInputElement>(null);

  const handleTryoutFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsTryoutProcessing(true);

    try {
      // ================================
      // 🔁 CHANGED: Removed mock delay
      // Previously: Simulated 2-second delay
      // Now: Real backend call
      // ================================

      // ================================
      // 🔁 CHANGED: Removed mock Excel generation logic
      // Previously: Local XLSX generation using hardcoded arrays
      // Now: Send PDF to backend AI endpoint
      // ================================

      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch("/api/result-analysis/ai-tryout/", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Failed to process PDF");
      }

      // ================================
      // 🔁 NEW: Handle Excel file returned from backend
      // ================================

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);

      const a = document.createElement("a");
      a.href = url;
      a.download = "AI_Result_Analysis.xlsx";
      document.body.appendChild(a);
      a.click();
      a.remove();

      window.URL.revokeObjectURL(url);

    } catch (error) {
      console.error("AI Tryout Error:", error);
      alert("Failed to process PDF. Please try again.");
    } finally {
      setIsTryoutProcessing(false);
      if (tryoutFileRef.current) tryoutFileRef.current.value = "";
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <h2 className="text-xl font-semibold text-foreground">Choose Analysis Method</h2>
        <p className="text-muted-foreground">
          Select how you'd like to generate your result analysis report
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
        {/* Traditional Analysis - Free */}
        <Card className="relative overflow-hidden hover:shadow-lg transition-all duration-300 border-2 hover:border-primary/50 cursor-pointer group">
          <div className="absolute top-4 right-4">
            <Badge variant="secondary" className="bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400">
              Free
            </Badge>
          </div>
          <CardHeader className="pb-4">
            <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
              <FileText className="h-7 w-7 text-primary" />
            </div>
            <CardTitle className="text-lg">Traditional Result Analysis</CardTitle>
            <CardDescription className="text-sm">
              Generate result analysis using structured PDF parsing and predefined institutional rules.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li className="flex items-center gap-2">
                <Check className="h-4 w-4 text-emerald-500" />
                Standard institutional format
              </li>
              <li className="flex items-center gap-2">
                <Check className="h-4 w-4 text-emerald-500" />
                Subject-wise analysis tables
              </li>
              <li className="flex items-center gap-2">
                <Check className="h-4 w-4 text-emerald-500" />
                Class toppers & summaries
              </li>
              <li className="flex items-center gap-2">
                <Check className="h-4 w-4 text-emerald-500" />
                PDF download ready
              </li>
            </ul>
            <Button 
              className="w-full mt-4" 
              onClick={() => onSelect("traditional")}
            >
              Proceed with Traditional Analysis
            </Button>
          </CardContent>
        </Card>

        {/* AI Analysis - Premium Coming Soon */}
        <Card 
          className={cn(
            "relative overflow-hidden border-2 border-violet-500/30 group cursor-default transition-all duration-300",
            "bg-gradient-to-br from-violet-50/80 via-background to-purple-50/80",
            "dark:from-violet-950/40 dark:via-background dark:to-purple-950/40",
            isHoveringAI && "border-violet-500/50 shadow-xl shadow-violet-500/20"
          )}
          onMouseEnter={() => setIsHoveringAI(true)}
          onMouseLeave={() => setIsHoveringAI(false)}
        >
          {/* Sparkle particles on hover */}
          <SparkleParticles isActive={isHoveringAI} />
          
          {/* Animated gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-r from-violet-500/0 via-violet-500/10 to-violet-500/0 animate-[shimmer_3s_ease-in-out_infinite]" />
          
          {/* Gloss effect */}
          <div className="absolute inset-0 bg-gradient-to-br from-white/20 via-transparent to-transparent pointer-events-none" />
          
          {/* Floating sparkles */}
          <div className="absolute top-8 left-8 animate-pulse">
            <Sparkles className="h-3 w-3 text-violet-400/60" />
          </div>
          <div className="absolute top-16 right-16 animate-pulse" style={{ animationDelay: "0.5s" }}>
            <Sparkles className="h-2 w-2 text-purple-400/60" />
          </div>
          <div className="absolute bottom-20 left-12 animate-pulse" style={{ animationDelay: "1s" }}>
            <Sparkles className="h-2.5 w-2.5 text-violet-400/60" />
          </div>
          <div className="absolute bottom-32 right-8 animate-pulse" style={{ animationDelay: "1.5s" }}>
            <Zap className="h-3 w-3 text-amber-400/60" />
          </div>
          
          {/* Glow effect behind card */}
          <div className="absolute -inset-1 rounded-xl bg-gradient-to-r from-violet-500/20 via-purple-500/30 to-violet-500/20 blur-xl -z-10 opacity-60 group-hover:opacity-80 transition-opacity" />
          
          <div className="absolute top-4 right-4 flex gap-2">
            <Badge className="bg-gradient-to-r from-violet-500 to-purple-600 text-white border-0 shadow-lg shadow-violet-500/25">
              <Sparkles className="h-3 w-3 mr-1 animate-pulse" />
              Premium
            </Badge>
          </div>
          <CardHeader className="pb-4 relative">
            <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-violet-500/30 to-purple-500/30 flex items-center justify-center mb-4 shadow-lg shadow-violet-500/20 group-hover:shadow-violet-500/30 transition-shadow">
              <Brain className="h-7 w-7 text-violet-500" />
            </div>
            <CardTitle className="text-lg bg-gradient-to-r from-violet-600 to-purple-600 dark:from-violet-400 dark:to-purple-400 bg-clip-text text-transparent">
              AI-Powered Result Analysis
            </CardTitle>
            <CardDescription className="text-sm">
              AI-assisted result interpretation with deeper insights and automated validations.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 relative">
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li className="flex items-center gap-2">
                <Zap className="h-4 w-4 text-amber-500" />
                Intelligent data extraction
              </li>
              <li className="flex items-center gap-2">
                <BarChart3 className="h-4 w-4 text-violet-500" />
                Anomaly detection
              </li>
              <li className="flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-emerald-500" />
                Performance predictions
              </li>
              <li className="flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-purple-500" />
                Comparative analytics
              </li>
            </ul>
            
            <div className="pt-2 border-t border-violet-200/50 dark:border-violet-800/50">
              <p className="text-xs text-muted-foreground mb-3">
                Pricing: <span className="font-medium bg-gradient-to-r from-violet-600 to-purple-600 dark:from-violet-400 dark:to-purple-400 bg-clip-text text-transparent">₹99 / Analysis</span> or Institution Plan
              </p>
              <div className="flex gap-2">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button 
                      className="flex-1 bg-gradient-to-r from-violet-500/20 to-purple-500/20 text-violet-700 dark:text-violet-300 border border-violet-300 dark:border-violet-700 hover:from-violet-500/30 hover:to-purple-500/30 cursor-not-allowed" 
                      variant="outline"
                    >
                      <Lock className="h-4 w-4 mr-2" />
                      Coming Soon
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>This feature will be available in a future update.</p>
                  </TooltipContent>
                </Tooltip>
                
                <input
                  ref={tryoutFileRef}
                  type="file"
                  accept=".pdf"
                  onChange={handleTryoutFile}
                  className="hidden"
                />
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="outline"
                      className="border-violet-300 dark:border-violet-700 text-violet-600 dark:text-violet-400 hover:bg-violet-500/10"
                      onClick={() => tryoutFileRef.current?.click()}
                      disabled={isTryoutProcessing}
                    >
                      {isTryoutProcessing ? (
                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      ) : (
                        <FlaskConical className="h-3.5 w-3.5" />
                      )}
                      Try
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Upload a PDF to preview AI analysis output</p>
                  </TooltipContent>
                </Tooltip>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
