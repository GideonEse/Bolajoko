'use client';

import type { ReactNode } from 'react';
import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import {
  SidebarProvider,
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarInset,
  SidebarTrigger,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
} from '@/components/ui/sidebar';
import { Logo } from '@/components/logo';
import {
  LayoutDashboard,
  FileDown,
  LogOut,
  Settings,
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import Link from 'next/link';
import type { Role, User } from '@/lib/types';
import { getUserData } from '@/lib/actions';

const navLinks = {
  student: [
    { href: '/dashboard?role=student', label: 'Dashboard', icon: LayoutDashboard },
  ],
  staff: [
    { href: '/dashboard?role=staff', label: 'Approved List', icon: FileDown },
  ],
  admin: [
    { href: '/dashboard?role=admin', label: 'Verify Receipts', icon: LayoutDashboard },
  ],
};

const roleNames = {
    student: "Student",
    staff: "Staff",
    admin: "Admin"
}

export default function DashboardLayout({
  children,
}: {
  children: ReactNode;
}) {
  const searchParams = useSearchParams();
  const role = (searchParams.get('role') as Role) || 'student';
  const userId = searchParams.get('userId');
  const [user, setUser] = useState<User | null>(null);
  const links = navLinks[role] || navLinks.student;

  useEffect(() => {
    if (userId) {
      getUserData(userId).then(fetchedUser => {
        if(fetchedUser) {
          setUser(fetchedUser);
        }
      });
    }
  }, [userId, children]); // Rerun effect if children change to pick up new user name

  const settingsHref = userId ? `/dashboard/settings?role=${role}&userId=${userId}` : '#';

  return (
    <SidebarProvider>
      <Sidebar>
        <SidebarHeader>
          <Logo />
        </SidebarHeader>
        <SidebarContent>
          <SidebarMenu>
            {links.map((link) => (
              <SidebarMenuItem key={link.label}>
                <SidebarMenuButton href={`${link.href}&userId=${userId}`} tooltip={link.label}>
                  <link.icon />
                  <span>{link.label}</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarContent>
      </Sidebar>
      <SidebarInset>
        <header className="flex h-14 items-center gap-4 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 px-4 lg:h-[60px] lg:px-6 sticky top-0 z-40">
          <SidebarTrigger className="md:hidden" />
          <div className="w-full flex-1">
            <h1 className="text-lg font-headline font-semibold">{user?.name ?? `${roleNames[role]} Dashboard`}</h1>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="secondary" size="icon" className="rounded-full">
                <Avatar>
                  <AvatarFallback>{user ? user.name.charAt(0).toUpperCase() : role.charAt(0).toUpperCase()}</AvatarFallback>
                </Avatar>
                <span className="sr-only">Toggle user menu</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>{user?.name ?? 'My Account'}</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <Link href={settingsHref}>
                <DropdownMenuItem>
                  <Settings className="mr-2 h-4 w-4" />
                  <span>Settings</span>
                </DropdownMenuItem>
              </Link>
              <DropdownMenuSeparator />
              <Link href="/">
                <DropdownMenuItem>
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Logout</span>
                </DropdownMenuItem>
              </Link>
            </DropdownMenuContent>
          </DropdownMenu>
        </header>
        <main className="flex-1 p-4 sm:p-6">{children}</main>
      </SidebarInset>
    </SidebarProvider>
  );
}
