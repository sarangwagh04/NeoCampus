import { cn } from "@/lib/utils";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { TimetableData, LectureSlot, TimeSlot } from "@/hooks/useTimetableData";
import { ClassYear, SubjectOption } from "@/hooks/useStaffTimetableData";
import { Clock, MapPin, User, Edit2 } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useState } from "react";

interface StaffWeeklyTimetableProps {
  timetable: TimetableData | null;
  isLoading: boolean;
  isEditMode: boolean;
  subjects: SubjectOption[];
  onUpdateLecture: (day: string, slotId: string, subjectCode: string | null) => void;
}

const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

function isCurrentTimeSlot(slot: TimeSlot): boolean {
  const now = new Date();
  const currentTime = now.getHours() * 60 + now.getMinutes();
  const [startHour, startMin] = slot.startTime.split(":").map(Number);
  const [endHour, endMin] = slot.endTime.split(":").map(Number);
  const slotStart = startHour * 60 + startMin;
  const slotEnd = endHour * 60 + endMin;
  return currentTime >= slotStart && currentTime < slotEnd;
}

function getCurrentDay(): string {
  const dayIndex = new Date().getDay();
  return days[dayIndex - 1] || "";
}

interface LectureCellProps {
  lecture: LectureSlot | null;
  isCurrentSlot: boolean;
  isCurrentDay: boolean;
  isEditMode: boolean;
  subjects: SubjectOption[];
  onSelect: (subjectCode: string | null) => void;
}

