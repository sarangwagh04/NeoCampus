import { 
  LayoutDashboard, 
  Users, 
  Shield, 
  CalendarCheck, 
  BookOpen, 
  BarChart3, 
  Clock, 
  FolderOpen, 
  Bell 
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

const features = [
  {
    icon: LayoutDashboard,
    title: "Student Dashboard",
    description: "Personalized academic overview with attendance, grades, and schedule at a glance."
  },
  {
    icon: Users,
    title: "Staff Dashboard",
    description: "Comprehensive teaching management with class insights and performance tracking."
  },
  {
    icon: Shield,
    title: "Admin Dashboard",
    description: "Institution-wide oversight with user management and academic analytics."
  },
  {
    icon: CalendarCheck,
    title: "Attendance Management",
    description: "Real-time attendance tracking with smart alerts and correction workflows."
  },
  {
    icon: BookOpen,
    title: "Teaching Plan Tracking",
    description: "Structured lecture planning with topic scheduling and progress monitoring."
  },
  {
    icon: BarChart3,
    title: "Results & Analytics",
    description: "Detailed performance analytics with semester-wise tracking and insights."
  },
  {
    icon: Clock,
    title: "Timetable & Scheduling",
    description: "Dynamic timetables with real-time updates and conflict detection."
  },
  {
    icon: FolderOpen,
    title: "Study Materials",
    description: "Centralized resource library for notes, assignments, and course materials."
  },
  {
    icon: Bell,
    title: "Announcements",
    description: "Instant notifications for academic updates, events, and important notices."
  }
];

export const FeaturesSection = () => {
  return (
    <section id="features" className="py-20 md:py-32 bg-muted/30">
      <div className="container mx-auto px-4 md:px-6">
        {/* Section header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            Everything You Need for
            <span className="text-primary"> Academic Excellence</span>
          </h2>
          <p className="text-lg text-muted-foreground">
            A complete suite of tools designed to streamline academic operations 
            and enhance the learning experience.
          </p>
        </div>

        {/* Features grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, index) => (
            <Card 
              key={feature.title}
              className="group bg-card hover:shadow-lg transition-all duration-300 hover:-translate-y-1 border-border"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <CardContent className="p-6">
                <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                  <feature.icon className="w-6 h-6 text-primary" />
                </div>
                <h3 className="text-lg font-semibold text-foreground mb-2">
                  {feature.title}
                </h3>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  {feature.description}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};
