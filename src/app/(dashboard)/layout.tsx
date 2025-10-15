"use client";

import { useState } from 'react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { 
  LayoutDashboard, 
  Settings, 
  Calendar, 
  Lightbulb, 
  Plug, 
  LogOut,
  Moon,
  Sun,
  ChevronDown,
  Building2
} from 'lucide-react';
import { useTheme } from 'next-themes';
import { useAuth } from '@/contexts/auth-context';
import { ProtectedRoute } from '@/components/protected-route';

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Digital Setup', href: '/setup', icon: Plug },
  { name: 'Content Suggestions', href: '/suggestions', icon: Lightbulb },
  { name: 'Content Calendar', href: '/calendar', icon: Calendar },
  { name: 'Settings', href: '/settings', icon: Settings },
];

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [showOrgDropdown, setShowOrgDropdown] = useState(false);
  const { theme, setTheme } = useTheme();
  const pathname = usePathname();
  const { 
    user, 
    organizations, 
    selectedOrganization, 
    signOut, 
    setSelectedOrganization 
  } = useAuth();

  const handleLogout = async () => {
    await signOut();
  };

  const toggleTheme = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
  };

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-background">
      {/* Top Navigation */}
      <nav className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <h1 className="text-xl font-bold text-gradient animate-fade-in">Dashboard</h1>
              </div>
              
              {/* Organization Selector */}
              <div className="ml-4 lg:ml-8 relative">
                <Button
                  variant="ghost"
                  onClick={() => setShowOrgDropdown(!showOrgDropdown)}
                  className="flex items-center space-x-2 focus-ring"
                >
                  <Building2 className="h-4 w-4" />
                  <span className="hidden sm:inline">{selectedOrganization?.name || 'Select Organization'}</span>
                  <span className="sm:hidden">Org</span>
                  <ChevronDown className="h-4 w-4" />
                </Button>
                
                {showOrgDropdown && (
                  <div className="absolute top-full left-0 mt-1 w-64 bg-card border rounded-md shadow-lg z-50 animate-scale-in">
                    {organizations.map((org) => (
                      <button
                        key={org.id}
                        onClick={() => {
                          setSelectedOrganization(org);
                          setShowOrgDropdown(false);
                        }}
                        className="w-full text-left px-4 py-2 hover:bg-accent flex items-center space-x-2 transition-colors"
                      >
                        <Building2 className="h-4 w-4" />
                        <span>{org.name}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="flex items-center space-x-2 lg:space-x-4">
              {/* Theme Toggle */}
              <Button
                variant="ghost"
                size="icon"
                onClick={toggleTheme}
                className="focus-ring"
              >
                {theme === 'dark' ? (
                  <Sun className="h-4 w-4" />
                ) : (
                  <Moon className="h-4 w-4" />
                )}
              </Button>

              {/* User Menu */}
              <div className="flex items-center space-x-2">
                <div className="text-sm hidden sm:block">
                  <div className="font-medium truncate max-w-[120px]">{user.full_name || user.email}</div>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleLogout}
                  className="focus-ring"
                >
                  <LogOut className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </nav>

      <div className="flex">
        {/* Sidebar Navigation */}
        <div className="w-64 bg-card/50 backdrop-blur-sm border-r min-h-screen hidden lg:block">
          <nav className="p-4 space-y-2">
            {navigation.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`flex items-center space-x-3 px-3 py-2 rounded-md text-sm font-medium transition-all duration-200 focus-ring ${
                    isActive
                      ? 'bg-primary text-primary-foreground shadow-sm'
                      : 'text-muted-foreground hover:text-foreground hover:bg-accent'
                  }`}
                >
                  <item.icon className="h-4 w-4" />
                  <span>{item.name}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Main Content */}
        <main className="flex-1 p-4 lg:p-6 animate-fade-in">
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </main>
      </div>
      </div>
    </ProtectedRoute>
  );
}
