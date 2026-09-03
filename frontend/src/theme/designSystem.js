// Design System Tokens & Semantic Helpers for PayShield AI
export const COLORS = {
  bg: '#070b14',
  surface: '#0d1527',
  surfaceRaised: '#131f37',
  surfaceCard: '#0f172a',
  border: 'rgba(255, 255, 255, 0.08)',
  borderLight: 'rgba(255, 255, 255, 0.04)',
  borderAccent: 'rgba(56, 189, 248, 0.25)',

  accent: '#38bdf8',
  accentBlue: '#0284c7',
  accentCyan: '#06b6d4',

  success: '#10b981',
  successBg: 'rgba(16, 185, 129, 0.12)',
  successBorder: 'rgba(16, 185, 129, 0.3)',

  warning: '#f59e0b',
  warningBg: 'rgba(245, 158, 11, 0.12)',
  warningBorder: 'rgba(245, 158, 11, 0.3)',

  danger: '#ef4444',
  dangerBg: 'rgba(239, 68, 68, 0.12)',
  dangerBorder: 'rgba(239, 68, 68, 0.35)',

  text: '#f1f5f9',
  textMuted: '#94a3b8',
  textDim: '#64748b',
};

export const RISK_TIERS = {
  safe: {
    tier: 'LOW',
    label: 'CLEARED / LOW',
    color: '#10b981',
    bg: 'rgba(16, 185, 129, 0.1)',
    border: 'rgba(16, 185, 129, 0.3)',
    glow: 'rgba(16, 185, 129, 0.2)',
  },
  medium: {
    tier: 'MEDIUM',
    label: 'REVIEW REQUIRED',
    color: '#f59e0b',
    bg: 'rgba(245, 158, 11, 0.1)',
    border: 'rgba(245, 158, 11, 0.3)',
    glow: 'rgba(245, 158, 11, 0.25)',
  },
  high: {
    tier: 'HIGH',
    label: 'SUSPICIOUS / HIGH',
    color: '#f97316',
    bg: 'rgba(249, 115, 22, 0.12)',
    border: 'rgba(249, 115, 22, 0.35)',
    glow: 'rgba(249, 115, 22, 0.3)',
  },
  critical: {
    tier: 'CRITICAL',
    label: 'CRITICAL FRAUD',
    color: '#ef4444',
    bg: 'rgba(239, 68, 68, 0.15)',
    border: 'rgba(239, 68, 68, 0.4)',
    glow: 'rgba(239, 68, 68, 0.35)',
  },
};

export function normalizeScore(score) {
  const num = Number(score) || 0;
  if (num > 100) return Math.min(100, Math.round(num / 100));
  if (num > 0 && num <= 1) return Math.round(num * 100);
  return Math.min(100, Math.max(0, Math.round(num)));
}

export function getRiskTier(score) {
  const num = normalizeScore(score);
  if (num >= 85) return RISK_TIERS.critical;
  if (num >= 70) return RISK_TIERS.high;
  if (num >= 35) return RISK_TIERS.medium;
  return RISK_TIERS.safe;
}

export const DECISION_STYLES = {
  approve: { label: 'CLEARED', color: '#10b981', bg: 'rgba(16, 185, 129, 0.12)', border: 'rgba(16, 185, 129, 0.3)' },
  quarantine: { label: 'QUARANTINE', color: '#f59e0b', bg: 'rgba(245, 158, 11, 0.12)', border: 'rgba(245, 158, 11, 0.3)' },
  block: { label: 'BLOCKED', color: '#ef4444', bg: 'rgba(239, 68, 68, 0.12)', border: 'rgba(239, 68, 68, 0.35)' },
  step_up_auth: { label: 'STEP-UP 2FA', color: '#38bdf8', bg: 'rgba(56, 189, 248, 0.12)', border: 'rgba(56, 189, 248, 0.3)' },
  pending: { label: 'PENDING', color: '#94a3b8', bg: 'rgba(148, 163, 184, 0.1)', border: 'rgba(148, 163, 184, 0.2)' },
};

export const SOURCE_STYLES = {
  GMAIL_LIVE: { label: 'GMAIL BEC', color: '#38bdf8', bg: 'rgba(56, 189, 248, 0.12)', border: 'rgba(56, 189, 248, 0.3)' },
  BANK_SMS: { label: 'BANK SMS', color: '#f59e0b', bg: 'rgba(245, 158, 11, 0.12)', border: 'rgba(245, 158, 11, 0.3)' },
  MANUAL: { label: 'DIRECT API', color: '#06b6d4', bg: 'rgba(6, 182, 212, 0.12)', border: 'rgba(6, 182, 212, 0.3)' },
  RESILIENCE: { label: 'FALLBACK', color: '#a855f7', bg: 'rgba(168, 85, 247, 0.12)', border: 'rgba(168, 85, 247, 0.3)' },
  LIVE_WEBHOOK: { label: 'WEBHOOK', color: '#ec4899', bg: 'rgba(236, 72, 153, 0.12)', border: 'rgba(236, 72, 153, 0.3)' },
};

export function formatINR(amount) {
  const num = Number(amount) || 0;
  return "\u20B9" + num.toLocaleString("en-IN");
}
