import { FileQuestion, RefreshCw, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ResultsEmptyStateProps {
  type: "not-published" | "error" | "no-data";
  semester?: number;
  onRetry?: () => void;
}

export function ResultsEmptyState({ type, semester, onRetry }: ResultsEmptyStateProps) {
  const content = {
    "not-published": {
      icon: Clock,
      title: "Results Not Yet Published",
      description: `Results for Semester ${semester} are not yet published. Please check back later or contact the examination department for more information.`,
      showRetry: false,
    },
    "error": {
      icon: FileQuestion,
      title: "Unable to Load Results",
      description: "Result data could not be loaded. This might be a temporary issue. Please try again later.",
      showRetry: true,
    },
    "no-data": {
      icon: FileQuestion,
      title: "No Results Found",
      description: "No examination results are available for your account. If you believe this is an error, please contact the examination department.",
      showRetry: false,
    },
  };

  const { icon: Icon, title, description, showRetry } = content[type];

  return (
    <div className="bg-card rounded-xl border border-border shadow-soft p-12 text-center">
      <div className="flex flex-col items-center gap-4">
        <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center">
          <Icon className="w-8 h-8 text-muted-foreground" />
        </div>
        <div className="space-y-2">
          <h3 className="text-lg font-semibold text-foreground">{title}</h3>
          <p className="text-sm text-muted-foreground max-w-md mx-auto">
            {description}
          </p>
        </div>
        {showRetry && onRetry && (
          <Button variant="outline" onClick={onRetry} className="mt-4 gap-2">
            <RefreshCw className="w-4 h-4" />
            Try Again
          </Button>
        )}
      </div>
    </div>
  );
}
