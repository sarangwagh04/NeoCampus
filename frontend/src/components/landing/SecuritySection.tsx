import { Shield, Lock, Users, Server, CheckCircle2 } from "lucide-react";

const securityFeatures = [
  {
    icon: Lock,
    title: "JWT Authentication",
    description: "Secure token-based authentication protecting every session"
  },
  {
    icon: Users,
    title: "Role-Based Access",
    description: "Granular permissions ensuring data visibility control"
  },
  {
    icon: Shield,
    title: "Data Protection",
    description: "Encrypted academic data with secure handling practices"
  },
  {
    icon: Server,
    title: "Scalable Architecture",
    description: "Built to grow with your institution's needs"
  }
];

export const SecuritySection = () => {
  return (
    <section className="py-20 md:py-32 bg-muted/30">
      <div className="container mx-auto px-4 md:px-6">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Content */}
          <div>
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Security &
              <span className="text-primary"> Reliability</span>
            </h2>
            <p className="text-lg text-muted-foreground mb-8">
              Built with enterprise-grade security practices to protect 
              sensitive academic data and ensure uninterrupted operations.
            </p>

            <div className="space-y-6">
              {securityFeatures.map((feature) => (
                <div key={feature.title} className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center shrink-0">
                    <feature.icon className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground mb-1">{feature.title}</h3>
                    <p className="text-sm text-muted-foreground">{feature.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Visual */}
          <div className="relative">
            <div className="bg-card rounded-3xl p-8 border border-border/50 shadow-lg">
              <div className="text-center mb-8">
                <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Shield className="w-10 h-10 text-primary" />
                </div>
                <h3 className="text-xl font-bold text-foreground">Trusted Platform</h3>
              </div>

              <div className="space-y-4">
                {[
                  "End-to-end encryption",
                  "Regular security audits",
                  "GDPR compliant practices",
                  "99.9% uptime guarantee",
                  "Automatic backups"
                ].map((item) => (
                  <div key={item} className="flex items-center gap-3 bg-muted/50 rounded-lg px-4 py-3">
                    <CheckCircle2 className="w-5 h-5 text-success shrink-0" />
                    <span className="text-sm text-foreground">{item}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Decorative elements */}
            <div className="absolute -top-4 -right-4 w-24 h-24 bg-primary/10 rounded-full blur-2xl" />
            <div className="absolute -bottom-4 -left-4 w-32 h-32 bg-primary/5 rounded-full blur-2xl" />
          </div>
        </div>
      </div>
    </section>
  );
};
