import fs from "node:fs";
import path from "node:path";

import { fileURLToPath, pathToFileURL } from "node:url";
import { Client, ClientEvents } from "discord.js";

interface EventLoadInfo{
    numEvents: number,
    eventsLoaded: string[],
}

class EventLoader{
    private static instance: EventLoader| null = null;
    private eventsFolderPath: string | null = null;

    public static getInstance(){
        if (!EventLoader.instance){
            EventLoader.instance = new EventLoader();
        }
        return EventLoader.instance;
    }

    /**
     * Checks whether a given object can be cast to the BaseEvent type
     * @param obj An object to evaluate.
     * @returns {boolean} True if obj can be cast to BaseEvent type. False otherwise.
     */
    public static isEvent(obj:any): boolean{
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
        this.eventsFolderPath = path.resolve(workingDir, '../events');
    }

    /**
     * Loads the events from the /events folder.
     * @param {Client} client A client from discord.js
     * @returns {Promise<number>} The amount of events loaded.
     */
    public async Load(client:Client): Promise<EventLoadInfo>{
        const eventFiles = fs.readdirSync(this.eventsFolderPath).filter(file => file.endsWith('.js'));
        let info:EventLoadInfo = {numEvents: 0, eventsLoaded: []};

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
                    info.eventsLoaded.push(event.event.name);
                    info.numEvents++;
                }
	        });
            eventPromises.push(prms);
        }
        await Promise.all(eventPromises);
        return info;
    }
}

const Events = EventLoader.getInstance();
export default Events;