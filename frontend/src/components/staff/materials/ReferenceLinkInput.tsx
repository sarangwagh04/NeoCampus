import { useState } from "react";
import { Plus, X, ExternalLink } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { motion, AnimatePresence } from "framer-motion";

interface ReferenceLinkInputProps {
  links: string[];
  onAdd: (link: string) => void;
  onRemove: (index: number) => void;
  maxLinks?: number;
}

function isValidUrl(string: string): boolean {
  try {
    new URL(string);
    return true;
  } catch {
    return false;
  }
}

function extractDomain(url: string): string {
  try {
    const urlObj = new URL(url);
    return urlObj.hostname.replace("www.", "");
  } catch {
    return url;
  }
}

export function ReferenceLinkInput({
  links,
  onAdd,
  onRemove,
  maxLinks = 5,
}: ReferenceLinkInputProps) {
  const [inputValue, setInputValue] = useState("");
  const [error, setError] = useState("");

  const handleAdd = () => {
    const trimmedUrl = inputValue.trim();
    
    if (!trimmedUrl) {
      setError("Please enter a URL");
      return;
    }

    // Add https:// if no protocol specified
    let urlToAdd = trimmedUrl;
    if (!trimmedUrl.startsWith("http://") && !trimmedUrl.startsWith("https://")) {
      urlToAdd = "https://" + trimmedUrl;
    }

    if (!isValidUrl(urlToAdd)) {
      setError("Please enter a valid URL");
      return;
    }

    if (links.includes(urlToAdd)) {
      setError("This link has already been added");
      return;
    }

    if (links.length >= maxLinks) {
      setError(`Maximum ${maxLinks} links allowed`);
      return;
    }

    onAdd(urlToAdd);
    setInputValue("");
    setError("");
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleAdd();
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex gap-2">
        <Input
          type="url"
          placeholder="https://example.com/resource"
          value={inputValue}
          onChange={(e) => {
            setInputValue(e.target.value);
            setError("");
          }}
          onKeyDown={handleKeyDown}
          className="flex-1"
        />
        <Button
          type="button"
          variant="outline"
          onClick={handleAdd}
          disabled={links.length >= maxLinks}
          className="gap-1.5"
        >
          <Plus className="h-4 w-4" />
          Add Link
        </Button>
      </div>

      {error && (
        <p className="text-sm text-destructive">{error}</p>
      )}

      {links.length > 0 && (
        <div className="flex flex-wrap gap-2">
          <AnimatePresence mode="popLayout">
            {links.map((link, index) => (
              <motion.div
                key={link}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                transition={{ duration: 0.15 }}
              >
                <Badge
                  variant="secondary"
                  className="gap-1.5 pl-2 pr-1 py-1.5 text-sm font-normal"
                >
                  <ExternalLink className="h-3 w-3 text-muted-foreground" />
                  <span className="max-w-[200px] truncate">
                    {extractDomain(link)}
                  </span>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => onRemove(index)}
                    className="h-5 w-5 ml-1 hover:bg-destructive/20 hover:text-destructive"
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </Badge>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}

      <p className="text-xs text-muted-foreground">
        {links.length}/{maxLinks} links added. Students will see "Open Reference Link" button.
      </p>
    </div>
  );
}
