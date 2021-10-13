/**
 * Discord Welcome-Bot
 * Copyright (c) 2021 The Welcome-Bot Team and Contributors
 * Licensed under Lesser General Public License v2.1 (LGPl-2.1 - https://opensource.org/licenses/lgpl-2.1.php)
 */
const Embed = require("../classes/Embed");
const { Collection } = require("discord.js");
module.exports = class CodesManager {
    #codesInfo;
    constructor(client) {
        this.client = client;
        this.#codesInfo = new Collection();
        this.refresh();
        setInterval(() => this.refresh(), 1 * 60 * 60 * 1000); //Every hour
    }

    async refresh() {
        const codes = await this.client.models.Code.find({});
        for (let i = 0; i < codes.length; i++) {
            if (codes[i].expiresAt < Date.now()) {
                this.client.models.Code.findOneAndDelete({
                    code: codes[i].code,
                });
                const channel = await this.client.channels.fetch(
                    this.client.config.channels.codes
                );
                if (channel) {
                    const embed = new Embed({ color: "error", timestamp: true })
                        .setTitle("Premium code expired")
                        .setDesc(`Code: ${codes[i].code}`);
                    const user = await this.client.users.fetch(codes[i].usedBy);
                    if (user)
                        embed.setAuthor(user.tag, user.displayAvatarURL());
                    else embed.setAuthor("Unknown or Anonymous");
                    const guild = this.client.guilds.cache.get(
                        codes[i].guildId
                    );
                    if (guild) embed.setFooter(guild.name, guild.iconURL());
                    else embed.setFooter("Unknown guild. Maybe claimed in DMs");
                    channel.send({ embeds: [embed] });
                }
                continue;
            }
            this.#codesInfo.set(codes[i].code, codes[i]);
        }
        return codes;
    }

    async create(exdays = 30, user) {
        if (!user) throw new TypeError("user not provided");
        //exdays is the expire days
        const expiresAt = new Date();
        expiresAt.setTime(expiresAt.getTime() + exdays * 24 * 60 * 60 * 1000);
        let code = "";
        const length = 8;
        const characters =
            "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwzy0123456789.-_";
        for (let i = 0; i < length; i++) {
            code += characters.charAt(
                Math.floor(Math.random() * characters.length)
            );
        }
        const info = { expiresAt: expiresAt.getTime(), code, userId: user.id };
        const codeDB = new this.client.models.Code(info);
        await codeDB.save();
        this.#codesInfo.set(code, info);
        const channel = await this.client.channels.fetch(
            this.client.config.channels.codes
        );
        if (channel) {
            const embed = new Embed({ color: "success", timestamp: true })
                .setTitle("New premium code created")
                .setDesc(`Code: ${code}`)
                .addField("Expires", `${expiresAt}`, true);
            if (user) embed.setAuthor(user.tag, user.displayAvatarURL());
            else embed.setAuthor("Unknown or Anonymous");
            channel.send({ embeds: [embed] });
        }
        return info;
    }

    async use(code, user, guild = null) {
        if (!code || !user) throw new TypeError("code/user not provided");
        const info = this.#codesInfo.get(code);
        if (!info) return { error: "invalid" };
        if (info.used) return { error: "used" };
        const codeDB = await this.client.models.Code.findOne(info);
        codeDB.used = true;
        codeDB.usedBy = user.id;
        if (guild) codeDB.guildId = guild.id;
        await codeDB.save();
        this.#codesInfo.delete(info.code);
        this.#codesInfo.set(info.code, codeDB.toJSON());
        const channel = await this.client.channels.fetch(
            this.client.config.channels.codes
        );
        if (channel) {
            const embed = new Embed({ color: "red", timestamp: true })
                .setTitle("Premium code used")
                .setDesc(`Code: ${code}`)
                .addField("Expires", `${new Date(info.expiresAt)}`, true);
            if (user) embed.setAuthor(user.tag, user.displayAvatarURL());
            else embed.setAuthor("Unknown or Anonymous");
            if (guild) embed.setFooter(guild.name, guild.iconURL());
            else embed.setFooter("Unknown guild. Maybe claimed in DMs");
            channel.send({ embeds: [embed] });
        }
        return info;
    }

    getCode(code) {
        return this.#codesInfo.get(code);
    }

    get valid() {
        return this.#codesInfo;
    }

    get used() {
        return this.#codesInfo.filter((c) => c.used);
    }

    get notUsed() {
        return this.#codesInfo.filter((c) => !c.used);
    }
};