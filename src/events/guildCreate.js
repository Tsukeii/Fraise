const { Embed } = require("../classes");
module.exports = {
    name: "guildCreate",
    once: false,
    async execute(client, guild) {
        const lang = guild.preferredLocale ?? "en-US";
        //Bot has been invited to a new guild
        await client.db.findOrCreateGuild(guild.id, lang);
        if (guild.systemChannelId) {
            const channel = await guild.channels.fetch(guild?.systemChannelId);
            const content = `Merci à vous d'avoir choisis Fraise! pour commencer, tape \`${client.config.defaultPrefix}help\`\nServeur communautaire: ${client.config.supportGuildInvite}`;
            if (channel) {
                channel.send(content).catch(() => {
                    guild.channels.cache
                        .find(
                            (c) =>
                                c
                                    .permissionsFor(client.user.id)
                                    .has("SEND_MESSAGES") &&
                                c.type === "GUILD_TEXT"
                        )
                        .send(content);
                });
            }
        }
        const bots = guild.members.cache.filter((m) => m.user.bot).size;
        const embed = new Embed({ color: "success", timestamp: true })
            .setTitle(`:white_check_mark: Ajouter à "${guild.name}"`)
            .setDescription(`${guild.id}`)
            .addField(
                "Info",
                `Shard: ${guild.shardId}\nCréer par: <@${
                    guild.ownerId
                }>\nMembres: ${guild.memberCount}\nHumains: ${Math.round(
                    (bots / guild.memberCount) * 100
                )}%`
            );
        client.channels.cache
            .get(client.config.logsChannelId)
            .send({ embeds: [embed] });
    },
};
