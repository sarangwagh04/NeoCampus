import { Calendar, Clock } from "lucide-react";

export function TimetableHeader() {
  const currentDate = new Date();
  const formattedDate = currentDate.toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <div className="flex flex-col gap-1 mb-6">
      <div className="flex items-center gap-2 mb-1">
        <Calendar className="w-6 h-6 text-primary" />
        <h1 className="text-2xl font-bold text-foreground">Timetable & Teaching Plan</h1>
      </div>
      <p className="text-muted-foreground">
        View your weekly schedule and track syllabus progress
      </p>
      <div className="flex items-center gap-2 mt-2 text-sm text-muted-foreground">
        <Clock className="w-4 h-4" />
        <span>{formattedDate}</span>
      </div>
    </div>
  );
}
