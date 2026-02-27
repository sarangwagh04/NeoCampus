import { BookOpen, ChevronDown, Check } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";

export interface Subject {
  id: string;
  name: string;
  code: string;
  chunksAvailable: boolean;
}

interface SubjectSelectorProps {
  subjects: Subject[];
  selectedSubject: Subject | null;
  onSelectSubject: (subject: Subject) => void;
  variant?: "pills" | "dropdown";
}

const pillVariants = {
  initial: { scale: 0.9, opacity: 0 },
  animate: { scale: 1, opacity: 1 },
  exit: { scale: 0.9, opacity: 0 },
};

export function SubjectSelector({
  subjects,
  selectedSubject,
  onSelectSubject,
  variant = "pills",
}: SubjectSelectorProps) {
  const availableSubjects = subjects.filter((s) => s.chunksAvailable);

  if (variant === "dropdown") {
    return (
      <div className="flex items-center gap-3">
        <span className="text-sm text-muted-foreground">Subject:</span>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="outline"
              className="min-w-[200px] justify-between"
            >
              <span className="flex items-center gap-2">
                <BookOpen className="h-4 w-4" />
                {selectedSubject ? selectedSubject.name : "Select Subject"}
              </span>
              <ChevronDown className="h-4 w-4 opacity-50" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="w-[200px] bg-popover">
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
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <BookOpen className="h-4 w-4" />
        <span>Choose a subject to chat about:</span>
      </div>
      <div className="flex flex-wrap gap-2">
        <AnimatePresence>
          {availableSubjects.map((subject, index) => {
            const isSelected = selectedSubject?.id === subject.id;
            return (
              <motion.button
                key={subject.id}
                variants={pillVariants}
                initial="initial"
                animate="animate"
                exit="exit"
                transition={{ delay: index * 0.05 }}
                onClick={() => onSelectSubject(subject)}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className={cn(
                  "relative px-4 py-2.5 rounded-full text-sm font-medium transition-all border-2",
                  isSelected
                    ? "bg-primary text-primary-foreground border-primary shadow-lg shadow-primary/25"
                    : "bg-card text-foreground border-border hover:border-primary/50 hover:bg-primary/5"
                )}
              >
                <span className="flex items-center gap-2">
                  {isSelected && (
                    <motion.span
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="w-2 h-2 bg-primary-foreground rounded-full"
                    />
                  )}
                  {subject.name}
                </span>
              </motion.button>
            );
          })}
        </AnimatePresence>
      </div>
      
      <AnimatePresence>
        {selectedSubject && (
          <motion.p
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="text-sm text-primary flex items-center gap-2"
          >
            <Check className="h-4 w-4" />
            Now chatting about <span className="font-semibold">{selectedSubject.name}</span>
          </motion.p>
        )}
      </AnimatePresence>
    </div>
  );
}
