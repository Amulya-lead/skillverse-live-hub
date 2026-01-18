import { useEffect, useState } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Loader2 } from "lucide-react";

interface RoleBasedRouteProps {
    children: React.ReactNode;
    allowedRoles: string[];
}

export const RoleBasedRoute = ({ children, allowedRoles }: RoleBasedRouteProps) => {
    const [loading, setLoading] = useState(true);
    const [authorized, setAuthorized] = useState(false);
    const location = useLocation();

    useEffect(() => {
        const checkAuth = async () => {
            try {
                const { data: { user } } = await supabase.auth.getUser();

                if (!user) {
                    setAuthorized(false);
                    setLoading(false);
                    return;
                }

                const { data: profile } = await supabase
                    .from('profiles')
                    .select('role')
                    .eq('id', user.id)
                    .single() as { data: any };

                if (profile && allowedRoles.includes(profile.role)) {
                    setAuthorized(true);
                } else {
                    setAuthorized(false);
                }
            } catch (error) {
                console.error("Auth check failed:", error);
                setAuthorized(false);
            } finally {
                setLoading(false);
            }
        };

        checkAuth();
    }, [allowedRoles]);

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    if (!authorized) {
        // Redirect to auth if not logged in, or to main dashboard if logged in but unauthorized
        return <Navigate to="/auth" state={{ from: location }} replace />;
    }

    return <>{children}</>;
};
