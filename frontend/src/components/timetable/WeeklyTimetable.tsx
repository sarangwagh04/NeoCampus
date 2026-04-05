import { cn } from "@/lib/utils";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { TimetableData, LectureSlot, TimeSlot } from "@/hooks/useTimetableData";
import { Clock, MapPin, User } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

interface WeeklyTimetableProps {
  timetable: TimetableData | null;
  isLoading: boolean;
}

const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

function getLectureStatus(remaining: number, planned: number) {
  const progress = ((planned - remaining) / planned) * 100;
  if (progress < 50) return "safe"; // Plenty remaining
  if (progress < 80) return "warning"; // Midway
  return "danger"; // Near completion
}

function getStatusColor(status: string) {
  switch (status) {
    case "safe":
      return "bg-success/20 text-success";
    case "warning":
      return "bg-warning/20 text-warning";
    case "danger":
      return "bg-destructive/20 text-destructive";
    default:
      return "bg-muted text-muted-foreground";
  }
}

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

function LectureCell({ lecture, isCurrentSlot, isCurrentDay }: { 
  lecture: LectureSlot | null; 
  isCurrentSlot: boolean;
  isCurrentDay: boolean;
}) {
  if (!lecture) {
    return (
      <div className="h-full min-h-[80px] flex items-center justify-center text-muted-foreground/50 text-sm">
        —
      </div>
    );
  }

  const status = getLectureStatus(lecture.lecturesRemaining, lecture.lecturesPlanned);
  const isCurrent = isCurrentSlot && isCurrentDay;

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <div
          className={cn(
            "h-full min-h-[80px] p-2 rounded-lg transition-all cursor-pointer",
            "hover:scale-[1.02] hover:shadow-md",
            isCurrent && "current-class ring-2 ring-primary/50"
          )}
        >
          <div className="flex flex-col h-full">
            <div className="flex items-start justify-between gap-1">
              <span className="font-semibold text-sm text-foreground leading-tight">
                {lecture.subjectCode}
              </span>
              <span
                className={cn(
                  "text-xs font-medium px-1.5 py-0.5 rounded-full",
                  getStatusColor(status)
                )}
              >
                {lecture.lecturesRemaining}
              </span>
            </div>
            <span className="text-xs text-muted-foreground mt-1 line-clamp-2">
              {lecture.subjectName}
            </span>
            {isCurrent && (
              <span className="text-xs text-primary font-medium mt-auto">
                ● Now
              </span>
            )}
          </div>
        </div>
      </TooltipTrigger>
      <TooltipContent side="top" className="max-w-[250px]">
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
          <div className="pt-1 border-t border-border text-xs">
            <span className="text-muted-foreground">Progress: </span>
            <span className="font-medium">
              {lecture.lecturesCompleted} / {lecture.lecturesPlanned} lectures
            </span>
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

export function WeeklyTimetable({ timetable, isLoading }: WeeklyTimetableProps) {
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
    <div className="bg-card rounded-xl border border-border overflow-hidden animate-fade-in">
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
                        🍽️ {slot.breakLabel}
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
                    isCurrentSlot && "bg-primary/5"
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

