import fs from 'fs';
import path from 'path';
import { fileURLToPath, pathToFileURL } from 'url';
import { BaseCommand } from '../types/BaseCommand';

class CommandLoader{
    private commands: Map<string, BaseCommand>;
    private static instance: CommandLoader| null = null;
    private commandsFolderPath: string | null = null;

    public static getInstance(){
        if (!CommandLoader.instance){
            CommandLoader.instance = new CommandLoader();
        }
        return CommandLoader.instance;
    }

    public static isCommand(command: any){
        return command instanceof Object &&
            'execute' in command &&
            typeof command.execute === 'function' &&
            'data' in command &&
            typeof command.data === 'object';
    }

    private constructor() {
        this.commands = new Map();
        let workingDir = path.dirname(fileURLToPath(import.meta.url));
        this.commandsFolderPath = path.join(workingDir, '/commands');
    }

    public Fetch(name:string){
        return this.commands.get(name);
    }
    public GetList(){
        return this.commands;
    }

    public async Load(){
        if (this.commandsFolderPath == null) throw new Error("Commands path not set!");

        const newCommands = new Map<string, BaseCommand>();
        const commandFolders = fs.readdirSync(this.commandsFolderPath);

        var totalCommandsLoaded =  0;
        const promises = [];

        for (const folder of commandFolders) {
            const commandsPath = path.join(this.commandsFolderPath, folder);
            const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));
            for (const file of commandFiles) {
                const filePath = path.join(commandsPath, file);
                var commandLoadPromise = import(pathToFileURL(filePath).href).then(command => {
                    if (CommandLoader.isCommand(command.command)) {
                        newCommands.set(command.command.data.name, command.command);
                        totalCommandsLoaded++;
                    } else {
                        console.log(`Command ${file} was not loaded.`);
                    }
                });
                promises.push(commandLoadPromise);
            }
        }
        await Promise.all(promises);
        this.commands = newCommands;
        return totalCommandsLoaded;
    }
}
const Commands = CommandLoader.getInstance();
export default Commands;