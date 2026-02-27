
export function AttendanceHeader() {
  return (
    <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
      <div>
        <h1 className="text-2xl font-bold text-foreground md:text-3xl">
          Attendance Overview
        </h1>
        <p className="mt-1 text-muted-foreground">
          Track your subject-wise attendance performance
        </p>
      </div>
    </div>
  );
}
