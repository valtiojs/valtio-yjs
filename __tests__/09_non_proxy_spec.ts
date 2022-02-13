import * as Y from 'yjs';
import { proxy, ref } from 'valtio/vanilla';
import { bindProxyAndYMap } from '../src/index';

describe('bindProxyAndYMap', () => {
  let savedConsoleWarn: any;
  beforeAll(() => {
    savedConsoleWarn = console.warn;
    console.warn = jest.fn();
  });
  afterAll(() => {
    console.warn = savedConsoleWarn;
  });

  it('does not error with ref object', async () => {
    const doc = new Y.Doc();
    const p = proxy<{ foo?: { bar?: string } }>({});
    const m = doc.getMap('map') as any;

    bindProxyAndYMap(p, m);
    expect(p.foo).toBe(undefined);
    expect(m.get('foo')).toBe(undefined);

    p.foo = ref({ bar: 'a' });
    await Promise.resolve();
    expect(p.foo.bar).toBe('a');
    expect(m.get('foo')).toBe(undefined);
    expect(console.warn).toHaveBeenCalledTimes(0);
  });

  it('does not error with ref array', async () => {
    const doc = new Y.Doc();
    const p = proxy<{ foo?: string[] }>({});
    const m = doc.getMap('map') as any;

    bindProxyAndYMap(p, m);
    expect(p.foo).toBe(undefined);
    expect(m.get('foo')).toBe(undefined);

    p.foo = ref(['a']);
    await Promise.resolve();
    expect(p.foo[0]).toBe('a');
    expect(m.get('foo')).toBe(undefined);
    expect(console.warn).toHaveBeenCalledTimes(0);
  });
});
