const fetch = require("node-fetch");
//eslint-disable-next-line no-unused-vars
const { Embed, Command } = require("../../classes");
module.exports = class CMD extends Command {
    constructor(client) {
        super(
            {
                name: "waifu",
                memberPerms: [],
                botPerms: [],
                disabled: false,
                cooldown: 5,
                category: "Anime",
            },
            client
        );
    }

    //eslint-disable-next-line no-unused-vars
    async execute({ message, args }, t) {
        const embed = new Embed();
        const type = message.channel.nsfw ? "nsfw" : "sfw"; //lewd if the channel is NSFW
        const { url } = await fetch(
            `https://waifu.pics/api/${type}/waifu`
        ).then((res) => res.json());
        embed.setImage(url);
        message.reply({ embeds: [embed] });
        return;
    }
};
