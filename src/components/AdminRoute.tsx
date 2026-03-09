import { useAuth } from "@/contexts/AuthContext";
import { Navigate } from "react-router-dom";

export const AdminRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAdmin, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  if (!isAdmin) return <Navigate to="/dashboard" replace />;
  return <>{children}</>;
};
