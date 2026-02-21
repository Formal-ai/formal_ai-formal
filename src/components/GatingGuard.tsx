import { Navigate, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

const LAUNCH_MODE = import.meta.env.VITE_LAUNCH_MODE || "live";

// Whitelisted routes that don't need gating
const WHITELIST = ["/", "/waitlist", "/waitlist/challenge", "/about", "/contacts", "/contact", "/pricing", "/terms", "/privacy"];

const GatingGuard = ({ children }: { children: React.ReactNode }) => {
    const location = useLocation();
    const [isAdmin, setIsAdmin] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const checkAdminStatus = async () => {
            try {
                const { data: { session } } = await supabase.auth.getSession();

                if (session?.user) {
                    // SECURITY FIX: Verify admin status from server-side database
                    // Never trust localStorage or client-side values for admin access
                    const { data: profile, error } = await supabase
                        .from('profiles')
                        .select('is_admin')
                        .eq('id', session.user.id)
                        .single();

                    if (!error && profile && (profile as any).is_admin === true) {
                        setIsAdmin(true);
                    }
                }
            } catch (error) {
                console.error("Error checking admin status:", error);
                setIsAdmin(false);
            } finally {
                setIsLoading(false);
            }
        };

        checkAdminStatus();
    }, []);

    // Show nothing while checking admin status to prevent flash of wrong content
    if (isLoading && LAUNCH_MODE === "waitlist") {
        return (
            <div className="min-h-screen flex items-center justify-center bg-background">
                <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    if (LAUNCH_MODE === "waitlist" && !isAdmin) {
        // If we're on a whitelisted page, allow it
        if (WHITELIST.includes(location.pathname)) {
            return <>{children}</>;
        }

        // Redirect everything else to waitlist
        if (location.pathname !== "/waitlist") {
            return <Navigate to="/waitlist" replace />;
        }
    }

    return <>{children}</>;
};

export default GatingGuard;
