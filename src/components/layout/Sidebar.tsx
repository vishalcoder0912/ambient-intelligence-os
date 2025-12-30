import { motion } from "framer-motion";
import { NavLink, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  Sparkles,
  Search,
  LineChart,
  Settings,
  Brain,
} from "lucide-react";

const navItems = [
  { icon: LayoutDashboard, label: "Dashboard", path: "/" },
  { icon: Sparkles, label: "Daily Brief", path: "/brief" },
  { icon: Search, label: "Search", path: "/search" },
  { icon: LineChart, label: "Insights", path: "/insights" },
  { icon: Settings, label: "Settings", path: "/settings" },
];

export function Sidebar() {
  const location = useLocation();

  return (
    <motion.aside
      initial={{ x: -20, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className="fixed left-0 top-0 z-40 h-screen w-64 border-r border-sidebar-border bg-sidebar px-4 py-6"
    >
      {/* Logo */}
      <div className="mb-8 flex items-center gap-3 px-2">
        <div className="relative flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
          <Brain className="h-5 w-5 text-primary" />
          <div className="absolute -right-0.5 -top-0.5">
            <span className="pulse-indicator calm" />
          </div>
        </div>
        <div>
          <h1 className="font-display text-lg font-semibold text-foreground">
            Second Brain
          </h1>
          <p className="text-xs text-muted-foreground">Personal OS</p>
        </div>
      </div>

      {/* Navigation */}
      <nav className="space-y-1">
        {navItems.map((item, index) => {
          const isActive = location.pathname === item.path;
          const Icon = item.icon;

          return (
            <motion.div
              key={item.path}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05 + 0.2 }}
            >
              <NavLink
                to={item.path}
                className={`nav-link ${isActive ? "active" : ""}`}
              >
                <Icon className="h-5 w-5" />
                <span className="font-medium">{item.label}</span>
                {isActive && (
                  <motion.div
                    layoutId="activeIndicator"
                    className="ml-auto h-1.5 w-1.5 rounded-full bg-primary"
                    transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                  />
                )}
              </NavLink>
            </motion.div>
          );
        })}
      </nav>

      {/* Status Footer */}
      <div className="absolute bottom-6 left-4 right-4">
        <div className="glass-card p-4">
          <div className="flex items-center gap-3">
            <div className="pulse-indicator calm" />
            <div>
              <p className="text-xs font-medium text-foreground">System Active</p>
              <p className="text-xs text-muted-foreground">All synced locally</p>
            </div>
          </div>
        </div>
      </div>
    </motion.aside>
  );
}
