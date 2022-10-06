import * as Y from 'yjs';
import { proxy, ref } from 'valtio/vanilla';
import { bindProxy } from '../src/index';

describe('bindProxy', () => {
  let savedConsoleWarn: any;
  beforeAll(() => {
    savedConsoleWarn = console.warn;
  });
  afterAll(() => {
    console.warn = savedConsoleWarn;
  });

  it('does not error with ref object', async () => {
    console.warn = jest.fn();
    const doc = new Y.Doc();
    const p = proxy<{ foo?: { bar?: string } }>({});
    const m = doc.getMap('map') as any;

    bindProxy(p, m);
    expect(p.foo).toBe(undefined);
    expect(m.get('foo')).toBe(undefined);

    p.foo = ref({ bar: 'a' });
    await Promise.resolve();
    expect(p.foo.bar).toBe('a');
    expect(m.get('foo')).toBe(undefined);
    expect(console.warn).toHaveBeenCalledTimes(1);
  });

  // it('does not error with ref array', async () => {
  //   console.warn = jest.fn();
  //   const doc = new Y.Doc();
  //   const p = proxy<{ foo?: string[] }>({});
  //   const m = doc.getMap('map') as any;

  //   bindProxy(p, m);
  //   expect(p.foo).toBe(undefined);
  //   expect(m.get('foo')).toBe(undefined);

  //   p.foo = ref(['a']);
  //   await Promise.resolve();
  //   expect(p.foo[0]).toBe('a');
  //   expect(m.get('foo')).toBe(undefined);
  //   expect(console.warn).toHaveBeenCalledTimes(1);
  // });
});
