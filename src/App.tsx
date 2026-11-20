/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useMemo, useRef, useState } from 'react';
import { Check, Search, Trash2, X } from 'lucide-react';
import { OfflineIndicator } from './components/OfflineIndicator';
import { PWAInstallButton } from './components/PWAInstallButton';

type Prioridad = 'Baja' | 'Media' | 'Alta';
type FiltroPrioridad = 'Todas' | 'Alta' | 'Media' | 'Baja';

interface Actividad {
  id: number;
  titulo: string;
  fecha: string; // YYYY-MM-DD
  prioridad: Prioridad;
  completada: boolean;
}

const NIVELES_PRIORIDAD: Prioridad[] = ['Baja', 'Media', 'Alta'];
const FILTROS_PRIORIDAD: FiltroPrioridad[] = ['Todas', 'Alta', 'Media', 'Baja'];

const ESTILOS_PRIORIDAD: Record<Prioridad, { texto: string; botonActivo: string }> = {
  Alta: {
    texto: 'text-rose-600 font-semibold',
    botonActivo: 'bg-rose-600 text-white shadow-xs',
  },
  Media: {
    texto: 'text-amber-600 font-medium',
    botonActivo: 'bg-amber-500 text-white shadow-xs',
  },
  Baja: {
    texto: 'text-zinc-500 font-normal',
    botonActivo: 'bg-white text-zinc-900 shadow-xs',
  },
};

function obtenerFechaHoy(): string {
  const hoy = new Date();
  const anio = hoy.getFullYear();
  const mes = String(hoy.getMonth() + 1).padStart(2, '0');
  const dia = String(hoy.getDate()).padStart(2, '0');
  return `${anio}-${mes}-${dia}`;
}

function formatearFecha(fechaIso: string): string {
  const partes = fechaIso.split('-');
  if (partes.length !== 3) return fechaIso;
  const [anio, mes, dia] = partes;
  return `${dia}/${mes}/${anio}`;
}

function vibrar(patron: number | number[] = 12) {
  if (typeof navigator !== 'undefined' && typeof navigator.vibrate === 'function') {
    try {
      navigator.vibrate(patron);
    } catch {
      // Ignorar en dispositivos sin soporte háptico
    }
  }
}

