import fs from "node:fs";
import path from "node:path";

import { fileURLToPath, pathToFileURL } from "node:url";
import { Client, ClientEvents } from "discord.js";


class EventLoader{
    private static instance: EventLoader| null = null;
    private eventsFolderPath: string | null = null;

    public static getInstance(){
        if (!EventLoader.instance){
            EventLoader.instance = new EventLoader();
        }
        return EventLoader.instance;
    }

    public static isEvent(obj:any){
        return obj instanceof Object && 
        'execute' in obj && 
        typeof obj.execute === 'function' &&
        'name' in obj &&
        typeof obj.name === 'string' &&
        'once' in obj &&
        typeof obj.once === 'boolean';
    }

    private constructor(){
        let workingDir = path.dirname(fileURLToPath(import.meta.url));
        this.eventsFolderPath = path.join(workingDir, '/events');
    }

    public SetFolderPath(folderPath: string){
        this.eventsFolderPath = folderPath;
    }

    public async Load(client:Client){
        const eventFiles = fs.readdirSync(this.eventsFolderPath).filter(file => file.endsWith('.js'));

        let eventPromises = [];
        let eventsLoaded =0;
        for (const file of eventFiles) {
	        const filePath = path.join(this.eventsFolderPath, file);
	        let prms = import(pathToFileURL(filePath).href).then(event => {
		        if (EventLoader.isEvent(event.event)) {
                    if (event.event.once) {
                        client.once(event.event.name as keyof ClientEvents, (...args) => event.event.execute(...args));
                    } else {
                        client.on(event.event.name as keyof ClientEvents, (...args) => event.event.execute(...args));
                    }
                    eventsLoaded++;
                }
	        });
            eventPromises.push(prms);
        }
        await Promise.all(eventPromises);
        return eventsLoaded;
    }
}

const Events = EventLoader.getInstance();
export default Events;