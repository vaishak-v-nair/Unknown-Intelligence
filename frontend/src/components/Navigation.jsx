import { Link, useLocation } from "react-router-dom";
import { Activity, ShieldAlert } from "lucide-react";

export default function Navigation() {
  const location = useLocation();

  return (
    <nav className="glass-nav">
      <div className="flex items-center gap-3 font-semibold text-lg text-text-primary">
        <ShieldAlert className="text-accent-primary" />
        <span>Aurora Intelligence</span>
      </div>
      
      <div className="flex gap-6">
        <Link 
          to="/" 
          className={`flex items-center text-sm font-medium transition-colors hover:text-accent-primary ${location.pathname === '/' ? 'text-accent-primary' : 'text-text-secondary'}`}
        >
          Home
        </Link>
        <Link 
          to="/dashboard" 
          className={`flex items-center gap-2 text-sm font-medium transition-colors hover:text-accent-primary ${location.pathname === '/dashboard' ? 'text-accent-primary' : 'text-text-secondary'}`}
        >
          <Activity size={16} />
          Dashboard
        </Link>
      </div>
    </nav>
  );
}
