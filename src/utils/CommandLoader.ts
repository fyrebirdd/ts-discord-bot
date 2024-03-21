import fs from 'fs';
import path from 'path';
import { fileURLToPath, pathToFileURL } from 'url';
import { BaseCommand } from '../types/BaseCommand';
import {Routes, REST, ApplicationCommand} from 'discord.js';

type CommandIDString = string;

interface CommandDeployStruct{
    guild: any[],
    global: any[],
};

interface CommandDeleteStruct{
    guild: CommandIDString[],
    global: CommandIDString[],
}

interface DeployedCommandsStruct{
    guild: ApplicationCommand[],
    global: ApplicationCommand[],
}

interface CommandsFromFileStruct{
    guild: BaseCommand[],
    global: BaseCommand[],
    commandsMap: Map<string, BaseCommand>,
}

interface CommandsLoadedInfoStruct{
    totalLoaded: number,
    totalDeployed: number,
    totalDeleted: number,
}

class CommandLoader{

    private static instance: CommandLoader| null = null;

    private commands: Map<string, BaseCommand>;
    private commandsFolderPath: string | null = null;
    private rest: REST;

    private constructor() {
        this.commands = new Map();
        let workingDir = path.dirname(fileURLToPath(import.meta.url));
        this.commandsFolderPath = path.resolve(workingDir, '../commands');
        this.rest = new REST().setToken(process.env.TEMPLATE_TOKEN);
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
        return (obj as BaseCommand).data !== undefined;
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
     * Loads the commands in the /commands directory. Automatically deploys and deletes commands as needed.
     * @returns {Promise<CommandsLoadedInfoStruct>} Number of commands that were loaded/deployed/deleted.
     */
    public async Load(): Promise<CommandsLoadedInfoStruct>{

        if (this.commandsFolderPath == null) throw new Error("Commands path not set!");

        const commandFolders = fs.readdirSync(this.commandsFolderPath);

        const commandsFromFile = await this.LoadCommandsFromFile(commandFolders);
        const deployedCommands = await this.FetchDeployedCommands();

        this.commands = commandsFromFile.commandsMap;

        const commandsToDeploy = this.FindCommandsToDeploy(commandsFromFile, deployedCommands);
        const commandsToDelete = this.FindCommandsToDelete(commandsFromFile, deployedCommands);

        const numDeployed = await this.DeployNewCommands(commandsToDeploy);
        const numDeleted = await this.DeleteCommands(commandsToDelete);

        const info:CommandsLoadedInfoStruct = {
            totalLoaded: commandsFromFile.commandsMap.size,
            totalDeployed: numDeployed,
            totalDeleted: numDeleted,
        };

        return info;
    }

    private async LoadCommandsFromFile(commandFolders: string[]):Promise<CommandsFromFileStruct>{
        let commandsLoadedFromFile = 0;
        let commandPromises = [];
        let newCommands = new Map<string, BaseCommand>();
        let loadedCommands:CommandsFromFileStruct = {global: [], guild: [], commandsMap: new Map<string, BaseCommand>()};

        for (const folder of commandFolders) {

            const commandsPath = path.join(this.commandsFolderPath, folder);
            const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));

            for (const file of commandFiles) {

                const filePath = path.join(commandsPath, file);
                let fileToImport = pathToFileURL(filePath).href;

                var commandLoadPromise = import(fileToImport).then((command) => {

                    if (CommandLoader.isCommand(command.command)) {

                        let loadedCommand:BaseCommand = command.command as BaseCommand;

                        newCommands.set(loadedCommand.data.name, loadedCommand);
                        commandsLoadedFromFile++;

                        if (loadedCommand.global){
                            loadedCommands.global.push(loadedCommand);
                        }
                        else{
                            loadedCommands.guild.push(loadedCommand);
                        }

                        loadedCommands.commandsMap.set(loadedCommand.data.name, loadedCommand);

                    } else {
                        console.log(`Command ${file} was not loaded.`);
                    }
                });
                commandPromises.push(commandLoadPromise);
            }
        }
        await Promise.all(commandPromises);
        return loadedCommands;
    }

    private FindCommandsToDeploy(local: CommandsFromFileStruct, deployed: DeployedCommandsStruct): CommandDeployStruct{
        let commandsToDeploy: CommandDeployStruct = {global: [], guild: []};

        for (const command of local.global){
            const commandExists = deployed.global.some(dCommand => dCommand.name === command.data.name);
            if (commandExists){
                commandsToDeploy.global.push(command.data.toJSON());
            }
        }

        for (const command of local.guild){
            const commandExists = deployed.guild.some(dCommand => dCommand.name === command.data.name);
            if (commandExists){
                commandsToDeploy.guild.push(command.data.toJSON());
            }
        }

        return commandsToDeploy;
    }

    private FindCommandsToDelete(local: CommandsFromFileStruct, deployed: DeployedCommandsStruct): CommandDeleteStruct{
        let commandsToDelete: CommandDeleteStruct = {global: [], guild: []};

        for (const dCommand of deployed.global){
            const commandExists = deployed.global.some(command => command.name === dCommand.name);
            if (commandExists){
                commandsToDelete.global.push(dCommand.id);
            }
        }

        for (const dCommand of deployed.guild){
            const commandExists = deployed.guild.some(command => command.name === dCommand.name);
            if (commandExists){
                commandsToDelete.guild.push(dCommand.id);
            }
        }

        return commandsToDelete;
    }
    
    private async DeployNewCommands(commandsToDeploy: CommandDeployStruct): Promise<number>{
        let commandsDeployed = 0;
        try{
            if (commandsToDeploy.global.length > 0){
                await this.rest.put(
                    Routes.applicationCommands(process.env.TEMPLATE_CLIENT_ID),
                    { body: commandsToDeploy.global },
                );
                commandsDeployed += commandsToDeploy.global.length;
            }
            if (commandsToDeploy.guild.length > 0){
                await this.rest.put(
                    Routes.applicationGuildCommands(process.env.TEMPLATE_CLIENT_ID, process.env.TEMPLATE_GUILD_ID),
                    { body: commandsToDeploy.guild },
                );
                commandsDeployed += commandsToDeploy.guild.length;
            }
        }
        catch(err){
            console.log(`- - - Error deploying commands - - -\n${err}`);
        }

        return commandsDeployed;
    }

    private async DeleteCommands(commandsToDelete: CommandDeleteStruct): Promise<number>{
        let commandsDeleted = 0;
        try{
            if (commandsToDelete.global.length > 0){
                commandsToDelete.global.forEach( async (id) => {
                    await this.rest.delete(
                        Routes.applicationCommand(process.env.TEMPLATE_CLIENT_ID, `${id}`)
                    );
                    commandsDeleted++;
                });
            }
            if (commandsToDelete.guild.length > 0){
                commandsToDelete.guild.forEach( async (id) => {
                    await this.rest.delete(
                        Routes.applicationGuildCommand(process.env.TEMPLATE_CLIENT_ID, process.env.TEMPLATE_GUILD_ID, `${id}`)
                    );
                    commandsDeleted++;
                })
            }
        }
        catch(err){
            console.log(`- - - Error deleting command - - -\n${err}`);
        }
        

        return commandsDeleted;
    }

    private async FetchDeployedCommands(): Promise<DeployedCommandsStruct>{
        this.rest = new REST().setToken(process.env.TEMPLATE_TOKEN);

        let guildCommands = await this.rest.get(
            Routes.applicationGuildCommands(process.env.TEMPLATE_CLIENT_ID, process.env.TEMPLATE_GUILD_ID)
        ) as ApplicationCommand[];

        let globalCommands = await this.rest.get(
            Routes.applicationCommands(process.env.TEMPLATE_CLIENT_ID)
        ) as ApplicationCommand[];

        return {
            guild: guildCommands,
            global: globalCommands
        };
    }

}

const Commands = CommandLoader.getInstance();
export default Commands;