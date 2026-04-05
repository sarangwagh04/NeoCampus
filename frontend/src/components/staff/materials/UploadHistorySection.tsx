import { useState } from "react";
import { ChevronDown, ChevronUp, FileText, Clock } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { UploadedMaterial } from "@/hooks/useStaffStudyMaterials";
import { format } from "date-fns";
import { motion, AnimatePresence } from "framer-motion";

interface UploadHistorySectionProps {
  materials: UploadedMaterial[];
  maxItems?: number;
}

export function UploadHistorySection({ materials, maxItems = 5 }: UploadHistorySectionProps) {
  const [isOpen, setIsOpen] = useState(false);
  const displayMaterials = materials.slice(0, maxItems);

  if (materials.length === 0) return null;

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <Card>
        <CollapsibleTrigger asChild>
          <CardHeader className="cursor-pointer hover:bg-muted/50 transition-colors">
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2 text-base font-semibold">
                <Clock className="h-4 w-4 text-muted-foreground" />
                Recent Uploads
                <Badge variant="secondary" className="ml-2">
                  {materials.length}
                </Badge>
              </CardTitle>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                {isOpen ? (
                  <ChevronUp className="h-4 w-4" />
                ) : (
                  <ChevronDown className="h-4 w-4" />
                )}
              </Button>
            </div>
          </CardHeader>
        </CollapsibleTrigger>

        <CollapsibleContent>
          <CardContent className="pt-0">
            <AnimatePresence>
              <div className="space-y-2">
                {displayMaterials.map((material, index) => (
                  <motion.div
                    key={material.id}
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="flex items-center justify-between p-3 rounded-lg bg-muted/30 border border-border"
                  >
                    <div className="flex items-center gap-3 min-w-0 flex-1">
                      <div className="flex-shrink-0 text-primary">
                        <FileText className="h-4 w-4" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium text-foreground truncate">
                          {material.title}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {material.subject_code} | Uploaded by {material.uploaded_by}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <span className="text-xs text-muted-foreground hidden sm:block">
                        {format(new Date(material.created_at), "MMM dd, yyyy")}
                      </span>
                    </div>
                  </motion.div>
                ))}
              </div>
            </AnimatePresence>
          </CardContent>
        </CollapsibleContent>
      </Card>
    </Collapsible>
  );
}
