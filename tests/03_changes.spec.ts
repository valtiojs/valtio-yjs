import { describe, expect, it, vi } from 'vitest';
import * as Y from 'yjs';
import { proxy, subscribe } from 'valtio/vanilla';

describe('push', () => {
  it('y array', async () => {
    const doc = new Y.Doc();
    const a = doc.getArray('arr');
    a.insert(0, ['a', 'b', 'c']);
    expect(a.toJSON()).toMatchInlineSnapshot(`
      [
        "a",
        "b",
        "c",
      ]
    `);

    const listener = vi.fn();
    a.observe((event) => {
      listener(event.changes.delta);
    });

    a.push(['d']);
    expect(a.toJSON()).toMatchInlineSnapshot(`
      [
        "a",
        "b",
        "c",
        "d",
      ]
    `);
    expect(listener).toMatchInlineSnapshot(`
      [MockFunction spy] {
        "calls": [
          [
            [
              {
                "retain": 3,
              },
              {
                "insert": [
                  "d",
                ],
              },
            ],
          ],
        ],
        "results": [
          {
            "type": "return",
            "value": undefined,
          },
        ],
      }
    `);
    listener.mockClear();

    a.push(['e', 'f']);
    expect(a.toJSON()).toMatchInlineSnapshot(`
      [
        "a",
        "b",
        "c",
        "d",
        "e",
        "f",
      ]
    `);
    expect(listener).toMatchInlineSnapshot(`
      [MockFunction spy] {
        "calls": [
          [
            [
              {
                "retain": 4,
              },
              {
                "insert": [
                  "e",
                  "f",
                ],
              },
            ],
          ],
        ],
        "results": [
          {
            "type": "return",
            "value": undefined,
          },
        ],
      }
    `);
    listener.mockClear();
  });

  it('proxy array', async () => {
    const p = proxy(['a', 'b', 'c']);
    expect(p).toMatchInlineSnapshot(`
      [
        "a",
        "b",
        "c",
      ]
    `);

    const listener = vi.fn();
    subscribe(p, listener);

    p.push('d');
    await Promise.resolve();
    expect(p).toMatchInlineSnapshot(`
      [
        "a",
        "b",
        "c",
        "d",
      ]
    `);
    expect(listener).toMatchInlineSnapshot(`
      [MockFunction spy] {
        "calls": [
          [
            [
              [
                "set",
                [
                  "3",
                ],
                "d",
                undefined,
              ],
            ],
          ],
        ],
        "results": [
          {
            "type": "return",
            "value": undefined,
          },
        ],
      }
    `);
    listener.mockClear();

    p.push('e', 'f');
    await Promise.resolve();
    expect(p).toMatchInlineSnapshot(`
      [
        "a",
        "b",
        "c",
        "d",
        "e",
        "f",
      ]
    `);
    expect(listener).toMatchInlineSnapshot(`
      [MockFunction spy] {
        "calls": [
          [
            [
              [
                "set",
                [
                  "4",
                ],
                "e",
                undefined,
              ],
              [
                "set",
                [
                  "5",
                ],
                "f",
                undefined,
              ],
            ],
          ],
        ],
        "results": [
          {
            "type": "return",
            "value": undefined,
          },
        ],
      }
    `);
    listener.mockClear();
  });
});

describe('pop', () => {
  it('y array', async () => {
    const doc = new Y.Doc();
    const a = doc.getArray('arr');
    a.insert(0, ['a', 'b', 'c']);
    expect(a.toJSON()).toMatchInlineSnapshot(`
      [
        "a",
        "b",
        "c",
      ]
    `);

    const listener = vi.fn();
    a.observe((event) => {
      listener(event.changes.delta);
    });

    a.delete(a.length - 1);
    expect(a.toJSON()).toMatchInlineSnapshot(`
      [
        "a",
        "b",
      ]
    `);
    expect(listener).toMatchInlineSnapshot(`
      [MockFunction spy] {
        "calls": [
          [
            [
              {
                "retain": 2,
              },
              {
                "delete": 1,
              },
            ],
          ],
        ],
        "results": [
          {
            "type": "return",
            "value": undefined,
          },
        ],
      }
    `);
    listener.mockClear();

    a.delete(a.length - 1);
    a.delete(a.length - 1);
    expect(a.toJSON()).toMatchInlineSnapshot('[]');
    expect(listener).toMatchInlineSnapshot(`
      [MockFunction spy] {
        "calls": [
          [
            [
              {
                "retain": 1,
              },
              {
                "delete": 1,
              },
            ],
          ],
          [
            [
              {
                "delete": 1,
              },
            ],
          ],
        ],
        "results": [
          {
            "type": "return",
            "value": undefined,
          },
          {
            "type": "return",
            "value": undefined,
          },
        ],
      }
    `);
    listener.mockClear();
  });

  it('proxy array', async () => {
    const p = proxy(['a', 'b', 'c']);
    expect(p).toMatchInlineSnapshot(`
      [
        "a",
        "b",
        "c",
      ]
    `);

    const listener = vi.fn();
    subscribe(p, listener);

    p.pop();
    await Promise.resolve();
    expect(p).toMatchInlineSnapshot(`
      [
        "a",
        "b",
      ]
    `);
    expect(listener).toMatchInlineSnapshot(`
      [MockFunction spy] {
        "calls": [
          [
            [
              [
                "delete",
                [
                  "2",
                ],
                "c",
              ],
              [
                "set",
                [
                  "length",
                ],
                2,
                3,
              ],
            ],
          ],
        ],
        "results": [
          {
            "type": "return",
            "value": undefined,
          },
        ],
      }
    `);
    listener.mockClear();

    p.pop();
    p.pop();
    await Promise.resolve();
    expect(p).toMatchInlineSnapshot('[]');
    expect(listener).toMatchInlineSnapshot(`
      [MockFunction spy] {
        "calls": [
          [
            [
              [
                "delete",
                [
                  "1",
                ],
                "b",
              ],
              [
                "set",
                [
                  "length",
                ],
                1,
                2,
              ],
              [
                "delete",
                [
                  "0",
                ],
                "a",
              ],
              [
                "set",
                [
                  "length",
                ],
                0,
                1,
              ],
            ],
          ],
        ],
        "results": [
          {
            "type": "return",
            "value": undefined,
          },
        ],
      }
    `);
    listener.mockClear();
  });
});

