import path from "node:path";
import { fileURLToPath } from "node:url";
import Database, { Database as DatabaseType } from "better-sqlite3";
import fs from 'node:fs';

const DATABASE_NAME:string = "bot-database.db";

class DatabaseConnection {

    private static instance: DatabaseConnection;
    private db: DatabaseType;
    private databasePath: string;

    public static getInstance(){
        if (!DatabaseConnection.instance){
            DatabaseConnection.instance = new DatabaseConnection();
        }
        return DatabaseConnection.instance;
    }
    
    private constructor() {
        this.databasePath = path.resolve(path.dirname(fileURLToPath(import.meta.url)), `../../${DATABASE_NAME}`);
        
        const db = new Database(this.databasePath);
        db.pragma("journal_mode = WAL");

        this.db = db;
    }   



}

const DB = DatabaseConnection.getInstance();
export default DB;