import React, { useState } from 'react';
import { Download, PlusSquare, Share, X } from 'lucide-react';
import { usePWAInstall } from '../hooks/usePWAInstall';

export const PWAInstallButton: React.FC = () => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [showIOSGuide, setShowIOSGuide] = useState(false);

  if (isInstalled) {
    return null;
  }

  if (isInstallable) {
    return (
      <button
        type="button"
        onClick={install}
        className="min-h-[40px] px-3 flex items-center gap-1.5 rounded-xl bg-blue-600 text-white text-xs font-semibold active:scale-95 transition-transform whitespace-nowrap shrink-0"
      >
        <Download className="w-3.5 h-3.5" />
        <span>Instalar app</span>
      </button>
    );
  }

  if (isIOS) {
    return (
      <>
        <button
          type="button"
          onClick={() => setShowIOSGuide(true)}
          className="min-h-[40px] px-3 flex items-center gap-1.5 rounded-xl border border-zinc-300 bg-white text-zinc-800 text-xs font-semibold active:scale-95 transition-transform whitespace-nowrap shrink-0"
        >
          <Download className="w-3.5 h-3.5 text-blue-600" />
          <span>Instalar</span>
        </button>

        {showIOSGuide && (
          <div
            role="dialog"
            aria-modal="true"
            aria-label="Instalar en iPhone"
            className="fixed inset-0 z-50 flex items-end justify-center bg-zinc-950/50 backdrop-blur-[2px]"
            onClick={() => setShowIOSGuide(false)}
          >
            <div
              className="w-full max-w-md rounded-t-3xl bg-white p-5 pb-[calc(1.5rem+env(safe-area-inset-bottom,0px))] shadow-2xl space-y-4"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="w-10 h-1.5 bg-zinc-300 rounded-full mx-auto" />
              <div className="flex items-center justify-between">
                <h2 className="font-display text-base font-bold text-zinc-900">
                  Instalar en iPhone
                </h2>
                <button
                  type="button"
                  onClick={() => setShowIOSGuide(false)}
                  aria-label="Cerrar"
                  className="min-w-[44px] min-h-[44px] -mr-2 flex items-center justify-center text-zinc-500"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-3 text-sm text-zinc-600">
                <div className="flex items-start gap-3 rounded-2xl bg-slate-50 p-3 border border-zinc-200/70">
                  <Share className="w-4 h-4 text-blue-600 mt-0.5 shrink-0" />
                  <p>
                    1. Toca el botón <strong>Compartir</strong> en la barra inferior de Safari.
                  </p>
                </div>
                <div className="flex items-start gap-3 rounded-2xl bg-slate-50 p-3 border border-zinc-200/70">
                  <PlusSquare className="w-4 h-4 text-blue-600 mt-0.5 shrink-0" />
                  <p>
                    2. Desliza y toca <strong>Añadir a pantalla de inicio</strong>.
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setShowIOSGuide(false)}
                className="w-full min-h-[46px] rounded-xl bg-zinc-900 text-white text-sm font-semibold active:scale-[0.98] transition-transform"
              >
                Entendido
              </button>
            </div>
          </div>
        )}
      </>
    );
  }

  return null;
};
