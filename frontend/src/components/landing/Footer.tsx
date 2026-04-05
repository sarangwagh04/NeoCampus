import { GraduationCap } from "lucide-react";
import { Link } from "react-router-dom";

export const Footer = () => {
  return (
    <footer className="bg-sidebar text-sidebar-foreground py-12">
      <div className="container mx-auto px-4 md:px-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* Brand */}
          <div className="md:col-span-2">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center">
                <GraduationCap className="w-6 h-6 text-primary-foreground" />
              </div>
              <span className="text-xl font-bold">NeoCampus</span>
            </div>
            <p className="text-sidebar-muted text-sm max-w-md">
              Smart Academic Management System for modern campuses. 
              Built to streamline academic operations and enhance the learning experience.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-semibold mb-4">Quick Links</h4>
            <ul className="space-y-2 text-sm text-sidebar-muted">
              <li>
                <Link to="/student" className="hover:text-sidebar-foreground transition-colors">
                  Student Login
                </Link>
              </li>
              <li>
                <Link to="/staff" className="hover:text-sidebar-foreground transition-colors">
                  Staff Login
                </Link>
              </li>
              <li>
                <a href="#features" className="hover:text-sidebar-foreground transition-colors">
                  Features
                </a>
              </li>
              <li>
                <a href="#team" className="hover:text-sidebar-foreground transition-colors">
                  Team
                </a>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-semibold mb-4">Contact</h4>
            <ul className="space-y-2 text-sm text-sidebar-muted">
              <li>support@neocampus.edu</li>
              <li>+91 XXXXX XXXXX</li>
            </ul>
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-sidebar-border pt-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-sidebar-muted">
            <p>© {new Date().getFullYear()} NeoCampus. All rights reserved.</p>
            <p>
              A project by students, guided by mentors, built for real campuses.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};