describe('unshift', () => {
  it('y array', async () => {
    const doc = new Y.Doc();
    const a = doc.getArray('arr');
    a.insert(0, ['a', 'b', 'c']);
    expect(a.toJSON()).toMatchInlineSnapshot(`
      [
        "a",
        "b",
        "c",
      ]
    `);

    const listener = vi.fn();
    a.observe((event) => {
      listener(event.changes.delta);
    });

    a.insert(0, ['d']);
    expect(a.toJSON()).toMatchInlineSnapshot(`
      [
        "d",
        "a",
        "b",
        "c",
      ]
    `);
    expect(listener).toMatchInlineSnapshot(`
      [MockFunction spy] {
        "calls": [
          [
            [
              {
                "insert": [
                  "d",
                ],
              },
            ],
          ],
        ],
        "results": [
          {
            "type": "return",
            "value": undefined,
          },
        ],
      }
    `);
    listener.mockClear();

    a.insert(0, ['e', 'f']);
    expect(a.toJSON()).toMatchInlineSnapshot(`
      [
        "e",
        "f",
        "d",
        "a",
        "b",
        "c",
      ]
    `);
    expect(listener).toMatchInlineSnapshot(`
      [MockFunction spy] {
        "calls": [
          [
            [
              {
                "insert": [
                  "e",
                  "f",
                ],
              },
            ],
          ],
        ],
        "results": [
          {
            "type": "return",
            "value": undefined,
          },
        ],
      }
    `);
    listener.mockClear();
  });

  it('proxy array', async () => {
    const p = proxy(['a', 'b', 'c']);
    expect(p).toMatchInlineSnapshot(`
      [
        "a",
        "b",
        "c",
      ]
    `);

    const listener = vi.fn();
    subscribe(p, listener);

    p.unshift('d');
    await Promise.resolve();
    expect(p).toMatchInlineSnapshot(`
      [
        "d",
        "a",
        "b",
        "c",
      ]
    `);
    expect(listener).toMatchInlineSnapshot(`
      [MockFunction spy] {
        "calls": [
          [
            [
              [
                "set",
                [
                  "3",
                ],
                "c",
                undefined,
              ],
              [
                "set",
                [
                  "2",
                ],
                "b",
                "c",
              ],
              [
                "set",
                [
                  "1",
                ],
                "a",
                "b",
              ],
              [
                "set",
                [
                  "0",
                ],
                "d",
                "a",
              ],
            ],
          ],
        ],
        "results": [
          {
            "type": "return",
            "value": undefined,
          },
        ],
      }
    `);
    listener.mockClear();

    p.unshift('e', 'f');
    await Promise.resolve();
    expect(p).toMatchInlineSnapshot(`
      [
        "e",
        "f",
        "d",
        "a",
        "b",
        "c",
      ]
    `);
    expect(listener).toMatchInlineSnapshot(`
      [MockFunction spy] {
        "calls": [
          [
            [
              [
                "set",
                [
                  "5",
                ],
                "c",
                undefined,
              ],
              [
                "set",
                [
                  "4",
                ],
                "b",
                undefined,
              ],
              [
                "set",
                [
                  "3",
                ],
                "a",
                "c",
              ],
              [
                "set",
                [
                  "2",
                ],
                "d",
                "b",
              ],
              [
                "set",
                [
                  "0",
                ],
                "e",
                "d",
              ],
              [
                "set",
                [
                  "1",
                ],
                "f",
                "a",
              ],
            ],
          ],
        ],
        "results": [
          {
            "type": "return",
            "value": undefined,
          },
        ],
      }
    `);
    listener.mockClear();

    p.splice(0); // clear
    await Promise.resolve();
    listener.mockClear();
    p.unshift('a');
    await Promise.resolve();
    p.unshift('b');
    p.unshift('c');
    await Promise.resolve();
    expect(p).toMatchInlineSnapshot(`
      [
        "c",
        "b",
        "a",
      ]
    `);
    expect(listener).toMatchInlineSnapshot(`
      [MockFunction spy] {
        "calls": [
          [
            [
              [
                "set",
                [
                  "0",
                ],
                "a",
                undefined,
              ],
            ],
          ],
          [
            [
              [
                "set",
                [
                  "1",
                ],
                "a",
                undefined,
              ],
              [
                "set",
                [
                  "0",
                ],
                "b",
                "a",
              ],
              [
                "set",
                [
                  "2",
                ],
                "a",
                undefined,
              ],
              [
                "set",
                [
                  "1",
                ],
                "b",
                "a",
              ],
              [
                "set",
                [
                  "0",
                ],
                "c",
                "b",
              ],
            ],
          ],
        ],
        "results": [
          {
            "type": "return",
            "value": undefined,
          },
          {
            "type": "return",
            "value": undefined,
          },
        ],
      }
    `);
    listener.mockClear();
  });
});
