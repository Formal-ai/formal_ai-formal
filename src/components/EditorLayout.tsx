import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  Upload,
  User,
  Scissors,
  Palette,
  Image,
  Sparkles,
  History,
  Download,
  UserCircle,
  Settings,
  Menu,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import formalAiLogo from "@/assets/formal-ai-logo.png";

const EditorLayout = ({ children }: { children: React.ReactNode }) => {
  const location = useLocation();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  const navItems = [
    { path: "/dashboard", label: "Dashboard", icon: LayoutDashboard },

    { path: "/portrait-studio", label: "Portrait Studio", icon: User },
    { path: "/hair-studio", label: "Hair Studio", icon: Scissors },
    { path: "/accessories-studio", label: "Accessories Studio", icon: Palette },
    { path: "/background-studio", label: "Background Studio", icon: Image },
    { path: "/prompt-yourself-studio", label: "PromptYourself Studio", icon: Sparkles },
    { path: "/history", label: "History", icon: History },
    { path: "/downloads", label: "Downloads", icon: Download },
    { path: "/account", label: "Account", icon: UserCircle },
    { path: "/settings", label: "Settings", icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-background flex">
      {/* Sidebar */}
      <aside
        className={`${isSidebarOpen ? "w-64" : "w-20"
          } bg-card border-r border-border transition-all duration-300 flex flex-col fixed left-0 top-0 h-screen z-40`}
      >
        {/* Logo & Toggle */}
        <div className="p-4 border-b border-border flex items-center justify-between">
          {isSidebarOpen ? (
            <Link to="/" className="flex items-center gap-2">
              <div className="w-8 h-8 bg-black rounded-lg flex items-center justify-center border-2 border-white overflow-hidden">
                <img src={formalAiLogo} alt="Formal.AI" className="w-full h-full object-cover scale-150" />
              </div>
              <span className="font-bold font-serif">Formal.AI</span>
            </Link>
          ) : (
            <div className="w-8 h-8 bg-black rounded-lg flex items-center justify-center border-2 border-white overflow-hidden mx-auto">
              <img src={formalAiLogo} alt="Formal.AI" className="w-full h-full object-cover scale-150" />
            </div>
          )}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className={!isSidebarOpen ? "absolute top-4 right-2" : ""}
          >
            {isSidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto py-4">
          <ul className="space-y-1 px-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              return (
                <li key={item.path}>
                  <Link
                    to={item.path}
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors ${isActive
                        ? "bg-primary text-primary-foreground"
                        : "hover:bg-accent hover:text-accent-foreground"
                      }`}
                  >
                    <Icon className="h-5 w-5 flex-shrink-0" />
                    {isSidebarOpen && <span className="text-sm font-medium">{item.label}</span>}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>
      </aside>

      {/* Main Content */}
      <main
        className={`flex-1 ${isSidebarOpen ? "ml-64" : "ml-20"} transition-all duration-300`}
      >
        {children}
      </main>
    </div>
  );
};

export default EditorLayout;
