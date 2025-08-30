import { randomUUID } from 'crypto'
import express from 'express'
import { addAccount, getAllAccounts } from './database/database.ts'

const app = express();
const PORT = 5000;

app.use(express.json());

app.get('/api/hello', async (req, res) => {
    addAccount(randomUUID(), "lol", "127.0.0.1", new Date())
    const messages = await getAllAccounts();
    res.json({message: JSON.stringify(messages) });
})

app.listen(PORT, () => {
    console.log(`Server is running at http://localhost:${PORT}`);
});