/**
 * AgroScan AI - Event Loop & Interaction to Next Paint (INP) Scheduler.
 *
 * Provides non-blocking execution primitives to yield control back to the main browser thread.
 * Guarantees responsiveness for user input events (taps, keystrokes, scroll) ensuring
 * Interaction to Next Paint (INP) stays under Google Core Web Vitals threshold (< 50ms).
 */

/**
 * Yields execution back to the browser's main event loop using the modern
 * Prioritized Task Scheduling API (`scheduler.yield()`), falling back to
 * `requestAnimationFrame` or `setTimeout(0)` when unsupported.
 */
export const yieldToMainThread = (): Promise<void> => {
  if (typeof window !== 'undefined' && 'scheduler' in window && 'yield' in (window as any).scheduler) {
    return (window as any).scheduler.yield();
  }

  // Fallback using MessageChannel or setTimeout to queue a microtask/macrotask without clamp delay
  return new Promise((resolve) => {
    if (typeof MessageChannel !== 'undefined') {
      const channel = new MessageChannel();
      channel.port1.onmessage = () => resolve();
      channel.port2.postMessage(null);
    } else {
      setTimeout(resolve, 0);
    }
  });
};

/**
 * Conditionally yields to main thread if continuous synchronous work has exceeded
 * a threshold (default: 16ms / 1 frame duration), preventing Long Tasks (>50ms).
 *
 * @param startTime timestamp when current work chunk began (via `performance.now()`).
 * @param thresholdMs maximum allowable continuous main-thread occupancy.
 * @returns updated timestamp for the next work slice.
 */
export const yieldIfLongTask = async (
  startTime: number,
  thresholdMs: number = 16
): Promise<number> => {
  if (performance.now() - startTime > thresholdMs) {
    await yieldToMainThread();
    return performance.now();
  }
  return startTime;
};

/**
 * Executes a heavy array processing pipeline in chunked time-slices,
 * allowing the browser to render frames and respond to touch/mouse events between slices.
 */
export const processChunkedArray = async <T>(
  items: T[],
  processor: (item: T, index: number) => void,
  chunkSize: number = 20
): Promise<void> => {
  for (let i = 0; i < items.length; i += chunkSize) {
    const chunk = items.slice(i, i + chunkSize);
    chunk.forEach((item, offset) => processor(item, i + offset));
    await yieldToMainThread();
  }
};

/**
 * Schedules background housekeeping during browser idle periods.
 */
export const scheduleIdleTask = (callback: () => void, timeoutMs: number = 2000): void => {
  if (typeof window !== 'undefined' && 'requestIdleCallback' in window) {
    (window as any).requestIdleCallback(callback, { timeout: timeoutMs });
  } else {
    setTimeout(callback, 50);
  }
};

