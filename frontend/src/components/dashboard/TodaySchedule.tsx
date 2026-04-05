import { Clock, MapPin, Coffee, Utensils } from "lucide-react";
import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import api from "@/api/axios";
import { useEffect, useState } from "react";


interface ScheduleItem {
  time: string;
  subject: string;
  faculty: string;
  room: string;
  type: "Lecture" | "Practical" | "Break";
  startHour: number;
  startMinute: number;
  endHour: number;
  endMinute: number;
}

export function TodaySchedule() {
  const [schedule, setSchedule] = useState<ScheduleItem[]>([]);
  const [loading, setLoading] = useState(true);

  // ✅ ADDED: Fetch schedule from backend
  useEffect(() => {
    api.get("/home/today-schedule/")
      .then((res) => {
        const formatted = res.data.map((item: any) => {

          // Convert "HH:MM:SS" to numbers
          const [startHour, startMinute] = item.start_time.split(":").map(Number);
          const [endHour, endMinute] = item.end_time.split(":").map(Number);

          return {
            time: `${item.start_time.slice(0,5)} - ${item.end_time.slice(0,5)}`,
            subject: item.subject,
            faculty: item.faculty,
            room: item.room,
            type: item.type,
            startHour,
            startMinute,
            endHour,
            endMinute,
          };
        });

        setSchedule(formatted);
      })
      .catch((err) => {
        console.error("Failed to load today's schedule", err);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  // 🔹 Status logic unchanged
  function getItemStatus(item: ScheduleItem): "past" | "ongoing" | "upcoming" {
    const now = new Date();
    const currentHour = now.getHours();
    const currentMinute = now.getMinutes();
    const currentTime = currentHour * 60 + currentMinute;

    const startTime = item.startHour * 60 + item.startMinute;
    const endTime = item.endHour * 60 + item.endMinute;

    if (currentTime >= endTime) return "past";
    if (currentTime >= startTime && currentTime < endTime) return "ongoing";
    return "upcoming";
  }

  const today = new Date();
  const dayName = today.toLocaleDateString('en-US', { weekday: 'long' });
  const dateStr = today.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

  return (
    <div className="stat-card animate-slide-up" style={{ animationDelay: "0.4s" }}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-foreground">Today's Schedule</h3>
        <span className="text-xs text-muted-foreground bg-muted px-2 py-1 rounded-md">
          {dayName}, {dateStr}
        </span>
      </div>

            {/* ✅ Skeleton Loading Preserved */}
      {loading && (
        <div className="space-y-2">
          <div className="h-16 bg-muted rounded-lg animate-pulse"></div>
          <div className="h-16 bg-muted rounded-lg animate-pulse"></div>
          <div className="h-16 bg-muted rounded-lg animate-pulse"></div>
        </div>
      )}

      {!loading && schedule.length === 0 && (
        <div className="flex flex-col items-center justify-center py-10 text-center">
          <Coffee className="w-8 h-8 text-muted-foreground mb-3" />
          <p className="text-sm text-muted-foreground font-medium">
            Enjoy your day 🎉
          </p>
          <p className="text-xs text-muted-foreground/70 mt-1">
            No lectures scheduled for today.
          </p>
        </div>
      )}

      {!loading && schedule.length > 0 && (
      <div className="space-y-2 max-h-[400px] overflow-y-auto pr-1">
        {schedule.map((item, index) => {
          const status = getItemStatus(item);
          const isPast = status === "past";
          const isOngoing = status === "ongoing";
          const isBreak = item.type === "Break";

          if (isBreak) {
            return (
              <div
                key={index}
                className={cn(
                  "flex items-center gap-3 py-2 px-3 rounded-lg bg-muted/30 border border-dashed border-muted-foreground/20",
                  isPast && "opacity-40"
                )}
              >
                {item.subject?.includes("Lunch") ? (
                  <Utensils className="w-4 h-4 text-amber-500" />
                ) : (
                  <Coffee className="w-4 h-4 text-amber-500" />
                )}
                <span className="text-sm text-muted-foreground font-medium">{item.subject}</span>
                <span className="text-xs text-muted-foreground ml-auto">{item.time}</span>
                {isPast && (
                  <Badge variant="outline" className="text-[10px] opacity-60">Done</Badge>
                )}
              </div>
            );
          }

          return (
            <div
              key={index}
              className={cn(
                "p-3 rounded-lg transition-all duration-200 border",
                isOngoing 
                  ? "bg-primary/5 border-primary/30" 
                  : isPast 
                    ? "opacity-40 border-transparent" 
                    : "border-transparent hover:bg-muted/50"
              )}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-sm font-semibold text-foreground">
                      {item.subject}
                    </span>
                    {isOngoing && (
                      <span className="text-[10px] font-medium bg-primary text-primary-foreground px-2 py-0.5 rounded-full animate-pulse">
                        ONGOING
                      </span>
                    )}
                    {isPast && (
                      <Badge variant="outline" className="text-[10px] opacity-60">Done</Badge>
                    )}
                    <span className={cn(
                      "text-[10px] font-medium px-2 py-0.5 rounded-full",
                      item.type === "Practical" 
                        ? "bg-warning/10 text-warning" 
                        : "bg-muted text-muted-foreground"
                    )}>
                      {item.type}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">{item.faculty}</p>
                </div>
                <div className="text-right">
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Clock className="w-3 h-3" />
                    {item.time}
                  </div>
                  <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
                    <MapPin className="w-3 h-3" />
                    {item.room}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
      )}
      <Link 
        to="/timetable" 
        className="block w-full mt-4 py-2 text-sm text-center text-primary hover:bg-primary/5 rounded-lg transition-colors"
      >
        View Full Weekly Timetable →
      </Link>
    </div>
  );
}
