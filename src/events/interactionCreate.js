const { Embed } = require("../classes");
module.exports = {
    name: "interactionCreate",
    once: false,
    async execute(client, interaction) {
        if (!interaction.isCommand()) return;
        if (!client.application?.owner) await client.application?.fetch();
        const { commandName: cmd } = interaction;
        await interaction.deferReply();
        let guildDB;
        if (interaction.inGuild() && interaction.channel.type !== "DM") {
            guildDB = await client.db.findOrCreateGuild(interaction.guild.id);
        } else {
            guildDB = { prefix: client.config.defaultPrefix, disabled: [] };
        }
        const t = client.i18next.getFixedT(guildDB.lang ?? "en-US");
        const userDB = await client.db.findOrCreateGuild(
            interaction.member.user.id
        );
        const command = client.commands.enabled
            .filter((cmd) => cmd.sladh)
            .get(cmd);
        if (!command) return;
        let preCheck = false;
        preCheck = await command.preCheck(interaction, guildDB, t);
        if (!preCheck) return;
        command.run({ interaction, guildDB, userDB }, t).catch((err) => {
            client.logger.log(`Error when executing ${command.name}`, "error", [
                "CMDS",
            ]);
            console.log(err);
            const embed = new Embed({ color: "error" })
                .setTitle(t("errors:generic"))
                .addField(
                    `Merci de le signaler à ${client.ownersTags.join(" OR ")}`,
                    "\u200b"
                );
            if (
                client.config.ownerIds.includes(interaction.user.id) ||
                client.config.staffIds.includes(interaction.user.id) ||
                interaction.user.id === client.application?.owner.id
            )
                embed.addField("Error", `${err}`);
            interaction.followUp({ embeds: [embed], ephemeral: true });
        });
        if (client.debug)
            client.logger.log(`Executed ${command.name} command`, "debug");
    },
};
