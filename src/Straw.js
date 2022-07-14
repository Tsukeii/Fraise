const fs = require("fs");
const { Client, Collection, Intents, Options } = require("discord.js");
const config = require("./config");
const util = require("util");
const packageJson = require(__dirname + "/../package.json");
const Logger = require("colors-logger");
const { Player } = require("discord-player");
const DBCache = require("./db/DBCache");

class WelcomeBot extends Client {
    constructor(opts) {
        super({
            intents: [
                Intents.FLAGS.GUILDS,
                Intents.FLAGS.GUILD_MEMBERS,
                //Intents.FLAGS.GUILD_BANS,
                Intents.FLAGS.GUILD_MESSAGES,
                Intents.FLAGS.GUILD_MESSAGE_REACTIONS,
                Intents.FLAGS.DIRECT_MESSAGES,
                Intents.FLAGS.DIRECT_MESSAGE_REACTIONS,
                Intents.FLAGS.GUILD_VOICE_STATES,
                //Intents.FLAGS.GUILD_PRESENCES,
            ],
            makeCache: Options.cacheWithLimits({
                MessageManager: 200,
            }),
            partials: ["CHANNEL"],
        });
        this.initialized = false;
        this.config = config;
        this.logger = new Logger();
        this.username = "Straw";
        this.db = new DBCache(this);
        this.guildSchema = require("./schema/guildSchema");
        //this.versionSchema = require("./schema/versionSchema");
        this.userSchema = require("./schema/userSchema");
        this.dashboard = require("./dashboard/app");
        this.dashboard.states = {};
        this.categories = [];
        this.customEmojis = require("./data/customEmojis.json");
        this.languages = new Collection();
        require("./locales/languages.json").forEach((lang) => {
            this.languages.set(lang.name, lang);
        });
        this.allPerms = require("./data/allPerms");
        this.shop = new Collection();
        const shop = require("./data/shop");
        for (let i = 0; i < shop.length; i++) {
            shop[i].ids.push(shop[i].name);
            this.shop.set(shop[i].name, shop[i]);
        }
        this.wait = util.promisify(setTimeout); // await client.wait(1000) - Wait 1 second
        this.package = packageJson;
        this.debug = opts?.debug || process.env.NODE_ENV === "development";
        this.debugLevel = opts?.debugLevel || process.env?.DEBUG_LEVEL || 0;
        if (!this.debug) this.debugLevel = -1;
        const ownersTags = [];
        (async (client) => {
            for (let i = 0; i < client.config.ownerIds.length; i++) {
                const user = await client.users.fetch(
                    client.config.ownerIds[i]
                );
                ownersTags.push(`${user?.tag}`);
            }
        })(this);
        this.ownersTags = ownersTags;
        const staffTags = [];
        (async (client) => {
            for (let i = 0; i < client.config.staffIds.length; i++) {
                const user = await client.users.fetch(
                    client.config.staffIds[i]
                );
                staffTags.push(`${user?.tag}`);
            }
        })(this);
        this.staffTags = staffTags;
        this.player = new Player(this, {
            leaveOnEmpty: false,
            leaveOnStop: true,
            enableLive: true,
        });
        if (!process.env.TEST_MODE) this.initialize();
    }

    /*loadCommand(commandPath, commandName) {
        const CMD = require(`${commandPath}/${commandName.replace(".js", "")}`);
        return this.setCmd(CMD);
    }*/

    async initialize() {
        this.addDbFuncs();
        if (this.debug) this.logger.log(`Loading Locales`);
        await require("./loaders/Locale")(this); //Locale loader is async, so load it seperately
        if (this.debug) this.logger.log(`Finished loading Locales`);
        ["Event", "Command"].forEach((f) => {
            if (this.debug) this.logger.log(`Loading ${f}s`);
            require(`./loaders/${f}`)(this);
            if (this.debug) this.logger.log(`Finished loading ${f}s`);
        });
        this.initialized = true;
        this.emit("initialized", this);
    }

    setCmd(CMD) {
        const command = new CMD(this);
        if (!command?.disabled) {
            this.commands.enabled.set(command.name, command);
        } else {
            this.commands.disabled.set(command.name, command);
        }
        return command;
    }

    setDebug(debug = true, level = 0) {
        this.debug = debug;
        this.debugLevel = level;
        return true;
    }

    findCMD(cmdName) {
        let cmd;
        let disabledCmd;
        try {
            cmd = this.commands.enabled.find(cmdName);
            disabledCmd = this.commands.disabled.find(cmdName);
        } catch (e) {
            if (!cmd && !disabledCmd) {
                throw new Error(
                    `Tried to find ${cmdName}, but it wasn't there in the commands.`
                );
                // eslint-disable-next-line no-unreachable
                return;
            }
        }
        return cmd.name ? cmd : disabledCmd;
    }

    addDbFuncs() {
        const dbFolder = __dirname + "/db/functions";
        const dbFuncs = fs.readdirSync(dbFolder);

        for (const folder of dbFuncs) {
            if (!folder.endsWith(".js")) {
                const dbFiles = fs
                    .readdirSync(`${dbFolder}/${folder}`)
                    .filter((file) => file.endsWith(".js"));
                this[`${folder}DbFuncs`] = {};
                for (const file of dbFiles) {
                    try {
                        const f = file.replace(".js", "");
                        this[`${folder}DbFuncs`][
                            f
                        ] = require(`${dbFolder}/${folder}/${f}`);
                    } catch (e) {
                        this.logger.log(`Error occurred when loading ${file}`);
                        console.error(e);
                        process.exit();
                    }
                }
            }
        }
    }
}

module.exports = Straw;
