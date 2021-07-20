import * as Y from 'yjs';
import { proxy, subscribe } from 'valtio/vanilla';

describe('push', () => {
  it('y array', async () => {
    const doc = new Y.Doc();
    const a = doc.getArray('arr');
    a.insert(0, ['a', 'b', 'c']);
    expect(a.toJSON()).toMatchInlineSnapshot(`
      Array [
        "a",
        "b",
        "c",
      ]
    `);

    const listener = jest.fn();
    a.observe((event) => {
      listener(event.changes.delta);
    });

    a.push(['d']);
    expect(a.toJSON()).toMatchInlineSnapshot(`
      Array [
        "a",
        "b",
        "c",
        "d",
      ]
    `);
    expect(listener).toMatchInlineSnapshot(`
      [MockFunction] {
        "calls": Array [
          Array [
            Array [
              Object {
                "retain": 3,
              },
              Object {
                "insert": Array [
                  "d",
                ],
              },
            ],
          ],
        ],
        "results": Array [
          Object {
            "type": "return",
            "value": undefined,
          },
        ],
      }
    `);
    listener.mockClear();

    a.push(['e', 'f']);
    expect(a.toJSON()).toMatchInlineSnapshot(`
      Array [
        "a",
        "b",
        "c",
        "d",
        "e",
        "f",
      ]
    `);
    expect(listener).toMatchInlineSnapshot(`
      [MockFunction] {
        "calls": Array [
          Array [
            Array [
              Object {
                "retain": 4,
              },
              Object {
                "insert": Array [
                  "e",
                  "f",
                ],
              },
            ],
          ],
        ],
        "results": Array [
          Object {
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
      Array [
        "a",
        "b",
        "c",
      ]
    `);

    const listener = jest.fn();
    subscribe(p, listener);

    p.push('d');
    await Promise.resolve();
    expect(p).toMatchInlineSnapshot(`
      Array [
        "a",
        "b",
        "c",
        "d",
      ]
    `);
    expect(listener).toMatchInlineSnapshot(`
      [MockFunction] {
        "calls": Array [
          Array [
            Array [
              Array [
                "set",
                Array [
                  "3",
                ],
                "d",
                undefined,
              ],
            ],
          ],
        ],
        "results": Array [
          Object {
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
      Array [
        "a",
        "b",
        "c",
        "d",
        "e",
        "f",
      ]
    `);
    expect(listener).toMatchInlineSnapshot(`
      [MockFunction] {
        "calls": Array [
          Array [
            Array [
              Array [
                "set",
                Array [
                  "4",
                ],
                "e",
                undefined,
              ],
              Array [
                "set",
                Array [
                  "5",
                ],
                "f",
                undefined,
              ],
            ],
          ],
        ],
        "results": Array [
          Object {
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
      Array [
        "a",
        "b",
        "c",
      ]
    `);

    const listener = jest.fn();
    a.observe((event) => {
      listener(event.changes.delta);
    });

    a.delete(a.length - 1);
    expect(a.toJSON()).toMatchInlineSnapshot(`
      Array [
        "a",
        "b",
      ]
    `);
    expect(listener).toMatchInlineSnapshot(`
      [MockFunction] {
        "calls": Array [
          Array [
            Array [
              Object {
                "retain": 2,
              },
              Object {
                "delete": 1,
              },
            ],
          ],
        ],
        "results": Array [
          Object {
            "type": "return",
            "value": undefined,
          },
        ],
      }
    `);
    listener.mockClear();

    a.delete(a.length - 1);
    a.delete(a.length - 1);
    expect(a.toJSON()).toMatchInlineSnapshot('Array []');
    expect(listener).toMatchInlineSnapshot(`
      [MockFunction] {
        "calls": Array [
          Array [
            Array [
              Object {
                "retain": 1,
              },
              Object {
                "delete": 1,
              },
            ],
          ],
          Array [
            Array [
              Object {
                "delete": 1,
              },
            ],
          ],
        ],
        "results": Array [
          Object {
            "type": "return",
            "value": undefined,
          },
          Object {
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
      Array [
        "a",
        "b",
        "c",
      ]
    `);

    const listener = jest.fn();
    subscribe(p, listener);

    p.pop();
    await Promise.resolve();
    expect(p).toMatchInlineSnapshot(`
      Array [
        "a",
        "b",
      ]
    `);
    expect(listener).toMatchInlineSnapshot(`
      [MockFunction] {
        "calls": Array [
          Array [
            Array [
              Array [
                "delete",
                Array [
                  "2",
                ],
                "c",
              ],
              Array [
                "set",
                Array [
                  "length",
                ],
                2,
                3,
              ],
            ],
          ],
        ],
        "results": Array [
          Object {
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
    expect(p).toMatchInlineSnapshot('Array []');
    expect(listener).toMatchInlineSnapshot(`
      [MockFunction] {
        "calls": Array [
          Array [
            Array [
              Array [
                "delete",
                Array [
                  "1",
                ],
                "b",
              ],
              Array [
                "set",
                Array [
                  "length",
                ],
                1,
                2,
              ],
              Array [
                "delete",
                Array [
                  "0",
                ],
                "a",
              ],
              Array [
                "set",
                Array [
                  "length",
                ],
                0,
                1,
              ],
            ],
          ],
        ],
        "results": Array [
          Object {
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
      Array [
        "a",
        "b",
        "c",
      ]
    `);

    const listener = jest.fn();
    a.observe((event) => {
      listener(event.changes.delta);
    });

    a.insert(0, ['d']);
    expect(a.toJSON()).toMatchInlineSnapshot(`
      Array [
        "d",
        "a",
        "b",
        "c",
      ]
    `);
    expect(listener).toMatchInlineSnapshot(`
      [MockFunction] {
        "calls": Array [
          Array [
            Array [
              Object {
                "insert": Array [
                  "d",
                ],
              },
            ],
          ],
        ],
        "results": Array [
          Object {
            "type": "return",
            "value": undefined,
          },
        ],
      }
    `);
    listener.mockClear();

    a.insert(0, ['e', 'f']);
    expect(a.toJSON()).toMatchInlineSnapshot(`
      Array [
        "e",
        "f",
        "d",
        "a",
        "b",
        "c",
      ]
    `);
    expect(listener).toMatchInlineSnapshot(`
      [MockFunction] {
        "calls": Array [
          Array [
            Array [
              Object {
                "insert": Array [
                  "e",
                  "f",
                ],
              },
            ],
          ],
        ],
        "results": Array [
          Object {
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
      Array [
        "a",
        "b",
        "c",
      ]
    `);

    const listener = jest.fn();
    subscribe(p, listener);

    p.unshift('d');
    await Promise.resolve();
    expect(p).toMatchInlineSnapshot(`
      Array [
        "d",
        "a",
        "b",
        "c",
      ]
    `);
    expect(listener).toMatchInlineSnapshot(`
      [MockFunction] {
        "calls": Array [
          Array [
            Array [
              Array [
                "set",
                Array [
                  "3",
                ],
                "c",
                undefined,
              ],
              Array [
                "set",
                Array [
                  "2",
                ],
                "b",
                "c",
              ],
              Array [
                "set",
                Array [
                  "1",
                ],
                "a",
                "b",
              ],
              Array [
                "set",
                Array [
                  "0",
                ],
                "d",
                "a",
              ],
            ],
          ],
        ],
        "results": Array [
          Object {
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
      Array [
        "e",
        "f",
        "d",
        "a",
        "b",
        "c",
      ]
    `);
    expect(listener).toMatchInlineSnapshot(`
      [MockFunction] {
        "calls": Array [
          Array [
            Array [
              Array [
                "set",
                Array [
                  "5",
                ],
                "c",
                undefined,
              ],
              Array [
                "set",
                Array [
                  "4",
                ],
                "b",
                undefined,
              ],
              Array [
                "set",
                Array [
                  "3",
                ],
                "a",
                "c",
              ],
              Array [
                "set",
                Array [
                  "2",
                ],
                "d",
                "b",
              ],
              Array [
                "set",
                Array [
                  "0",
                ],
                "e",
                "d",
              ],
              Array [
                "set",
                Array [
                  "1",
                ],
                "f",
                "a",
              ],
            ],
          ],
        ],
        "results": Array [
          Object {
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
      Array [
        "c",
        "b",
        "a",
      ]
    `);
    expect(listener).toMatchInlineSnapshot(`
      [MockFunction] {
        "calls": Array [
          Array [
            Array [
              Array [
                "set",
                Array [
                  "0",
                ],
                "a",
                undefined,
              ],
            ],
          ],
          Array [
            Array [
              Array [
                "set",
                Array [
                  "1",
                ],
                "a",
                undefined,
              ],
              Array [
                "set",
                Array [
                  "0",
                ],
                "b",
                "a",
              ],
              Array [
                "set",
                Array [
                  "2",
                ],
                "a",
                undefined,
              ],
              Array [
                "set",
                Array [
                  "1",
                ],
                "b",
                "a",
              ],
              Array [
                "set",
                Array [
                  "0",
                ],
                "c",
                "b",
              ],
            ],
          ],
        ],
        "results": Array [
          Object {
            "type": "return",
            "value": undefined,
          },
          Object {
            "type": "return",
            "value": undefined,
          },
        ],
      }
    `);
    listener.mockClear();
  });
});
