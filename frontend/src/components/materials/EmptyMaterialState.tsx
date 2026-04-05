import { BookOpen, Search } from "lucide-react";
import { motion } from "framer-motion";

interface EmptyMaterialStateProps {
  type: "no-materials" | "no-results";
  subjectName?: string;
}

export function EmptyMaterialState({ type, subjectName }: EmptyMaterialStateProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col items-center justify-center py-16 px-4"
    >
      <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
        {type === "no-materials" ? (
          <BookOpen className="h-8 w-8 text-muted-foreground" />
        ) : (
          <Search className="h-8 w-8 text-muted-foreground" />
        )}
      </div>
      
      <h3 className="text-lg font-semibold text-foreground mb-2">
        {type === "no-materials"
          ? "No Study Materials Yet"
          : "No Results Found"}
      </h3>
      
      <p className="text-sm text-muted-foreground text-center max-w-sm">
        {type === "no-materials"
          ? subjectName
            ? `No study materials have been uploaded for ${subjectName} yet. Check back later!`
            : "No study materials have been uploaded yet. Your teachers will add materials soon."
          : "No materials match your current filters. Try adjusting your search or selecting a different subject."}
      </p>
    </motion.div>
  );
}
