import type { RiskLevel } from '../types/dashboard';

export const RISK_LABELS: Record<RiskLevel, string> = {
  SAFE: '안전',
  CAUTION: '주의',
  WARNING: '경계',
  DANGER: '위험',
};

export const RISK_COLORS: Record<RiskLevel, string> = {
  SAFE: '#22C55E',
  CAUTION: '#EAB308',
  WARNING: '#F97316',
  DANGER: '#EF4444',
};

export const RISK_BG_CLASSES: Record<RiskLevel, string> = {
  SAFE: 'bg-green-50 border-green-200',
  CAUTION: 'bg-yellow-50 border-yellow-200',
  WARNING: 'bg-orange-50 border-orange-200',
  DANGER: 'bg-red-50 border-red-200',
};

export const RISK_TEXT_CLASSES: Record<RiskLevel, string> = {
  SAFE: 'text-green-600',
  CAUTION: 'text-yellow-600',
  WARNING: 'text-orange-600',
  DANGER: 'text-red-600',
};

export const RISK_BADGE_CLASSES: Record<RiskLevel, string> = {
  SAFE: 'bg-green-500 text-white',
  CAUTION: 'bg-yellow-400 text-gray-900',
  WARNING: 'bg-orange-500 text-white',
  DANGER: 'bg-red-500 text-white',
};

export const RISK_DOT_CLASSES: Record<RiskLevel, string> = {
  SAFE: 'bg-green-500',
  CAUTION: 'bg-yellow-400',
  WARNING: 'bg-orange-500',
  DANGER: 'bg-red-500',
};

export const RISK_ACCENT_BORDER: Record<RiskLevel, string> = {
  SAFE: 'border-l-green-500',
  CAUTION: 'border-l-yellow-400',
  WARNING: 'border-l-orange-500',
  DANGER: 'border-l-red-500',
};
