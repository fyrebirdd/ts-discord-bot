import path from "node:path";

import { Client, GatewayIntentBits } from "discord.js";
import { fileURLToPath } from "node:url";
import Commands from "./utils/CommandLoader.js";
import Events from "./utils/EventLoader.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const client:Client = new Client({intents:[
    GatewayIntentBits.Guilds, 
    GatewayIntentBits.MessageContent, 
    GatewayIntentBits.GuildMessages, 
    GatewayIntentBits.GuildMessageReactions, 
    GatewayIntentBits.GuildMembers, 
    GatewayIntentBits.GuildMessageReactions
]});

Commands.SetFolderPath(path.join( __dirname, '/commands'));
await Commands.Load();

Events.SetFolderPath(path.join( __dirname, '/events'));
await Events.Load(client);

client.login(process.env.TEMPLATE_TOKEN);