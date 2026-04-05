import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { InlineBanner } from "@/components/ui/inline-banner";
import { ArrowLeft, Plus, Save, Calendar, BookOpen } from "lucide-react";
import { Link } from "react-router-dom";
import { AssignedSubject, TeachingPlanLecture } from "@/hooks/useStaffAttendanceData";
import { useEffect } from "react";


interface TeachingPlanFormProps {
    subject: AssignedSubject | null;
    existingPlan: TeachingPlanLecture[];
    onCreatePlan: (totalLectures: number, lectures: Partial<TeachingPlanLecture>[]) => Promise<TeachingPlanLecture[]>;
    onUpdatePlan: (lectures: TeachingPlanLecture[]) => Promise<TeachingPlanLecture[]>;
    isLoading: boolean;
}

export function TeachingPlanForm({
    subject,
    existingPlan,
    onCreatePlan,
    onUpdatePlan,
    isLoading,
}: TeachingPlanFormProps) {
    const [totalLectures, setTotalLectures] = useState<number>(0);
    const [lectureRows, setLectureRows] = useState<Partial<TeachingPlanLecture>[]>([]);
    const [editablePlan, setEditablePlan] = useState<TeachingPlanLecture[]>(existingPlan);
    const [isGenerated, setIsGenerated] = useState(false);
    const [banner, setBanner] = useState<{ type: "success" | "error"; message: string } | null>(null);
    const [isSaving, setIsSaving] = useState(false);

    const hasExistingPlan = existingPlan.length > 0;

    // Initialize editable plan when existing plan loads
    useEffect(() => {
        if (existingPlan.length > 0) {
            setEditablePlan(existingPlan);
        }
    }, [existingPlan]);

    const handleGenerateRows = () => {
        if (totalLectures <= 0 || totalLectures > 100) {
            setBanner({ type: "error", message: "Please enter a valid number (1-100)" });
            return;
        }

        const rows: Partial<TeachingPlanLecture>[] = Array.from({ length: totalLectures }, (_, i) => ({
            lectureNumber: i + 1,
            topic: "",
            scheduledDate: "",
            scheduledTime: "09:00",
        }));

        setLectureRows(rows);
        setIsGenerated(true);
        setBanner(null);
    };

    const handleRowChange = (index: number, field: string, value: string) => {
        setLectureRows((prev) =>
            prev.map((row, i) => (i === index ? { ...row, [field]: value } : row))
        );
    };

    const handleEditableChange = (index: number, field: string, value: string) => {
        setEditablePlan((prev) =>
            prev.map((row, i) => (i === index ? { ...row, [field]: value } : row))
        );
    };

    const handleSaveNewPlan = async () => {
        const hasEmptyTopics = lectureRows.some((row) => !row.topic?.trim());
        const hasEmptyDates = lectureRows.some((row) => !row.scheduledDate);

        if (hasEmptyTopics || hasEmptyDates) {
            setBanner({ type: "error", message: "Please fill all topics and dates" });
            return;
        }

        setIsSaving(true);
        try {
            await onCreatePlan(totalLectures, lectureRows);
            setBanner({ type: "success", message: "Teaching plan created successfully!" });
            setIsGenerated(false);
            setLectureRows([]);
        } catch {
            setBanner({ type: "error", message: "Failed to save teaching plan" });
        } finally {
            setIsSaving(false);
        }
    };

    const handleUpdatePlan = async () => {
        setIsSaving(true);
        try {
            await onUpdatePlan(editablePlan);
            setBanner({ type: "success", message: "Teaching plan updated successfully!" });
        } catch {
            setBanner({ type: "error", message: "Failed to update teaching plan" });
        } finally {
            setIsSaving(false);
        }
    };

    if (isLoading) {
        return (
            <div className="space-y-4">
                <div className="h-12 bg-muted animate-pulse rounded-lg" />
                <div className="h-64 bg-muted animate-pulse rounded-lg" />
            </div>
        );
    }

    if (!subject) {
        return (
            <Card>
                <CardContent className="py-12 text-center">
                    <p className="text-muted-foreground">Subject not found</p>
                    <Link to="/staff/attendance">
                        <Button variant="link" className="mt-2">
                            Go back to Attendance
                        </Button>
                    </Link>
                </CardContent>
            </Card>
        );
    }

    return (
        <div className="space-y-4">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                    <Link to="/staff/attendance">
                        <Button variant="ghost" size="icon">
                            <ArrowLeft className="w-5 h-5" />
                        </Button>
                    </Link>
                    <div>
                        <h1 className="text-xl sm:text-2xl font-bold text-foreground">
                            Teaching Plan
                        </h1>
                        <p className="text-sm text-muted-foreground">
                            {subject.name} ({subject.code}) • {subject.batchId}
                        </p>
                    </div>
                </div>
            </div>

            {banner && (
                <InlineBanner
                    type={banner.type}
                    message={banner.message}
                    onClose={() => setBanner(null)}
                    autoClose={4000}
                />
            )}

            {/* No existing plan - create new */}
            {!hasExistingPlan && !isGenerated && (
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Plus className="w-5 h-5 text-primary" />
                            Create Teaching Plan
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="flex flex-col sm:flex-row gap-4 items-end">
                            <div className="flex-1 space-y-2">
                                <Label htmlFor="totalLectures">Total Number of Lectures</Label>
                                <Input
                                    id="totalLectures"
                                    type="number"
                                    min={1}
                                    max={100}
                                    value={totalLectures || ""}
                                    onChange={(e) => setTotalLectures(parseInt(e.target.value) || 0)}
                                    placeholder="Enter number of lectures"
                                />
                            </div>
                            <Button onClick={handleGenerateRows} className="w-full sm:w-auto">
                                Generate Rows
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Generated rows for new plan */}
            {!hasExistingPlan && isGenerated && (
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between">
                        <CardTitle className="flex items-center gap-2">
                            <Calendar className="w-5 h-5 text-primary" />
                            Lecture Schedule ({lectureRows.length} lectures)
                        </CardTitle>
                        <Button onClick={handleSaveNewPlan} disabled={isSaving} className="gap-2">
                            <Save className="w-4 h-4" />
                            {isSaving ? "Saving..." : "Save Plan"}
                        </Button>
                    </CardHeader>
                    <CardContent>
                        <div className="overflow-x-auto -mx-4 sm:mx-0">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead className="w-16">#</TableHead>
                                        <TableHead>Topic</TableHead>
                                        <TableHead className="w-36">Date</TableHead>
                                        <TableHead className="w-28">Time</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {lectureRows.map((row, index) => (
                                        <TableRow key={index}>
                                            <TableCell className="font-medium">{row.lectureNumber}</TableCell>
                                            <TableCell>
                                                <Input
                                                    value={row.topic || ""}
                                                    onChange={(e) => handleRowChange(index, "topic", e.target.value)}
                                                    placeholder="Enter topic"
                                                    className="min-w-[200px]"
                                                />
                                            </TableCell>
                                            <TableCell>
                                                <Input
                                                    type="date"
                                                    value={row.scheduledDate || ""}
                                                    onChange={(e) => handleRowChange(index, "scheduledDate", e.target.value)}
                                                />
                                            </TableCell>
                                            <TableCell>
                                                <Input
                                                    type="time"
                                                    value={row.scheduledTime || "09:00"}
                                                    onChange={(e) => handleRowChange(index, "scheduledTime", e.target.value)}
                                                />
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Existing plan - edit mode */}
            {hasExistingPlan && (
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between">
                        <CardTitle className="flex items-center gap-2">
                            <BookOpen className="w-5 h-5 text-primary" />
                            Teaching Plan ({editablePlan.length} lectures)
                        </CardTitle>
                        <Button onClick={handleUpdatePlan} disabled={isSaving} className="gap-2">
                            <Save className="w-4 h-4" />
                            {isSaving ? "Saving..." : "Save Changes"}
                        </Button>
                    </CardHeader>
                    <CardContent>
                        <div className="overflow-x-auto -mx-4 sm:mx-0">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead className="w-16">#</TableHead>
                                        <TableHead>Topic</TableHead>
                                        <TableHead className="w-36">Date</TableHead>
                                        <TableHead className="w-28">Time</TableHead>
                                        <TableHead className="w-24">Status</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {editablePlan.map((lecture, index) => (
                                        <TableRow key={lecture.id}>
                                            <TableCell className="font-medium">{lecture.lectureNumber}</TableCell>
                                            <TableCell>
                                                <Input
                                                    value={lecture.topic}
                                                    onChange={(e) => handleEditableChange(index, "topic", e.target.value)}
                                                    className="min-w-[200px]"
                                                    disabled={lecture.isCompleted}
                                                />
                                            </TableCell>
                                            <TableCell>
                                                <Input
                                                    type="date"
                                                    value={lecture.scheduledDate}
                                                    onChange={(e) => handleEditableChange(index, "scheduledDate", e.target.value)}
                                                    disabled={lecture.isCompleted}
                                                />
                                            </TableCell>
                                            <TableCell>
                                                <Input
                                                    type="time"
                                                    value={lecture.scheduledTime}
                                                    onChange={(e) => handleEditableChange(index, "scheduledTime", e.target.value)}
                                                    disabled={lecture.isCompleted}
                                                />
                                            </TableCell>
                                            <TableCell>
                                                <span
                                                    className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${lecture.isCompleted
                                                            ? "bg-success/10 text-success"
                                                            : "bg-muted text-muted-foreground"
                                                        }`}
                                                >
                                                    {lecture.isCompleted ? "Completed" : "Pending"}
                                                </span>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>
                    </CardContent>
                </Card>
            )}
        </div>
    );
}
