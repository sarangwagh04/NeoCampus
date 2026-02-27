import { Calendar, User, MessageSquare, Link2, Paperclip } from "lucide-react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { StudyMaterial } from "@/hooks/useStudyMaterials";
import { FileAttachment } from "./FileAttachment";
import { ReferenceLink } from "./ReferenceLink";
import { format } from "date-fns";

interface MaterialCardProps {
  material: StudyMaterial;
  index: number;
}

export function MaterialCard({ material, index }: MaterialCardProps) {
  const formattedDate = format(new Date(material.uploadedAt), "MMM dd, yyyy");

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
    >
      <Card className="overflow-hidden hover:shadow-md transition-shadow duration-200">
        <CardHeader className="pb-3">
          {/* Subject Badge & Date */}
          <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
            <Badge variant="secondary" className="text-xs font-medium">
              {material.subjectCode} • {material.subjectName}
            </Badge>
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <Calendar className="h-3.5 w-3.5" />
              {formattedDate}
            </div>
          </div>

          {/* Title */}
          <h3 className="text-lg font-semibold text-foreground leading-tight">
            {material.title}
          </h3>

          {/* Uploaded By */}
          <div className="flex items-center gap-1.5 text-sm text-muted-foreground mt-1">
            <User className="h-3.5 w-3.5" />
            <span>Uploaded by {material.uploadedBy}</span>
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* Staff Message */}
          {material.staffMessage && (
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm font-medium text-foreground">
                <MessageSquare className="h-4 w-4 text-primary" />
                <span>Instructions from Staff</span>
              </div>
              <div className="pl-6">
                <p className="text-sm text-muted-foreground leading-relaxed bg-muted/50 rounded-lg p-3 border-l-2 border-primary/30">
                  {material.staffMessage}
                </p>
              </div>
            </div>
          )}

          {/* Reference Link */}
          {material.referenceLinks.length > 0 && (
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm font-medium text-foreground">
                <Link2 className="h-4 w-4 text-primary" />
                <span>Reference Links ({material.referenceLinks.length})</span>
              </div>
              <div className="pl-6 space-y-2">
                {material.referenceLinks.map((link, i) => (
                  <ReferenceLink key={i} url={link} />
                ))}
              </div>
            </div>
          )}

          {/* Files */}
          {material.files.length > 0 && (
            <div className="space-y-2">
              <Separator className="my-3" />
              <div className="flex items-center gap-2 text-sm font-medium text-foreground">
                <Paperclip className="h-4 w-4 text-primary" />
                <span>Attachments ({material.files.length})</span>
              </div>
              <div className="space-y-2 mt-2">
                {material.files.map((file) => (
                  <FileAttachment key={file.id} file={file} />
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}
