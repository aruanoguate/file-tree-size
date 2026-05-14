import { buildWorkerResult } from '../src/worker/result';

describe('buildWorkerResult', () => {
  it('returns a tree message when the task succeeds', () => {
    const result = buildWorkerResult(() => ({
      key: 'root',
      size: 1,
      type: 'object',
      children: [],
      line: 0,
      col: 0,
    }));

    expect(result).toEqual({
      type: 'tree',
      data: {
        key: 'root',
        size: 1,
        type: 'object',
        children: [],
        line: 0,
        col: 0,
      },
    });
  });

  it('returns an error message when the task throws an Error', () => {
    expect(buildWorkerResult(() => {
      throw new Error('boom');
    })).toEqual({ type: 'error', message: 'boom' });
  });

  it('stringifies non-Error throw values', () => {
    expect(buildWorkerResult(() => {
      throw 'boom';
    })).toEqual({ type: 'error', message: 'boom' });
  });
});