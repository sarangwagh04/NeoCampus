import TiltedCard from "@/components/ui/tilted-card";
import ProfileCard from "@/components/ui/profile-card";
import { motion } from "framer-motion";

const developers = [
  {
    name: "Sarang Wagh",
    title: "Backend Developer",
    handle: "frontend_dev",
    avatarUrl: "/avatars/sarang.jpg"
  },
  {
    name: "Shubham Gadekar",
    title: "System Design",
    handle: "backend_dev",
    avatarUrl: "https://images.unsplash.com/photo-1568602471122-7832951cc4c5?w=400&h=500&fit=crop&crop=face"
  },
  {
    name: "Rushi Rajarupe",
    title: "Frontend Developer",
    handle: "fullstack_dev",
    avatarUrl: "/avatars/rushi.heic"
  },
  {
    name: "Siddharth Wake",
    title: "Full Stack Developer",
    handle: "system_dev",
    avatarUrl: "/avatars/siddharth.jpeg"
  }
];

const mentors = [
  {
    name: "Dr. R. Tambe",
    expertise: "Guide",
    avatarUrl: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&h=500&fit=crop&crop=face"
  },
  {
    name: "Prof. Pondhe",
    expertise: "Co-Ordinator",
    avatarUrl: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&h=500&fit=crop&crop=face"
  }
];

export const TeamSection = () => {
  return (
    <section id="team" className="py-20 md:py-32 bg-background">
      <div className="container mx-auto px-4 md:px-6">
        {/* Section header */}
        <motion.div 
          className="text-center max-w-3xl mx-auto mb-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            Built by
            <span className="text-primary"> Educators & Engineers</span>
          </h2>
          <p className="text-lg text-muted-foreground">
            A dedicated team of developers guided by experienced mentors, 
            creating solutions that truly understand academic needs.
          </p>
        </motion.div>

        {/* Developers - Using ProfileCard without contact/mini profile */}
        <div className="mb-16">
          <motion.h3 
            className="text-xl font-semibold text-foreground text-center mb-8"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            Development Team
          </motion.h3>
          <div className="flex flex-wrap justify-center gap-6 md:gap-8">
            {developers.map((dev, index) => (
              <motion.div
                key={dev.name}
                className="will-change-transform"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <ProfileCard
                  name={dev.name}
                  title={dev.title}
                  avatarUrl={dev.avatarUrl}
                  showUserInfo={false}
                  enableTilt={true}
                  enableMobileTilt={true}
                  behindGlowEnabled={true}
                  behindGlowColor="hsla(255, 100%, 70%, 0.6)"
                  innerGradient="linear-gradient(145deg, hsla(255, 40%, 45%, 0.55) 0%, hsla(177, 60%, 70%, 0.27) 100%)"
                />
              </motion.div>
            ))}
          </div>
        </div>

        {/* Mentors - Using TiltedCard */}
        <div>
          <motion.h3 
            className="text-xl font-semibold text-foreground text-center mb-8"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            Project Mentors
          </motion.h3>
          <div className="flex flex-wrap justify-center gap-8 max-w-3xl mx-auto">
            {mentors.map((mentor, index) => (
              <motion.div
                key={mentor.name}
                className="will-change-transform"
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ duration: 0.5, delay: index * 0.15 }}
              >
                <TiltedCard
                  imageSrc={mentor.avatarUrl}
                  altText={mentor.name}
                  captionText={`${mentor.name} - ${mentor.expertise}`}
                  containerHeight="280px"
                  containerWidth="280px"
                  imageHeight="280px"
                  imageWidth="280px"
                  rotateAmplitude={12}
                  scaleOnHover={1.05}
                  showMobileWarning={false}
                  showTooltip={true}
                  displayOverlayContent={true}
                  overlayContent={
                    <div className="absolute top-0 left-0 right-0 w-full flex justify-center pt-3">
                      <div className="bg-muted/90 dark:bg-muted/80 backdrop-blur-sm text-foreground px-4 py-2 rounded-lg shadow-lg border border-border">
                        <p className="font-semibold text-sm">{mentor.name} - {mentor.expertise}</p>
                      </div>
                    </div>
                  }
                />
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};
