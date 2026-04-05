import { Card, CardContent } from "@/components/ui/card";
import { Loader2, FileSearch } from "lucide-react";

export function AnalysisProcessing() {
  return (
    <Card className="max-w-xl mx-auto">
      <CardContent className="py-16 text-center space-y-6">
        <div className="relative mx-auto w-20 h-20">
          <div className="absolute inset-0 rounded-full bg-primary/20 animate-ping" />
          <div className="relative w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center">
            <FileSearch className="h-10 w-10 text-primary" />
          </div>
        </div>
        
        <div className="space-y-2">
          <h3 className="text-lg font-semibold text-foreground">
            Analyzing Result Data
          </h3>
          <p className="text-muted-foreground">
            Parsing PDF and generating institutional report...
          </p>
        </div>

        <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" />
          Please wait, this may take a moment
        </div>
      </CardContent>
    </Card>
  );
}
