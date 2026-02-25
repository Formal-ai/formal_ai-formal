import { useState, useEffect, useRef } from "react";
import { Menu, X, Moon, Sun, ChevronDown, LogOut } from "lucide-react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { NavigationMenu, NavigationMenuContent, NavigationMenuItem, NavigationMenuLink, NavigationMenuList, NavigationMenuTrigger } from "@/components/ui/navigation-menu";
import formalAiLogo from "@/assets/formal-ai-logo.png";
import { cn } from "@/lib/utils";
import { useTheme } from "next-themes";

const LAUNCH_MODE = import.meta.env.VITE_LAUNCH_MODE || "live";

const Header = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { theme, setTheme } = useTheme();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [user, setUser] = useState<any>(null);
  const headerRef = useRef<HTMLDivElement>(null);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!headerRef.current) return;
    const rect = headerRef.current.getBoundingClientRect();
    setMousePosition({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    });
  };

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };

    window.addEventListener("scroll", handleScroll);

    // Auth listener
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchProfile(session.user.id);
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchProfile(session.user.id);
      } else {
        setProfileName("");
      }
    });

    return () => {
      window.removeEventListener("scroll", handleScroll);
      subscription.unsubscribe();
    };
  }, []);

  const [profileName, setProfileName] = useState("");

  const fetchProfile = async (userId: string) => {
    const { data, error } = await supabase
      .from('profiles')
      .select('full_name')
      .eq('id', userId)
      .single();

    // @ts-expect-error
    if (data?.full_name) {
      // @ts-expect-error
      setProfileName(data.full_name.split(' ')[0]);
    }
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate("/");
  };

  const toggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark");
  };

  const isDark = theme === "dark";

  return (
    <header
      ref={headerRef}
      onMouseMove={handleMouseMove}
      className="sticky top-0 z-50 py-2 sm:py-4 transition-all duration-300 pointer-events-none"
    >
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 pointer-events-auto">
        <div
          className={cn(
            "relative flex items-center justify-between h-14 sm:h-16 liquid-glass-nav px-4 sm:px-6 group transition-all duration-500 transform-gpu",
            isScrolled ? "bg-background/90 shadow-xl border-primary/20" : "bg-background/40 border-transparent"
          )}
          style={{
            '--mouse-x': `${mousePosition.x}px`,
            '--mouse-y': `${mousePosition.y}px`,
            '--light-opacity': isScrolled ? '0.4' : '1',
          } as React.CSSProperties}
        >
          {/* Logo */}
          <div className="flex items-center min-w-0">
            <Link to="/" className="flex items-center gap-1.5 sm:gap-2">
              <div className="w-8 h-8 sm:w-10 sm:h-10 bg-black rounded-lg flex items-center justify-center flex-shrink-0 border-2 border-white overflow-hidden p-0">
                <img src={formalAiLogo} alt="Formal.AI Logo" className="w-full h-full object-contain p-1" />
              </div>
              <span className="text-base sm:text-xl font-bold font-serif truncate">
                {profileName ? `${profileName}'s Studio` : "Formal.AI"}
              </span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-2 relative z-10">
            <Link
              to="/"
              className={`glass-nav-item rounded-full px-4 py-2 transition-all nav-underline-effect ${location.pathname === "/" ? "active" : ""}`}
            >
              Home
            </Link>

            {LAUNCH_MODE === "waitlist" ? (
              <Link
                to="/waitlist"
                className={`glass-nav-item rounded-full px-4 py-2 transition-all nav-underline-effect ${location.pathname === "/waitlist" ? "active" : ""}`}
              >
                Waitlist
              </Link>
            ) : (
              <>
                <NavigationMenu>
                  <NavigationMenuList>
                    <NavigationMenuItem>
                      <NavigationMenuTrigger className="glass-nav-item rounded-full px-4 py-2 bg-transparent hover:bg-accent/50 data-[state=open]:bg-accent/50">
                        Studios
                      </NavigationMenuTrigger>
                      <NavigationMenuContent>
                        <ul className="grid w-[240px] gap-1 p-2 bg-background/95 backdrop-blur-xl border border-border shadow-xl rounded-lg">
                          <li>
                            <NavigationMenuLink asChild>
                              <Link
                                to="/portrait-studio"
                                className="block select-none rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground"
                              >
                                <div className="text-sm font-medium">Portrait Studio</div>
                              </Link>
                            </NavigationMenuLink>
                          </li>
                          <li>
                            <NavigationMenuLink asChild>
                              <Link
                                to="/hair-studio"
                                className="block select-none rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground"
                              >
                                <div className="text-sm font-medium">Hair Studio</div>
                              </Link>
                            </NavigationMenuLink>
                          </li>
                          <li>
                            <NavigationMenuLink asChild>
                              <Link
                                to="/accessories-studio"
                                className="block select-none rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground"
                              >
                                <div className="text-sm font-medium">Accessories Studio</div>
                              </Link>
                            </NavigationMenuLink>
                          </li>
                          <li>
                            <NavigationMenuLink asChild>
                              <Link
                                to="/background-studio"
                                className="block select-none rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground"
                              >
                                <div className="text-sm font-medium">Background Studio</div>
                              </Link>
                            </NavigationMenuLink>
                          </li>
                          <li>
                            <NavigationMenuLink asChild>
                              <Link
                                to="/prompt-yourself-studio"
                                className="block select-none rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground"
                              >
                                <div className="text-sm font-medium">Prompt Yourself Studio</div>
                              </Link>
                            </NavigationMenuLink>
                          </li>
                        </ul>
                      </NavigationMenuContent>
                    </NavigationMenuItem>
                  </NavigationMenuList>
                </NavigationMenu>

                <Link
                  to="/pricing"
                  className={`glass-nav-item rounded-full px-4 py-2 transition-all nav-underline-effect ${location.pathname === "/pricing" ? "active" : ""}`}
                >
                  Pricing
                </Link>
                <Link
                  to="/contacts"
                  className={`glass-nav-item rounded-full px-4 py-2 transition-all nav-underline-effect ${location.pathname === "/contacts" ? "active" : ""}`}
                >
                  Contacts
                </Link>
              </>
            )}

            <Link
              to="/about"
              className={`glass-nav-item rounded-full px-4 py-2 transition-all nav-underline-effect ${location.pathname === "/about" ? "active" : ""}`}
            >
              About
            </Link>
          </nav>

          {/* Actions */}
          <div className="flex items-center gap-2 sm:gap-4 flex-shrink-0 relative z-10">
            <button
              onClick={toggleTheme}
              className="p-1.5 sm:p-2 rounded-full glass-nav-item transition-all"
              aria-label="Toggle theme"
            >
              {isDark ? (
                <Sun className="h-4 w-4 sm:h-5 sm:w-5" />
              ) : (
                <Moon className="h-4 w-4 sm:h-5 sm:w-5" />
              )}
            </button>

            {user && LAUNCH_MODE !== "waitlist" ? (
              <div className="flex items-center gap-4">
                <Link to="/dashboard">
                  <Button className="hidden md:flex bg-primary/90 backdrop-blur-sm hover:bg-primary text-primary-foreground rounded-full px-6 py-2 hover:scale-105 transition-all shadow-lg">
                    Dashboard
                  </Button>
                </Link>
                <button
                  onClick={handleSignOut}
                  className="hidden md:flex p-2 rounded-full glass-nav-item hover:bg-red-500/10 hover:text-red-500 transition-all"
                  title="Sign Out"
                >
                  <LogOut className="h-5 w-5" />
                </button>
              </div>
            ) : LAUNCH_MODE === "waitlist" ? (
              <Link to="/waitlist" className="hidden md:flex">
                <Button className="ios-glass-button rounded-full px-6 py-2 hover:scale-105 transition-all">
                  Join The Waitlist
                </Button>
              </Link>
            ) : (
              <div className="flex items-center gap-2">
                <Link to="/auth">
                  <Button variant="ghost" className="hidden md:flex text-sm font-medium hover:bg-transparent hover:text-primary transition-colors">
                    Log in
                  </Button>
                </Link>
                <Link to="/auth?signup=true">
                  <Button className="hidden md:flex bg-primary/90 backdrop-blur-sm hover:bg-primary text-primary-foreground rounded-full px-6 py-2 hover:scale-105 transition-all shadow-lg">
                    Sign Up
                  </Button>
                </Link>
              </div>
            )}

            {/* Mobile Menu Button */}
            <button
              className="md:hidden p-1.5 sm:p-2"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              aria-label="Toggle menu"
            >
              {isMenuOpen ? <X className="h-5 w-5 sm:h-6 sm:w-6" /> : <Menu className="h-5 w-5 sm:h-6 sm:w-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden py-6 border-t border-border animate-fade-in px-4 bg-background/95 backdrop-blur-xl">
            <nav className="flex flex-col gap-6 items-end">
              <Link
                to="/"
                className="text-lg font-medium hover:text-primary transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                Home
              </Link>
              {LAUNCH_MODE === "waitlist" ? (
                <>
                  <Link
                    to="/waitlist"
                    className="text-lg font-medium hover:text-primary transition-colors"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Waitlist
                  </Link>
                  <Link
                    to="/about"
                    className="text-lg font-medium hover:text-primary transition-colors"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    About
                  </Link>
                  <Link to="/waitlist" className="w-full flex justify-end pt-2">
                    <Button
                      className="ios-glass-button rounded-full w-fit px-10 py-6 text-base font-semibold"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      Join The Waitlist
                    </Button>
                  </Link>
                </>
              ) : (
                <>
                  <div className="text-sm font-medium text-muted-foreground pr-2">Studios</div>
                  {[
                    { name: "Portrait Studio", path: "/portrait-studio" },
                    { name: "Hair Studio", path: "/hair-studio" },
                    { name: "Accessories Studio", path: "/accessories-studio" },
                    { name: "Background Studio", path: "/background-studio" },
                    { name: "Prompt Yourself Studio", path: "/prompt-yourself-studio" },
                  ].map((studio) => (
                    <Link
                      key={studio.path}
                      to={studio.path}
                      className="text-lg font-medium hover:text-primary transition-colors pr-4"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      {studio.name}
                    </Link>
                  ))}
                  <Link
                    to="/pricing"
                    className="text-lg font-medium hover:text-primary transition-colors"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Pricing
                  </Link>
                  <Link
                    to="/contacts"
                    className="text-lg font-medium hover:text-primary transition-colors"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Contacts
                  </Link>
                  <Link
                    to="/about"
                    className="text-lg font-medium hover:text-primary transition-colors"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    About
                  </Link>
                  <Link to="/dashboard" className="w-full flex justify-end pt-2">
                    <Button
                      className="bg-primary hover:bg-primary/90 text-primary-foreground rounded-full w-fit px-10 py-6 text-base"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      Join Now
                    </Button>
                  </Link>
                </>
              )}
            </nav>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;
