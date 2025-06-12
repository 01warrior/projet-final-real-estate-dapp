
import React from 'react';
import { Button } from "@/components/ui/button";
import { LayoutDashboard, ListChecks, PlusCircle, Users, Settings, LogOut } from 'lucide-react'; // Icônes

const Sidebar = ({ isAdmin, setCurrentView  }) => {
  const navItems = [
    { name: 'Dashboard', icon: LayoutDashboard, view: 'dashboard', adminOnly: false },
    { name: 'Propriétés', icon: ListChecks, view: 'properties', adminOnly: false },
  ];

  return (
    <aside className="w-64 bg-white dark:bg-slate-800 p-5 border-r border-slate-200 dark:border-slate-700 flex flex-col">
      <div className="mb-8 text-center">
        {/*logo*/}
        <h1 className="text-2xl font-bold text-slate-700 dark:text-slate-200">ImmoChain</h1> 
      </div>
      <nav className="flex-grow">
        <ul className="space-y-2">
          {navItems.map((item) => {
            if (item.adminOnly && !isAdmin) return null;
            return (
              <li key={item.name}>
                <Button
                  variant="ghost"
                  className="w-full justify-start text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700"
                  onClick={() => setCurrentView(item.view)}
                >
                  <item.icon className="mr-3 h-5 w-5" />
                  {item.name}
                </Button>
              </li>
            );
          })}
        </ul>
      </nav>
      <div className="mt-auto">
        <Button variant="outline" className="w-full justify-start text-slate-600 dark:text-slate-300">
          <LogOut className="mr-3 h-5 w-5" />
          Déconnexion {/* (La logique de déconnexion n'est pas encore implémentée) */}
        </Button>
      </div>
    </aside>
  );
};

export default Sidebar;