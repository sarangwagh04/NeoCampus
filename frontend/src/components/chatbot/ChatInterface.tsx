import { useState, useRef, useEffect, useMemo } from "react";
import { ChatHeader, type Subject } from "./ChatHeader";
import { ChatMessage, type Message } from "./ChatMessage";
import { ChatInput } from "./ChatInput";
import { EmptyState } from "./EmptyState";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";


interface ChatInterfaceProps {
  variant?: "dashboard" | "fullscreen";
}

export function ChatInterface({ variant = "dashboard" }: ChatInterfaceProps) {
  /* ----------------------------
     ✅ Detect Staff from JWT
  ---------------------------- */
  const isStaff = useMemo(() => {
    const token = localStorage.getItem("access_token");
    if (!token) return false;

    try {
      const payload = JSON.parse(atob(token.split(".")[1]));
      return payload?.is_staff === true;
    } catch {
      return false;
    }
  }, []);

  /* ----------------------------
     ✅ Subjects (Immutable)
  ---------------------------- */
  const baseSubjects: Subject[] = [
    {
      id: "other",
      name: "Other",
      code: "GEN",
      chunksAvailable: false,
    },
    {
      id: "dbms",
      name: "DBMS",
      code: "CS301",
      chunksAvailable: true,
    },
    {
      id: "updates",
      name: "College Updates",
      code: "CLG",
      chunksAvailable: true,
    },
  ];

  const subjects: Subject[] = isStaff
    ? [
        ...baseSubjects,
        {
          id: "add-updates",
          name: "Post Updates",
          code: "STAFF",
          chunksAvailable: false,
        },
      ]
    : baseSubjects;

  /* ----------------------------
     State
  ---------------------------- */
  const [selectedSubject, setSelectedSubject] = useState<Subject>(
    baseSubjects[0] // default = Other
  );
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  /* ----------------------------
     Auto Scroll
  ---------------------------- */
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  /* ----------------------------
     Subject Change
  ---------------------------- */
  const handleSubjectChange = (subject: Subject) => {
    setSelectedSubject(subject);
    setMessages([]);
  };

  /* ----------------------------
     Send Message
  ---------------------------- */
  const handleSendMessage = async (content: string) => {
    if (!selectedSubject) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setIsLoading(true);

    const loadingMessage: Message = {
      id: "loading",
      role: "assistant",
      content: "",
      timestamp: new Date(),
      isLoading: true,
    };

    setMessages((prev) => [...prev, loadingMessage]);

    try {
      const token = localStorage.getItem("access_token");

      /* -----------------------------------------
         ✅ STAFF ADD UPDATES MODE
      ------------------------------------------ */
      if (selectedSubject.id === "add-updates") {
        const response = await fetch(
          "http://127.0.0.1:8000/api/chatbot/post-update/",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({ content: content, }),
          }
        );

        if (!response.ok) {
          throw new Error("Failed to add update");
        }

        const assistantMessage: Message = {
          id: (Date.now() + 1).toString(),
          role: "assistant",
          content: "✅ Update added successfully.",
          timestamp: new Date(),
        };

        setMessages((prev) =>
          prev.filter((m) => m.id !== "loading").concat(assistantMessage)
        );

        setIsLoading(false);
        return;
      }

      /* -----------------------------------------
         ✅ NORMAL CHAT (Other / DBMS / Updates)
      ------------------------------------------ */

      const response = await fetch(
        "http://127.0.0.1:8000/api/chatbot/ask/",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            question: content,
            context:
              selectedSubject.id === "dbms"
                ? "DBMS"
                : selectedSubject.id === "updates"
                ? "COLLEGE_UPDATE"
                : "",
            top_k: 3,
          }),
        }
      );

      if (!response.ok) {
        throw new Error("API failed");
      }

      const data = await response.json();

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: data.answer,
        timestamp: new Date(),
      };

      setMessages((prev) =>
        prev.filter((m) => m.id !== "loading").concat(assistantMessage)
      );
    } catch (error) {
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: "⚠️ Something went wrong. Please try again.",
        timestamp: new Date(),
      };

      setMessages((prev) =>
        prev.filter((m) => m.id !== "loading").concat(errorMessage)
      );
    }

    setIsLoading(false);
  };

  /* ----------------------------
     Example Click
  ---------------------------- */
  const handleExampleClick = (question: string) => {
    handleSendMessage(question);
  };

  /* ----------------------------
     UI
  ---------------------------- */
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className={cn(
        "flex flex-col h-full min-h-0 bg-background",
        variant === "fullscreen" && "max-w-5xl mx-auto w-full shadow-2xl border-x border-border"
      )}
    >

      <ChatHeader
        selectedSubject={selectedSubject}
        isTyping={isLoading}
        subjects={subjects}
        onSelectSubject={handleSubjectChange}
      />

      <div className="flex-1 min-h-0 overflow-y-auto">
        {messages.length === 0 ? (
          <EmptyState
            hasSubject={!!selectedSubject}
            subjectName={selectedSubject?.name}
            onExampleClick={handleExampleClick}
          />
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className={cn(
              "space-y-6 max-w-3xl mx-auto",
              variant === "fullscreen" ? "p-8" : "p-4"
            )}
          >

            {messages.map((message, index) => (
              <ChatMessage
                key={message.id}
                message={message}
                isLatest={
                  index === messages.length - 1 &&
                  message.role === "assistant" &&
                  !message.isLoading
                }
              />
            ))}
            <div ref={messagesEndRef} />
          </motion.div>
        )}
      </div>

      <div className="flex-shrink-0">
        <ChatInput
          onSend={handleSendMessage}
          disabled={!selectedSubject}
          isLoading={isLoading}
          placeholder={
            selectedSubject
              ? `Ask about ${selectedSubject.name}...`
              : "Select a subject first..."
          }
        />
      </div>

      <AnimatePresence>
        {selectedSubject && messages.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="flex-shrink-0 text-center py-2 bg-primary/5 border-t border-primary/10"
          >
            <p className="text-xs text-primary font-medium">
              ✨ Answers powered AI
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}