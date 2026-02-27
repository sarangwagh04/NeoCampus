import React from "react";
import { CheckCircle, Clock, XCircle, Users, MapPin, Play, CalendarDays, Coffee } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { TodayClass } from "@/hooks/useStaffData";
import { cn } from "@/lib/utils";
import { Link } from "react-router-dom";
interface StaffTodayOverviewProps {
  classes: TodayClass[] | null;
  isLoading: boolean;
  onMarkAttendance: (classId: string) => void;
}
const statusConfig = {
  marked: {
    label: "Marked",
    icon: CheckCircle,
    className: "bg-success/10 text-success border-success/20"
  },
  pending: {
    label: "Pending",
    icon: Clock,
    className: "bg-warning/10 text-warning border-warning/20"
  },
  missed: {
    label: "Missed",
    icon: XCircle,
    className: "bg-destructive/10 text-destructive border-destructive/20"
  }
};
export function StaffTodayOverview({
  classes,
  isLoading,
  onMarkAttendance
}: StaffTodayOverviewProps) {
  if (isLoading) {
    return <Card className="min-h-[500px]">
        <CardHeader>
          <Skeleton className="h-6 w-48" />
        </CardHeader>
        <CardContent className="space-y-4">
          {Array.from({
          length: 4
        }).map((_, i) => <Skeleton key={i} className="h-24 w-full rounded-lg" />)}
        </CardContent>
      </Card>;
  }
  if (!classes) return null;
  const pendingCount = classes.filter(c => c.attendanceStatus === "pending").length;
  const markedCount = classes.filter(c => c.attendanceStatus === "marked").length;

  // Find current class based on time
  const now = new Date();
  const currentHour = now.getHours();
  const currentClassIndex = classes.findIndex(c => {
    const startHour = parseInt(c.time.split(":")[0]);
    return startHour === currentHour || startHour === currentHour - 12;
  });
  return <Card className="card-shadow animate-fade-in min-h-[500px]">
      <Tabs defaultValue="schedule" className="h-full">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg font-semibold">Today's Overview</CardTitle>
            <TabsList className="grid w-[240px] grid-cols-2">
              <TabsTrigger value="classes" className="text-xs">
                <Users className="h-3.5 w-3.5 mr-1.5" />
                Classes
              </TabsTrigger>
              <TabsTrigger value="schedule" className="text-xs">
                <CalendarDays className="h-3.5 w-3.5 mr-1.5" />
                Schedule
              </TabsTrigger>
            </TabsList>
          </div>
        </CardHeader>

        <CardContent className="pt-4">
          {/* Classes Tab - Attendance Management */}
          <TabsContent value="classes" className="mt-0 space-y-3">
            <div className="flex items-center gap-3 text-sm mb-4">
              <span className="text-success flex items-center gap-1">
                <CheckCircle className="h-4 w-4" />
                {markedCount} Marked
              </span>
              <span className="text-warning flex items-center gap-1">
                <Clock className="h-4 w-4" />
                {pendingCount} Pending
              </span>
            </div>

            {classes.map((classItem, index) => {
            const status = statusConfig[classItem.attendanceStatus];
            const StatusIcon = status.icon;
            return <div key={classItem.id} className={cn("p-4 rounded-lg border bg-card hover:bg-muted/50 transition-colors animate-slide-up", classItem.attendanceStatus === "pending" && "border-warning/30 bg-warning/5")} style={{
              animationDelay: `${index * 50}ms`
            }}>
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-medium text-foreground">{classItem.subject}</h4>
                        <Badge variant="outline" className="text-xs font-normal">
                          {classItem.subjectCode}
                        </Badge>
                      </div>
                      <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Users className="h-3.5 w-3.5" />
                          {classItem.class} - {classItem.division}
                        </span>
                        <span>{classItem.time}</span>
                        <span className="flex items-center gap-1">
                          <MapPin className="h-3.5 w-3.5" />
                          {classItem.room}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <Badge className={cn("border", status.className)}>
                        <StatusIcon className="h-3 w-3 mr-1" />
                        {status.label}
                      </Badge>

                      {classItem.attendanceStatus === "marked" && classItem.presentStudents && <span className="text-sm text-muted-foreground">
                          {classItem.presentStudents}/{classItem.totalStudents}
                        </span>}

                      {classItem.attendanceStatus === "pending" && <Button size="sm" onClick={() => onMarkAttendance(classItem.id)} className="bg-primary hover:bg-primary/90">
                          <Play className="h-3.5 w-3.5 mr-1" />
                          Mark Attendance
                        </Button>}
                    </div>
                  </div>
                </div>;
          })}
          </TabsContent>

          {/* Schedule Tab - Timeline View */}
          <TabsContent value="schedule" className="mt-0">
            <ScrollArea className="h-[380px] pr-4">
              <div className="relative">
                {/* Timeline line */}
                <div className="absolute left-[15px] top-0 bottom-0 w-0.5 bg-border" />

                <div className="space-y-3">
                  {classes.map((classItem, index) => {
                    const isCurrent = index === currentClassIndex;
                    const isPast = index < currentClassIndex;
                    const classEndTime = classItem.time.split(" - ")[1];
                    
                    // Check if lunch break should appear after this class (ends at 12:00)
                    const showLunchBreak = classEndTime === "12:00";
                    // Check if short break should appear after this class (ends at 14:45)
                    const showShortBreak = classEndTime === "14:45";

                    return (
                      <React.Fragment key={classItem.id}>
                        <div
                          className={cn(
                            "relative flex items-start gap-4 pl-8 animate-slide-up transition-opacity duration-300",
                            isPast && "opacity-40"
                          )}
                          style={{ animationDelay: `${index * 50}ms` }}
                        >
                          {/* Timeline dot */}
                          <div
                            className={cn(
                              "absolute left-[11px] top-2 w-2.5 h-2.5 rounded-full border-2 transition-all",
                              isCurrent
                                ? "bg-primary border-primary animate-pulse scale-125"
                                : isPast
                                ? "bg-muted-foreground/30 border-muted-foreground/30"
                                : "bg-background border-muted-foreground"
                            )}
                          />

                          <div
                            className={cn(
                              "flex-1 p-3 rounded-lg border transition-all",
                              isCurrent 
                                ? "border-primary bg-primary/10 shadow-sm shadow-primary/20" 
                                : isPast
                                ? "bg-muted/30 border-muted"
                                : "bg-card border-border"
                            )}
                          >
                            <div className="flex items-start justify-between gap-2">
                              <div>
                                <div className="flex items-center gap-2">
                                  <h4 className={cn(
                                    "font-medium text-sm",
                                    isPast ? "text-muted-foreground" : "text-foreground"
                                  )}>
                                    {classItem.subject}
                                  </h4>
                                  {isCurrent && (
                                    <Badge className="bg-primary text-primary-foreground text-xs animate-pulse">
                                      <span className="relative flex h-2 w-2 mr-1">
                                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary-foreground opacity-75"></span>
                                        <span className="relative inline-flex rounded-full h-2 w-2 bg-primary-foreground"></span>
                                      </span>
                                      Ongoing
                                    </Badge>
                                  )}
                                  {isPast && (
                                    <Badge variant="outline" className="text-xs text-muted-foreground border-muted-foreground/30">
                                      <CheckCircle className="h-3 w-3 mr-1" />
                                      Done
                                    </Badge>
                                  )}
                                </div>
                                <div className={cn(
                                  "flex flex-wrap items-center gap-2 mt-1 text-xs",
                                  isPast ? "text-muted-foreground/70" : "text-muted-foreground"
                                )}>
                                  <span className="flex items-center gap-1">
                                    <Users className="h-3 w-3" />
                                    {classItem.class}-{classItem.division}
                                  </span>
                                  <span className="flex items-center gap-1">
                                    <MapPin className="h-3 w-3" />
                                    {classItem.room}
                                  </span>
                                </div>
                              </div>
                              <span className={cn(
                                "text-xs font-medium whitespace-nowrap",
                                isPast ? "text-muted-foreground/70" : "text-muted-foreground"
                              )}>
                                {classItem.time}
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Lunch Break Indicator */}
                        {showLunchBreak && (
                          <div className="relative flex items-center gap-4 pl-8 py-1">
                            <div className="absolute left-[11px] top-1/2 -translate-y-1/2 w-2.5 h-2.5 rounded-full bg-warning/20 border-2 border-warning/40" />
                            <div className="flex-1 p-2.5 rounded-lg border border-dashed border-warning/30 bg-warning/5">
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                  <Coffee className="h-3.5 w-3.5 text-warning" />
                                  <span className="text-xs font-medium text-warning">Lunch Break</span>
                                </div>
                                <span className="text-xs text-muted-foreground">12:00 - 12:45</span>
                              </div>
                            </div>
                          </div>
                        )}

                        {/* Short Break Indicator */}
                        {showShortBreak && (
                          <div className="relative flex items-center gap-4 pl-8 py-1">
                            <div className="absolute left-[11px] top-1/2 -translate-y-1/2 w-2.5 h-2.5 rounded-full bg-muted border-2 border-muted-foreground/40" />
                            <div className="flex-1 p-2.5 rounded-lg border border-dashed border-muted-foreground/30 bg-muted/30">
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                  <Clock className="h-3.5 w-3.5 text-muted-foreground" />
                                  <span className="text-xs font-medium text-muted-foreground">Short Break</span>
                                </div>
                                <span className="text-xs text-muted-foreground">14:45 - 15:00</span>
                              </div>
                            </div>
                          </div>
                        )}
                      </React.Fragment>
                    );
                  })}
                </div>
              </div>
            </ScrollArea>
            
            <div className="mt-4 pt-4 border-t">
              <Button variant="outline" className="w-full" asChild>
                <Link to="/staff/timetable">
                  <CalendarDays className="h-4 w-4 mr-2" />
                  View Full Timetable
                  
                </Link>
              </Button>
            </div>
          </TabsContent>
        </CardContent>
      </Tabs>
    </Card>;
}