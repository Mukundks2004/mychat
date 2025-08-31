import { v4 as uuidv4 } from 'uuid';
import express from 'express'
import { addAccount, addMessage, getAccountByAddress, getAllMessagesWithAccountOrderByDate, type AccountDto, type UUID } from './database/database.ts'
import { WebSocketServer } from 'ws';
import http from 'http';

type MessageDto = {
    uuid: UUID;
    name: string;
    color: string;
    time_sent: Date;
    contents: string;
}

const app = express();
app.use(express.json());
app.set('trust proxy', true);

const PORT = 5000;

const server = http.createServer(app);
const wss = new WebSocketServer({ server });

const broadcastMessage = (data: MessageDto) => {
    console.log('broadcasting')
    const message = JSON.stringify(data);
    wss.clients.forEach(client => {
        if (client.readyState === client.OPEN) {
            console.log("client!", message);
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
        console.log("ip", ip, "len", ip?.length);

        var accountDto: AccountDto | null = {
            uuid: "8599c544-90e7-4971-9330-e22687299f54",
            name: "Guest",
            color: "#000000",

        }
        if (ip) {
            accountDto = await getAccountByAddress(ip);
            console.log(accountDto)
            if (!accountDto) {
                console.log("creating new account!");
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

server.listen(PORT, () => {
    console.log(`Server is running at http://localhost:${PORT}`);
});

wss.on('connection', (ws: WebSocket) => {
    console.log("Client connected via websocket!");
    ws.send(JSON.stringify({ type: 'info', message: 'Websocket connected' }));
});

function getRandomColor(): string {
    const colors = [
        '#ff0000',
        '#00ff00',
        '#0000ff',
        '#00ffff',
        '#ff00ff',
        '#ffff00',
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