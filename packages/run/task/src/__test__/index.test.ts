import { describe, expect, test } from 'vitest';
import { createTask } from '../index';

interface CounterState {
  value: number;
  log: string[];
}

const counterMethods = {
  add: (state: CounterState, n: number) => ({
    ...state,
    value: state.value + n,
  }),
  subtract: (state: CounterState, n: number) => ({
    ...state,
    value: state.value - n,
  }),
  multiply: (state: CounterState, n: number) => ({
    ...state,
    value: state.value * n,
  }),
  record: (state: CounterState, message: string) => ({
    ...state,
    log: [...state.log, message],
  }),
  /** Interrupts unless the value is strictly greater than 100. */
  assertBigEnough: (state: CounterState) =>
    state.value > 100 ? state : undefined,
  /** Replaces the state with a brand new object, discarding `log`. */
  resetLog: (state: CounterState) => ({ ...state, log: [] }),
};

const newCounter = () =>
  createTask<CounterState, typeof counterMethods>(
    { value: 0, log: [] },
    counterMethods,
  );

describe('createTask', () => {
  test('exposes the initial state', () => {
    const counter = newCounter();

    expect(counter.value).toBe(0);
    expect(counter.log).toEqual([]);
    expect(counter.interrupted).toBe(false);
  });

  test('mutates the state through the chain', () => {
    const counter = newCounter();

    counter.add(10)?.subtract(5)?.multiply(4);

    expect(counter.value).toBe(20);
  });

  test('returns the chain from every step', () => {
    const counter = newCounter();

    expect(counter.add(1)).toBe(counter);
  });

  test('falls through to the state for a property that is not a step', () => {
    const counter = newCounter();

    // @ts-expect-error - deliberately probing a non-existent step
    expect(counter.missing).toBeUndefined();
  });

  test('interrupts the chain when a step returns undefined', () => {
    const counter = newCounter();

    // 10 is not > 100, so `assertBigEnough` interrupts.
    const result = counter.add(10)?.assertBigEnough()?.multiply(4);

    expect(result).toBeUndefined();
    // `multiply` must not have run.
    expect(counter.value).toBe(10);
  });

  test('flags the chain as interrupted', () => {
    const counter = newCounter();

    counter.add(10)?.assertBigEnough();

    expect(counter.interrupted).toBe(true);
  });

  test('stays interrupted for every later call', () => {
    const counter = newCounter();

    counter.add(10)?.assertBigEnough();

    expect(counter.add(100)).toBeUndefined();
    expect(counter.value).toBe(10);
  });

  test('does not interrupt when a step passes the check', () => {
    const counter = newCounter();

    counter.add(200)?.assertBigEnough()?.multiply(2);

    expect(counter.value).toBe(400);
    expect(counter.interrupted).toBe(false);
  });

  test('keeps independent state per task', () => {
    const a = newCounter();
    const b = newCounter();

    a.add(5);

    expect(a.value).toBe(5);
    expect(b.value).toBe(0);
  });

  test('supports non-numeric steps', () => {
    const counter = newCounter();

    counter.record('first')?.record('second');

    expect(counter.log).toEqual(['first', 'second']);
  });

  test('a step may replace the whole state', () => {
    const counter = newCounter();

    counter.record('x')?.resetLog();

    expect(counter.log).toEqual([]);
    expect(counter.value).toBe(0);
  });
});
