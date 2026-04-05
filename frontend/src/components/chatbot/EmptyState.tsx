import { MessageSquare, Lightbulb, Bot, Sparkles, BookOpen } from "lucide-react";
import { motion } from "framer-motion";

interface EmptyStateProps {
  hasSubject: boolean;
  subjectName?: string;
  onExampleClick?: (question: string) => void;
}

const exampleQuestions: Record<string, string[]> = {
  "Others": [
    "Explain the difference between stack and queue",
    "What is a binary search tree?",
    "How does a hash table work?",
  ],
  "DBMS": [
    "What is normalization in databases?",
    "Explain ACID properties",
    "What are different types of SQL joins?",
  ],
  "Operating Systems": [
    "What is process scheduling?",
    "Explain deadlock and its prevention",
    "What is virtual memory?",
  ],
  "Computer Networks": [
    "Explain the OSI model layers",
    "What is TCP/IP protocol?",
    "How does DNS work?",
  ],
  default: [
    "What are the key concepts in this subject?",
    "Explain the fundamentals",
    "What are common applications?",
  ],
};

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

export function EmptyState({
  hasSubject,
  subjectName,
  onExampleClick,
}: EmptyStateProps) {
  const questions = subjectName
    ? exampleQuestions[subjectName] || exampleQuestions.default
    : exampleQuestions.default;

  if (!hasSubject) {
    return (
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="flex flex-col items-center justify-center p-6 md:p-8 text-center min-h-[300px]"
      >
        {/* Animated Bot Icon */}
        <motion.div
          variants={itemVariants}
          className="relative mb-4"
        >
          <motion.div
            className="w-20 h-20 md:w-24 md:h-24 rounded-full bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center"
            animate={{ 
              boxShadow: [
                "0 0 0 0 rgba(var(--primary), 0)",
                "0 0 0 20px rgba(var(--primary), 0.1)",
                "0 0 0 0 rgba(var(--primary), 0)"
              ]
            }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <motion.div
              animate={{ rotate: [0, 10, -10, 0] }}
              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
            >
              <Bot className="h-10 w-10 md:h-12 md:w-12 text-primary" />
            </motion.div>
          </motion.div>
          <motion.div
            className="absolute -top-1 -right-1 w-6 h-6 md:w-8 md:h-8 bg-primary/20 rounded-full flex items-center justify-center"
            animate={{ scale: [1, 1.2, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <Sparkles className="h-3 w-3 md:h-4 md:w-4 text-primary" />
          </motion.div>
        </motion.div>

        <motion.h3
          variants={itemVariants}
          className="text-xl md:text-2xl font-bold text-foreground mb-2"
        >
          Hi! I'm Neo 👋
        </motion.h3>
        
        <motion.p
          variants={itemVariants}
          className="text-sm md:text-base text-muted-foreground max-w-md mb-4 leading-relaxed"
        >
          Your AI-powered academic assistant. I can help you understand concepts, 
          solve problems, and explore subjects in depth.
        </motion.p>

        <motion.div
          variants={itemVariants}
          className="flex items-center gap-2 px-4 py-2 bg-primary/10 rounded-full text-primary text-sm font-medium"
        >
          <BookOpen className="h-4 w-4" />
          Select a subject above to get started
        </motion.div>
      </motion.div>
    );
  }

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="flex flex-col items-center justify-center p-6 md:p-8 text-center"
    >
      <motion.div
        variants={itemVariants}
        className="w-16 h-16 md:w-20 md:h-20 rounded-full bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center mb-4"
      >
        <motion.div
          animate={{ y: [0, -5, 0] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
        >
          <Lightbulb className="h-8 w-8 md:h-10 md:w-10 text-primary" />
        </motion.div>
      </motion.div>

      <motion.h3
        variants={itemVariants}
        className="text-lg md:text-xl font-bold text-foreground mb-2"
      >
        Let's explore {subjectName}!
      </motion.h3>
      
      <motion.p
        variants={itemVariants}
        className="text-sm text-muted-foreground max-w-md mb-6"
      >
        I'm ready to help with your questions. Try one of these or ask your own:
      </motion.p>

      <motion.div variants={itemVariants} className="space-y-2 w-full max-w-md">
        {questions.map((question, index) => (
          <motion.button
            key={index}
            onClick={() => onExampleClick?.(question)}
            className="w-full text-left px-4 py-3 rounded-xl bg-card border border-border hover:border-primary hover:bg-primary/5 transition-all text-sm text-foreground group shadow-sm"
            whileHover={{ scale: 1.02, x: 5 }}
            whileTap={{ scale: 0.98 }}
          >
            <span className="text-primary mr-2 group-hover:mr-3 transition-all">💡</span>
            {question}
          </motion.button>
        ))}
      </motion.div>

      <motion.p
        variants={itemVariants}
        className="text-xs text-muted-foreground mt-6 flex items-center gap-2"
      >
        <span className="w-2 h-2 bg-success rounded-full animate-pulse" />
        Answers powered AI✨
      </motion.p>
    </motion.div>
  );
}
