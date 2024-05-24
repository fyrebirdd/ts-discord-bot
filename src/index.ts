import Commands from "./utils/CommandLoader.js";
import Events from "./utils/EventLoader.js";

import { Client, GatewayIntentBits } from "discord.js";
import Tasks, { TaskScheduler } from "./utils/TaskScheduler.js";
import BotConfig from "./utils/BotSettings.js";
import Debug from "./utils/Logger.js";

const client:Client = new Client({intents:[
    GatewayIntentBits.Guilds, 
    GatewayIntentBits.MessageContent, 
    GatewayIntentBits.GuildMessages, 
    GatewayIntentBits.GuildMessageReactions, 
    GatewayIntentBits.GuildMembers, 
    GatewayIntentBits.GuildMessageReactions
]});

console.log("\n- - - - - LOADING COMMANDS - - - - -\n");

let commandsLoaded = await Commands.Load();

console.log(`Loading ${commandsLoaded.totalLoaded} command(s)...`);
commandsLoaded.commandsLoaded.forEach((c) => {
    console.log(`Loaded command "${c}"`);
})
if (commandsLoaded.deployed) console.log("Redeployed Commands");


console.log("\n- - - - - LOADING EVENTS - - - - -\n");
let eventsLoaded = await Events.Load(client);

console.log(`Loading ${eventsLoaded.numEvents} events...`);
eventsLoaded.eventsLoaded.forEach((e)=>{
    console.log(`Loaded event "${e}"`);
});

console.log("\n- - - - - READY - - - - -\n");

await client.login(process.env.BOT_TOKEN);

// CAN NOW USE CLIENT TO DO STUFF

BotConfig.SetClient(client);
await Debug.Init(await client.guilds.fetch(process.env.BOT_GUILD_ID));


let tasksLoaded = await Tasks.LoadTasks();
console.log("\n- - - - - LOADING BACKGROUND TASKS - - - - -\n");
tasksLoaded.tasksLoaded.forEach((t) => {
    console.log(`Loaded Task: "${t.name}"\nDuration: ${TaskScheduler.GetTaskDurationAsString(t)}`);
});