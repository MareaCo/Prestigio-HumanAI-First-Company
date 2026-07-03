export const TIER_NAMES = ['Aficionado', 'Regular', 'Integrador', 'Director', 'Constructor', 'Orquestador'];
export const TIER_COLORS = ['#E8534A', '#E87A3A', '#E8A83A', '#6BAE5E', '#3A8E6E', '#1A6E9E'];
export const TIER_COLORS_LIGHT = ['#FDECEA', '#FEF0E6', '#FEF6E6', '#EDF7EB', '#E6F5F0', '#E6F2FB'];
export const TIER_RANGES: [number, number][] = [[15, 23], [24, 31], [32, 39], [40, 47], [48, 54], [55, 60]];

export const DIMENSIONS = [
  'Mentalidad',
  'Contexto',
  'Datos',
  'Automatización',
  'Calidad',
  'Autonomía',
  'Liderazgo',
] as const;

export const DIM_MAX: Record<(typeof DIMENSIONS)[number], number> = {
  Mentalidad: 8,
  Contexto: 8,
  Datos: 8,
  Automatización: 8,
  Calidad: 8,
  Autonomía: 8,
  Liderazgo: 12,
};

export const MAX_SCORE = 60;

export const PERFIL_CONFIG = {
  'Escéptico': { color: '#E8534A', light: '#FDECEA', dark: '#993C1D' },
  'Táctico': { color: '#E8A83A', light: '#FEF6E6', dark: '#854F0B' },
  'Facilitador': { color: '#6BAE5E', light: '#EDF7EB', dark: '#27500A' },
  'Amplificador': { color: '#1A6E9E', light: '#E6F2FB', dark: '#0C447C' },
} as const;

export const AREAS = ['Ventas', 'Operaciones', 'Tecnología', 'RRHH', 'Finanzas', 'Legal', 'Marketing', 'Otra'];

export const AWARE_STAGES = [
  { key: 'awake', letter: 'A', name: 'AWAKE', desc: 'Conciencia y urgencia compartida', failure: 'Falta visión — RESISTENCIA' },
  { key: 'watch', letter: 'W', name: 'WATCH', desc: 'Lectura de la realidad sin autoengaño', failure: 'Falta diagnóstico — CONFUSIÓN' },
  { key: 'align', letter: 'A', name: 'ALIGN', desc: 'Coherencia organizacional', failure: 'Falta coherencia — ANSIEDAD' },
  { key: 'relearn', letter: 'R', name: 'RELEARN', desc: 'Capacidades reaprendidas', failure: 'Falta de capacidades — FRUSTRACIÓN' },
  { key: 'experiment', letter: 'E', name: 'EXPERIMENT', desc: 'Pilotos y escalamiento con criterio', failure: 'Falta de aprendizaje — DESMOTIVACIÓN' },
] as const;
