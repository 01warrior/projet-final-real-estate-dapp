
import React from 'react';
import { Button } from "@/components/ui/button";
import { Bell, UserCircle, Sun, Moon } from 'lucide-react'; // d'icônes pour le thème

// on auras un état pour le thème (clair/sombre) dans App.js et une fonction pour le changer
const Header = ({ account, isAdmin /*, theme, toggleTheme */ }) => {
  return (
    <header className="bg-white dark:bg-slate-800 h-16 px-6 flex justify-between items-center border-b border-slate-200 dark:border-slate-700 sticky top-0 z-10">
      <div>
        <h1 className='text-2xl text-slate-500 dark:text-slate-400'>Application decentralisé de gestion immobiliere</h1>
        {/* un champ de recherche */}
        {/* <Input type="search" placeholder="Rechercher..." className="md:w-[300px] lg:w-[400px]" /> */}
      </div>
      <div className="flex items-center gap-4">
        {/* <Button variant="ghost" size="icon" onClick={toggleTheme}>
          {theme === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
        </Button>
        <Button variant="ghost" size="icon">
          <Bell className="h-5 w-5" />
        </Button> */}
        {account && (
          <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300">
            <UserCircle className="h-6 w-6" />
            <div>
              <p className="font-medium leading-none">{isAdmin ? 'Admin' : 'Utilisateur'}</p>
              <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
                {account.substring(0, 6)}...{account.substring(account.length - 4)}
              </p>
            </div>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;