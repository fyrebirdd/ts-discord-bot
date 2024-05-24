# ts-discord-bot
This is the template i use for most of my discord bots, with some example functions added in.

# Installation
Clone the repository and run ```npm install```.<br>
In working directory, make a ```.env``` file and put the following values in it:
```
BOT_TOKEN=<the bot's token>
BOT_CLIENT_ID=<the bot's application id>
BOT_NAME=<name of the bot (for embeds)>
BOT_GUILD_ID=<guild id of a server the bot is in(for non global commands)>
BOT_LOG_CHANNEL_ID=<channel to log errors in (MUST BE IN THE ABOVE GUILD)>
```

## For Docker:
- Run ```npm run bot-docker```, which will build and run the docker container with the premade script in ```package.json```. (This will automatically load environment variables from the .env file)

    Alternatively:

- Run ```npm run build-docker``` to only build an image, which you can then run with your own settings in docker cli or docker desktop. (This will not automatically load the environment variables from the .env file)

## For Node:
- Run ```npm run bot```, which will build and run the application through node using the premade script in ```package.json```. (This will automatically load environment variables from the .env file)

    Alternatively: 

- Run ```npm run build```, which will only compile the typescript project. You will have to run the main file, which is located at ```./build/index.js```. (This will not automatically load the environment variables from the .env file)



# Developer Guide: 

## Commands:
Adding commands to the bot is quite simple. Create a typescript file in a subdirectory of the commands folder. (NOTE: All commands must be in a folder within the commands folder).

This is the interface for a command:

```ts
export interface BaseCommand {
    data: Omit<SlashCommandBuilder, "addSubcommand" | "addSubcommandGroup"> 
    | SlashCommandSubcommandsOnlyBuilder
    | ContextMenuCommandBuilder,
    global: boolean,
    execute: (interaction: ChatInputCommandInteraction) => Promise<void>;
}
```

Here is an example of a command that replies "Hello!" when the user calls it.

```ts
import { SlashCommandBuilder } from 'discord.js';
import { BaseCommand } from '../../types/BaseCommand';

export const command: BaseCommand = {
	data: new SlashCommandBuilder()
	.setName('say-hello')
	.setDescription('says hello'),

	global: true,

	execute: async (interaction) => {
        await interaction.reply("Hello!")
	}
};
```
The exported variable name must be "command"!

### Interface Variables:

<B>Data:</B> The [SlashCommandBuilder](https://discord.js.org/docs/packages/builders/1.6.0/SlashCommandBuilder:Class) object describing your command. 

<B>Global:</B> Whether a command should be global, or only accessable via the guild in your environment variables.

<B>Execute:</B> An asyncronous function that should be executed whenever your command is called. Takes a [ChatInputCommandInteraction](https://discord.js.org/docs/packages/discord.js/14.14.1/ChatInputCommandInteraction:Class) object as a parameter.

### IMPORTANT TO NOTE:

Commands will only automatically deploy if their names change. Changing options of a command without changing the name will not trigger an automatic deployment. (I will fix this in the future).


## Events:
Adding events is also quite simple. Create a typescript file in the events directory.

This is the interface for each event:

```ts
export interface BaseEvent {
    name: Events;
	once: boolean;
	execute: (...args: any[]) => Promise<void> | void;
}
```

Each event will have its own execute function with its own parameters, a list of which can be found [here](https://discord.js.org/docs/packages/discord.js/14.15.2/Client:Class) in the events section.

Below is an example of the Ready event:

```ts
import { Events, Client } from "discord.js";
import { BaseEvent } from "../types/BaseEvent";

export const event: BaseEvent = {
	name: Events.ClientReady,
	once: true,
	execute: async (client:Client) => {
		console.log(`Client session is now valid`);
	}
};
```
The exported variable name must be "event"!

### Interface Variables:
<B>Name:</B> The [Event enum](https://discord.js.org/docs/packages/discord.js/14.14.1/Events:Enum) which matches the event you are implementing.

<B>Once: </B> True if the event will only fire once, false otherwise. (I can't find documentation for this, most events can be set to false but there are some that only fire once like ready).

<B>Execute: </B> The function that will be called once the event is emitted. Parameters for these functions can be found in the [docs](https://discord.js.org/docs/packages/discord.js/14.15.2/Client:Class).

## Tasks:

Tasks are functions that run after a set interval. I found myself implementing these in every bot I used so I thought it would be wise to implement it here by default

This is the interface for a task:

```ts
export interface BaseTask{
    name: string,
    duration: number;
    runBeforeTimerStart: boolean;
    execute: () => Promise<void>;
}
```

Heres an example of a Task that prints Hello World once every hour:
```ts
import { BaseTask } from "../types/BaseTask";

export const task: BaseTask = {
    name: "Hello World",

    duration: 3600000,

    runBeforeTimerStart: true,

    execute: async () => {
        console.log("Hello World");
    }
}
```
The exported variable name must be "task"!

### Interface Variables:
<B>Name:</B> The name of the task (only for console outputting purpose)

<B>Duration:</B> How long to wait between function calls (in ms)

<B>Run Before Timer Start:</B> True if you want to run the function once before starting the timer, False otherwise.

<B>Execute:</B> Asyncronous function to call when timer runs out

## Database: 

In the ```./src/utils``` folder there is a file called DatabaseHandler.ts. In this file is where you can make your own database functions. The documentation for better-sqlite3 can be found [here](https://github.com/WiseLibs/better-sqlite3/blob/master/docs/api.md#api)

## Logging:

In the ```./src/utils``` folder there is a file called Logger.ts. This file exports an object called Debug, which has a couple members that can log text to a text channel (the one you set in your environment variable). I named the members like the Unity debug object but feel free to change them if you would like.

