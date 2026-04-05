import { ExternalLink, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface ReferenceLinkProps {
  url: string;
}

function getDomain(url: string): string {
  try {
    const domain = new URL(url).hostname;
    return domain.replace("www.", "");
  } catch {
    return url;
  }
}

export function ReferenceLink({ url }: ReferenceLinkProps) {
  const domain = getDomain(url);

  return (
    <div className="flex items-center gap-2">
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="outline"
            size="sm"
            className="gap-2 text-primary border-primary/30 hover:bg-primary/10 hover:border-primary/50"
            onClick={() => window.open(url, "_blank", "noopener,noreferrer")}
          >
            <ExternalLink className="h-4 w-4" />
            Open Reference Link
          </Button>
        </TooltipTrigger>
        <TooltipContent side="top" className="max-w-xs">
          <div className="flex items-center gap-2">
            <Shield className="h-3.5 w-3.5 text-green-500 flex-shrink-0" />
            <div className="text-xs">
              <p className="font-medium">{domain}</p>
              <p className="text-muted-foreground truncate">{url}</p>
            </div>
          </div>
        </TooltipContent>
      </Tooltip>
      <span className="text-xs text-muted-foreground hidden sm:inline">
        Opens in new tab
      </span>
    </div>
  );
}
