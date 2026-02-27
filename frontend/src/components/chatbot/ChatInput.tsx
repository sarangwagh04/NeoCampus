import { useState, useRef, useEffect } from "react";
import { Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";

interface ChatInputProps {
  onSend: (message: string) => void;
  disabled?: boolean;
  placeholder?: string;
  isLoading?: boolean;
}

export function ChatInput({
  onSend,
  disabled = false,
  placeholder = "Type your message...",
  isLoading = false,
}: ChatInputProps) {
  const [input, setInput] = useState("");
  const [isFocused, setIsFocused] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleSubmit = () => {
    if (input.trim() && !disabled && !isLoading) {
      onSend(input.trim());
      setInput("");
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const canSend = input.trim() && !disabled && !isLoading;

  return (
    <div className="bg-background border-t border-border px-4 py-2">
      {/* Compact Input Area with inline hint */}
      <motion.div
        animate={{
          boxShadow: isFocused && !disabled
            ? "0 0 0 2px hsl(var(--primary) / 0.2)"
            : "none",
        }}
        className={cn(
          "relative flex items-center gap-2 bg-card border rounded-full px-4 py-2 transition-all",
          disabled ? "opacity-60 border-border" : "border-border",
          isFocused && !disabled && "border-primary"
        )}
      >
        {/* Inline instruction hint */}
        <AnimatePresence mode="wait">
          {disabled ? (
            <motion.span
              key="hint"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="text-[10px] text-warning bg-warning/10 px-2 py-0.5 rounded-full whitespace-nowrap flex-shrink-0"
            >
              Select subject
            </motion.span>
          ) : !input.trim() && !isFocused ? (
            <motion.span
              key="enter-hint"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="text-[10px] text-muted-foreground bg-muted px-2 py-0.5 rounded-full whitespace-nowrap flex-shrink-0"
            >
              ↵ Enter
            </motion.span>
          ) : null}
        </AnimatePresence>

        <input
          ref={inputRef}
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          placeholder={disabled ? "Select a subject first..." : placeholder}
          disabled={disabled || isLoading}
          className="flex-1 bg-transparent border-0 outline-none text-sm text-foreground placeholder:text-muted-foreground min-w-0"
        />

        {/* Send button */}
        <AnimatePresence mode="wait">
          <motion.div
            key={canSend ? "active" : "inactive"}
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
            transition={{ duration: 0.15 }}
          >
            <Button
              onClick={handleSubmit}
              disabled={!canSend}
              size="icon"
              className={cn(
                "h-8 w-8 rounded-full flex-shrink-0 transition-all",
                canSend
                  ? "bg-primary hover:bg-primary/90 shadow-md shadow-primary/25"
                  : "bg-muted text-muted-foreground"
              )}
            >
              <Send className={cn("h-4 w-4", canSend && "text-primary-foreground")} />
            </Button>
          </motion.div>
        </AnimatePresence>
      </motion.div>
    </div>
  );
}