export default function App() {
  const [textoActividad, setTextoActividad] = useState('');
  const [fechaActividad, setFechaActividad] = useState('');
  const [prioridadActividad, setPrioridadActividad] = useState<Prioridad>('Media');
  const [busqueda, setBusqueda] = useState('');
  const [filtroPrioridad, setFiltroPrioridad] = useState<FiltroPrioridad>('Todas');
  const [actividades, setActividades] = useState<Actividad[]>([]);
  const [aviso, setAviso] = useState<string | null>(null);
  const siguienteId = useRef(1);

  const actividadesFiltradas = useMemo(() => {
    const termino = busqueda.trim().toLowerCase();
    return actividades.filter((item) => {
      const coincideTexto = !termino || item.titulo.toLowerCase().includes(termino);
      const coincidePrioridad =
        filtroPrioridad === 'Todas' || item.prioridad === filtroPrioridad;
      return coincideTexto && coincidePrioridad;
    });
  }, [actividades, busqueda, filtroPrioridad]);

  const agregarActividad = (e: React.FormEvent) => {
    e.preventDefault();
    const tituloLimpio = textoActividad.trim();
    if (!tituloLimpio) {
      vibrar([10, 20]);
      setAviso('Debes escribir una actividad.');
      return;
    }

    vibrar(14);
    const fechaFinal = fechaActividad.trim() || obtenerFechaHoy();
    setActividades((prev) => [
      ...prev,
      {
        id: siguienteId.current++,
        titulo: tituloLimpio,
        fecha: fechaFinal,
        prioridad: prioridadActividad,
        completada: false,
      },
    ]);
    setTextoActividad('');
    setFechaActividad('');
    setPrioridadActividad('Media');
    setAviso(null);
  };

  const cambiarEstado = (id: number) => {
    vibrar(12);
    setActividades((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, completada: !item.completada } : item
      )
    );
  };

  const eliminarActividad = (id: number) => {
    vibrar([10, 20]);
    setActividades((prev) => prev.filter((item) => item.id !== id));
  };

  return (
    <div className="min-h-[100dvh] w-full sm:flex sm:items-center sm:justify-center sm:bg-zinc-950 sm:p-4">
      {/* Aplicación móvil exclusiva para teléfonos: pantalla completa en móvil y marco de teléfono en escritorio */}
      <div className="relative w-full h-[100dvh] sm:w-[390px] sm:h-[min(820px,92dvh)] sm:rounded-[38px] sm:border-[6px] sm:border-zinc-800 sm:shadow-2xl bg-slate-50 text-zinc-900 flex flex-col overflow-hidden select-none">
        {/* TopAppBar compacto (52px + safe area superior) */}
        <header className="shrink-0 pt-safe bg-white/95 backdrop-blur-md border-b border-zinc-200/80 z-20">
          <div className="h-[52px] px-4 flex items-center justify-between gap-3">
            <h1 className="font-display text-xl font-bold tracking-tight text-zinc-900 whitespace-nowrap shrink-0">
              Mi Agenda
            </h1>
            <PWAInstallButton />
          </div>
        </header>

        {/* Contenido principal desplazable optimizado para teléfono */}
        <main className="flex-1 overflow-y-auto overscroll-contain no-scrollbar px-4 pt-3 pb-[calc(1.25rem+env(safe-area-inset-bottom,0px))] space-y-4">
          <OfflineIndicator />

          {/* Formulario de creación */}
          <form onSubmit={agregarActividad} noValidate className="space-y-3">
            <div>
              <label
                htmlFor="campo-actividad"
                className="block text-xs font-semibold text-zinc-600 mb-1.5"
              >
                Escribe una actividad
              </label>
              <input
                id="campo-actividad"
                type="text"
                enterKeyHint="done"
                value={textoActividad}
                onChange={(e) => {
                  setTextoActividad(e.target.value);
                  if (aviso && e.target.value.trim()) {
                    setAviso(null);
                  }
                }}
                placeholder="Ej. Estudiar Kotlin 30 minutos"
                aria-invalid={!!aviso}
                className={`w-full min-h-[48px] rounded-xl bg-white border px-3.5 text-sm text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:ring-2 select-text ${
                  aviso
                    ? 'border-rose-600 focus:ring-rose-600'
                    : 'border-zinc-300 focus:border-blue-600 focus:ring-blue-600'
                }`}
              />
              {aviso && (
                <p role="alert" className="mt-1.5 text-xs font-medium text-rose-600">
                  {aviso}
                </p>
              )}
            </div>

            <div>
              <label
                htmlFor="campo-fecha"
                className="block text-xs font-semibold text-zinc-600 mb-1.5"
              >
                Fecha <span className="font-normal text-zinc-400">(opcional · hoy por defecto)</span>
              </label>
              <input
                id="campo-fecha"
                type="date"
                value={fechaActividad}
                onChange={(e) => setFechaActividad(e.target.value)}
                className="w-full min-h-[46px] rounded-xl bg-white border border-zinc-300 px-3.5 text-sm tabular-nums text-zinc-900 focus:outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-600 select-text"
              />
            </div>

            <div>
              <span className="block text-xs font-semibold text-zinc-600 mb-1.5">
                Prioridad
              </span>
              <div className="grid grid-cols-3 gap-1.5 p-1 rounded-xl bg-zinc-200/70 border border-zinc-200">
                {NIVELES_PRIORIDAD.map((nivel) => {
                  const activa = prioridadActividad === nivel;
                  return (
                    <button
                      key={nivel}
                      type="button"
                      onClick={() => {
                        vibrar(8);
                        setPrioridadActividad(nivel);
                      }}
                      className={`min-h-[40px] rounded-lg text-xs font-semibold transition-colors whitespace-nowrap ${
                        activa
                          ? ESTILOS_PRIORIDAD[nivel].botonActivo
                          : 'text-zinc-600 hover:text-zinc-900'
                      }`}
                    >
                      {nivel}
                    </button>
                  );
                })}
              </div>
            </div>

            <button
              type="submit"
              className="w-full min-h-[48px] rounded-xl bg-blue-600 hover:bg-blue-700 active:scale-[0.98] text-white text-sm font-semibold transition-all shadow-xs"
            >
              Agregar actividad
            </button>
          </form>

          {/* Barra de búsqueda + selector de filtros por prioridad */}
          <div className="pt-3 border-t border-zinc-200/80 space-y-2.5">
            <div className="relative flex items-center">
              <Search className="w-4 h-4 text-zinc-400 absolute left-3.5 pointer-events-none" />
              <input
                id="barra-busqueda"
                type="search"
                aria-label="Buscar actividad"
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
                placeholder="Buscar actividad..."
                className="w-full min-h-[44px] rounded-xl bg-white border border-zinc-300 pl-10 pr-10 text-sm text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-600 select-text"
              />
              {busqueda && (
                <button
                  type="button"
                  onClick={() => setBusqueda('')}
                  aria-label="Limpiar búsqueda"
                  className="absolute right-0 min-w-[44px] min-h-[44px] flex items-center justify-center text-zinc-400 hover:text-zinc-700"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Selector de filtros debajo de la barra de búsqueda */}
            <div
              role="group"
              aria-label="Filtrar por prioridad"
              className="grid grid-cols-4 gap-1 p-1 rounded-xl bg-zinc-200/70 border border-zinc-200"
            >
              {FILTROS_PRIORIDAD.map((filtro) => {
                const activo = filtroPrioridad === filtro;
                return (
                  <button
                    key={filtro}
                    type="button"
                    aria-pressed={activo}
                    onClick={() => {
                      vibrar(8);
                      setFiltroPrioridad(filtro);
                    }}
                    className={`min-h-[38px] rounded-lg text-xs font-semibold transition-colors whitespace-nowrap ${
                      activo
                        ? 'bg-white text-zinc-900 shadow-xs'
                        : 'text-zinc-600 hover:text-zinc-900'
                    }`}
                  >
                    {filtro}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Lista filtrada de actividades en memoria */}
          <div>
            {actividadesFiltradas.length === 0 ? (
              <div className="py-10 px-4 text-center">
                <p className="text-sm text-zinc-500 leading-relaxed">
                  {actividades.length === 0
                    ? 'No hay actividades todavía. Escribe una arriba para comenzar.'
                    : 'No hay actividades que coincidan con el filtro.'}
                </p>
              </div>
            ) : (
              <ul className="space-y-2 pb-safe">
                {actividadesFiltradas.map((actividad) => (
                  <li
                    key={actividad.id}
                    className="flex items-center gap-1 rounded-2xl bg-white px-2 py-1.5 border border-zinc-200/80"
                  >
                    <button
                      type="button"
                      role="checkbox"
                      aria-checked={actividad.completada}
                      aria-label={
                        actividad.completada
                          ? `Desmarcar ${actividad.titulo}`
                          : `Marcar ${actividad.titulo} como completada`
                      }
                      onClick={() => cambiarEstado(actividad.id)}
                      className="min-w-[44px] min-h-[44px] flex items-center justify-center shrink-0 active:scale-90 transition-transform"
                    >
                      <span
                        className={`w-5 h-5 rounded-[5px] border-2 flex items-center justify-center transition-colors ${
                          actividad.completada
                            ? 'bg-blue-600 border-blue-600 text-white'
                            : 'border-zinc-400 bg-transparent'
                        }`}
                      >
                        {actividad.completada && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                      </span>
                    </button>

                    <button
                      type="button"
                      onClick={() => cambiarEstado(actividad.id)}
                      className="flex-1 min-w-0 text-left py-2 px-1"
                    >
                      <div className="flex items-baseline justify-between gap-2">
                        <span
                          className={`text-sm font-medium break-words transition-colors ${
                            actividad.completada
                              ? 'line-through text-zinc-400'
                              : 'text-zinc-900'
                          }`}
                        >
                          {actividad.titulo}
                        </span>
                        <span className="text-xs text-zinc-500 tabular-nums whitespace-nowrap shrink-0">
                          {formatearFecha(actividad.fecha)}
                        </span>
                      </div>
                      <span
                        className={`block text-xs mt-0.5 ${ESTILOS_PRIORIDAD[actividad.prioridad].texto}`}
                      >
                        Prioridad {actividad.prioridad}
                      </span>
                    </button>

                    <button
                      type="button"
                      onClick={() => eliminarActividad(actividad.id)}
                      aria-label={`Eliminar ${actividad.titulo}`}
                      className="min-w-[44px] min-h-[44px] flex items-center justify-center rounded-xl text-rose-600 hover:bg-rose-50 active:scale-90 transition-all shrink-0"
                    >
                      <Trash2 className="w-[18px] h-[18px]" />
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
