import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ChatInterface } from "@/components/chatbot/ChatInterface";
import { ThemeToggle } from "@/components/ThemeToggle";

export default function PublicChatbot() {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Simple Header */}
      <header className="h-16 border-b border-border bg-card/50 backdrop-blur-sm px-6 flex items-center justify-between sticky top-0 z-50">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" asChild>
            <Link to="/" className="flex items-center gap-2">
              <ArrowLeft className="h-4 w-4" />
              Back to Home
            </Link>
          </Button>
          <div className="h-6 w-px bg-border" />
          <div className="flex items-center gap-2">
            <span className="text-lg font-semibold text-foreground">NeoCampus</span>
            <span className="text-muted-foreground">•</span>
            <span className="text-sm text-muted-foreground">Academic Chatbot</span>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <ThemeToggle />
          <Button asChild>
            <Link to="/login">Login</Link>
          </Button>
        </div>
      </header>

      {/* Chat Interface - Full Height */}
      <div className="flex-1 overflow-hidden">
        <ChatInterface variant="fullscreen" />
      </div>
    </div>
  );
}
