import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Droplets, Map, FileText, LayoutDashboard, LogOut, User } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

interface NavbarProps {
  user?: any;
}

export const Navbar = ({ user }: NavbarProps) => {
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    toast.success("Logged out successfully");
    navigate("/");
  };

  const isActive = (path: string) => location.pathname === path;

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 glass-card border-b">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2 group">
            <Droplets className="w-8 h-8 text-primary transition-transform group-hover:scale-110" />
            <span className="text-2xl font-bold bg-gradient-to-r from-primary to-primary-light bg-clip-text text-transparent">
              Fix Karachi
            </span>
          </Link>

          <div className="hidden md:flex items-center gap-6">
            <Link to="/">
              <Button
                variant={isActive("/") ? "default" : "ghost"}
                className="transition-all duration-300"
              >
                Home
              </Button>
            </Link>
            {user && (
              <>
                <Link to="/map">
                  <Button
                    variant={isActive("/map") ? "default" : "ghost"}
                    className="gap-2 transition-all duration-300"
                  >
                    <Map className="w-4 h-4" />
                    Live Map
                  </Button>
                </Link>
                <Link to="/report">
                  <Button
                    variant={isActive("/report") ? "default" : "ghost"}
                    className="gap-2 transition-all duration-300"
                  >
                    <FileText className="w-4 h-4" />
                    Report
                  </Button>
                </Link>
                <Link to="/dashboard">
                  <Button
                    variant={isActive("/dashboard") ? "default" : "ghost"}
                    className="gap-2 transition-all duration-300"
                  >
                    <LayoutDashboard className="w-4 h-4" />
                    Dashboard
                  </Button>
                </Link>
              </>
            )}
          </div>

          <div className="flex items-center gap-3">
            {user ? (
              <>
                <Button variant="ghost" className="gap-2">
                  <User className="w-4 h-4" />
                  {user.email?.split("@")[0]}
                </Button>
                <Button variant="outline" onClick={handleLogout} className="gap-2">
                  <LogOut className="w-4 h-4" />
                  Logout
                </Button>
              </>
            ) : (
              <Link to="/auth">
                <Button variant="hero">Get Started</Button>
              </Link>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};
