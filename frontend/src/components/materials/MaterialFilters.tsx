
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Subject, SortOption } from "@/hooks/useStudyMaterials";

interface MaterialFiltersProps {
  subjects: Subject[];
  selectedSubject: string;
  onSubjectChange: (value: string) => void;
  sortBy: SortOption;
  onSortChange: (value: SortOption) => void;
  searchQuery: string;
  onSearchChange: (value: string) => void;
}

export function MaterialFilters({
  subjects,
  selectedSubject,
  onSubjectChange,
  sortBy,
  onSortChange,
  searchQuery,
  onSearchChange,
}: MaterialFiltersProps) {
  return (
    <div className="flex flex-col sm:flex-row gap-3 sm:items-center">
      {/* Search */}
      <div className="relative flex-1 max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search materials..."
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-9 bg-background"
        />
      </div>

      {/* Subject Filter */}
      <Select value={selectedSubject} onValueChange={onSubjectChange}>
        <SelectTrigger className="w-full sm:w-[200px] bg-background">
          <SelectValue placeholder="Select Subject" />
        </SelectTrigger>
        <SelectContent className="bg-popover border border-border z-50">
          {subjects.map((subject) => (
            <SelectItem key={subject.id} value={subject.id}>
              {subject.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {/* Sort By */}
      <Select value={sortBy} onValueChange={(v) => onSortChange(v as SortOption)}>
        <SelectTrigger className="w-full sm:w-[150px] bg-background">
          <SelectValue placeholder="Sort By" />
        </SelectTrigger>
        <SelectContent className="bg-popover border border-border z-50">
          <SelectItem value="latest">Latest First</SelectItem>
          <SelectItem value="subject">By Subject</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
}
