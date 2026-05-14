export type DamageType = 'scratch' | 'dent' | 'crack' | 'deform';

export interface Point {
  x: number;
  y: number;
}

export interface DamageArea {
  id: string;
  type: DamageType;
  points: Point[];
  color: string;
  pixelArea: number;
  realArea: number;
  severity: number;
  estimatedCost: number;
}

export interface InsuranceEstimate {
  totalCost: number;
  severityScore: number;
  insuranceCoverage: number;
  selfPay: number;
  recommendation: string;
}

export interface ActionStep {
  id: number;
  title: string;
  description: string;
  icon: string;
  priority: 'high' | 'medium' | 'low';
  completed: boolean;
  details?: string[];
}

export interface GeoPosition {
  lat: number;
  lng: number;
  address?: string;
}

export interface ServicePoint {
  id: string;
  name: string;
  type: 'repair' | 'insurance' | 'police';
  address: string;
  distance: string;
  rating: number;
  phone?: string;
}

export interface AccidentReport {
  id: string;
  images: string[];
  damages: DamageArea[];
  estimate: InsuranceEstimate;
  actions: ActionStep[];
  createdAt: string;
  location?: GeoPosition;
}

export const DAMAGE_COLORS: Record<DamageType, string> = {
  scratch: '#EF4444',
  dent: '#F97316',
  crack: '#3B82F6',
  deform: '#A855F7',
};

export const DAMAGE_LABELS: Record<DamageType, string> = {
  scratch: '刮擦',
  dent: '凹陷',
  crack: '破裂',
  deform: '变形',
};
