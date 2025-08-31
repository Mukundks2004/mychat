import sqlite3 from 'sqlite3'

export type UUID = string;

export type Account = {
    uuid: UUID;
    name: string;
    color: string;
    address: string;
    created: Date;
}

export type Message = {
    uuid: UUID;
    account_uuid: UUID;
    time_sent: Date;
    contents: string;
}

export type MessageWithAccount = {
    uuid: UUID;
    account_uuid: UUID;
    time_sent: Date;
    contents: string;
    name: string;
    color: string;
}

export type AccountDto = {
    uuid: string;
    name: string;
    color: string;
}

const db = new sqlite3.Database('./src/database/mychat.db', ((err: Error | null) => {
    if (err) {
        console.error('Could not connect to database!', err);
    }
    else {
        console.log('Connected to SQLite database!');
    }
}));

db.serialize(() => {
    db.run(`
        CREATE TABLE IF NOT EXISTS account (
            uuid TEXT PRIMARY KEY,
            color TEXT NOT NULL,
            name TEXT NOT NULL,
            address TEXT NOT NULL,
            created DATETIME NOT NULL
        );`
    );

    db.run(`
        CREATE TABLE IF NOT EXISTS message (
            uuid TEXT PRIMARY KEY,
            account_uuid TEXT NOT NULL,
            time_sent DATETIME NOT NULL,
            contents TEXT NOT NULL,
            FOREIGN KEY (account_uuid) REFERENCES account(uuid)
        );`
    );

    db.run(`INSERT OR IGNORE INTO account (uuid, color, name, address, created) VALUES ('8599c544-90e7-4971-9330-e22687299f54', '#000000', 'guest', '127.0.0.1', strftime('%s', 'now'))`);
})

export const addAccount = async (uuid: UUID, color: string, name: string, address: string, created: Date) => {
    const query = db.prepare('INSERT INTO account (uuid, color, name, address, created) VALUES (?, ?, ?, ?, ?)');
    query.run(uuid, color, name, address, created);
    query.finalize();
}

export const addMessage = async (uuid: UUID, account_uuid: UUID, time_sent: Date, contents: string) => {
    const query = db.prepare('INSERT INTO message (uuid, account_uuid, time_sent, contents) VALUES (?, ?, ?, ?)');
    query.run(uuid, account_uuid, time_sent, contents);
    query.finalize();
}

export const getAllAccounts = async (): Promise<Account[]> => {
    return new Promise((resolve, reject) => {
        db.all('SELECT * FROM account', [], (err, rows: Account[]) => {
            if (err) {
                reject(err);
            } else {
                resolve(
                    rows.map(row => ({
                        ...row,
                        created: new Date(row.created)
                    }))
                );
            }
        });
    });
}

export const getAllMessagesWithAccountOrderByDate = async (): Promise<MessageWithAccount[]> => {
    return new Promise((resolve, reject) => {
        const query = `
            SELECT
                message.uuid,
                message.account_uuid,
                message.time_sent,
                message.contents,
                account.name,
                account.color
            FROM message
            JOIN account ON message.account_uuid = account.uuid
            ORDER BY message.time_sent ASC;
        `;
        
        db.all(query, [], (err, rows: MessageWithAccount[]) => {
            if (err) {
                reject(err);
            } else {
                const result: MessageWithAccount[] = rows.map(row => ({
                    ...row,
                    time_sent: new Date(row.time_sent),
                }));
                resolve(result);
            }
        })
    })
}

export const getMessagesByAccount = async (account_uuid: UUID): Promise<Message[]> => {
    return new Promise((resolve, reject) => {
        db.all('SELECT * FROM message WHERE account_uuid = ?', [account_uuid], (err, rows: Message[]) => {
            if (err) {
                reject(err);
            } else {
                resolve(
                    rows.map(row => ({
                        ...row,
                        time_sent: new Date(row.time_sent)
                    }))
                );
            }
        });
    });
}

export const getAccountByAddress = async (address: string): Promise<AccountDto | null> => {
    return new Promise((resolve, reject) => {
        db.get('SELECT uuid, name, color FROM account WHERE address = ? LIMIT 1;', [address], (err, row: AccountDto | undefined) => {
            if (err) {
                reject(err);
            } else {
                resolve(row || null);
            }
        });
    });
}