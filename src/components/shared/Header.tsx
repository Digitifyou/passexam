"use client";

import { useState, useEffect } from 'react';
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { useToast } from "@/hooks/use-toast";
import { LogOut, User, BookOpen } from "lucide-react";

export default function Header() {
  const router = useRouter();
  const { toast } = useToast();
  const [userName, setUserName] = useState("Loading..."); // Placeholder
  const [userInitials, setUserInitials] = useState(".."); // Placeholder

  // Simulate fetching user data after mount to avoid hydration issues
  useEffect(() => {
    // TODO: Fetch user data from session or /get_user.php
    // For now, use mock data
    const fetchedUserName = "John Doe"; // Replace with actual data
    setUserName(fetchedUserName);
    setUserInitials(
      fetchedUserName
        .split(' ')
        .map(n => n[0])
        .join('')
        .toUpperCase()
    );
  }, []);


  const handleLogout = async () => {
    // TODO: Replace with actual API call to logout.php
    console.log("Logging out...");

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 500));

    toast({
      title: "Logged Out",
      description: "You have been successfully logged out.",
    });
    // Redirect to login page
    router.push("/login");
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b bg-background">
      <div className="container flex h-16 items-center space-x-4 sm:justify-between sm:space-x-0">
        <Link href="/dashboard" className="flex items-center space-x-2">
           <BookOpen className="h-6 w-6 text-primary" />
          <span className="inline-block font-bold">QuizMaster Pro</span>
        </Link>
        <div className="flex flex-1 items-center justify-end space-x-4">
          <nav className="flex items-center space-x-1">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src="/placeholder-user.jpg" alt={userName} data-ai-hint="user avatar" />
                    <AvatarFallback>{userInitials}</AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end" forceMount>
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">{userName}</p>
                     {/* <p className="text-xs leading-none text-muted-foreground">
                       {userEmail} // Fetch email as well if needed
                     </p> */}
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                   <Link href="/profile">
                     <User className="mr-2 h-4 w-4" />
                     <span>Profile</span>
                   </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout}>
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Log out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </nav>
        </div>
      </div>
    </header>
  );
}
