import { Monitor, Tablet, Smartphone, Moon, Zap, Sparkles } from "lucide-react";

const features = [
  {
    icon: Monitor,
    title: "Desktop Optimized",
    description: "Full-featured experience on larger screens"
  },
  {
    icon: Tablet,
    title: "Tablet Ready",
    description: "Perfect for classroom and mobile teaching"
  },
  {
    icon: Smartphone,
    title: "Mobile First",
    description: "Attendance marking designed for phones"
  },
  {
    icon: Zap,
    title: "Lightning Fast",
    description: "Optimized performance on all devices"
  },
  {
    icon: Moon,
    title: "Dark Mode Ready",
    description: "Easy on the eyes, day or night"
  },
  {
    icon: Sparkles,
    title: "Modern UI",
    description: "Clean, intuitive interface design"
  }
];

export const ResponsiveSection = () => {
  return (
    <section className="py-20 md:py-32 bg-background">
      <div className="container mx-auto px-4 md:px-6">
        {/* Section header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            Responsive &
            <span className="text-primary"> Modern Design</span>
          </h2>
          <p className="text-lg text-muted-foreground">
            Access NeoCampus from any device, anywhere. Our responsive design 
            ensures a seamless experience across all screen sizes.
          </p>
        </div>

        {/* Features grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
          {features.map((feature) => (
            <div 
              key={feature.title}
              className="text-center p-6 rounded-2xl bg-muted/30 hover:bg-muted/50 transition-colors"
            >
              <div className="w-14 h-14 bg-primary/10 rounded-xl flex items-center justify-center mx-auto mb-4">
                <feature.icon className="w-7 h-7 text-primary" />
              </div>
              <h3 className="font-semibold text-foreground mb-2">{feature.title}</h3>
              <p className="text-sm text-muted-foreground">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
