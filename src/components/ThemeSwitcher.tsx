import React, { useEffect, useState } from 'react';
import { Sun, Moon } from 'lucide-react';
import { motion } from 'motion/react';

export default function ThemeSwitcher() {
  const [theme, setTheme] = useState<'light' | 'dark'>('light');

  useEffect(() => {
    // Read persisted theme
    const saved = localStorage.getItem('radha_theme');
    const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    
    if (saved === 'dark' || (!saved && systemPrefersDark)) {
      setTheme('dark');
      document.documentElement.classList.add('dark');
    } else {
      setTheme('light');
      document.documentElement.classList.remove('dark');
    }
  }, []);

  const toggleTheme = () => {
    if (theme === 'light') {
      setTheme('dark');
      document.documentElement.classList.add('dark');
      localStorage.setItem('radha_theme', 'dark');
    } else {
      setTheme('light');
      document.documentElement.classList.remove('dark');
      localStorage.setItem('radha_theme', 'light');
    }
  };

  return (
    <motion.button
      id="theme-switcher-btn"
      onClick={toggleTheme}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      className="p-2 text-foreground hover:bg-accent transition rounded-full cursor-pointer flex items-center justify-center group focus:outline-none"
      title={theme === 'light' ? 'Switch to Dark Mode' : 'Switch to Light Mode'}
    >
      <div className="relative w-5 h-5 flex items-center justify-center">
        {theme === 'light' ? (
          <Sun className="w-5 h-5 text-foreground group-hover:text-primary transition duration-300" />
        ) : (
          <Moon className="w-5 h-5 text-primary fill-primary group-hover:text-primary transition duration-300" />
        )}
      </div>
    </motion.button>
  );
}


