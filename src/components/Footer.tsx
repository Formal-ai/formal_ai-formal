import { Link } from "react-router-dom";
import { Facebook, Instagram, Linkedin, Twitter, Copyright } from "lucide-react";
import formalAiLogo from "@/assets/formal-ai-logo.png";

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t border-border/20 mt-16 ios-glass-card mx-4 rounded-[2rem] mb-4 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 lg:gap-8">

          {/* Formal.AI Links */}
          <div className="space-y-6">
            <h3 className="font-bold text-lg">Formal.AI</h3>
            <ul className="space-y-4">
              <li>
                <Link to="/" className="text-muted-foreground hover:text-primary transition-colors">
                  Landing Page
                </Link>
              </li>
              <li>
                <Link to="/careers" className="text-muted-foreground hover:text-primary transition-colors">
                  Careers
                </Link>
              </li>
              <li>
                <Link to="/auth" className="text-muted-foreground hover:text-primary transition-colors">
                  Login
                </Link>
              </li>
              <li>
                <Link to="/auth" className="text-muted-foreground hover:text-primary transition-colors">
                  Sign Up
                </Link>
              </li>
            </ul>
          </div>

          {/* Resources Links */}
          <div className="space-y-6">
            <h3 className="font-bold text-lg">Resources</h3>
            <ul className="space-y-4">
              <li>
                <Link to="/terms" className="text-muted-foreground hover:text-primary transition-colors">
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link to="/privacy" className="text-muted-foreground hover:text-primary transition-colors">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link to="/pricing" className="text-muted-foreground hover:text-primary transition-colors">
                  Pricing
                </Link>
              </li>
              <li>
                <Link to="/documentation" className="text-muted-foreground hover:text-primary transition-colors">
                  Documentation
                </Link>
              </li>
            </ul>
          </div>

          {/* Authenticated/Platform Links */}
          <div className="space-y-6">
            <h3 className="font-bold text-lg">Platform</h3>
            <ul className="space-y-4">
              <li>
                <Link to="/dashboard" className="text-muted-foreground hover:text-primary transition-colors">
                  Dashboard
                </Link>
              </li>
              <li>
                <Link to="/generate" className="text-muted-foreground hover:text-primary transition-colors">
                  Generate
                </Link>
              </li>
              <li>
                <Link to="/history" className="text-muted-foreground hover:text-primary transition-colors">
                  History
                </Link>
              </li>
              <li>
                <Link to="/settings" className="text-muted-foreground hover:text-primary transition-colors">
                  Settings
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact Links (Icons) */}
          <div className="space-y-6">
            <h3 className="font-bold text-lg">Contact</h3>
            <div className="flex flex-col space-y-4">
              <a href="#" className="flex items-center gap-2 text-muted-foreground hover:text-pink-600 transition-colors">
                <Instagram className="h-5 w-5" />
                <span className="text-sm">Instagram</span>
              </a>
              <a href="#" className="flex items-center gap-2 text-muted-foreground hover:text-blue-600 transition-colors">
                <Facebook className="h-5 w-5" />
                <span className="text-sm">Facebook</span>
              </a>
              <a href="#" className="flex items-center gap-2 text-muted-foreground hover:text-black dark:hover:text-white transition-colors">
                {/* Tiktok standard icon is not in Lucide, using text/placeholder or similar */}
                <div className="h-5 w-5 flex items-center justify-center font-bold text-xs bg-current rounded-sm text-background">T</div>
                <span className="text-sm">TikTok</span>
              </a>
              <a href="#" className="flex items-center gap-2 text-muted-foreground hover:text-blue-700 transition-colors">
                <Linkedin className="h-5 w-5" />
                <span className="text-sm">LinkedIn</span>
              </a>
              <a href="#" className="flex items-center gap-2 text-muted-foreground hover:text-black dark:hover:text-white transition-colors">
                <Twitter className="h-5 w-5" />
                <span className="text-sm">X (Twitter)</span>
              </a>
            </div>
          </div>

        </div>

        {/* Sub-footer */}
        <div className="mt-12 pt-8 border-t border-border/10 flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <span>Powered by Formal.AI</span>
          </div>
          <div className="flex items-center gap-1">
            <span>All rights reserved</span>
            <Copyright className="h-3 w-3" />
            <span>formal.ai {currentYear}</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
