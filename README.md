# valtio-yjs 💊🚀

valtio-yjs makes yjs state easy

## What is this

[valtio](https://github.com/pmndrs/valtio) is
a proxy state library for ReactJS and VanillaJS.
[yjs](https://github.com/yjs/yjs) is
an implmentation of CRDT algorithm.

valtio-yjs is a two-way binding to bridge them.

## Project status

It started as an experiment, and the experiment is finished.
Now, it's in alpha.
We encourage users to try it in non-trivial apps, and find bugs.

## Install

```bash
yarn add valtio-yjs valtio yjs
```

## How to use it

```js
import * as Y from "yjs";
import { proxy } from "valtio";
import { bindProxyAndYMap } from "valtio-yjs";

// create a new Y doc
const ydoc = new Y.Doc();

// create a Y map
const ymap = ydoc.getMap("mymap");

// create a valtio state
const state = proxy({});

// bind them
bindProxyAndYMap(state, ymap);

// you can nest objects
state.obj = { count: 0 };

// you can use arrays too
state.arr = [1, 2, 3];
```

## Demos

Using `useSnapshot` in valtio and
`WebsocketProvider` in [y-websocket](https://github.com/yjs/y-websocket),
we can create multi-client React apps pretty easily.

- [https://codesandbox.io/s/valtio-yjs-demo-ox3iy](Messages object)
- [https://codesandbox.io/s/valtio-yjs-array-demo-j1wkp](Messages array)
- (...open a PR to add your demos)
