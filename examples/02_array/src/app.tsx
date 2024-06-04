import * as Y from 'yjs';
import { WebsocketProvider } from 'y-websocket';
import { bind } from 'valtio-yjs';
import { proxy, useSnapshot } from 'valtio';
import { useState } from 'react';

const genId = () => `${Math.random()}`.slice(-8);

const ydoc = new Y.Doc();

new WebsocketProvider('wss://demos.yjs.dev', 'valtio-yjs-demo', ydoc);

const yarray = ydoc.getArray('messages.v2');
const messages = proxy([] as { id: string; text: string; vote: number }[]);
bind(messages, yarray);

const MyMessage = () => {
  const [message, setMessage] = useState('');
  const send = () => {
    if (message) {
      messages.unshift({ id: genId(), text: message, vote: 1 });
      setMessage('');
    }
  };
  return (
    <div>
      Message:{' '}
      <input value={message} onChange={(e) => setMessage(e.target.value)} />{' '}
      <button disabled={!message} onClick={send}>
        Send
      </button>
    </div>
  );
};

const Message = ({
  message,
}: {
  message: { id: string; text: string; vote: number };
}) => {
  const [pending, setPending] = useState(false);
  const voteUp = () => {
    const found = messages.find((item) => item.id === message.id);
    ++found!.vote;
    setPending(true);
    setTimeout(() => {
      setPending(false);
    }, 1000);
  };
  return (
    <p>
      [{message.vote}]
      <button disabled={pending} onClick={voteUp}>
        +1
      </button>
      : {message.text}
    </p>
  );
};

const Messages = () => {
  const snap = useSnapshot(messages);
  return (
    <div>
      {snap.map((message) => (
        <Message key={message.id} message={message} />
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
