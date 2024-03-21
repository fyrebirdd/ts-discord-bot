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

console.log(`Loading ${commandsLoaded.totalLoaded} command(s)...`);
commandsLoaded.commandsLoaded.forEach((c) => {
    console.log(`Loaded command "${c}"`);
})
if (commandsLoaded.deployed) console.log("Redeployed Commands");


console.log('\n');


console.log("- - - - - LOADING EVENTS - - - - -\n");
let eventsLoaded = await Events.Load(client);

console.log(`Loading ${eventsLoaded.numEvents} events...`);
eventsLoaded.eventsLoaded.forEach((e)=>{
    console.log(`Loaded event "${e}"`);
});


console.log('\n');


client.login(process.env.TEMPLATE_TOKEN);