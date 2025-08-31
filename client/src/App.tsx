import { useState, useEffect } from 'react';
import { Textbox } from './Textbox';
import { ScrollBox } from './Scrollbox';
import { Card } from './Card';

type MessageDto = {
    uuid: string;
    name: string;
    color: string;
    time_sent: Date;
    contents: string;
}

const websocketUrl = process.env.REACT_APP_WEBSOCKET_URL!;
// const websocketUrl = 'http://192.168.0.69:5000'

function App() {
  const [messages, setMessages] = useState<MessageDto[]>([]);

  useEffect(() => {
    async function fetchMesssages() {
      try {
        const response = await fetch('/api/messages');
        if (!response.ok) {
          throw new Error('Failed to fetch messages!');
        }
        const data = await response.json();
        setMessages(data);
      } catch (err) {
        console.error('Error fetching messages:', err);
      }
    }

    fetchMesssages();
  }, []);

  useEffect(() => {
    const socket = new WebSocket(websocketUrl);

    socket.onopen = () => {
      console.log('Websocket connected!');
    }

    socket.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);

        setMessages(prev => [...prev, {
          ...data,
          time_sent: new Date(data.time_sent)
        }]);
      } catch (err) {
        console.error('Error parsing ws message:', err);
      }
    }

    socket.onerror = (err) => {
      console.error("Websocket error:", err);
    }

    socket.onclose = () => {
      console.log("Websocket disconnected");
    }

    return () => {
      socket.close();
    };

  }, []);

  return (
    <div style={{padding: "10px"}}>
      <h1>Welcome to MyChat!</h1>
      <ScrollBox height="300px" width="600px" scrollDirection="vertical" childBorder="1px solid #ccc">
        {
          messages.length === 0 ? (
            <p>Loading messages...</p>
          ) : (
            messages.map(({ uuid, time_sent, name, color, contents }) => (
              <Card key={uuid} date={new Date(time_sent).toLocaleString()} name={name} color={color} message={contents} />
            )
          ))
        }
      </ScrollBox>
      <Textbox></Textbox>
    </div>
  );
}

export default App;
