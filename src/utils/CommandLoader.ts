import fs from 'fs';
import path from 'path';
import { fileURLToPath, pathToFileURL } from 'url';
import { BaseCommand } from '../types/BaseCommand';
import {Routes, REST, ApplicationCommand} from 'discord.js';

class CommandLoader{
    private commands: Map<string, BaseCommand>;
    private static instance: CommandLoader| null = null;
    private commandsFolderPath: string | null = null;
    private rest: REST;

    private constructor() {
        this.commands = new Map();
        let workingDir = path.dirname(fileURLToPath(import.meta.url));
        this.commandsFolderPath = path.resolve(workingDir, '../commands');
    }

    public static getInstance(){
        if (!CommandLoader.instance){
            CommandLoader.instance = new CommandLoader();
        }
        return CommandLoader.instance;
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
    public async Load(): Promise<{loaded:number, deleted:number, updated:number}>{
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

        let commandsToUpdate = await this.GetCommandsToUpdate();

        let commandsToAdd = {global: [],guild: []};
        let commandsToDelete = {global: [],guild: []};

        commandsToUpdate.forEach((deleted, name) => {
            let command = this.commands.get(name);
            
            if (deleted){
                command.global ? commandsToDelete.global.push(name) : 
                                 commandsToDelete.guild.push(name);
            }
            else{
                command.global ? commandsToAdd.global.push(command.data.toJSON()) : 
                                 commandsToAdd.guild.push(command.data.toJSON());
            }
        });

        await this.UpdateCommands(commandsToAdd, commandsToDelete);



        return {
            loaded: this.commands.size,
            deleted: commandsToDelete.global.length + commandsToDelete.guild.length,
            updated: commandsToAdd.global.length + commandsToAdd.guild.length
        };
    }

    private async UpdateCommands(commandsToAdd: {global: any[], guild: any[]}, commandsToDelete){
        

        if (commandsToAdd.global.length > 0){
            try{
                await this.rest.put(
                    Routes.applicationCommands(process.env.TEMPLATE_CLIENT_ID),
                    { body: commandsToAdd.global },
                );
            }
            catch(err){
                console.log(`Error updating global commands: ${err}`)
            } 
        }
        if (commandsToAdd.guild.length > 0){
            try{
                await this.rest.put(
                    Routes.applicationGuildCommands(process.env.TEMPLATE_CLIENT_ID, process.env.TEMPLATE_GUILD_ID),
                    { body: commandsToAdd.guild },
                );
            }
            catch(err){
                console.log(`Error updating guild commands: ${err}`)
            }
        }

        if (commandsToDelete.global.length > 0){
            try{
                await commandsToDelete.global.forEach( async (id) => {
                    await this.rest.delete(
                        Routes.applicationCommands(process.env.TEMPLATE_CLIENT_ID),
                        { body: id},
                    );
                });
                
            }
            catch(err){
                console.log(`Error deleting global commands: ${err}`)
            } 
        }
        if (commandsToDelete.guild.length > 0){
            try{
               await commandsToDelete.guild.foreach(async (id) => {
                    await this.rest.delete(
                        Routes.applicationGuildCommands(process.env.TEMPLATE_CLIENT_ID, process.env.TEMPLATE_GUILD_ID),
                        { body: id},
                    );
                })
            }
            catch(err){
                console.log(`Error deleting guild commands: ${err}`)
            }
        }
    }

    private async GetCommandsToUpdate(): Promise<Map<string, boolean>>{
        this.rest = new REST().setToken(process.env.TEMPLATE_TOKEN);
        let guildCommands = await this.rest.get(
            Routes.applicationGuildCommands(process.env.TEMPLATE_CLIENT_ID, process.env.TEMPLATE_GUILD_ID)
        ) as ApplicationCommand[];
        let globalCommands = await this.rest.get(
            Routes.applicationCommands(process.env.TEMPLATE_CLIENT_ID)
        ) as ApplicationCommand[];

        let commandsToUpdate = new Map<string, boolean>();

        this.commands.forEach( ((command, name) => {
            if (command.global){
                for (let i = 0; i < globalCommands.length; i++){
                    if (globalCommands[i].name===name){
                        return;
                    }
                } 
            }
            else{
                for (let i = 0; i < guildCommands.length; i++){
                    if (guildCommands[i].name===name){
                        return;
                    }
                }
            }
            commandsToUpdate.set(name, false);
        }));

        guildCommands.forEach((c)=>{
            if (!this.commands.has(c.name)){
                commandsToUpdate.set(c.id, true);
            }
        });
        globalCommands.forEach((c)=>{
            if (!this.commands.has(c.name)){
                commandsToUpdate.set(c.id, true);
            }
        });
        
        return commandsToUpdate;
    }
    

}

const Commands = CommandLoader.getInstance();
export default Commands;