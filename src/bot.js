require("dotenv").config();
const Straw = require("./Straw");
const { Embed } = require("./classes");

const client = new Straw({
    debug: process.env.NODE_ENV === "development",
});

require("./db/connection");
const dbAuditor = require("./db/functions/dbAuditor");

process.env.userAgent = "Discord Straw " + client.package.version;
process.on("unhandledRejection", (error) => {
    if (
        error.toString().indexOf("No guild with guild ID") !== -1 &&
        client &&
        dbAuditor
    ) {
        dbAuditor(client);
    } else {
        client.logger.log("Unhandled promise rejection", "error");
        console.error(error);
        const channel =
            client.channels.cache.get(client?.config?.errorLogsChannelId) ??
            null;
        if (channel)
            channel
                .send({
                    embeds: [
                        {
                            title: ":x: An error occurred",
                            description: `${error}`,
                            fields: [
                                {
                                    name: "Stack trace",
                                    value: `${error.stack}`,
                                    inline: true,
                                },
                            ],
                        },
                    ],
                })
                .catch(() => {});
    }
});
process.on("exit", (code) => {
    client.destroy();
});

const getT = async (guildId) => {
    const guildDB = await client.db.findOrCreateGuild(guildId);
    return client.i18next.getFixedT(guildDB.lang || "en-US");
};

let embed = new Embed({ color: "success" });
client.player
    .on("trackAdd", async (queue, track) => {
        embed = new Embed({ color: "success" });
        const t = await getT(queue.metadata.guild.id);
        embed
            .setTitle(`🎶 | ${t("cmds:play.queueAdded")}`)
            .setDescription(track.title)
            .setImage(track.thumbnail);
        queue.metadata.channel.send({ embeds: [embed] });
    })
    .on("trackStart", async (queue, track) => {
        embed = new Embed({ color: "success" });
        const t = await getT(queue.metadata.guild.id);
        embed
            .setTitle(`🥁 | ${t("cmds:play.starting")}`)
            .setDescription(track.title)
            .setImage(track.thumbnail);
        queue.metadata.channel.send({ embeds: [embed] });
    })
    .on("playlistStart", async (queue, playlist, track) => {
        embed = new Embed({ color: "blue" });
        const t = await getT(queue.metadata.guild.id);
        embed.setTitle(
            t("cmds.play.playlistStart", {
                playlistTitle: playlist.title,
                songName: track.title,
            })
        );
        queue.metadata.channel.send({ embeds: [embed] });
    })
    .on("playlistAdd", async (queue, playlist) => {
        embed = new Embed({ color: "blue" });
        const t = await getT(queue.metadata.guild.id);
        embed.setTitle(
            t("cmds.play.queueAddCount", {
                songCount: playlist.items.length,
            })
        );
        queue.metadata.channel.send({ embeds: [embed] });
    })
    .on("debug", (queue, message) => {
        if (client.debug) client.logger.log(message, "debug", ["VOICE"]);
    })
    .on("botDisconnect", async (queue) => {
        const t = await getT(queue.metadata.guild.id);
        queue.metadata.channel.send(t("cmds:play.botDisconnected"));
    })
    .on("noResults", async (queue) => {
        const t = await getT(queue.metadata.guild.id);
        queue.metadata.channel.send(t("cmds:play.noResults"));
    })
    .on("queueEnd", async (queue) => {
        const t = await getT(queue.metadata.guild.id);
        queue.metadata.channel.send(t("cmds:play.queueEnd"));
    })
    .on("channelEmpty", () => {
        // do nothing, leaveOnEmpty is not enabled
    })
    .on("connectionCreate", (queue, connection) => {
        if (client.debug)
            client.logger.log("Joined voice channel", "debug", ["VOICE"]);
    })
    .on("connectionError", (queue, err) => {
        client.logger.log("Connection Error:", "error", ["VOICE"]);
        console.log(err);
    })
    .on("error", async (queue, error) => {
        const t = await getT(queue.metadata.guild.id);
        switch (error.message.replace("Error:", "").trim()) {
            case "Status Code: 429":
                queue.metadata.reply(t("cmds:play.rateLimited"));
                break;
            case "Status Code: 403":
                queue.metadata.reply(t("cmds:play.forbidden"));
                break;
            case "Cannot use destroyed queue":
                queue.metadata.reply(t("cmds:play.destroyedQueue"));
                break;
            default:
                queue.metadata.reply(
                    t("cmds:play.errorOccurred", { error: error.message })
                );
                break;
        }
    });

client.login(process.env.DISCORD_TOKEN);
