import { isWebglAvailable } from '@/features/games/three/webgl';

describe('isWebglAvailable', () => {
  it('returns true when the canvas can create a WebGL context', () => {
    const spy = vi
      .spyOn(HTMLCanvasElement.prototype, 'getContext')
      .mockReturnValue({} as unknown as RenderingContext);
    expect(isWebglAvailable()).toBe(true);
    spy.mockRestore();
  });

  it('returns false when no WebGL context can be created', () => {
    const spy = vi
      .spyOn(HTMLCanvasElement.prototype, 'getContext')
      .mockReturnValue(null);
    expect(isWebglAvailable()).toBe(false);
    spy.mockRestore();
  });

  it('returns false when context creation throws', () => {
    const spy = vi
      .spyOn(HTMLCanvasElement.prototype, 'getContext')
      .mockImplementation(() => {
        throw new Error('context creation blocked');
      });
    expect(isWebglAvailable()).toBe(false);
    spy.mockRestore();
  });
});
