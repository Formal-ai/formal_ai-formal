import { useEffect, useState } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Loader2 } from "lucide-react";

interface ProtectedRouteProps {
    children: React.ReactNode;
    requireEmailConfirmation?: boolean;
}

const ProtectedRoute = ({ children, requireEmailConfirmation = true }: ProtectedRouteProps) => {
    const [loading, setLoading] = useState(true);
    const [authenticated, setAuthenticated] = useState(false);
    const [isEmailConfirmed, setIsEmailConfirmed] = useState(false);
    const location = useLocation();

    useEffect(() => {
        const checkAuth = async () => {
            try {
                const { data: { session } } = await supabase.auth.getSession();

                if (session) {
                    setAuthenticated(true);
                    // Check if email is confirmed if required
                    if (requireEmailConfirmation) {
                        const { data: { user } } = await supabase.auth.getUser();
                        setIsEmailConfirmed(!!user?.email_confirmed_at);
                    } else {
                        setIsEmailConfirmed(true);
                    }
                } else {
                    setAuthenticated(false);
                }
            } catch (error) {
                console.error("Error checking auth status:", error);
                setAuthenticated(false);
            } finally {
                setLoading(false);
            }
        };

        checkAuth();

        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            setAuthenticated(!!session);
            if (session?.user) {
                setIsEmailConfirmed(!!session.user.email_confirmed_at);
            }
            setLoading(false);
        });

        return () => subscription.unsubscribe();
    }, [requireEmailConfirmation]);

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-background">
                <Loader2 className="w-10 h-10 animate-spin text-primary" />
            </div>
        );
    }

    if (!authenticated) {
        // Redirect to auth page, specifically to signup if requested by user logic
        // We pass the current path as 'redirectTo' so we can return after login
        return <Navigate to={`/auth?signup=true&redirectTo=${encodeURIComponent(location.pathname)}`} replace />;
    }

    if (requireEmailConfirmation && !isEmailConfirmed) {
        // If logged in but not confirmed, we might want to redirect to a special verification page 
        // or just back to auth with a message. For now, let's redirect to auth which has verification UI.
        return <Navigate to="/auth?verification=pending" replace />;
    }

    return <>{children}</>;
};

export default ProtectedRoute;
