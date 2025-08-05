/* eslint @typescript-eslint/no-explicit-any: "off" */

import { afterAll, beforeAll, describe, expect, it, vi } from 'vitest';
import * as Y from 'yjs';
import { proxy, ref } from 'valtio/vanilla';
import { bind } from 'valtio-yjs';

describe('bind', () => {
  let savedConsoleWarn: any;
  beforeAll(() => {
    savedConsoleWarn = console.warn;
  });
  afterAll(() => {
    console.warn = savedConsoleWarn;
  });

  it('does not error with ref object', async () => {
    console.warn = vi.fn();
    const doc = new Y.Doc();
    const p = proxy<{ foo?: { bar?: string } }>({});
    const m = doc.getMap('map') as any;

    bind(p, m);
    expect(p.foo).toBe(undefined);
    expect(m.get('foo')).toBe(undefined);

    p.foo = ref({ bar: 'a' });
    await Promise.resolve();
    expect(p.foo.bar).toBe('a');
    expect(m.get('foo')).toBe(undefined);
    expect(console.warn).toHaveBeenCalledTimes(1);
  });

  it('does not error with ref array', async () => {
    console.warn = vi.fn();
    const doc = new Y.Doc();
    const p = proxy<{ foo?: string[] }>({});
    const m = doc.getMap('map') as any;

    bind(p, m);
    expect(p.foo).toBe(undefined);
    expect(m.get('foo')).toBe(undefined);

    p.foo = ref(['a']);
    await Promise.resolve();
    expect(p.foo[0]).toBe('a');
    expect(m.get('foo')).toBe(undefined);
    expect(console.warn).toHaveBeenCalledTimes(1);
  });

  it('does not error with Y.Text', async () => {
    console.warn = vi.fn();
    const doc = new Y.Doc();
    const p = proxy<{ foo?: Y.Text }>({});
    const m = doc.getMap('map') as any;

    bind(p, m);
    expect(p.foo).toBe(undefined);
    expect(m.get('foo')).toBe(undefined);

    p.foo = new Y.Text();
    await Promise.resolve();
    expect(m.get('foo')).toBe(undefined);
    expect(console.warn).toHaveBeenCalledTimes(1);
  });
});
