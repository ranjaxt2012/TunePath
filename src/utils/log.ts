type LogLevel = 'info' | 'warn' | 'error';
type LogCategory =
  | 'AUTH'
  | 'API'
  | 'PLAYER'
  | 'NAV'
  | 'STORE'
  | 'UI';

const ENABLED = __DEV__;

const COLORS: Record<LogCategory, string> = {
  AUTH:   '🔐',
  API:    '🌐',
  PLAYER: '🎵',
  NAV:    '🧭',
  STORE:  '💾',
  UI:     '🖼',
};

function log(
  level: LogLevel,
  category: LogCategory,
  message: string,
  data?: unknown
) {
  if (!ENABLED) return;
  const emoji = COLORS[category];
  const prefix = `${emoji}[${category}]`;
  const ts = new Date().toISOString().slice(11, 23);

  if (data !== undefined) {
    if (level === 'error') {
      console.error(prefix, message, data);
    } else if (level === 'warn') {
      console.warn(prefix, message, data);
    } else {
      console.log(`[${ts}]`, prefix, message, data);
    }
  } else {
    if (level === 'error') {
      console.error(prefix, message);
    } else if (level === 'warn') {
      console.warn(prefix, message);
    } else {
      console.log(`[${ts}]`, prefix, message);
    }
  }
}

export const Log = {
  auth: (msg: string, data?: unknown) =>
    log('info', 'AUTH', msg, data),
  api: (msg: string, data?: unknown) =>
    log('info', 'API', msg, data),
  apiError: (msg: string, data?: unknown) =>
    log('error', 'API', msg, data),
  player: (msg: string, data?: unknown) =>
    log('info', 'PLAYER', msg, data),
  playerWarn: (msg: string, data?: unknown) =>
    log('warn', 'PLAYER', msg, data),
  nav: (msg: string, data?: unknown) =>
    log('info', 'NAV', msg, data),
  store: (msg: string, data?: unknown) =>
    log('info', 'STORE', msg, data),
  ui: (msg: string, data?: unknown) =>
    log('info', 'UI', msg, data),
  error: (msg: string, data?: unknown) =>
    log('error', 'UI', msg, data),
};
