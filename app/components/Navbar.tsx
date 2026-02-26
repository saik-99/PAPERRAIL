'use client'

import Link from "next/link";
import { useState, useEffect } from "react";
import { Menu, X, Home, Map, CloudSun, Briefcase, BarChart3, HelpCircle, Leaf, Shield } from "lucide-react";
import { User } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/client";
import { useLanguage } from "./LanguageContext";

// In a real app, we might pass the initial user down from a layout
// but for simplicity in this refactor, we can fetch it client-side
export function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const supabase = createClient();
  const { language, setLanguage } = useLanguage();

  useEffect(() => {
    const { data: authListener } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setUser(session?.user ?? null);
      }
    );

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, [supabase.auth]);

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  const toggleLanguage = () => {
    setLanguage(language === 'en' ? 'hi' : 'en');
  };

  return (
    <header className="sticky top-0 z-50 border-b border-zinc-100 bg-white/80 px-4 py-3 backdrop-blur-sm dark:border-zinc-800 dark:bg-black/80 sm:px-8 lg:px-20">
      <nav className="mx-auto flex max-w-6xl items-center justify-between">

        {/* Left side: Logo */}
        <div className="flex items-center gap-3">
          <Link
            href="/"
            className="text-sm font-bold uppercase tracking-[0.18em] text-emerald-700 dark:text-emerald-500"
          >
            KhetiWala
          </Link>
        </div>

        {/* Right side: Auth + Language + Hamburger */}
        <div className="flex items-center gap-4 text-sm">

          {/* Language Toggle */}
          <button
            onClick={toggleLanguage}
            className="hidden text-zinc-600 font-medium hover:text-emerald-700 dark:text-zinc-400 dark:hover:text-emerald-500 sm:inline-flex items-center justify-center h-8 w-12 rounded-full border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-900 transition-colors"
            title="Toggle Language"
            aria-label="Toggle Language"
          >
            {language === 'en' ? 'HI' : 'EN'}
          </button>

          {user ? (
            <div className="flex items-center gap-3">
              <span className="hidden text-zinc-900 font-medium dark:text-zinc-100 sm:inline-block">
                Hi, {user.user_metadata?.full_name?.split(' ')[0] || 'Farmer'}
              </span>
              <button
                onClick={signOut}
                className="text-xs font-semibold text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-50"
              >
                Logout
              </button>
            </div>
          ) : (
            <>
              <Link
                href="/login"
                className="hidden text-zinc-700 hover:text-zinc-900 dark:text-zinc-300 dark:hover:text-zinc-50 sm:inline-block"
              >
                Login
              </Link>
              <Link
                href="/signup"
                className="hidden sm:inline-flex rounded-full bg-emerald-700 px-4 py-1.5 text-xs font-semibold text-white shadow-sm hover:bg-emerald-800"
              >
                Sign up
              </Link>
            </>
          )}

          {/* Hamburger Menu Button */}
          <button
            onClick={() => setIsMenuOpen(true)}
            className="ml-2 rounded-md p-1.5 text-zinc-600 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-800"
            aria-label="Open menu"
          >
            <Menu className="h-6 w-6" />
          </button>
        </div>

      </nav>

      {/* Slide-over Menu Overlay */}

      {isMenuOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm transition-opacity"
          onClick={() => setIsMenuOpen(false)}
        />
      )}

      {/* Slide-over Menu Panel */}
      <div
        className={`fixed top-0 left-0 z-50 h-[100dvh] w-72 transform bg-white shadow-2xl transition-transform duration-300 ease-in-out dark:bg-zinc-950 ${isMenuOpen ? "translate-x-0" : "-translate-x-full"
          }`}
      >
        <div className="flex h-full flex-col overflow-y-auto">
          <div className="flex items-center justify-between border-b border-zinc-100 px-4 py-4 dark:border-zinc-800">
            <span className="text-sm font-bold uppercase tracking-[0.18em] text-emerald-700 dark:text-emerald-500">
              Menu
            </span>
            <button
              onClick={() => setIsMenuOpen(false)}
              className="rounded-md p-1.5 text-zinc-500 hover:bg-zinc-100 hover:text-zinc-800 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-zinc-200"
            >
              <X className="h-5 w-5" />
            </button>
          </div>


          <nav className="flex-1 space-y-1 px-3 py-4">
            <Link
              href="/"
              onClick={() => setIsMenuOpen(false)}
              className="group flex items-center rounded-lg px-3 py-2.5 text-sm font-medium text-zinc-700 hover:bg-emerald-50 hover:text-emerald-700 dark:text-zinc-300 dark:hover:bg-emerald-900/30 dark:hover:text-emerald-400"
            >
              <Home className="mr-3 h-5 w-5 flex-shrink-0 text-zinc-400 group-hover:text-emerald-600 dark:group-hover:text-emerald-500" />
              Dashboard
            </Link>

            <Link
              href="/harvest-advisor"
              onClick={() => setIsMenuOpen(false)}
              className="group flex items-center rounded-lg px-3 py-2.5 text-sm font-medium text-zinc-700 hover:bg-emerald-50 hover:text-emerald-700 dark:text-zinc-300 dark:hover:bg-emerald-900/30 dark:hover:text-emerald-400"
            >
              <Leaf className="mr-3 h-5 w-5 flex-shrink-0 text-zinc-400 group-hover:text-emerald-600 dark:group-hover:text-emerald-500" />
              <span>AI Harvest Advisor</span>
              <span className="ml-auto rounded-full bg-emerald-100 px-1.5 py-0.5 text-[9px] font-bold text-emerald-700 dark:bg-emerald-900/60 dark:text-emerald-400">NEW</span>
            </Link>

            <Link
              href="/spoilage"
              onClick={() => setIsMenuOpen(false)}
              className="group flex items-center rounded-lg px-3 py-2.5 text-sm font-medium text-zinc-700 hover:bg-emerald-50 hover:text-emerald-700 dark:text-zinc-300 dark:hover:bg-emerald-900/30 dark:hover:text-emerald-400"
            >
              <Shield className="mr-3 h-5 w-5 flex-shrink-0 text-zinc-400 group-hover:text-emerald-600 dark:group-hover:text-emerald-500" />
              Spoilage & Storage
            </Link>

            <Link
              href="/analytics"
              onClick={() => setIsMenuOpen(false)}
              className="group flex items-center rounded-lg px-3 py-2.5 text-sm font-medium text-zinc-700 hover:bg-emerald-50 hover:text-emerald-700 dark:text-zinc-300 dark:hover:bg-emerald-900/30 dark:hover:text-emerald-400"
            >
              <BarChart3 className="mr-3 h-5 w-5 flex-shrink-0 text-zinc-400 group-hover:text-emerald-600 dark:group-hover:text-emerald-500" />
              Price Analytics
            </Link>

            <Link
              href="/mandi-map"
              onClick={() => setIsMenuOpen(false)}
              className="group flex items-center rounded-lg px-3 py-2.5 text-sm font-medium text-zinc-700 hover:bg-emerald-50 hover:text-emerald-700 dark:text-zinc-300 dark:hover:bg-emerald-900/30 dark:hover:text-emerald-400"
            >
              <Map className="mr-3 h-5 w-5 flex-shrink-0 text-zinc-400 group-hover:text-emerald-600 dark:group-hover:text-emerald-500" />
              Nearest Mandis
            </Link>

            <Link
              href="/weather"
              onClick={() => setIsMenuOpen(false)}
              className="group flex items-center rounded-lg px-3 py-2.5 text-sm font-medium text-zinc-700 hover:bg-emerald-50 hover:text-emerald-700 dark:text-zinc-300 dark:hover:bg-emerald-900/30 dark:hover:text-emerald-400"
            >
              <CloudSun className="mr-3 h-5 w-5 flex-shrink-0 text-zinc-400 group-hover:text-emerald-600 dark:group-hover:text-emerald-500" />
              Weather Forecast
            </Link>

            <Link
              href="/pm-schemes"
              onClick={() => setIsMenuOpen(false)}
              className="group flex items-center rounded-lg px-3 py-2.5 text-sm font-medium text-zinc-700 hover:bg-emerald-50 hover:text-emerald-700 dark:text-zinc-300 dark:hover:bg-emerald-900/30 dark:hover:text-emerald-400"
            >
              <Briefcase className="mr-3 h-5 w-5 flex-shrink-0 text-zinc-400 group-hover:text-emerald-600 dark:group-hover:text-emerald-500" />
              PM Yojanas & Schemes
            </Link>

            <div className="my-4 border-t border-zinc-100 dark:border-zinc-800"></div>

            <Link
              href="/advisory"
              onClick={() => setIsMenuOpen(false)}
              className="group flex items-center rounded-lg px-3 py-2.5 text-sm font-medium text-zinc-700 hover:bg-zinc-100 hover:text-zinc-900 dark:text-zinc-300 dark:hover:bg-zinc-800 dark:hover:text-zinc-100"
            >
              <HelpCircle className="mr-3 h-5 w-5 flex-shrink-0 text-zinc-400 group-hover:text-zinc-600 dark:group-hover:text-zinc-300" />
              Help & Advisory
            </Link>
          </nav>

          {!user && (
            <div className="p-4 border-t border-zinc-100 dark:border-zinc-800">
              <Link
                href="/login"
                onClick={() => setIsMenuOpen(false)}
                className="flex w-full items-center justify-center rounded-full border border-zinc-300 bg-white px-4 py-2 text-sm font-medium text-zinc-700 shadow-sm hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-300 dark:hover:bg-zinc-800"
              >
                Login to your account
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
