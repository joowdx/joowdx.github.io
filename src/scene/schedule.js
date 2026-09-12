/** Break construction into tasks so input and rendering can run between scene sections. */
export const yieldToBrowser = () => (typeof document === 'undefined' ? Promise.resolve() : new Promise((resolve) => setTimeout(resolve, 0)));
