import path from "node:path";
import fs from "node:fs";

import { fileURLToPath } from "node:url";

class DataFolderUtils{
    private static instance: DataFolderUtils| null = null;
    private dataFolderPath: string | null = null;

    public static getInstance(){
        if (!DataFolderUtils.instance){
            DataFolderUtils.instance = new DataFolderUtils();
        }
        return DataFolderUtils.instance;
    }

    private constructor(){
    this.dataFolderPath = path.dirname(fileURLToPath(import.meta.url));
    }

    public GetPath(){
        return this.dataFolderPath;
    }

    public ReadFileToJsonObjectSync(jsonFileName:string){
        try{
            let rawJson = fs.readFileSync(path.resolve(this.dataFolderPath, `./${jsonFileName}`), 'utf8');
            return JSON.parse(rawJson.toString()); 
        }
        catch (err){
            console.log("LoadJsonAsObject ERROR: " + err);
            return null;
        }   
    }

    public WriteJsonObjectToFileSync(fileName:string, json:any){
        try{
            fs.writeFileSync(path.resolve(this.dataFolderPath, `./${fileName}`), JSON.stringify(json));
            return true
        }
        catch(err){
            console.log("Write object to file error: " + err);
            return false;
        }
    }

    public LoadDotEnv(){
        try{
            let dotenv = require('dotenv');
            dotenv.config({path: path.join(this.GetPath(), '/.env')});
            console.log("Loaded .env file.");
        }
        catch{
            console.log("Dotenv package not installed, assuming environment variables already set.");
        }
    }

}

const Data = DataFolderUtils.getInstance();
export default Data;