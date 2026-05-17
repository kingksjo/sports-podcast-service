import React from 'react';
import Header from './Header';

export default function Layout({ children, footer }) {
  return (
    <main className="flex-1 flex flex-col items-center p-gutter md:p-margin min-h-screen">
      <div className="w-full max-w-3xl border border-outline-variant bg-surface-container flex flex-col shadow-2xl mt-8">
        <Header />
        {/* Content Area */}
        <div className="p-margin flex flex-col gap-margin">
          {children}
        </div>
      </div>
      
      {/* Optional Footer/Feed Area */}
      {footer}
    </main>
  );
}
