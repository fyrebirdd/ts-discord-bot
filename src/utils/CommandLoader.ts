import fs from 'fs';
import path from 'path';
import { fileURLToPath, pathToFileURL } from 'url';
import { BaseCommand } from '../types/BaseCommand';
import {Routes, REST, ApplicationCommand} from 'discord.js';

interface CommandDeployStruct{
    guild: any[],
    global: any[],
};

interface CommandsFromFileStruct{
    guild: BaseCommand[],
    global: BaseCommand[],
    commandsMap: Map<string, BaseCommand>,
}

interface CommandsLoadedInfoStruct{
    totalLoaded: number,
    commandsLoaded: string[],
    deployed: boolean,
}

interface DeployedCommandsStruct{
    global: ApplicationCommand[],
    guild: ApplicationCommand[],
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
        this.rest = new REST().setToken(process.env.BOT_TOKEN);
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
     * Loads the commands in the /commands directory. Automatically deploys commands as needed.
     * @returns {Promise<CommandsLoadedInfoStruct>} Number of commands that were loaded/deployed/deleted.
     */
    public async Load(): Promise<CommandsLoadedInfoStruct>{

        if (this.commandsFolderPath == null) throw new Error("Commands path not set!");

        const commandFolders = fs.readdirSync(this.commandsFolderPath);

        const commandsFromFile = await this.LoadCommandsFromFile(commandFolders);
        const commandsFromDiscord = await this.FetchDeployedCommands();

        let deploy = this.CheckNeedsDeployment(commandsFromFile, commandsFromDiscord);
        if(deploy || process.argv[2] == 'deploy'){
            let deployStruct:CommandDeployStruct = {guild: [], global: []};

            commandsFromFile.global.forEach((c)=>{deployStruct.global.push(c.data.toJSON())});
            commandsFromFile.guild.forEach((c)=>{deployStruct.guild.push(c.data.toJSON())});

            await this.DeployCommands(deployStruct);
            deploy = true;
        }

        this.commands = commandsFromFile.commandsMap;

        const info:CommandsLoadedInfoStruct = {
            totalLoaded: commandsFromFile.commandsMap.size,
            commandsLoaded: Array.from(this.commands.keys()),
            deployed: deploy
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

                        if (!loadedCommand.global){
                            loadedCommands.guild.push(loadedCommand);
                        }
                        else{
                            loadedCommands.global.push(loadedCommand);
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
    
    private async DeployCommands(commandsToDeploy: CommandDeployStruct): Promise<number>{
        let commandsDeployed = 0;

        try{
            await this.rest.put(
                Routes.applicationCommands(process.env.BOT_CLIENT_ID),
                { body: commandsToDeploy.global.length > 0 ? commandsToDeploy.global: [] },
            );
            commandsDeployed += commandsToDeploy.global.length;
            await this.rest.put(
                Routes.applicationGuildCommands(process.env.BOT_CLIENT_ID, process.env.BOT_GUILD_ID),
                { body: commandsToDeploy.guild.length > 0 ? commandsToDeploy.guild : []},
            );
        }

        catch(err){
            console.log(`- - - Error deploying commands - - -\n${err}`);
        }

        return commandsDeployed;
    }

    private async FetchDeployedCommands(): Promise<DeployedCommandsStruct>{
        this.rest = new REST().setToken(process.env.BOT_TOKEN);

        let guildCommands = await this.rest.get(
            Routes.applicationGuildCommands(process.env.BOT_CLIENT_ID, process.env.BOT_GUILD_ID)
        ) as ApplicationCommand[];

        let globalCommands = await this.rest.get(
            Routes.applicationCommands(process.env.BOT_CLIENT_ID)
        ) as ApplicationCommand[];

        return {
            guild: guildCommands,
            global: globalCommands
        };
    }

    private CheckNeedsDeployment(local: CommandsFromFileStruct, deployed: DeployedCommandsStruct): boolean{
        
        if (deployed.global.length != local.global.length) return true;

        let matchingCommands = 0;
        deployed.global.forEach((deployedCommand) => {
            local.global.forEach((localCommand) =>{
                if (deployedCommand.name === localCommand.data.name){
                    matchingCommands++;
                }
            });
        });

        if (matchingCommands !== local.global.length || matchingCommands !== deployed.global.length) return true;

        matchingCommands = 0;
        deployed.guild.forEach((deployedCommand) => {
            local.guild.forEach((localCommand) =>{
                if (deployedCommand.name === localCommand.data.name){
                    matchingCommands++;
                }
            });
        });

        if (matchingCommands !== local.guild.length || matchingCommands !== deployed.guild.length) return true;

        return false;
    }
}

const Commands = CommandLoader.getInstance();
export default Commands;