import * as Y from 'yjs';
import { WebsocketProvider } from 'y-websocket';
import { bind } from 'valtio-yjs';
import { proxy, useSnapshot } from 'valtio';
import { useState } from 'react';

const ydoc = new Y.Doc();

new WebsocketProvider('wss://demos.yjs.dev', 'valtio-yjs-demo', ydoc);

const ymap = ydoc.getMap('messages.v1');
const mesgMap = proxy({} as Record<string, string>);
bind(mesgMap, ymap);

const MyMessage = () => {
  const [name, setName] = useState('');
  const [message, setMessage] = useState('');
  const send = () => {
    if (name && message) {
      mesgMap[name] = message;
    }
  };
  return (
    <div>
      <div>
        Name: <input value={name} onChange={(e) => setName(e.target.value)} />
      </div>
      <div>
        Message:{' '}
        <input value={message} onChange={(e) => setMessage(e.target.value)} />
      </div>
      <button disabled={!name || !message} onClick={send}>
        Send
      </button>
    </div>
  );
};

const Messages = () => {
  const snap = useSnapshot(mesgMap);
  return (
    <div>
      {Object.keys(snap)
        .reverse()
        .map((key) => (
          <p key={key}>
            {key}: {snap[key]}
          </p>
        ))}
    </div>
  );
};

const App = () => (
  <div>
    <h2>My Message</h2>
    <MyMessage />
    <h2>Messages</h2>
    <Messages />
  </div>
);

export default App;
