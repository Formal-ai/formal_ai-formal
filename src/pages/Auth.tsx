import { useState, useEffect, useRef } from "react";
import { useNavigate, useSearchParams, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Loader2, Mail, CheckCircle2, AlertCircle, ArrowRight } from "lucide-react";
import formalAiHero from "@/assets/auth-hero-new.jpg";
import signupHero from "@/assets/signup-hero.jpg";
import formalAiLogo from "@/assets/formal-ai-logo.png";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

const Auth = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [isLoading, setIsLoading] = useState(false);
  const [isSignUp, setIsSignUp] = useState(searchParams.get("signup") === "true");
  const [isForgotPassword, setIsForgotPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [fullName, setFullName] = useState("");
  const [password, setPassword] = useState("");
  const [verificationSent, setVerificationSent] = useState(false);
  const [resetSent, setResetSent] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [resendCountdown, setResendCountdown] = useState(0);

  // Animation state
  const sideSectionRef = useRef<HTMLDivElement>(null);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!sideSectionRef.current) return;
    const rect = sideSectionRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    setMousePosition({ x, y });
  };

  useEffect(() => {
    // Check if user is already logged in
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        navigate("/dashboard");
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (session) {
        navigate("/dashboard");
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  const validatePassword = (pass: string) => {
    if (pass.length >= 15) return true;
    const hasNumber = /\d/.test(pass);
    const hasLower = /[a-z]/.test(pass);
    return pass.length >= 8 && hasNumber && hasLower;
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });

      if (error) throw error;
      setResetSent(true);
      toast.success("Password reset link sent! Check your email.");
    } catch (error: any) {
      console.error("Reset error:", error);
      setError(error.message || "An error occurred while sending reset email.");
      toast.error(error.message || "An error occurred.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    if (isSignUp && !validatePassword(password)) {
      setError("Password should be at least 15 characters OR at least 8 characters including a number and a lowercase letter.");
      setIsLoading(false);
      return;
    }

    try {
      if (isSignUp) {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: `${window.location.origin}/auth?verified=true`,
            data: {
              full_name: fullName,
            }
          }
        });

        if (error) throw error;
        setVerificationSent(true);
        toast.success("Account created successfully! Check your email to activate.");
      } else {
        const { error, data } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (error) throw error;

        // Check if email is confirmed
        if (data.user && !data.user.email_confirmed_at) {
          setError("Please confirm your email address before signing in.");
          await supabase.auth.signOut();
          return;
        }

        toast.success("Welcome back!");
        const redirectTo = searchParams.get("redirectTo") || "/dashboard";
        navigate(redirectTo);
      }
    } catch (error: any) {
      console.error("Auth error:", error);
      let errorMessage = "An error occurred during authentication";

      if (error.message.includes("Invalid login credentials")) {
        errorMessage = "Invalid email or password. Please try again.";
      } else if (error.message.includes("User already registered")) {
        errorMessage = "This email is already registered. Please sign in instead.";
      } else if (error.message.includes("Password should be at least")) {
        errorMessage = "Password does not meet safety requirements.";
      } else if (error.message.includes("Email not confirmed")) {
        errorMessage = "Please verify your email address before logging in.";
      }

      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendVerification = async () => {
    if (!email || resendCountdown > 0) return;
    setIsLoading(true);
    try {
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email,
        options: {
          emailRedirectTo: `${window.location.origin}/auth?verified=true`,
        }
      });
      if (error) throw error;
      toast.success("Verification email resent!");
      setResendCountdown(60);
      const timer = setInterval(() => {
        setResendCountdown((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } catch (error: any) {
      toast.error(error.message || "Failed to resend verification email.");
    } finally {
      setIsLoading(false);
    }
  };

  if (verificationSent || searchParams.get("verification") === "pending") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4 animate-fade-in text-white">
        <div className="w-full max-w-md text-center space-y-6">
          <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
            <Mail className="w-8 h-8 text-primary" />
          </div>
          <h2 className="text-3xl font-bold tracking-tight">Check your inbox</h2>
          <p className="text-muted-foreground text-lg">
            We've sent a verification link to <span className="font-semibold text-foreground">{email || "your email"}</span>.
            Please confirm your email to activate your account and access the Studios.
          </p>
          <div className="pt-4 flex flex-col gap-3">
            <Button
              variant="default"
              onClick={handleResendVerification}
              disabled={isLoading || resendCountdown > 0}
              className="rounded-full px-8 h-12 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold"
            >
              {isLoading ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : resendCountdown > 0 ? (
                `Resend in ${resendCountdown}s`
              ) : (
                "Resend Verification Email"
              )}
            </Button>
            <Button variant="outline" onClick={() => {
              setVerificationSent(false);
              navigate("/auth");
            }} className="rounded-full px-8 h-12 border-white/20 text-white hover:bg-white/5">
              Back to Sign In
            </Button>
          </div>
        </div>
      </div>
    );
  }

  if (resetSent) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4 animate-fade-in text-white">
        <div className="w-full max-w-md text-center space-y-6">
          <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle2 className="w-8 h-8 text-primary" />
          </div>
          <h2 className="text-3xl font-bold tracking-tight">Email Sent</h2>
          <p className="text-muted-foreground text-lg">
            We've sent a password reset link to <span className="font-semibold text-foreground">{email}</span> if an account exists.
          </p>
          <div className="pt-4 flex flex-col gap-3">
            <Button variant="outline" onClick={() => {
              setResetSent(false);
              setIsForgotPassword(false);
            }} className="rounded-full px-8">
              Back to Sign In
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen grid lg:grid-cols-2 bg-background">
      {/* Left Column - Form */}
      <div className="flex flex-col justify-center p-8 md:p-12 lg:p-16 xl:p-24 animate-fade-in">
        <div className="w-full max-w-sm mx-auto space-y-8">
          {/* Logo */}
          <div className="flex items-center gap-2 mb-8">
            <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center border border-primary/20">
              <img src={formalAiLogo} alt="Formal.AI" className="w-10 h-10 object-contain" />
            </div>
            <span className="text-xl font-bold font-serif">Formal.AI</span>
          </div>

          <div className="space-y-2">
            <h1 className="text-3xl md:text-4xl font-bold tracking-tight">
              {isForgotPassword ? "Reset Password" : (isSignUp ? "Create an account" : "Welcome back")}
            </h1>
            <p className="text-muted-foreground">
              {isForgotPassword
                ? "Enter your email to receive a reset link"
                : (isSignUp ? "Enter your details to get started" : "Enter your credentials to access your account")}
            </p>
          </div>

          {searchParams.get("verified") === "true" && (
            <Alert className="bg-green-500/10 border-green-500/50 text-green-600 dark:text-green-400">
              <CheckCircle2 className="h-4 w-4" />
              <AlertTitle>Success</AlertTitle>
              <AlertDescription>Your email has been verified! You can now sign in.</AlertDescription>
            </Alert>
          )}

          {error && (
            <Alert variant="destructive" className="animate-in fade-in-0 slide-in-from-top-1">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <form onSubmit={isForgotPassword ? handleForgotPassword : handleAuth} className="space-y-6">
            <div className="space-y-4">
              {isSignUp && !isForgotPassword && (
                <div className="space-y-2 animate-slide-up">
                  <Label htmlFor="full-name">Full name*</Label>
                  <Input
                    id="full-name"
                    type="text"
                    placeholder="John Doe"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    required
                    className="h-12 rounded-xl bg-muted/50 border-transparent focus:border-primary focus:bg-background transition-all"
                  />
                </div>
              )}
              <div className="space-y-2">
                <Label htmlFor="email">Email*</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="h-12 rounded-xl bg-muted/50 border-transparent focus:border-primary focus:bg-background transition-all"
                />
              </div>
              {!isForgotPassword && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="password">Password*</Label>
                    {!isSignUp && (
                      <button
                        type="button"
                        onClick={() => {
                          setIsForgotPassword(true);
                          setError(null);
                        }}
                        className="text-sm font-medium text-primary hover:underline"
                      >
                        Forgot password?
                      </button>
                    )}
                  </div>
                  <Input
                    id="password"
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="h-12 rounded-xl bg-muted/50 border-transparent focus:border-primary focus:bg-background transition-all"
                  />
                  {isSignUp && (
                    <p className="text-[10px] text-muted-foreground px-1 leading-tight">
                      Password should be at least 15 characters OR at least 8 characters including a number and a lowercase letter.
                    </p>
                  )}
                </div>
              )}
            </div>

            <Button type="submit" className="w-full h-12 text-base rounded-xl" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Please wait...
                </>
              ) : (
                <>{isForgotPassword ? "Send Reset Link" : (isSignUp ? "Sign Up" : "Sign In")}</>
              )}
            </Button>
          </form>

          {!isForgotPassword && (
            <>
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-background px-2 text-muted-foreground">
                    Or continue with
                  </span>
                </div>
              </div>

              <Button
                variant="outline"
                type="button"
                disabled={isLoading}
                className="w-full h-12 text-base rounded-xl flex items-center gap-2"
                onClick={async () => {
                  try {
                    const { error } = await supabase.auth.signInWithOAuth({
                      provider: 'google',
                      options: {
                        redirectTo: `${window.location.origin}/dashboard`,
                      },
                    });
                    if (error) throw error;
                  } catch (error: any) {
                    toast.error(error.message || "An error occurred with Google Sign In");
                  }
                }}
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    fill="#4285F4"
                  />
                  <path
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    fill="#34A853"
                  />
                  <path
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                    fill="#FBBC05"
                  />
                  <path
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                    fill="#EA4335"
                  />
                </svg>
                Google
              </Button>
            </>
          )}

          <div className="text-center text-sm">
            <span className="text-muted-foreground">
              {isForgotPassword
                ? "Remember your password? "
                : (isSignUp ? "Already have an account? " : "Don't have an account? ")}
            </span>
            <button
              onClick={() => {
                if (isForgotPassword) {
                  setIsForgotPassword(false);
                } else {
                  setIsSignUp(!isSignUp);
                }
                setError(null);
                if (!isForgotPassword) {
                  navigate(`/auth${!isSignUp ? '?signup=true' : ''}`, { replace: true });
                }
              }}
              className="font-semibold text-primary hover:underline transition-all"
            >
              {isForgotPassword ? "Sign in" : (isSignUp ? "Sign in" : "Sign up")}
            </button>
          </div>

          {!isForgotPassword && isSignUp && (
            <div className="text-[10px] text-muted-foreground text-center animate-fade-in px-2">
              By creating an account, you agree to the <Link to="/terms" className="underline">Terms of Service</Link>. For more information about Formal.AI's privacy practices, see the <Link to="/privacy" className="underline">Formal.AI Privacy Statement</Link>. We'll occasionally send you account-related emails.
            </div>
          )}
        </div>
      </div>

      {/* Right Column - Hero Image */}
      <div className="hidden lg:flex relative bg-black items-center justify-center overflow-hidden">
        <img
          key={isForgotPassword ? "reset" : (isSignUp ? "signup" : "login")}
          src={isSignUp ? signupHero : formalAiHero}
          alt="Formal Attire"
          className="absolute inset-0 w-full h-full object-cover transition-transform duration-[20s] hover:scale-110 animate-fade-in opacity-50"
        />
        <div className="relative z-10 p-12 text-center space-y-4 max-w-lg">
          <div className="glass-card p-8 rounded-[2rem] border-white/10 backdrop-blur-2xl animate-fade-in shadow-2xl">
            <h3 className="text-3xl font-bold text-white mb-2 font-serif">Redefine Professionalism</h3>
            <p className="text-white/70 text-lg leading-relaxed">
              Experience the next generation of AI-powered formal styling.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Auth;

