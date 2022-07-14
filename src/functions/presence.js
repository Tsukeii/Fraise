/**
 * Discord Welcome bot
 * Copyright (c) 2021 The Welcome-Bot Team and Contributors
 * Licensed under Lesser General Public License v2.1 (LGPl-2.1 - https://opensource.org/licenses/lgpl-2.1.php)
 */
module.exports = async (client) => {
    const servers = client.guilds.cache.size;
    const commands = client.commands.enabled.size;
    const allUsers = client.shard
        ? await client.shard.broadcastEval((c) =>
              c.guilds.cache.reduce((acc, guild) => acc + guild.memberCount, 0)
          )
        : null;
    const users = allUsers
        ? allUsers.reduce((acc, memberCount) => acc + memberCount, 0)
        : client.users.cache.size;
    const channels = client.channels.cache.size;
    const presences = [
        {
            name: `${servers} serveur${servers > 1 ? "s" : ""} | ${
                client.config.defaultPrefix
            }help`,
            type: "WATCHING",
        },
        {
            name: `${commands} commande${commands > 1 ? "s" : ""} | ${
                client.config.defaultPrefix
            }help`,
            type: "PLAYING",
        },
        {
            name: `${channels} salon${channels > 1 ? "s" : ""} | ${
                client.config.defaultPrefix
            }help`,
            type: "LISTENING",
        },
        {
            name: `${users} utilisateur${users > 1 ? "s" : ""} | ${
                client.config.defaultPrefix
            }help`,
            type: "WATCHING",
        },
        {
            name: `${client.user.username} v${client.package.version} | ${client.config.defaultPrefix}help`,
            type: "PLAYING",
        },
        {   
            name: `discord.gg/fraise`,
            type: "WATCHING",
        },
    ];
    client.user.setPresence({
        activities: [presences[Math.floor(Math.random() * presences.length)]],
    });
};
