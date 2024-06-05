import { addition } from './utils';

describe('App', () => {
  it('should work', () => {
    const result = addition(10, 20);
    expect(result).toBe(30);
  });
});
