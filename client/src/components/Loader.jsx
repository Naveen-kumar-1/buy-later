import React from 'react'
import logoImage from '../assets/buy-later.png'

const Loader = () => {
  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-slate-50 dark:bg-slate-950 transition-colors duration-300">
      <div className="flex flex-col items-center space-y-4">
        {/* Pulsing logo icon */}
        <div className="w-12 h-12 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center justify-center p-1.5 shadow-sm animate-pulse">
          <img src={logoImage} alt="Loading brand logo" className="w-8 h-8 object-contain" />
        </div>
        
        {/* Spinner and label */}
        <div className="flex items-center space-x-2">
          <div className="w-3.5 h-3.5 border-2 border-slate-300 dark:border-slate-800 border-t-black dark:border-t-white rounded-full animate-spin" />
          <span className="text-xs font-bold text-slate-500 dark:text-slate-400 tracking-wider uppercase">
            Loading App...
          </span>
        </div>
      </div>
    </div>
  )
}

export default Loader
