# ts-discord-bot
A template for a discord bot built in typescript that can either be run using node or docker.

## Installation
Clone the repository and run ```npm install```.<br>
In the ts-discord-bot directory, make a ```.env``` file and put the following values in it:
```
TEMPLATE_TOKEN=your bot token
TEMPLATE_GUILD_ID=your dev guild id
TEMPLATE_CLIENT_ID=client id of your bot
```
as well as any other environment variables you would like.

### For Docker:
- Run ```npm run bot-docker```, which will build and run the docker container with the premade script in ```package.json```. (This will automatically load environment variables from the .env file)

    Alternatively:

- Run ```npm run build-docker``` to only build an image, which you can then run with your own settings in docker cli or docker desktop. (This will not load the environment variables from the .env file)

### For Node:
- Run ```npm run bot```, which will build and run the application through node using the premade script in ```package.json```. (This will automatically load environment variables from the .env file)

    Alternatively: 

- Run ```npm run build```, which will only compile the typescript project. You will have to run the main file, which is located at ```./build/index.js```. (This will not load the environment variables from the .env file)

