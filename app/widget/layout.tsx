"use client";

import { useEffect } from "react";

export default function WidgetLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  useEffect(() => {
    // Override global overflow hidden for this page
    const html = document.documentElement;
    const body = document.body;
    
    html.style.overflow = 'auto';
    html.style.height = 'auto';
    body.style.overflow = 'auto';
    body.style.height = 'auto';

    return () => {
      // Reset on unmount
      html.style.overflow = '';
      html.style.height = '';
      body.style.overflow = '';
      body.style.height = '';
    };
  }, []);

  return <>{children}</>;
}