function LectureCell({ 
  lecture, 
  isCurrentSlot, 
  isCurrentDay, 
  isEditMode, 
  subjects, 
  onSelect 
}: LectureCellProps) {
  const [isEditing, setIsEditing] = useState(false);
  const isCurrent = isCurrentSlot && isCurrentDay;

  if (isEditMode && isEditing) {
    return (
      <div className="h-full min-h-[80px] p-2">
        <Select
          value={lecture?.subjectCode || "empty"}
          onValueChange={(value) => {
            onSelect(value === "empty" ? null : value);
            setIsEditing(false);
          }}
        >
          <SelectTrigger className="h-full min-h-[70px] bg-background">
            <SelectValue placeholder="Select subject" />
          </SelectTrigger>
          <SelectContent className="bg-popover z-50">
            <SelectItem value="empty">— Empty —</SelectItem>
            {subjects.map((subject) => (
              <SelectItem key={subject.code} value={subject.code}>
                <div className="flex flex-col">
                  <span className="font-medium">{subject.code}</span>
                  <span className="text-xs text-muted-foreground">{subject.name}</span>
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    );
  }

  if (!lecture) {
    return (
      <div 
        className={cn(
          "h-full min-h-[80px] flex items-center justify-center text-muted-foreground/50 text-sm rounded-lg",
          isEditMode && "cursor-pointer hover:bg-muted/50 border-2 border-dashed border-muted-foreground/20"
        )}
        onClick={() => isEditMode && setIsEditing(true)}
      >
        {isEditMode ? (
          <div className="flex flex-col items-center gap-1">
            <Edit2 className="w-4 h-4" />
            <span className="text-xs">Click to add</span>
          </div>
        ) : (
          "—"
        )}
      </div>
    );
  }

  const cellContent = (
    <div
      className={cn(
        "h-full min-h-[80px] p-2 rounded-lg transition-all",
        isEditMode ? "cursor-pointer hover:ring-2 hover:ring-primary/50" : "cursor-pointer hover:scale-[1.02] hover:shadow-md",
        isCurrent && "current-class ring-2 ring-primary/50"
      )}
      onClick={() => isEditMode && setIsEditing(true)}
    >
      <div className="flex flex-col h-full">
        <div className="flex items-start justify-between gap-1">
          <span className="font-semibold text-sm text-foreground leading-tight">
            {lecture.subjectCode}
          </span>
          {isEditMode && (
            <Edit2 className="w-3 h-3 text-muted-foreground" />
          )}
        </div>
        <span className="text-xs text-muted-foreground mt-1 line-clamp-2">
          {lecture.subjectName}
        </span>
        <span className="text-xs text-muted-foreground/70 mt-auto line-clamp-1">
          {lecture.facultyName}
        </span>
        {isCurrent && !isEditMode && (
          <span className="text-xs text-primary font-medium mt-1">
            ● Now
          </span>
        )}
      </div>
    </div>
  );

  if (isEditMode) {
    return cellContent;
  }

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        {cellContent}
      </TooltipTrigger>
      <TooltipContent side="top" className="max-w-[250px] bg-popover z-50">
        <div className="space-y-2">
          <p className="font-semibold">{lecture.subjectName}</p>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <User className="w-3 h-3" />
            <span>{lecture.facultyName}</span>
          </div>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <MapPin className="w-3 h-3" />
            <span>{lecture.classroom}</span>
          </div>
        </div>
      </TooltipContent>
    </Tooltip>
  );
}

function TimetableSkeleton() {
  return (
    <div className="bg-card rounded-xl border border-border overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[800px]">
          <thead>
            <tr className="bg-muted/50">
              <th className="p-3 w-24">
                <Skeleton className="h-4 w-12" />
              </th>
              {days.map((day) => (
                <th key={day} className="p-3">
                  <Skeleton className="h-4 w-16 mx-auto" />
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {[1, 2, 3, 4, 5, 6, 7, 8].map((row) => (
              <tr key={row} className="border-t border-border">
                <td className="p-3">
                  <Skeleton className="h-4 w-16" />
                </td>
                {days.map((day) => (
                  <td key={day} className="p-2">
                    <Skeleton className="h-20 w-full rounded-lg" />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export function StaffWeeklyTimetable({ 
  timetable, 
  isLoading, 
  isEditMode, 
  subjects,
  onUpdateLecture 
}: StaffWeeklyTimetableProps) {
  const currentDay = getCurrentDay();

  if (isLoading) {
    return <TimetableSkeleton />;
  }

  if (!timetable) {
    return (
      <div className="bg-card rounded-xl border border-border p-8 text-center">
        <p className="text-muted-foreground">Timetable not published yet</p>
      </div>
    );
  }

  return (
    <div className={cn(
      "bg-card rounded-xl border overflow-hidden animate-fade-in",
      isEditMode ? "border-primary/30 ring-1 ring-primary/20" : "border-border"
    )}>
      {isEditMode && (
        <div className="bg-primary/10 px-4 py-2 text-sm text-primary font-medium border-b border-primary/20">
          ✏️ Edit Mode Active — Click on any lecture block to modify
        </div>
      )}
      <div className="overflow-x-auto custom-scrollbar">
        <table className="w-full min-w-[800px]">
          <thead className="sticky top-0 z-10">
            <tr className="bg-muted/80 backdrop-blur-sm">
              <th className="p-3 text-left text-sm font-semibold text-muted-foreground w-24">
                <div className="flex items-center gap-1">
                  <Clock className="w-4 h-4" />
                  <span>Time</span>
                </div>
              </th>
              {days.map((day) => (
                <th
                  key={day}
                  className={cn(
                    "p-3 text-center text-sm font-semibold",
                    day === currentDay ? "text-primary" : "text-muted-foreground"
                  )}
                >
                  <span className={cn(
                    "px-2 py-1 rounded-md",
                    day === currentDay && "bg-primary/10"
                  )}>
                    {day}
                  </span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {timetable.timeSlots.map((slot) => {
              const isCurrentSlot = isCurrentTimeSlot(slot);

              if (slot.isBreak) {
                return (
                  <tr key={slot.id} className="bg-muted/30">
                    <td className="p-3 text-sm text-muted-foreground">
                      {slot.startTime} - {slot.endTime}
                    </td>
                    <td colSpan={6} className="p-4 text-center">
                      <span className="text-sm font-medium text-muted-foreground">
                        {slot.breakLabel === "Lunch Break" ? "🍽️" : "☕"} {slot.breakLabel}
                      </span>
                    </td>
                  </tr>
                );
              }

              return (
                <tr
                  key={slot.id}
                  className={cn(
                    "border-t border-border table-row-hover",
                    isCurrentSlot && !isEditMode && "bg-primary/5"
                  )}
                >
                  <td className="p-3 text-sm text-muted-foreground whitespace-nowrap">
                    <div className="flex flex-col">
                      <span className="font-medium">{slot.startTime}</span>
                      <span className="text-xs">{slot.endTime}</span>
                    </div>
                  </td>
                  {days.map((day) => (
                    <td key={day} className="p-1.5">
                      <LectureCell
                        lecture={timetable.schedule[day]?.[slot.id] || null}
                        isCurrentSlot={isCurrentSlot}
                        isCurrentDay={day === currentDay}
                        isEditMode={isEditMode}
                        subjects={subjects}
                        onSelect={(code) => onUpdateLecture(day, slot.id, code)}
                      />
                    </td>
                  ))}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
