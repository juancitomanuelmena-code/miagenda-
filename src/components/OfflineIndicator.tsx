import React from 'react';
import { WifiOff } from 'lucide-react';
import { useOnlineStatus } from '../hooks/useOnlineStatus';

export const OfflineIndicator: React.FC = () => {
  const isOnline = useOnlineStatus();

  if (isOnline) return null;

  return (
    <div
      role="status"
      aria-live="polite"
      className="mb-3 flex items-center gap-2 rounded-xl bg-amber-500/15 border border-amber-500/30 px-3 py-2 text-xs font-medium text-amber-900"
    >
      <WifiOff className="w-3.5 h-3.5 shrink-0" />
      <span>Modo sin conexión · Funcionando localmente en tu teléfono</span>
    </div>
  );
};
