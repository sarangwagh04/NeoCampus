import { Clock, MapPin, Coffee, Utensils } from "lucide-react";
import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

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

const schedule: ScheduleItem[] = [
  {
    time: "10:00 - 11:00",
    subject: "Data Structures & Algorithms",
    faculty: "Dr. Rajesh Kumar",
    room: "Room 301",
    type: "Lecture",
    startHour: 10, startMinute: 0, endHour: 11, endMinute: 0,
  },
  {
    time: "11:00 - 12:00",
    subject: "Database Management Systems",
    faculty: "Prof. Anita Sharma",
    room: "Room 205",
    type: "Lecture",
    startHour: 11, startMinute: 0, endHour: 12, endMinute: 0,
  },
  {
    time: "12:00 - 12:45",
    subject: "Lunch Break",
    faculty: "",
    room: "",
    type: "Break",
    startHour: 12, startMinute: 0, endHour: 12, endMinute: 45,
  },
  {
    time: "12:45 - 13:45",
    subject: "Web Technologies Lab",
    faculty: "Mr. Vikram Singh",
    room: "Lab 102",
    type: "Practical",
    startHour: 12, startMinute: 45, endHour: 13, endMinute: 45,
  },
  {
    time: "13:45 - 14:45",
    subject: "Computer Networks",
    faculty: "Dr. Priya Menon",
    room: "Room 401",
    type: "Lecture",
    startHour: 13, startMinute: 45, endHour: 14, endMinute: 45,
  },
  {
    time: "14:45 - 15:00",
    subject: "Short Break",
    faculty: "",
    room: "",
    type: "Break",
    startHour: 14, startMinute: 45, endHour: 15, endMinute: 0,
  },
  {
    time: "15:00 - 16:00",
    subject: "Operating Systems",
    faculty: "Dr. Sunil Mehta",
    room: "Room 303",
    type: "Lecture",
    startHour: 15, startMinute: 0, endHour: 16, endMinute: 0,
  },
  {
    time: "16:00 - 17:00",
    subject: "Software Engineering",
    faculty: "Prof. Kavita Joshi",
    room: "Room 202",
    type: "Lecture",
    startHour: 16, startMinute: 0, endHour: 17, endMinute: 0,
  },
];

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

export function TodaySchedule() {
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
                {item.subject.includes("Lunch") ? (
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

      <Link 
        to="/timetable" 
        className="block w-full mt-4 py-2 text-sm text-center text-primary hover:bg-primary/5 rounded-lg transition-colors"
      >
        View Full Weekly Timetable →
      </Link>
    </div>
  );
}
