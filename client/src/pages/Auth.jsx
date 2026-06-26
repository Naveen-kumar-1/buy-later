import React from 'react'
import { SignedIn, SignedOut, SignInButton, SignUpButton, UserButton } from '@clerk/clerk-react'
import { ArrowRight, Bell, Sparkles, LayoutGrid, Sun, Moon } from 'lucide-react'
import { useTheme } from '../context/ThemeContext'
import logoImage from '../assets/buy-later.png'

const Auth = () => {
  const { theme, toggleTheme } = useTheme()

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-850 dark:text-slate-100 flex flex-col selection:bg-slate-200 dark:selection:bg-slate-800 selection:text-black dark:selection:text-white transition-colors duration-350">
      
      {/* Clean solid header with thin border like Polaris */}
      <header className="relative z-10 border-b border-slate-200 dark:border-slate-900 bg-white dark:bg-slate-950 transition-colors duration-300">
        <div className="max-w-5xl mx-auto px-6 h-16 flex items-center justify-between">
          
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center justify-center p-1 overflow-hidden shadow-sm">
              <img src={logoImage} alt="Buy Later Logo" className="w-6 h-6 object-contain" />
            </div>
            <span className="text-lg font-bold text-slate-950 dark:text-white tracking-tight">
              Buy Later
            </span>
          </div>

          <div className="flex items-center space-x-4">
            {/* Theme Toggle Button */}
            <button 
              onClick={toggleTheme}
              className="w-8.5 h-8.5 rounded-lg flex items-center justify-center border border-slate-200 dark:border-slate-850 hover:bg-slate-50 dark:hover:bg-slate-900 transition-colors text-slate-550 dark:text-slate-400 hover:text-black dark:hover:text-white cursor-pointer"
              title="Toggle Theme"
            >
              {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>

            <SignedOut>
              <SignInButton mode="modal">
                <button className="text-xs font-semibold text-slate-600 dark:text-slate-350 hover:text-black dark:hover:text-white transition-colors cursor-pointer">
                  Sign In
                </button>
              </SignInButton>
              <SignUpButton mode="modal">
                <button className="px-4 py-2 text-xs font-bold rounded-lg transition-all cursor-pointer shadow-sm
                  bg-black hover:bg-slate-900 text-white 
                  dark:bg-blue-600 dark:hover:bg-blue-500 dark:text-white"
                >
                  Sign Up
                </button>
              </SignUpButton>
            </SignedOut>
            <SignedIn>
              <UserButton afterSignOutUrl="/" />
            </SignedIn>
          </div>
        </div>
      </header>

      {/* Main hero page - Polaris style minimalism */}
      <main className="relative z-10 flex-1 flex flex-col items-center justify-center max-w-5xl mx-auto px-6 py-16 w-full">
        <SignedOut>
          <div className="text-center max-w-2xl space-y-6 my-auto">
            
            <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 text-xs font-medium tracking-wide">
              <Sparkles className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400" />
              <span>Smart Shopping Assistant</span>
            </div>

            <h1 className="text-4xl sm:text-5xl font-black tracking-tight leading-tight text-slate-950 dark:text-white">
              Save products now. <br />
              <span className="text-slate-500 dark:text-slate-450">Buy when it's right.</span>
            </h1>

            <p className="text-base text-slate-650 dark:text-slate-400 max-w-lg mx-auto leading-relaxed">
              Organize items you want from any online store. Monitor price drops and purchase intelligently when you are ready.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-3.5 pt-2">
              <SignUpButton mode="modal">
                <button className="w-full sm:w-auto px-6 py-3 rounded-lg font-bold transition-all flex items-center justify-center space-x-2 cursor-pointer shadow-sm
                  bg-black hover:bg-slate-900 text-white
                  dark:bg-blue-600 dark:hover:bg-blue-550 dark:text-white"
                >
                  <span>Get Started for Free</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </SignUpButton>
              <SignInButton mode="modal">
                <button className="w-full sm:w-auto px-6 py-3 bg-white hover:bg-slate-50 dark:bg-slate-900 dark:hover:bg-slate-850 text-slate-800 dark:text-slate-300 font-bold rounded-lg border border-slate-200 dark:border-slate-800 transition-all cursor-pointer shadow-sm">
                  Learn how it works
                </button>
              </SignInButton>
            </div>

            {/* Feature Cards Grid - Simple neat borders, clean grids */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-10">
              
              <div className="p-6 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-900 text-left shadow-sm">
                <div className="w-9 h-9 rounded-lg bg-slate-100 dark:bg-slate-950 border border-slate-200/60 dark:border-slate-800 flex items-center justify-center text-slate-700 dark:text-slate-300 mb-4">
                  <LayoutGrid className="w-4.5 h-4.5" />
                </div>
                <h3 className="font-bold text-sm text-slate-950 dark:text-slate-200 mb-1.5">Universal Cart</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">Save products from any online store in one single place.</p>
              </div>

              <div className="p-6 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-900 text-left shadow-sm">
                <div className="w-9 h-9 rounded-lg bg-slate-100 dark:bg-slate-950 border border-slate-200/60 dark:border-slate-800 flex items-center justify-center text-slate-700 dark:text-slate-300 mb-4">
                  <Bell className="w-4.5 h-4.5" />
                </div>
                <h3 className="font-bold text-sm text-slate-950 dark:text-slate-200 mb-1.5">Price Alerts</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">Get notified instantly when your saved items go on sale.</p>
              </div>

              <div className="p-6 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-900 text-left shadow-sm">
                <div className="w-9 h-9 rounded-lg bg-slate-100 dark:bg-slate-950 border border-slate-200/60 dark:border-slate-800 flex items-center justify-center text-slate-700 dark:text-slate-300 mb-4">
                  <Sparkles className="w-4.5 h-4.5" />
                </div>
                <h3 className="font-bold text-sm text-slate-950 dark:text-slate-200 mb-1.5">Smart Organization</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">Categorize items into custom collections and wishlists.</p>
              </div>

            </div>
          </div>
        </SignedOut>

        <SignedIn>
          <div className="text-center max-w-md space-y-6 my-auto">
            <div className="w-14 h-14 rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center justify-center mx-auto shadow-sm">
              <Sparkles className="w-6 h-6 text-slate-800 dark:text-indigo-400" />
            </div>

            <h1 className="text-2xl font-black text-slate-950 dark:text-white">
              Welcome to Buy Later!
            </h1>

            <p className="text-sm text-slate-650 dark:text-slate-400 leading-relaxed max-w-sm mx-auto">
              You are signed in successfully. Ready to build your ultimate wishlist, track products, and manage your shopping list?
            </p>

            <div className="p-5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-900 text-left space-y-3.5 shadow-sm transition-colors duration-300">
              <h3 className="font-bold text-sm text-slate-950 dark:text-slate-200">Configure your application</h3>
              <p className="text-xs text-slate-550 dark:text-slate-400 leading-normal">
                You can manage your account settings, see your session status, or log out using the user button in the top right corner.
              </p>
              <a 
                href="https://dashboard.clerk.com/" 
                target="_blank" 
                rel="noopener noreferrer"
                className="inline-flex items-center space-x-1 text-xs font-bold text-black dark:text-indigo-400 hover:underline cursor-pointer"
              >
                <span>Go to Clerk Dashboard</span>
                <ArrowRight className="w-3.5 h-3.5 ml-1" />
              </a>
            </div>
          </div>
        </SignedIn>
      </main>

      {/* Footer */}
      <footer className="relative z-10 border-t border-slate-200 dark:border-slate-900 py-6 text-center text-xs text-slate-500 transition-colors duration-300">
        <p>&copy; {new Date().getFullYear()} Buy Later. Powered by Clerk.</p>
      </footer>
    </div>
  )
}

export default Auth