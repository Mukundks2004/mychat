import type { UUID } from 'crypto';
import sqlite3 from 'sqlite3'

const db = new sqlite3.Database('./mychat.db', ((err: Error | null) => {
    if (err) {
        console.error('Could not connect to database', err);
    }
    else {
        console.log('Connected to SQLite database');
    }
}));

db.serialize(() => {
    db.run(`
        CREATE TABLE IF NOT EXISTS account (
            uuid TEXT PRIMARY KEY,
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
})

export const addAccount = (uuid: UUID, name: string, address: string, created: Date) => {
    const query = db.prepare('INSERT INTO account (uuid, name, address, created) VALUES (?, ?, ?, ?)');
    query.run(uuid, name, address, created);
    query.finalize();
}

const addMessage = (uuid: UUID, account_uuid: UUID, time_sent: Date, contents: string) => {
    const query = db.prepare('INSERT INTO message (uuid, account_uuid, time_sent, contents) VALUES (?, ?, ?, ?)');
    query.run(uuid, account_uuid, time_sent, contents);
    query.finalize();
}

export const getAllAccounts = () => {
    return new Promise((resolve, reject) => {
        db.all('SELECT * FROM account', [], (err, rows) => {
            if (err) {
                reject(err);
            } else {
                resolve(rows);
            }
        });
    });
}

const getMessagesByAccount = (account_uuid: UUID) => {
    return new Promise((resolve, reject) => {
        db.all('SELECT * FROM message WHERE account_uuid = ?', [account_uuid], (err, rows) => {
            if (err) {
                reject(err);
            } else {
                resolve(rows);
            }
        });
    });
}