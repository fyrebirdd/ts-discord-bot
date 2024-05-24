import { Client, Colors, EmbedBuilder, Guild, TextChannel } from "discord.js";

class Logger{

    private static instance: Logger;
    private logChannel:TextChannel;

    private constructor(){}

    public static getInstance(){
        if (!Logger.instance){
            Logger.instance = new Logger();
        }
        return Logger.instance;
    }

    public async Init(guild:Guild){
        this.logChannel = (await guild.channels.fetch(process.env.BOT_LOG_CHANNEL_ID)) as TextChannel;
    }

    public async Log(message: string){
        let logMessage = new EmbedBuilder()
        .setTitle("Log")
        .setDescription(`${message}`)
        .setTimestamp()
        .setColor(Colors.Green)

        await this.logChannel.send({embeds:[logMessage]});
    }

    public async Error(message:string){
        let logMessage = new EmbedBuilder()
        .setTitle("Error")
        .setDescription(`${message}`)
        .setTimestamp()
        .setColor(Colors.Red)

        await this.logChannel.send({embeds:[logMessage]});
    }
}

const Debug = Logger.getInstance();
export default Debug;