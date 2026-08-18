"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { checkAuthStatus, isAuthenticated, getAdminUser } from "@/lib/auth";

interface AuthGuardProps {
  children: React.ReactNode;
  requireSuperAdmin?: boolean;
}

export default function AuthGuard({ children, requireSuperAdmin = false }: AuthGuardProps) {
  const router = useRouter();
  const [isChecking, setIsChecking] = useState(true);
  const [isAuth, setIsAuth] = useState(false);

  useEffect(() => {
    const verifyAuth = async () => {
      if (!isAuthenticated()) {
        router.push("/login");
        return;
      }

      const isValid = await checkAuthStatus();
      if (!isValid) {
        router.push("/login");
        return;
      }

      // Check if super admin is required
      if (requireSuperAdmin) {
        const user = getAdminUser();
        if (!user || !user.is_superuser) {
          router.push("/");
          return;
        }
      }

      setIsAuth(true);
      setIsChecking(false);
    };

    verifyAuth();
  }, [router, requireSuperAdmin]);

  if (isChecking) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
          <p className="mt-4 text-gray-600">Verifying authentication...</p>
        </div>
      </div>
    );
  }

  if (!isAuth) {
    return null;
  }

  return <>{children}</>;
}

