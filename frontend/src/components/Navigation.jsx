import { Link, useLocation } from "react-router-dom";
import { Activity, ShieldAlert } from "lucide-react";

export default function Navigation() {
  const location = useLocation();

  return (
    <nav className="flex justify-between items-center px-8 py-4 bg-space-black brutal-border-b sticky top-0 z-50">
      <div className="flex items-center gap-3 font-display font-bold text-xl uppercase tracking-widest text-text-primary">
        <ShieldAlert className="text-accent-secondary" />
        <span>Unknown Intelligence</span>
      </div>
      
      <div className="flex gap-6">
        <Link 
          to="/" 
          className={`flex items-center text-sm font-mono tracking-widest uppercase transition-all duration-200 hover:text-accent-primary hover:translate-x-1 ${location.pathname === '/' ? 'text-accent-primary font-bold' : 'text-text-secondary'}`}
        >
          [Home]
        </Link>
        <Link 
          to="/dashboard" 
          className={`flex items-center gap-2 text-sm font-mono tracking-widest uppercase transition-all duration-200 hover:text-accent-primary hover:translate-x-1 ${location.pathname === '/dashboard' ? 'text-accent-primary font-bold' : 'text-text-secondary'}`}
        >
          <Activity size={16} />
          [Dashboard]
        </Link>
      </div>
    </nav>
  );
}
