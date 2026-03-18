import React from 'react';
import { NavLink, Link, useLocation } from 'react-router-dom';
import { Home, Search, PlusCircle, User, LogIn, Video, Compass, TrendingUp } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Sheet, SheetContent, SheetTrigger, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Menu } from 'lucide-react';

interface LayoutProps {
  children: React.ReactNode;
}

export const MainLayout: React.FC<LayoutProps> = ({ children }) => {
  const { user, profile, signOut } = useAuth();
  const location = useLocation();

  const isHome = location.pathname === '/';

  return (
    <div className={`flex flex-col min-h-screen ${isHome ? 'bg-black text-white' : 'bg-background text-foreground'}`}>
      {/* Top Header */}
      <header className={`sticky top-0 z-50 w-full border-b ${isHome ? 'bg-black/80 border-white/10' : 'bg-background/80 border-border'} backdrop-blur-md`}>
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <Link to="/" className="flex items-center gap-2">
            <Video className="h-8 w-8 text-primary" />
            <span className="text-xl font-bold tracking-tighter">MiaodaShorts</span>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-6">
            <NavLink 
              to="/" 
              className={({ isActive }) => `flex items-center gap-2 text-sm font-medium transition-colors hover:text-primary ${isActive ? 'text-primary' : (isHome ? 'text-white/80' : 'text-foreground/80')}`}
            >
              <Home className="h-4 w-4" />
              الرئيسية
            </NavLink>
            <NavLink 
              to="/search" 
              className={({ isActive }) => `flex items-center gap-2 text-sm font-medium transition-colors hover:text-primary ${isActive ? 'text-primary' : (isHome ? 'text-white/80' : 'text-foreground/80')}`}
            >
              <Search className="h-4 w-4" />
              بحث
            </NavLink>
            <NavLink 
              to="/trending" 
              className={({ isActive }) => `flex items-center gap-2 text-sm font-medium transition-colors hover:text-primary ${isActive ? 'text-primary' : (isHome ? 'text-white/80' : 'text-foreground/80')}`}
            >
              <TrendingUp className="h-4 w-4" />
              رائج
            </NavLink>
          </nav>

          <div className="flex items-center gap-4">
            {user ? (
              <div className="flex items-center gap-4">
                <Button asChild variant="default" className="hidden md:flex gap-2">
                  <Link to="/upload">
                    <PlusCircle className="h-4 w-4" />
                    تحميل
                  </Link>
                </Button>
                <Link to={`/profile/${profile?.username}`}>
                  <Avatar className="h-9 w-9 border border-primary">
                    <AvatarImage src={profile?.avatar_url || ''} />
                    <AvatarFallback className="bg-primary text-white">
                      {profile?.username?.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                </Link>
                <Button variant="outline" size="sm" onClick={signOut} className="hidden md:flex">
                  تسجيل خروج
                </Button>
              </div>
            ) : (
              <Button asChild variant="default" size="sm">
                <Link to="/login" className="flex items-center gap-2">
                  <LogIn className="h-4 w-4" />
                  تسجيل دخول
                </Link>
              </Button>
            )}

            {/* Mobile Nav Toggle */}
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="md:hidden">
                  <Menu className="h-6 w-6" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right">
                <SheetHeader>
                  <SheetTitle>القائمة</SheetTitle>
                </SheetHeader>
                <nav className="flex flex-col gap-4 mt-8">
                  <Link to="/" className="flex items-center gap-3 text-lg font-medium p-2 hover:bg-muted rounded-md">
                    <Home className="h-5 w-5" />
                    الرئيسية
                  </Link>
                  <Link to="/search" className="flex items-center gap-3 text-lg font-medium p-2 hover:bg-muted rounded-md">
                    <Search className="h-5 w-5" />
                    بحث
                  </Link>
                  <Link to="/upload" className="flex items-center gap-3 text-lg font-medium p-2 hover:bg-muted rounded-md">
                    <PlusCircle className="h-5 w-5" />
                    تحميل فيديو
                  </Link>
                  {user ? (
                    <>
                      <Link to={`/profile/${profile?.username}`} className="flex items-center gap-3 text-lg font-medium p-2 hover:bg-muted rounded-md">
                        <User className="h-5 w-5" />
                        الملف الشخصي
                      </Link>
                      <Button variant="outline" onClick={signOut} className="mt-4">
                        تسجيل خروج
                      </Button>
                    </>
                  ) : (
                    <Link to="/login" className="flex items-center gap-3 text-lg font-medium p-2 hover:bg-muted rounded-md">
                      <LogIn className="h-5 w-5" />
                      تسجيل دخول
                    </Link>
                  )}
                </nav>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex flex-col">
        {children}
      </main>

      {/* Bottom Nav Mobile */}
      <footer className="md:hidden sticky bottom-0 z-50 w-full h-16 bg-background border-t border-border flex items-center justify-around px-4">
        <NavLink to="/" className={({ isActive }) => `flex flex-col items-center gap-1 transition-colors ${isActive ? 'text-primary' : 'text-muted-foreground'}`}>
          <Home className="h-6 w-6" />
          <span className="text-[10px]">الرئيسية</span>
        </NavLink>
        <NavLink to="/search" className={({ isActive }) => `flex flex-col items-center gap-1 transition-colors ${isActive ? 'text-primary' : 'text-muted-foreground'}`}>
          <Search className="h-6 w-6" />
          <span className="text-[10px]">بحث</span>
        </NavLink>
        <NavLink to="/upload" className={({ isActive }) => `flex flex-col items-center gap-1 transition-colors ${isActive ? 'text-primary' : 'text-muted-foreground'}`}>
          <PlusCircle className="h-8 w-8 text-primary" />
          <span className="text-[10px]">تحميل</span>
        </NavLink>
        <NavLink to="/trending" className={({ isActive }) => `flex flex-col items-center gap-1 transition-colors ${isActive ? 'text-primary' : 'text-muted-foreground'}`}>
          <Compass className="h-6 w-6" />
          <span className="text-[10px]">اكتشف</span>
        </NavLink>
        {user ? (
          <NavLink to={`/profile/${profile?.username}`} className={({ isActive }) => `flex flex-col items-center gap-1 transition-colors ${isActive ? 'text-primary' : 'text-muted-foreground'}`}>
            <User className="h-6 w-6" />
            <span className="text-[10px]">أنا</span>
          </NavLink>
        ) : (
          <NavLink to="/login" className={({ isActive }) => `flex flex-col items-center gap-1 transition-colors ${isActive ? 'text-primary' : 'text-muted-foreground'}`}>
            <User className="h-6 w-6" />
            <span className="text-[10px]">أنا</span>
          </NavLink>
        )}
      </footer>
    </div>
  );
};
