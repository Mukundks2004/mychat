import { randomUUID } from 'crypto'
import express from 'express'
import { addAccount, getAllAccounts } from './database/database.ts'

const app = express();
const PORT = 5000;

app.use(express.json());

app.get('/api/test', async (req, res) => {
    addAccount(randomUUID(), "a", "b", new Date())
    const messages: any = await getAllAccounts();
    const text: string = messages.map((m: { name: string; uuid: string; }) => m.name + ": " + m.uuid).join();
    res.json({message: text });
})

app.post('/api/submit', async (req, res) => {
    const data = req.body;

})

app.listen(PORT, () => {
    console.log(`Server is running at http://localhost:${PORT}`);
});