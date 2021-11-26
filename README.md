# BunkbotJS
The spiritual successor to [Bunkbot](https://github.com/fugwenna/bunkbot)


![bunkbot](https://github.com/fugwenna/bunkbotjs/blob/master/avatar.png)

<br/>  <sup>(credit [Christine Schlotter](http://christineschlotter.com))</sup>

## Overview

The bunkest of bots, ~~first~~ second of his name. Bunkbot is a small sandbox discord bot meant for privately run servers who want a strange sandbox bot to run and customize for fun. Built using DiscordJS and PouchDB.

## Prerequisites:
**Required**:   
NodeJS 16.6.0 or higher
<br/> 

_Optional_: <br />
Many of Bunkbot's features use (free) API accounts. Bunkbot will still load without these accounts, but will not support the functions that require them. Below are the APIs Bunkbot uses:
- Discord: [Developer Account](https://discord.com/developers/applications)
- Chat: [Cleverbot](https://cleverbot.io/)
- Weather: [Open Weather](https://openweathermap.org/api)
- Gif Responses: [Tenor](https://tenor.com/gifapi/documentation)
- Youtube: [Google Developer Account](https://developers.google.com/youtube/v3)
  
## Setup
Running Bunkbot's setup will provide a pouch `database/` directory at the root of the project. You may opt for defaults and come back to change configuration later using the setup scripts.

For first time setup, open your desired terminal and run:
```bash
npm run setup
```

For additional configuration later, open a terminal and run: 
```bash
npm run config
```
  
<!--
 ## Running the bot
Once the setup is complete, the bot is ready. Run `python3 main.py` at the root of the project to boot Bunkbot.
-->