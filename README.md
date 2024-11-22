# valtio-yjs 💊🚀

[![CI](https://img.shields.io/github/actions/workflow/status/valtiojs/valtio-yjs/ci.yml?branch=main)](https://github.com/valtiojs/valtio-yjs/actions?query=workflow%3ACI)
[![npm](https://img.shields.io/npm/v/valtio-yjs)](https://www.npmjs.com/package/valtio-yjs)
[![size](https://img.shields.io/bundlephobia/minzip/valtio-yjs)](https://bundlephobia.com/result?p=valtio-yjs)
[![discord](https://img.shields.io/discord/627656437971288081)](https://discord.gg/MrQdmzd)

valtio-yjs makes yjs state easy

## What is this

[valtio](https://github.com/pmndrs/valtio) is
a proxy state library for ReactJS and VanillaJS.
[yjs](https://github.com/yjs/yjs) is
an implementation of CRDT algorithm
(which allows to merge client data without server coordination).

valtio-yjs is a two-way binding to bridge them.

## Project status

It started as an experiment, and the experiment is finished.
Now, it's in alpha.
We encourage developers to try it in non-trivial apps, and find bugs.

## Install

```bash
yarn add valtio-yjs valtio yjs
```

## How to use it

```js
import * as Y from 'yjs';
import { proxy } from 'valtio';
import { bind } from 'valtio-yjs';

// create a new Y doc
const ydoc = new Y.Doc();

// create a Y map
const ymap = ydoc.getMap('mymap');

// create a valtio state
const state = proxy({});

// bind them
const unbind = bind(state, ymap);

// now you can mutate the state
state.text = 'hello';

// you can nest objects
state.obj = { count: 0 };

// and mutate the nested object value
++state.obj.count;

// you can use arrays too
state.arr = [1, 2, 3];

// mutating the array is also possible
state.arr.push(4);

// unbind them by calling the result
unbind();
```

## Demos

Using `useSnapshot` in valtio and
`WebsocketProvider` in [y-websocket](https://github.com/yjs/y-websocket),
we can create multi-client React apps pretty easily.

- [Messages object](https://stackblitz.com/github/valtiojs/valtio-yjs/tree/main/examples/01_obj)
- [Messages array](https://stackblitz.com/github/valtiojs/valtio-yjs/tree/main/examples/02_array)
- [Minecraft + webrtc](https://stackblitz.com/github/valtiojs/valtio-yjs/tree/main/examples/03_minecraft)
