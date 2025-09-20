import 'dotenv/config';

const EVALUATION_SERVICE_URL = 'http://20.244.56.144/evaluation-service/logs';
const ACCESS_TOKEN = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJNYXBDbGFpbXMiOnsiYXVkIjoiaHR0cDovLzIwLjI0NC41Ni4xNDQvZXZhbHVhdGlvbi1zZXJ2aWNlIiwiZW1haWwiOiJzaGl2YXN1bnVndXB0YUBnbWFpbC5jb20iLCJleHAiOjE3NTgzNTQ2MzIsImlhdCI6MTc1ODM1MzczMiwiaXNzIjoiQWZmb3JkIE1lZGljYWwgVGVjaG5vbG9naWVzIFByaXZhdGUgTGltaXRlZCIsImp0aSI6ImIzOWQyYWU5LTE3NTQtNDk3MC1hOTZhLWM4OTM5MTY0MjE5YSIsImxvY2FsZSI6ImVuLUlOIiwibmFtZSI6InNoaXZhc3VudSBndXB0YSIsInN1YiI6ImY5YTg0MjgwLWM0NmItNGY0Ni1hZTM4LWM0MGVkZjRmMTM0MSJ9LCJlbWFpbCI6InNoaXZhc3VudWd1cHRhQGdtYWlsLmNvbSIsIm5hbWUiOiJzaGl2YXN1bnUgZ3VwdGEiLCJyb2xsTm8iOiIyMjAxMDI2NjMiLCJhY2Nlc3NDb2RlIjoiU2ttbmV3IiwiY2xpZW50SUQiOiJmOWE4NDI4MC1jNDZiLTRmNDYtYWUzOC1jNDBlZGY0ZjEzNDEiLCJjbGllbnRTZWNyZXQiOiJYTkRDTXhuY3hhendLdXNYIn0.utE3fvOwuTKjqOfcKnQ534Cam0ur8gk8xhpbizre2o0";

const ALLOWED_STACKS = ['backend', 'frontend'];
const ALLOWED_LEVELS = ['debug', 'info', 'warn', 'error', 'fatal'];
const ALLOWED_PACKAGES = {
  backend: ['cache', 'controller', 'cron_job', 'db', 'domain', 'handler', 'repository', 'route', 'service', 'auth', 'config', 'middleware'],
  frontend: ['api', 'component', 'hook', 'page', 'style', 'auth', 'config', 'middleware']
};

/**
 * Logs an event to the AffordMed evaluation service
 * @param {string} stack - The application stack ('backend' or 'frontend')
 * @param {string} level - The log level ('debug', 'info', 'warn', 'error', 'fatal')
 * @param {string} packageName - The package/module name
 * @param {string} message - The log message
 * @returns {Promise<void>}
 */
export async function logEvent(stack, level, packageName, message) {
  try {
    // Validation
    if (!ALLOWED_STACKS.includes(stack)) {
      console.error(`Invalid stack: ${stack}. Allowed: ${ALLOWED_STACKS.join(', ')}`);
      return;
    }

    if (!ALLOWED_LEVELS.includes(level)) {
      console.error(`Invalid level: ${level}. Allowed: ${ALLOWED_LEVELS.join(', ')}`);
      return;
    }

    if (!ALLOWED_PACKAGES[stack] || !ALLOWED_PACKAGES[stack].includes(packageName)) {
      console.error(`Invalid package: ${packageName} for stack: ${stack}. Allowed: ${ALLOWED_PACKAGES[stack]?.join(', ')}`);
      return;
    }

    if (!ACCESS_TOKEN) {
      console.error('ACCESS_TOKEN not found in environment variables');
      return;
    }

    // Prepare log payload
    const logPayload = {
      stack,
      level,
      package: packageName,
      message,
      timestamp: new Date().toISOString()
    };

    // Send to evaluation service
    const response = await fetch(EVALUATION_SERVICE_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${ACCESS_TOKEN}`
      },
      body: JSON.stringify(logPayload)
    });

    if (!response.ok) {
      console.error(`Logging failed: ${response.status} ${response.statusText}`);
      const errorText = await response.text();
      console.error('Response:', errorText);
    } else {
      //console.log(`[LOG SENT] ${stack}:${level}:${packageName} - ${message}`);
    }

  } catch (error) {
    console.error('Error sending log to evaluation service:', error.message);
  }
}

/**
 * Creates a console logger that also sends to evaluation service
 * @param {string} stack - The application stack
 * @param {string} packageName - The package name
 * @returns {Object} Logger object with debug, info, warn, error, fatal methods
 */
export function createLogger(stack, packageName) {
  return {
    debug: async (message) => {
      await logEvent(stack, 'debug', packageName, message);
    },
    info: async (message) => {
      await logEvent(stack, 'info', packageName, message);
    },
    warn: async (message) => {
      console.warn(`[WARN] ${message}`);
      await logEvent(stack, 'warn', packageName, message);
    },
    error: async (message) => {
      console.error(`[ERROR] ${message}`);
      await logEvent(stack, 'error', packageName, message);
    },
    fatal: async (message) => {
      console.error(`[FATAL] ${message}`);
      await logEvent(stack, 'fatal', packageName, message);
    }
  };
}

export default { logEvent, createLogger };