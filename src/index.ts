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

let commandsLoaded = await Commands.Load();
console.log(`Loaded ${commandsLoaded} commands.`);

let eventsLoaded = await Events.Load(client);
console.log(`Loaded ${eventsLoaded} events.`);

client.login(process.env.TEMPLATE_TOKEN);