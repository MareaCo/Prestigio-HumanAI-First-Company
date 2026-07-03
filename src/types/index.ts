export interface Company {
  id: string;
  name: string;
  created_at: string;
}

export interface Employee {
  id: string;
  name: string;
  email: string | null;
  area: string;
  company_id: string;
  created_at: string;
}

export type DimScores = Record<
  'Mentalidad' | 'Contexto' | 'Datos' | 'Automatización' | 'Calidad' | 'Autonomía' | 'Liderazgo',
  number
>;

export interface ActivitiesQ {
  q1: number;
  q2: number;
  q3: number;
  q4: number;
}

export interface Diagnostic {
  id: string;
  employee_id: string;
  tier: number;
  total_score: number;
  dim_scores: DimScores;
  perfil: 'Escéptico' | 'Táctico' | 'Facilitador' | 'Amplificador';
  activities_q: ActivitiesQ;
  created_at: string;
  employee?: Employee;
}

export type AreaFilter = '__all__' | string;

export type Role = 'admin' | 'leader' | 'employee';
export type Screen = 'login' | 'dashboard' | 'quiz' | 'report' | 'employee-detail' | 'users';
