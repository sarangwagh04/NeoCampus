import { useState, useEffect } from "react";
import api from "@/api/axios"; // ✅ ADDED: Real API
import { TimetableData, TimeSlot } from "@/hooks/useTimetableData";

export type ClassYear = "F.E." | "S.E." | "T.E." | "B.E.";

export interface StaffTimetableState {
  timetables: Record<ClassYear, TimetableData | null>;
  subjects: SubjectOption[];
  isLoading: boolean;
  error: string | null;
  isHod: boolean;
}

export interface SubjectOption {
  code: string;
  name: string;
  staffName: string;
  classroom: string;
}

/* ❌ REMOVED ALL MOCK DATA:
   - mockTimeSlots
   - subjectsByClass
   - createLecture
   - generateSchedule
*/

export function useStaffTimetableData() {
  const [state, setState] = useState<StaffTimetableState>({
    timetables: {
      "F.E.": null,
      "S.E.": null,
      "T.E.": null,
      "B.E.": null,
    },
    subjects: [],
    isLoading: true,
    error: null,
    isHod: false, // ⚠ For now static (later from auth)
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        // ===============================
        // ✅ NEW: Read HOD flag from localStorage
        // ===============================
        const userRaw = localStorage.getItem("user");
        const user = userRaw ? JSON.parse(userRaw) : null;
        const isHod = user?.is_hod === true;

        // ✅ CALL REAL BACKEND
        const response = await api.get("/staff-timetable/");

        const backendData = response.data;

        const formattedTimetables: Record<ClassYear, TimetableData> = {
          "F.E.": null as any,
          "S.E.": null as any,
          "T.E.": null as any,
          "B.E.": null as any,
        };

        Object.keys(backendData).forEach((year) => {

          const data = backendData[year];

          const formattedTimeSlots: TimeSlot[] = data.timeSlots.map((slot: any) => ({
            id: String(slot.id),
            startTime: slot.start_time,
            endTime: slot.end_time,
            isBreak: slot.is_break,
            breakLabel: slot.break_label,
          }));

          formattedTimetables[year as ClassYear] = {
            timeSlots: formattedTimeSlots,
            schedule: data.schedule,
          };
        });

        // ✅ Build subject dropdown list dynamically from DB
        const subjectList: SubjectOption[] = [];

        Object.values(formattedTimetables).forEach((timetable) => {
          if (!timetable) return;

          Object.values(timetable.schedule).forEach((day) => {
            Object.values(day).forEach((lecture: any) => {
              if (lecture && !subjectList.find(s => s.code === lecture.subjectCode)) {
                subjectList.push({
                  code: lecture.subjectCode,
                  name: lecture.subjectName,
                  staffName: lecture.facultyName,
                  classroom: lecture.classroom,
                });
              }
            });
          });
        });

        setState({
          timetables: formattedTimetables,
          subjects: subjectList,
          isLoading: false,
          error: null,
          isHod: isHod,
        });

      } catch (error) {
        setState((prev) => ({
          ...prev,
          isLoading: false,
          error: "Unable to load timetable data. Please try again later.",
        }));
      }
    };

    fetchData();
  }, []);

  const getSubjectsForClass = (classYear: ClassYear): SubjectOption[] => {
    // ✅ Now dynamic based on loaded timetable
    const timetable = state.timetables[classYear];
    if (!timetable) return [];

    const subjects: SubjectOption[] = [];

    Object.values(timetable.schedule).forEach((day) => {
      Object.values(day).forEach((lecture: any) => {
        if (lecture && !subjects.find(s => s.code === lecture.subjectCode)) {
          subjects.push({
            code: lecture.subjectCode,
            name: lecture.subjectName,
            staffName: lecture.facultyName,
            classroom: lecture.classroom,
          });
        }
      });
    });

    return subjects;
  };

  return { ...state, getSubjectsForClass };
}