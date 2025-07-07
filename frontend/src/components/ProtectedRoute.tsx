// src/components/ProtectedRoute.tsx
import { useUser, ClerkLoaded, ClerkLoading } from "@clerk/clerk-react";
import { Navigate } from "react-router-dom";

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  return (
    <>
      <ClerkLoading>
        <div className="text-center mt-10">Loading authentication...</div>
      </ClerkLoading>

      <ClerkLoaded>
        <ActualProtectedRoute>{children}</ActualProtectedRoute>
      </ClerkLoaded>
    </>
  );
};

const ActualProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { isSignedIn } = useUser();

  if (!isSignedIn) {
    return <Navigate to="/sign-in" />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;