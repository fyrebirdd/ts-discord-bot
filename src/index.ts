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

console.log("- - - - - LOADING COMMANDS - - - - -\n");
let commandsLoaded = await Commands.Load();

console.log(`Deployed ${commandsLoaded.totalDeployed} new command(s)`);
console.log(`Deleted ${commandsLoaded.totalDeleted} command(s)`);
console.log(`Loaded ${commandsLoaded.totalLoaded} command(s).`);


console.log('\n');


console.log("- - - - - LOADING EVENTS - - - - -\n");
let eventsLoaded = await Events.Load(client);
console.log(`Loaded ${eventsLoaded} events.`);


console.log('\n');


client.login(process.env.TEMPLATE_TOKEN);