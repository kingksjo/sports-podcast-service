import React from 'react';

export default function Header() {
  // Generate a random PID for flavor
  const pid = React.useMemo(() => Math.floor(Math.random() * 9000) + 1000, []);

  return (
    <div className="flex items-center justify-between p-gutter border-b border-outline-variant bg-surface-container-high">
      <div className="flex items-center gap-unit">
        <span className="material-symbols-outlined text-secondary">memory</span>
        <h1 className="font-headline-md text-headline-md text-primary uppercase">AloSphere Kernel</h1>
      </div>
      <div className="font-status-code text-status-code text-on-surface-variant">
        PID: {pid}
      </div>
    </div>
  );
}
