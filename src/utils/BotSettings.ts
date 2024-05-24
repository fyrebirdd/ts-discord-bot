import { Client, PresenceData } from "discord.js"

class BotSettings{

    private static instance: BotSettings
    private botClient: Client;

    private constructor(){}
    
    public static getInstance(){
        if (!BotSettings.instance){
            BotSettings.instance = new BotSettings();
        }
        return BotSettings.instance;
    }

    public SetClient(client: Client){
        this.botClient = client;
    }

    public ChangeStatus(presence: PresenceData){
        if (this.botClient.isReady()){
            this.botClient.user.setPresence(presence);
        }
    }
}

const BotConfig = BotSettings.getInstance();
export default BotConfig;