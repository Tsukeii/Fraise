/**
 * Discord Welcome-Bot
 * Copyright (c) 2021 The Welcome-Bot Team and Contributors
 * Licensed under Lesser General Public License v2.1 (LGPl-2.1 - https://opensource.org/licenses/lgpl-2.1.php)
 */
//eslint-disable-next-line no-unused-vars
const { Embed, Command } = require("../../classes");
const { Permissions } = require("discord.js");
module.exports = class CMD extends Command {
    constructor(client) {
        super(
            {
                name: "unlock",
                aliases: ["unlock-channel"],
                memberPerms: [Permissions.FLAGS.MANAGE_CHANNELS],
                botPerms: [Permissions.FLAGS.MANAGE_CHANNELS],
                requirements: {
                    guildOnly: true,
                },
                disabled: false,
                cooldown: 5,
                category: "Moderation",
                slash: false,
            },
            client
        );
    }

    async execute({ message }, t) {
        const { channel, guild } = message;
        const result = await this.unlockChannel(channel, guild);
        await message.channel.send(t(result));
    }

    async run({ interaction }, t) {
        const { channel, guild } = interaction;
        const result = await this.unlockChannel(channel, guild);
        await interaction.followUp(t(result));
    }

    async unlockChannel(channel, guild) {
        if (!channel.permissionOverwrites.cache.get(this.client.user.id)) {
            await channel.permissionOverwrites.create(this.client.user.id, {
                SEND_MESSAGES: true,
            });
        }
        if (
            !channel.permissionOverwrites.cache
                .get(this.client.user.id)
                .allow.has(Permissions.FLAGS.SEND_MESSAGES)
        ) {
            await channel.permissionOverwrites.edit(this.client.user.id, {
                SEND_MESSAGES: true,
            });
        }
        if (!channel.permissionOverwrites.cache.get(guild.roles.everyone.id)) {
            await channel.permissionOverwrites.create(guild.roles.everyone.id, {
                SEND_MESSAGES: true,
            });
            return "cmds:unlock.unlocked";
        }
        if (
            channel.permissionOverwrites.cache
                .get(guild.roles.everyone.id)
                .allow.has(Permissions.FLAGS.SEND_MESSAGES)
        )
            return "cmds:unlock.already";
        await channel.permissionOverwrites.edit(guild.roles.everyone.id, {
            SEND_MESSAGES: true,
        });
        return "cmds:unlock.unlocked";
    }
};
