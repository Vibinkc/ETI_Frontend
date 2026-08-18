"use client";

import AuthGuard from "@/components/auth/AuthGuard";

export default function AdminManagementLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <AuthGuard requireSuperAdmin={true}>{children}</AuthGuard>;
}

