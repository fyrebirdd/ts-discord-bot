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
    
    private constructor() {
        this.commands = new Map();
        let workingDir = path.dirname(fileURLToPath(import.meta.url));
        this.commandsFolderPath = path.resolve(workingDir, '../commands');
    }

    /**
     * Evaluates whether or not an object can be cast to BaseCommand.
     * @param obj object to evaluate.
     * @returns true if obj can be cast to BaseCommand type, false otherwise.
     */
    public static isCommand(obj: any){
        return obj instanceof Object &&
            'execute' in obj &&
            typeof obj.execute === 'function' &&
            'data' in obj &&
            typeof obj.data === 'object';
    }

    /**
     * Fetches a command from the command list.
     * @param name The name of the command you wish to fetch
     * @returns {BaseCommand} The command with the given name.
     */
    public Fetch(name:string): BaseCommand{
        return this.commands.get(name);
    }
    /**
     * Returns the entire command list.
     * @returns {Map<string, BaseCommand>} The current list of commands.
     */
    public GetList(): Map<string, BaseCommand>{
        return this.commands;
    }

    /**
     * Loads the commands from the /commands directory
     * @returns {Promise<number>} The number of commands that were loaded
     */
    public async Load(): Promise<number>{
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
                let fileToImport = pathToFileURL(filePath).href;
                var commandLoadPromise = import(fileToImport).then(command => {
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