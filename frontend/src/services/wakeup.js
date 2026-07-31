/**
 * DropGuard AI - Early Backend Wake-Up Service
 * 
 * Purpose:
 * Hosted containers on platforms like Render will sleep/spin down after periods of inactivity.
 * This service triggers a lightweight, database-free ping to boot up the backend as soon as
 * the application loads in the browser, reducing the perceived login wait time.
 * 
 * Design details:
 * 1. Executes immediately during application bootstrap (imported in main.jsx).
 * 2. Uses `navigator.sendBeacon` for a non-blocking, fire-and-forget POST request.
 * 3. Falls back to `fetch()` with a 5-second AbortController timeout if sendBeacon is unsupported.
 * 4. Retries exactly once after 4 seconds if the first attempt fails or times out.
 * 5. Listens to `visibilitychange` to trigger a wakeup ping if the tab is reactivated after 20+ minutes of idle.
 */

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1';
const PING_URL = `${API_URL}/ping`;

let isRetrying = false;

/**
 * Dispatches a lightweight ping to the server.
 * Bypasses database logic to wake up the container at low resource cost.
 */
const sendPing = async () => {
  // Use sendBeacon first if supported (always POST fire-and-forget)
  if (typeof navigator !== 'undefined' && navigator.sendBeacon) {
    try {
      const success = navigator.sendBeacon(PING_URL);
      if (success) {
        console.log("[Wakeup] sendBeacon ping successfully queued.");
        return true;
      }
    } catch (err) {
      console.warn("[Wakeup] sendBeacon queue failed, falling back to fetch.", err);
    }
  }

  // Fallback to fetch with custom AbortController timeout
  if (typeof fetch !== 'undefined') {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000); // 5s timeout

    try {
      const response = await fetch(PING_URL, {
        method: 'POST',
        signal: controller.signal,
        mode: 'cors',
        headers: { 'Content-Type': 'application/json' }
      });
      clearTimeout(timeoutId);
      return response.ok;
    } catch (err) {
      clearTimeout(timeoutId);
      // Fail silently (e.g. abort or network failure)
      return false;
    }
  }

  return false;
};

/**
 * Initiates the wakeup flow with exactly one retry on initial load.
 */
const triggerWakeupFlow = async () => {
  const success = await sendPing();
  if (!success && !isRetrying) {
    isRetrying = true;
    console.log("[Wakeup] First ping failed or timed out. Retrying in 4 seconds...");
    setTimeout(async () => {
      await sendPing();
      isRetrying = false;
    }, 4000); // Wait 4 seconds before the single retry
  }
};

// Fire wakeup instantly upon script load (application entry point)
triggerWakeupFlow();

/**
 * Visibility change listener.
 * If the user reactivates the tab after the container might have fallen asleep again (20+ minutes idle),
 * send one additional background ping.
 */
let hiddenTime = null;

if (typeof document !== 'undefined') {
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'hidden') {
      hiddenTime = Date.now();
    } else if (document.visibilityState === 'visible') {
      if (hiddenTime) {
        const idleDuration = Date.now() - hiddenTime;
        const idleThreshold = 20 * 60 * 1000; // 20 minutes in milliseconds
        
        if (idleDuration >= idleThreshold) {
          console.log(`[Wakeup] Tab reactivated after ${(idleDuration / 60000).toFixed(1)} mins idle. Dispatching additional wakeup ping.`);
          sendPing();
        }
      }
      hiddenTime = null;
    }
  });
}
