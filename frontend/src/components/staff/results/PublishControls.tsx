import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Send, RotateCcw, CheckCircle2, Loader2, PartyPopper } from "lucide-react";
import { cn } from "@/lib/utils";

interface PublishControlsProps {
  isActive: boolean;
  isPublished: boolean;
  isLoading: boolean;
  onPublish: () => void;
  onReset: () => void;
}

export function PublishControls({
  isActive,
  isPublished,
  isLoading,
  onPublish,
  onReset,
}: PublishControlsProps) {
  const [dialogOpen, setDialogOpen] = useState(false);

  const handleConfirmPublish = () => {
    setDialogOpen(false);
    onPublish();
  };

  if (isPublished) {
    return (
      <Card className="ring-2 ring-success/50 bg-success/5 transition-all duration-300">
        <CardContent className="py-12">
          <div className="flex flex-col items-center text-center gap-4">
            <div className="w-16 h-16 rounded-full bg-success/20 flex items-center justify-center">
              <PartyPopper className="h-8 w-8 text-success" />
            </div>
            <div>
              <h3 className="text-xl font-semibold text-foreground mb-2">
                Results Published Successfully!
              </h3>
              <p className="text-muted-foreground max-w-md">
                Results are now visible to students. Official marksheets have been generated
                and are available in the student dashboard.
              </p>
            </div>
            <Button variant="outline" onClick={onReset} className="gap-2 mt-4">
              <RotateCcw className="h-4 w-4" />
              Upload More Results
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={cn(
      "transition-all duration-300",
      isActive ? "ring-2 ring-primary/50" : "opacity-60"
    )}>
      <CardHeader>
        <div className="flex items-center gap-3">
          <div className={cn(
            "w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold",
            isActive ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
          )}>
            4
          </div>
          <div className="flex-1">
            <CardTitle className="text-lg flex items-center gap-2">
              <Send className="h-5 w-5 text-primary" />
              Publish Results
            </CardTitle>
            <CardDescription>
              Review and publish results to make them visible to students
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {!isActive ? (
          <p className="text-sm text-muted-foreground">Complete previous steps to publish</p>
        ) : (
          <div className="flex items-center gap-4">
            <AlertDialog open={dialogOpen} onOpenChange={setDialogOpen}>
              <AlertDialogTrigger asChild>
                <Button className="gap-2" disabled={isLoading}>
                  {isLoading ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Publishing...
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="h-4 w-4" />
                      Publish Results
                    </>
                  )}
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Confirm Publication</AlertDialogTitle>
                  <AlertDialogDescription>
                    Once published, results will be immediately visible to all students.
                    Official marksheets will be generated automatically. This action cannot
                    be undone without admin authorization.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={handleConfirmPublish}>
                    Yes, Publish Results
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>

            <Button variant="outline" onClick={onReset} className="gap-2">
              <RotateCcw className="h-4 w-4" />
              Start Over
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
