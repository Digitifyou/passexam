"use client";

import Link from "next/link";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { useToast } from "@/hooks/use-toast";
import { LogOut, User, BookOpen } from "lucide-react";
import { useSession, signOut } from "next-auth/react";
import { Skeleton } from "@/components/ui/skeleton";

export default function Header() {
  const { data: session, status } = useSession(); // Get the session status
  const user = session?.user;
  const { toast } = useToast();

  const handleLogout = async () => {
    try {
      await signOut({ callbackUrl: '/login' });
      toast({
        title: "Logged Out",
        description: "You have been successfully logged out.",
      });
    } catch (error) {
      toast({
        variant: 'destructive',
        title: "Logout Failed",
        description: "Could not log out. Please try again.",
      });
    }
  };

  const getUserInitials = (name: string | undefined | null): string => {
    if (!name) return "..";
    return name
      .split(' ')
      .map(n => n[0])
      .slice(0, 2)
      .join('')
      .toUpperCase();
  }

  return (
    <header className="sticky top-0 z-40 w-full border-b bg-background">
      <div className="container flex h-16 items-center space-x-4 sm:justify-between sm:space-x-0">
        <Link href="/dashboard" className="flex items-center space-x-2">
          <BookOpen className="h-6 w-6 text-primary" />
          <span className="inline-block font-bold">PassExam</span>
        </Link>
        <div className="flex flex-1 items-center justify-end space-x-4">
          <nav className="flex items-center space-x-1">
            {/* Show a skeleton while the session is loading */}
            {status === 'loading' && (
              <Skeleton className="h-8 w-8 rounded-full" />
            )}

            {/* Show the user profile dropdown when authenticated */}
            {status === 'authenticated' && user && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={user.image ?? "/placeholder-user.jpg"} alt={user.name ?? ""} />
                      <AvatarFallback>{getUserInitials(user.name)}</AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="end" forceMount>
                  <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium leading-none">{user.name}</p>
                      <p className="text-xs leading-none text-muted-foreground">
                        {user.email}
                      </p>
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
            )}

            {/* Show the login button when unauthenticated */}
            {status === 'unauthenticated' && (
              <Button asChild>
                <Link href="/login">Login</Link>
              </Button>
            )}
          </nav>
        </div>
      </div>
    </header>
  );
}