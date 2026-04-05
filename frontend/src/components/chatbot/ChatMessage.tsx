import { useState } from "react";
import { Bot, User, Copy, Check, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";

export interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
  isLoading?: boolean;
}

interface ChatMessageProps {
  message: Message;
  isLatest?: boolean;
}

export function ChatMessage({ message, isLatest = false }: ChatMessageProps) {
  const [copied, setCopied] = useState(false);
  const isBot = message.role === "assistant";

  const handleCopy = async () => {
    await navigator.clipboard.writeText(message.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  };

  // Simple markdown-like rendering
  const renderContent = (content: string) => {
    const parts = content.split(/(```[\s\S]*?```)/g);

    return parts.map((part, index) => {
      if (part.startsWith("```") && part.endsWith("```")) {
        const code = part.slice(3, -3);
        const lines = code.split("\n");
        const language = lines[0]?.trim() || "";
        const codeContent = language ? lines.slice(1).join("\n") : code;

        return (
          <pre
            key={index}
            className="bg-muted/50 rounded-lg p-3 my-2 overflow-x-auto text-sm font-mono"
          >
            <code>{codeContent}</code>
          </pre>
        );
      }

      return (
        <span key={index}>
          {part.split("\n").map((line, lineIndex) => {
            if (line.trim().startsWith("- ") || line.trim().startsWith("• ")) {
              return (
                <div key={lineIndex} className="flex gap-2 my-1">
                  <span className="text-primary">•</span>
                  <span>{line.replace(/^[-•]\s*/, "")}</span>
                </div>
              );
            }

            if (line.startsWith("### ")) {
              return (
                <h4 key={lineIndex} className="font-semibold text-base mt-3 mb-1">
                  {line.replace("### ", "")}
                </h4>
              );
            }
            if (line.startsWith("## ")) {
              return (
                <h3 key={lineIndex} className="font-semibold text-lg mt-3 mb-1">
                  {line.replace("## ", "")}
                </h3>
              );
            }

            const boldProcessed = line.replace(
              /\*\*(.*?)\*\*/g,
              '<strong class="font-semibold">$1</strong>'
            );

            return (
              <span
                key={lineIndex}
                dangerouslySetInnerHTML={{
                  __html: boldProcessed + (lineIndex < part.split("\n").length - 1 ? "<br/>" : ""),
                }}
              />
            );
          })}
        </span>
      );
    });
  };

  if (message.isLoading) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex gap-3 items-start"
      >
        <motion.div 
          className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center flex-shrink-0 shadow-lg"
          animate={{ scale: [1, 1.05, 1] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          <Bot className="h-5 w-5 text-primary-foreground" />
        </motion.div>
        <div className="bg-card border border-border rounded-2xl rounded-tl-none px-4 py-3 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="flex gap-1.5">
              <motion.span
                className="w-2.5 h-2.5 bg-primary rounded-full"
                animate={{ scale: [1, 1.3, 1], opacity: [0.5, 1, 0.5] }}
                transition={{ duration: 0.6, repeat: Infinity, delay: 0 }}
              />
              <motion.span
                className="w-2.5 h-2.5 bg-primary rounded-full"
                animate={{ scale: [1, 1.3, 1], opacity: [0.5, 1, 0.5] }}
                transition={{ duration: 0.6, repeat: Infinity, delay: 0.2 }}
              />
              <motion.span
                className="w-2.5 h-2.5 bg-primary rounded-full"
                animate={{ scale: [1, 1.3, 1], opacity: [0.5, 1, 0.5] }}
                transition={{ duration: 0.6, repeat: Infinity, delay: 0.4 }}
              />
            </div>
            <span className="text-sm text-muted-foreground">Neo is thinking...</span>
          </div>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      className={cn(
        "flex gap-3 items-start group",
        !isBot && "flex-row-reverse"
      )}
    >
      {/* Avatar */}
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: "spring", stiffness: 500, damping: 25 }}
        className={cn(
          "w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 shadow-md",
          isBot 
            ? "bg-gradient-to-br from-primary to-primary/60" 
            : "bg-gradient-to-br from-secondary to-secondary/80"
        )}
      >
        {isBot ? (
          <Bot className="h-5 w-5 text-primary-foreground" />
        ) : (
          <User className="h-5 w-5 text-secondary-foreground" />
        )}
      </motion.div>

      {/* Message Bubble */}
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.2, delay: 0.1 }}
        className={cn(
          "relative max-w-[75%] rounded-2xl px-4 py-3 shadow-md",
          isBot
            ? "bg-card border border-border rounded-tl-none"
            : "bg-primary text-primary-foreground rounded-tr-none"
        )}
      >
        {/* Bot sparkle indicator */}
        {isBot && isLatest && (
          <motion.div
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            className="absolute -top-2 -right-2"
          >
            <div className="w-5 h-5 bg-primary/20 rounded-full flex items-center justify-center">
              <Sparkles className="w-3 h-3 text-primary" />
            </div>
          </motion.div>
        )}

        <div className={cn("text-sm leading-relaxed", !isBot && "text-primary-foreground")}>
          {renderContent(message.content)}
        </div>

        {/* Timestamp and actions */}
        <div
          className={cn(
            "flex items-center gap-2 mt-2 text-xs",
            isBot ? "text-muted-foreground" : "text-primary-foreground/70"
          )}
        >
          <span>{formatTime(message.timestamp)}</span>
          {isBot && (
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-muted"
              onClick={handleCopy}
            >
              {copied ? (
                <Check className="h-3 w-3 text-success" />
              ) : (
                <Copy className="h-3 w-3" />
              )}
            </Button>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}
