import { BookOpen } from "lucide-react";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { MaterialFilters } from "@/components/materials/MaterialFilters";
import { MaterialCard } from "@/components/materials/MaterialCard";
import { EmptyMaterialState } from "@/components/materials/EmptyMaterialState";
import { useStudyMaterials } from "@/hooks/useStudyMaterials";

const StudyMaterials = () => {
  const {
    materials,
    subjects,
    selectedSubject,
    setSelectedSubject,
    sortBy,
    setSortBy,
    searchQuery,
    setSearchQuery,
  } = useStudyMaterials();

  const selectedSubjectName = subjects.find((s) => s.id === selectedSubject)?.name;
  const hasActiveFilters = selectedSubject !== "all" || searchQuery.trim() !== "";

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <BookOpen className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-foreground">
                Notice Board
              </h1>
              <p className="text-muted-foreground text-sm">
                Access updates & Notes send by your teachers
              </p>
            </div>
          </div>
        </div>

        {/* Filters */}
        <MaterialFilters
          subjects={subjects}
          selectedSubject={selectedSubject}
          onSubjectChange={setSelectedSubject}
          sortBy={sortBy}
          onSortChange={setSortBy}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
        />

        {/* Materials Count */}
        {materials.length > 0 && (
          <p className="text-sm text-muted-foreground">
            Showing {materials.length} material{materials.length !== 1 ? "s" : ""}
            {selectedSubject !== "all" && ` for ${selectedSubjectName}`}
          </p>
        )}

        {/* Materials List */}
        {materials.length > 0 ? (
          <div className="grid gap-4">
            {materials.map((material, index) => (
              <MaterialCard key={material.id} material={material} index={index} />
            ))}
          </div>
        ) : (
          <EmptyMaterialState
            type={hasActiveFilters ? "no-results" : "no-materials"}
            subjectName={selectedSubject !== "all" ? selectedSubjectName : undefined}
          />
        )}
      </div>
    </DashboardLayout>
  );
};

export default StudyMaterials;
