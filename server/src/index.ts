import { v4 as uuidv4 } from 'uuid';
import express from 'express'
import { addAccount, addMessage, getAccountByAddress, getAllMessagesWithAccountOrderByDate, type AccountDto, type UUID } from './database/database.js'
import { WebSocket, WebSocketServer } from 'ws';
import http from 'http';
import cors from 'cors';

type MessageDto = {
    uuid: UUID;
    name: string;
    color: string;
    time_sent: Date;
    contents: string;
}

const app = express();
app.use(express.json());
app.use(cors({
  origin: 'https://mkstech.dev',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
}));


app.set('trust proxy', true);

const PORT = 5000;

const server = http.createServer(app);
const wss = new WebSocketServer({ server, path: '/socket' });

const broadcastMessage = (data: MessageDto) => {
    const message = JSON.stringify(data);
    wss.clients.forEach(client => {
        if (client.readyState === client.OPEN) {
            client.send(message);
        }
    })
}

app.get('/api/test', async (_, res) => {
    res.json({message: "hello world!" });
})

app.post('/api/submit', async (req, res) => {
    try {
        const { message: contents } = req.body;
        const text: string = contents;


        if (!text) {
            return res.status(400).json({ error: "No message contents delivered!"});
        }

        const ip = req.ip;

        var accountDto: AccountDto | null = {
            uuid: "8599c544-90e7-4971-9330-e22687299f54",
            name: "Guest",
            color: "#000000",
        }
        
        if (ip) {
            accountDto = await getAccountByAddress(ip);
            if (!accountDto) {
                console.log("Creating new account for ip " + ip + "!");
                accountDto = {
                    uuid: uuidv4(),
                    name: getRandomName(),
                    color: getRandomColor(),
                }
                await addAccount(accountDto.uuid, accountDto.color, accountDto.name, ip, new Date())
            }
        }

        const messageId = uuidv4() as UUID;
        const timeSent = new Date();

        await addMessage(messageId, accountDto.uuid, timeSent, text);

        broadcastMessage({
            uuid: messageId,
            name: accountDto.name,
            time_sent: timeSent,
            contents: text,
            color: accountDto.color,
        });


        return res.status(201).json({ message: "Message submit successfully!", uuid: messageId });

    } catch (err) {
        console.error('Error in /api/submit:', err);
        return res.status(500).json({ error: 'Internal server error!'});
    }
})

app.get('/api/messages', async (req, res) => {
    try {
        const messages = await getAllMessagesWithAccountOrderByDate();
        res.json(messages);
    } catch (err) {
        console.error('Error fetching messages:', err);
        res.status(500).json({ error: "Internal server error" });
    }
});


wss.on('connection', (ws: WebSocket) => {
    console.log("Client connected via websocket!");
});

server.listen(PORT, () => {
    console.log(`Server is running at http://localhost:${PORT}`);
});

function getRandomColor(): string {
    const colors = [
        '#990000',
        '#009900',
        '#000099',
        '#009999',
        '#990099',
        '#9900ff',
        '#999900',
        '#999999',
    ]

    const index = Math.floor(Math.random() * colors.length);

    if (colors[index]) {
        return colors[index];
    } else {
        return '#ff0000';
    }
}

function getRandomName(): string {
    const adjectives = ['happy', 'sad', 'angry', 'bored', 'excited', 'cool', 'fiery', 'awesome', 'hormonal']
    const nouns = ['bear', 'mouse', 'toad', 'cat', 'dog', 'elephant', 'donkey', 'snake', 'tiger', 'hamster', 'capybara', 'potoroo']

    const index1 = Math.floor(Math.random() * adjectives.length);
    const index2 = Math.floor(Math.random() * nouns.length);

    if (adjectives[index1] && nouns[index2]) {
        return adjectives[index1] + '-' + nouns[index2];
    } else {
        return 'stupid idiot';
    }
}