import { useState, useEffect } from "react";
import api from "@/api/axios";

export interface LectureSlot {
  id: string;
  subjectCode: string;
  subjectName: string;
  facultyName: string;
  classroom: string;
  lecturesPlanned: number;
  lecturesCompleted: number;
  lecturesRemaining: number;
}

export interface TimeSlot {
  id: string;
  startTime: string;
  endTime: string;
  isBreak?: boolean;
  breakLabel?: string;
}

export interface TimetableData {
  timeSlots: TimeSlot[];
  schedule: Record<string, Record<string, LectureSlot | null>>;
}

export interface TeachingPlan {
  subjectCode: string;
  subjectName: string;
  facultyName: string;
  lecturesPlanned: number;
  lecturesCompleted: number;
  lecturesRemaining: number;
  topics?: { name: string; lectures: number; completed: boolean }[];
}

export interface TimetableState {
  timetable: TimetableData | null;
  teachingPlans: TeachingPlan[];
  isLoading: boolean;
  error: string | null;
}

/* ❌ REMOVED MOCK DATA SECTION
   - mockTimeSlots
   - subjects
   - createLecture
   - mockSchedule
   - mockTeachingPlans
*/


export function useTimetableData() {
  const [state, setState] = useState<TimetableState>({
    timetable: null,
    teachingPlans: [],
    isLoading: true,
    error: null,
  });

  useEffect(() => {
    const fetchData = async () => {
      try {

        // ✅ Fetch both APIs in parallel (FASTER)
        const [timetableResponse, teachingPlanResponse] =
          await Promise.all([
            api.get("/timetable/", {
              params: {
                branch: "CSD", // 🔹 later dynamic
                year: "BE",
              },
            }),
            api.get("/student-teaching-plan/"),
          ]);

        const backendData = timetableResponse.data;

        // ✅ Transform time slots
        const formattedTimeSlots: TimeSlot[] =
          backendData.timeSlots.map((slot: any) => ({
            id: String(slot.id),
            startTime: slot.start_time,
            endTime: slot.end_time,
            isBreak: slot.is_break,
            breakLabel: slot.break_label,
          }));

        // ✅ SINGLE setState (Important!)
        setState({
          timetable: {
            timeSlots: formattedTimeSlots,
            schedule: backendData.schedule,
          },
          teachingPlans: teachingPlanResponse.data,
          isLoading: false,
          error: null,
        });

      } catch (err: any) {
        setState((prev) => ({
          ...prev,
          isLoading: false,
          error: "Unable to load timetable data. Please try again later.",
        }));
      }
    };

    fetchData();
  }, []);

  return state;
}