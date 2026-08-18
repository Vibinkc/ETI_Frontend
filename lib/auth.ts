"use client";

import { apiUrl } from "./api";

/**
 * Authentication utilities for admin access
 */

export function getAuthToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("admin_token");
}

export function setAuthToken(token: string): void {
  if (typeof window === "undefined") return;
  localStorage.setItem("admin_token", token);
}

export function removeAuthToken(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem("admin_token");
  localStorage.removeItem("admin_user");
}

/**
 * Shape of the admin record cached in localStorage by the login flow.
 * Fields are optional because the stored JSON is written by the API and is
 * only ever read defensively; the index signature keeps any additional field
 * the API sends readable without widening the known fields to `any`.
 */
export interface AdminUser {
  id?: number;
  email?: string;
  first_name?: string;
  last_name?: string;
  is_superuser?: boolean;
  [key: string]: unknown;
}

export function getAdminUser(): AdminUser | null {
  if (typeof window === "undefined") return null;
  const userStr = localStorage.getItem("admin_user");
  if (!userStr) return null;
  try {
    return JSON.parse(userStr);
  } catch {
    return null;
  }
}

export function isAuthenticated(): boolean {
  return getAuthToken() !== null;
}

export async function checkAuthStatus(): Promise<boolean> {
  const token = getAuthToken();
  if (!token) return false;

  try {
    const response = await fetch(apiUrl("api/admin/me"), {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      removeAuthToken();
      return false;
    }

    return true;
  } catch {
    removeAuthToken();
    return false;
  }
}

