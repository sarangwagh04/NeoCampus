import { LogIn, LayoutDashboard, CalendarCheck, BookOpen, BarChart3, Lightbulb, ArrowRight } from "lucide-react";

const steps = [
  {
    icon: LogIn,
    title: "Login",
    description: "Secure JWT authentication"
  },
  {
    icon: LayoutDashboard,
    title: "Dashboard",
    description: "Personalized overview"
  },
  {
    icon: BookOpen,
    title: "Teaching Plan",
    description: "Structured learning"
  },
  {
    icon: CalendarCheck,
    title: "Attendance",
    description: "Track & manage"
  },
  {
    icon: BarChart3,
    title: "Results",
    description: "Performance data"
  },
  {
    icon: Lightbulb,
    title: "Insights",
    description: "Smart analytics"
  }
];

export const WorkflowSection = () => {
  return (
    <section className="py-20 md:py-32 bg-muted/30">
      <div className="container mx-auto px-4 md:px-6">
        {/* Section header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            Smart Academic
            <span className="text-primary"> Workflow</span>
          </h2>
          <p className="text-lg text-muted-foreground">
            A seamless journey from login to insights, designed to simplify 
            academic management at every step.
          </p>
        </div>

        {/* Workflow steps */}
        <div className="relative">
        {/* Desktop view - horizontal */}
          <div className="hidden lg:flex items-start justify-center gap-4 max-w-5xl mx-auto">
            {steps.map((step, index) => (
              <div key={step.title} className="flex items-start">
                <div className="flex flex-col items-center text-center">
                  <div className="w-16 h-16 bg-card border-2 border-primary/20 rounded-2xl flex items-center justify-center mb-4 shadow-sm hover:shadow-md hover:border-primary/40 transition-all">
                    <step.icon className="w-7 h-7 text-primary" />
                  </div>
                  <h3 className="font-semibold text-foreground mb-1">{step.title}</h3>
                  <p className="text-xs text-muted-foreground max-w-[100px]">{step.description}</p>
                </div>
                {index < steps.length - 1 && (
                  <div className="flex items-center justify-center w-8 mt-5">
                    <ArrowRight className="w-5 h-5 text-primary/40" />
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Mobile/Tablet view - vertical */}
          <div className="lg:hidden space-y-4 flex flex-col items-center">
            {steps.map((step, index) => (
              <div key={step.title} className="flex items-center gap-4">
                <div className="relative">
                  <div className="w-14 h-14 bg-card border-2 border-primary/20 rounded-xl flex items-center justify-center shadow-sm">
                    <step.icon className="w-6 h-6 text-primary" />
                  </div>
                  {index < steps.length - 1 && (
                    <div className="absolute top-full left-1/2 -translate-x-1/2 w-0.5 h-4 bg-primary/20" />
                  )}
                </div>
                <div>
                  <h3 className="font-semibold text-foreground">{step.title}</h3>
                  <p className="text-sm text-muted-foreground">{step.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};
