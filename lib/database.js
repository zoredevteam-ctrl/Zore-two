import { Low } from 'lowdb';
import { JSONFile } from 'lowdb'; // Se quitó el '/node' para evitar el error
import path from 'path';
import { fileURLToPath } from 'url';
import chalk from 'chalk';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dbPath = path.join(__dirname, '../database.json');

const defaultData = {
    users: {},
    groups: {},
    settings: {
        mode: 'public',   
        welcome: true,
        antilink: false,
        antispam: false,
    },
    stats: {
        totalCommands: 0,
        startTime: Date.now(),
    }
};

// Configuración del adaptador compatible con Node v25
const adapter = new JSONFile(dbPath);
const db = new Low(adapter, defaultData);

// Inicializar base de datos
async function initDB() {
    try {
        await db.read();
        db.data = { ...defaultData, ...db.data };
        await db.write();
        console.log(chalk.greenBright('[DATABASE] Base de datos iniciada correctamente ✅'));
    } catch (e) {
        console.error(chalk.red('[ERROR DATABASE INIT]'), e);
    }
}

await initDB();

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
            if (db.data) this.data = db.data;
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
