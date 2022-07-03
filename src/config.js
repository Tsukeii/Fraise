require("dotenv").config();
//const { Permissions } = require("discord.js");
const defaultPerms = require("./data/defaultPerms");
module.exports = {
    botGuildId: "681797849926860810",
    newsChannelId: "966739100298281090",
    logsChannelId: "966739100298281090",
    votesChannelId: "966739100298281090",
    suggestionLogsChannelId: "966739100298281090",
    errorLogsChannelId: "966739100298281090",
    loginLogsChannelId: "966739100298281090",
    defaultPrefix: process.env.BOT_PREFIX ?? "w/",
    votersRole: "852512614789808138",
    roles: {
        voteReminder: "886776592666353724",
    },
    channels: {
        general: "988200748397527160",
    },
    reportsChannelId: "945880722877612072",
    ownerIds: [
        "499447456678019072" /*Tsu#0010*/,
        "683464613790220288" /*Keii#0001*/,
    ],
    dbCacheRefreshInterval: 1 * 60 * 60 * 1000, //refresh db cache every hour
    staffIds: ["499447456678019072" /*Masha#1000*/],
    dashboard: {
        port: process.env.PORT || 8000,
        secret: process.env.SESS_SECRET ?? null,
        enabled: process.env.SESS_SECRET ?? null ? true : false,
        logs: "855331801635749888",
    },
    site: "https://fraise-production.up.railway.app/",
    invite: (client) => {
        return client.generateInvite({
            scopes: ["bot", "applications.commands"],
            permissions: defaultPerms,
        });
    },
    inviteToGuild: (client, guildId, disableGuildSelect = true) => {
        return client.generateInvite({
            scopes: ["bot"],
            permissions: defaultPerms,
            guild: guildId,
            disableGuildSelect,
        });
    },
    plugins: {
        welcome: {
            msgLength: 50, //max welcome msg length
        },
        goodbye: {
            msgLength: 50, //max goodbye msg length
        },
    },
    supportGuildInvite: "https://discord.gg/MvSVmy3vjm",
    supportGuildInviteReal: (client) => {
        let invite = client.config.supportGuildInvite;
        try {
            const guild = client.guilds.cache.get(client.config.botGuildId);
            invite = guild.invites.create(guild.systemChannelId);
        } catch (e) {
            invite = client.config.supportGuildInvite;
        }
        return invite;
    },
};
