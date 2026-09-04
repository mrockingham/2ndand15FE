export const isWebglAvailable = (): boolean => {
  if (typeof window === 'undefined' || typeof document === 'undefined')
    return false;
  try {
    const canvas = document.createElement('canvas');
    const context =
      canvas.getContext('webgl2') ??
      canvas.getContext('webgl') ??
      canvas.getContext('experimental-webgl');
    return context !== null;
  } catch {
    return false;
  }
};
