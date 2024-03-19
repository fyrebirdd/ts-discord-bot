import Commands from "./utils/CommandLoader.js";
import Events from "./utils/EventLoader.js";

import { Client, GatewayIntentBits } from "discord.js";

const client:Client = new Client({intents:[
    GatewayIntentBits.Guilds, 
    GatewayIntentBits.MessageContent, 
    GatewayIntentBits.GuildMessages, 
    GatewayIntentBits.GuildMessageReactions, 
    GatewayIntentBits.GuildMembers, 
    GatewayIntentBits.GuildMessageReactions
]});

console.log("LOADING COMMANDS...");
let commandsLoaded = await Commands.Load();
console.log(`Loaded ${commandsLoaded.loaded} commands.`);
console.log(`Updated ${commandsLoaded.updated} commands.`);
console.log(`Deleted ${commandsLoaded.deleted} commands.`);

console.log("LOADING EVENTS...");
let eventsLoaded = await Events.Load(client);
console.log(`Loaded ${eventsLoaded} events.`);

client.login(process.env.TEMPLATE_TOKEN);