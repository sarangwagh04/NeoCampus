import { Bot, Sparkles, BookOpen, ChevronDown, Check } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

export interface Subject {
  id: string;
  name: string;
  code: string;
  chunksAvailable: boolean;
}

interface ChatHeaderProps {
  selectedSubject?: Subject | null;
  isTyping?: boolean;
  subjects?: Subject[];
  onSelectSubject?: (subject: Subject) => void;
}

export function ChatHeader({ selectedSubject, isTyping, subjects = [], onSelectSubject }: ChatHeaderProps) {
  const availableSubjects = subjects;

  return (
    <div className="border-b border-border bg-card/80 backdrop-blur-sm px-6 py-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          {/* Neo Avatar with pulse animation */}
          <div className="relative">
            <motion.div 
              className="w-12 h-12 rounded-full bg-gradient-to-br from-primary via-primary/80 to-primary/60 flex items-center justify-center shadow-lg"
              animate={isTyping ? { scale: [1, 1.05, 1] } : {}}
              transition={{ duration: 1.5, repeat: Infinity }}
            >
              <Bot className="h-6 w-6 text-primary-foreground" />
            </motion.div>
            {/* Online indicator */}
            <motion.div 
              className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-success rounded-full border-2 border-background"
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
            />
            {/* Typing ripple effect */}
            {isTyping && (
              <motion.div
                className="absolute inset-0 rounded-full border-2 border-primary"
                initial={{ scale: 1, opacity: 0.5 }}
                animate={{ scale: 1.5, opacity: 0 }}
                transition={{ duration: 1, repeat: Infinity }}
              />
            )}
          </div>

          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-bold text-foreground">Neo</h2>
              <Badge variant="secondary" className="text-xs gap-1 bg-primary/10 text-primary border-0">
                <Sparkles className="h-3 w-3" />
                AI
              </Badge>
            </div>
            <motion.p 
              className="text-sm text-muted-foreground"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              key={isTyping ? "typing" : "ready"}
            >
              {isTyping ? (
                <span className="text-primary">Typing...</span>
              ) : (
                "Your academic companion"
              )}
            </motion.p>
          </div>
        </div>

        {/* Subject Selector Dropdown - Top Right */}
        {subjects.length > 0 && onSelectSubject && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                className={cn(
                  "min-w-[160px] justify-between gap-2 rounded-full",
                  selectedSubject && "border-primary/50 bg-primary/5"
                )}
              >
                <span className="flex items-center gap-2">
                  <BookOpen className="h-4 w-4 text-primary" />
                  <span className="truncate max-w-[100px]">
                    {selectedSubject ? selectedSubject.name : "Select Subject"}
                  </span>
                </span>
                <ChevronDown className="h-4 w-4 opacity-50 flex-shrink-0" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-[200px] bg-popover z-50">
              {availableSubjects.map((subject) => (
                <DropdownMenuItem
                  key={subject.id}
                  onClick={() => onSelectSubject(subject)}
                  className={cn(
                    "cursor-pointer",
                    selectedSubject?.id === subject.id && "bg-primary/10"
                  )}
                >
                  <BookOpen className="h-4 w-4 mr-2" />
                  {subject.name}
                  {selectedSubject?.id === subject.id && (
                    <Check className="h-4 w-4 ml-auto text-primary" />
                  )}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>
    </div>
  );
}
