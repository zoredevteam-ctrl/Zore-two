import { Low } from 'lowdb';
import { JSONFile } from 'lowdb/node';
import path from 'path';
import { fileURLToPath } from 'url';
import chalk from 'chalk';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dbPath = path.join(__dirname, '../database.json');

const defaultData = {
    users: {},
    groups: {},
    settings: {
        mode: 'public',   // public | self | groups
        welcome: true,
        antilink: false,
        antispam: false,
    },
    stats: {
        totalCommands: 0,
        startTime: Date.now(),
    }
};

const adapter = new JSONFile(dbPath);
const db = new Low(adapter, defaultData);

// Inicializar y mergear defaults
await db.read();
db.data = { ...defaultData, ...db.data };

// Asegurar claves faltantes
for (const key of Object.keys(defaultData)) {
    if (db.data[key] === undefined || db.data[key] === null) {
        db.data[key] = defaultData[key];
    }
}

await db.write();

export const database = {
    data: db.data,

    async save() {
        try {
            await db.write();
        } catch (e) {
            console.log(chalk.red('[ERROR DATABASE SAVE]'), e.message);
        }
    },

    async read() {
        try {
            await db.read();
            this.data = db.data;
        } catch (e) {
            console.log(chalk.red('[ERROR DATABASE READ]'), e.message);
        }
    },

    async reset() {
        db.data = { ...defaultData };
        await db.write();
        this.data = db.data;
        console.log(chalk.yellowBright('[DATABASE] Base de datos reseteada.'));
    }
};

console.log(chalk.greenBright('[DATABASE] Base de datos iniciada correctamente ✅'));