import path from "node:path";
import { fileURLToPath } from "node:url";
import { promisify } from "node:util";
import sqlite3 from "sqlite3";

export interface Test{
    id:number,
    msg: string
}

class DatabaseConnection {

    private static instance: DatabaseConnection;
    private database: sqlite3.Database;
    private query: (arg0: string) => any;

    public static getInstance(){
        if (!DatabaseConnection.instance){
            DatabaseConnection.instance = new DatabaseConnection();
        }
        return DatabaseConnection.instance;
    }
    
    private constructor() {
        let dbDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "./db.sqlite");
        this.database = new sqlite3.Database(dbDir);
        this.query = promisify(this.database.all).bind(this.database);
    }   

    public async LoadDatabase(){
        const testTableQuery = `CREATE TABLE IF NOT EXISTS test ("id" INTEGER PRIMARY KEY,"msg" TEXT)`;
        await this.query(testTableQuery);
    }

    public async Get({ table }){
        const res = await this.query(`SELECT * FROM ${table}`);
        return res;
    }

    public async Set({table, object}){
        const keys = Object.keys(object).join(",");
        const values = Object.values(object)
        .map((v) => `"${v}"`)
        .join(",");
        const res = await this.query(`INSERT INTO ${table} (${keys}) VALUES (${values})`);
        return res;
    }
}

const DB = DatabaseConnection.getInstance();
export default DB;