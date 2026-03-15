import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, ArrowRight, Link2, CheckCircle2, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import type { FieldMapping } from "@/hooks/useAIResultAnalysis";
interface AIFieldMappingProps {
  columns: string[];
  fieldMappings: FieldMapping[];
  onUpdateMapping: (fieldKey: string, columnName: string | null) => void;
  allRequiredMapped: boolean;
  onProceed: () => void;
  onBack: () => void;
}
export function AIFieldMapping({
  columns,
  fieldMappings,
  onUpdateMapping,
  allRequiredMapped,
  onProceed,
  onBack,
}: AIFieldMappingProps) {
  const mappedCount = fieldMappings.filter(f => f.mappedColumn).length;
  const requiredCount = fieldMappings.filter(f => f.required).length;
  const requiredMappedCount = fieldMappings.filter(f => f.required && f.mappedColumn).length;
  // Track which columns are already used
  const usedColumns = new Set(fieldMappings.map(f => f.mappedColumn).filter(Boolean));
  return (
    <div className="space-y-6 animate-fade-in">
      <Button variant="ghost" onClick={onBack} className="mb-2">
        <ArrowLeft className="h-4 w-4 mr-2" />
        Back — Value Mapping
      </Button>
      <Card className={cn(
        "relative overflow-hidden border-2 border-blue-500/30 transition-all duration-500",
        "bg-gradient-to-br from-blue-50/80 via-background to-indigo-50/80",
        "dark:from-blue-950/40 dark:via-background dark:to-indigo-950/40"
      )}>
        <div className="absolute inset-0 bg-gradient-to-r from-blue-500/0 via-blue-500/5 to-blue-500/0 animate-[shimmer_3s_ease-in-out_infinite]" />
        <div className="absolute -inset-1 rounded-xl bg-gradient-to-r from-blue-500/10 via-indigo-500/20 to-blue-500/10 blur-xl -z-10 opacity-40" />
        <CardHeader className="relative">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500/30 to-indigo-500/30 flex items-center justify-center shadow-lg shadow-blue-500/20">
              <Link2 className="h-6 w-6 text-blue-500" />
            </div>
            <div>
              <CardTitle className="text-lg bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-400 dark:to-indigo-400 bg-clip-text text-transparent">
                Map Columns to Report Fields
              </CardTitle>
              <CardDescription>
                Assign your data columns to the required report fields
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6 relative">
          {/* Progress summary */}
          <div className="grid grid-cols-3 gap-3">
            <div className="rounded-xl bg-muted/50 p-3 text-center">
              <p className="text-2xl font-bold text-foreground">{fieldMappings.length}</p>
              <p className="text-xs text-muted-foreground">Total Fields</p>
            </div>
            <div className="rounded-xl bg-blue-500/10 border border-blue-500/20 p-3 text-center">
              <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">{mappedCount}</p>
              <p className="text-xs text-blue-600/70 dark:text-blue-400/70">Mapped</p>
            </div>
            <div className={cn(
              "rounded-xl p-3 text-center border",
              requiredMappedCount === requiredCount
                ? "bg-emerald-500/10 border-emerald-500/20"
                : "bg-amber-500/10 border-amber-500/20"
            )}>
              <p className={cn(
                "text-2xl font-bold",
                requiredMappedCount === requiredCount
                  ? "text-emerald-600 dark:text-emerald-400"
                  : "text-amber-600 dark:text-amber-400"
              )}>
                {requiredMappedCount}/{requiredCount}
              </p>
              <p className="text-xs text-muted-foreground">Required</p>
            </div>
          </div>
          {/* Field mapping rows */}
          <div className="space-y-3">
            {fieldMappings.map((field) => (
              <div
                key={field.key}
                className={cn(
                  "flex items-center gap-4 p-4 rounded-xl border-2 transition-all duration-300",
                  field.mappedColumn
                    ? "border-emerald-500/40 bg-emerald-500/5"
                    : field.required
                      ? "border-amber-500/30 bg-amber-500/5"
                      : "border-border bg-card"
                )}
              >
                {/* Field info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="font-semibold text-foreground text-sm">{field.label}</p>
                    {field.required ? (
                      <Badge variant="outline" className="text-[10px] border-amber-400/50 text-amber-600 dark:text-amber-400">
                        Required
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="text-[10px] border-muted-foreground/30 text-muted-foreground">
                        Optional
                      </Badge>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground mt-0.5">{field.description}</p>
                </div>
                {/* Arrow */}
                <ArrowRight className="h-4 w-4 text-muted-foreground shrink-0" />
                {/* Column selector */}
                <div className="w-52 shrink-0">
                  <Select
                    value={field.mappedColumn || ""}
                    onValueChange={(val) => onUpdateMapping(field.key, val === "__none__" ? null : val)}
                  >
                    <SelectTrigger className={cn(
                      "transition-all duration-300",
                      field.mappedColumn
                        ? "border-emerald-500/50 text-foreground"
                        : "border-muted-foreground/30"
                    )}>
                      <SelectValue placeholder="Select column..." />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="__none__">— None —</SelectItem>
                      {columns.map((col) => (
                        <SelectItem
                          key={col}
                          value={col}
                          disabled={usedColumns.has(col) && field.mappedColumn !== col}
                        >
                          {col}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                {/* Status icon */}
                <div className="shrink-0 w-5">
                  {field.mappedColumn ? (
                    <CheckCircle2 className="h-5 w-5 text-emerald-500" />
                  ) : field.required ? (
                    <AlertCircle className="h-5 w-5 text-amber-500" />
                  ) : null}
                </div>
              </div>
            ))}
          </div>
          {/* Proceed button */}
          <Button
            className={cn(
              "w-full transition-all duration-500",
              allRequiredMapped
                ? "bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-xl shadow-blue-500/30 hover:shadow-blue-500/50 hover:scale-[1.01]"
                : "bg-muted text-muted-foreground"
            )}
            size="lg"
            disabled={!allRequiredMapped}
            onClick={onProceed}
          >
            {allRequiredMapped ? (
              <>
                <CheckCircle2 className="h-4 w-4 mr-2" />
                Generate AI Analysis Report
              </>
            ) : (
              <>
                <AlertCircle className="h-4 w-4 mr-2" />
                Map all required fields to continue
              </>
            )}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
