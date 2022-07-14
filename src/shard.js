require("dotenv").config();
const { ShardingManager } = require("discord.js");
const manager = new ShardingManager(__dirname + "/bot.js", {
    token: process.env.DISCORD_TOKEN,
});

manager.on("shardCreate", (shard) => console.log(`Éclat lancé ${shard.id}`));
manager.spawn({ timeout: -1 });
