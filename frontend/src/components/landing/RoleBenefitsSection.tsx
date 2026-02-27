import { GraduationCap, Briefcase, Building2, CheckCircle2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const roles = [
  {
    icon: GraduationCap,
    title: "For Students",
    color: "text-primary",
    bgColor: "bg-primary/10",
    benefits: [
      "Real-time attendance tracking",
      "Syllabus progress visibility",
      "Timetable & academic clarity",
      "Performance analytics dashboard",
      "Access study materials anytime"
    ]
  },
  {
    icon: Briefcase,
    title: "For Staff",
    color: "text-success",
    bgColor: "bg-success/10",
    benefits: [
      "Easy attendance marking",
      "Teaching plan control",
      "Performance insights",
      "Class management tools",
      "Student progress tracking"
    ]
  },
  {
    icon: Building2,
    title: "For Administrators",
    color: "text-warning",
    bgColor: "bg-warning/10",
    benefits: [
      "Institution-wide oversight",
      "User & course management",
      "Academic analytics",
      "Department coordination",
      "System configuration"
    ]
  }
];

export const RoleBenefitsSection = () => {
  return (
    <section className="py-20 md:py-32 bg-background">
      <div className="container mx-auto px-4 md:px-6">
        {/* Section header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            Tailored Experience for
            <span className="text-primary"> Every Role</span>
          </h2>
          <p className="text-lg text-muted-foreground">
            NeoCampus adapts to your needs, whether you're a student tracking progress, 
            staff managing classes, or an admin overseeing operations.
          </p>
        </div>

        {/* Role cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {roles.map((role) => (
            <Card 
              key={role.title}
              className="bg-card border-border/50 hover:shadow-lg transition-all duration-300"
            >
              <CardHeader className="pb-4">
                <div className={`w-14 h-14 ${role.bgColor} rounded-2xl flex items-center justify-center mb-4`}>
                  <role.icon className={`w-7 h-7 ${role.color}`} />
                </div>
                <CardTitle className="text-xl font-bold text-foreground">
                  {role.title}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3">
                  {role.benefits.map((benefit) => (
                    <li key={benefit} className="flex items-start gap-3">
                      <CheckCircle2 className={`w-5 h-5 ${role.color} shrink-0 mt-0.5`} />
                      <span className="text-muted-foreground text-sm">{benefit}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};
