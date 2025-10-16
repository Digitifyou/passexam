"use client";

import { useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useToast } from "@/hooks/use-toast";

export function AuthStatusPopup() {
  const { data: session, status } = useSession();
  const { toast } = useToast();

  useEffect(() => {
    // Check if the session has loaded and the user is authenticated
    if (status === 'authenticated') {
      // Show the toast notification
      toast({
        title: "Auth Status ✅",
        description: `User is logged in as ${session.user?.email}`,
      });
    }
  }, [status, session, toast]); // Rerun this effect when the session status changes

  // This component doesn't render anything visible, it just triggers the toast.
  return null;
}