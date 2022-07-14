module.exports = {
    name: "rateLimit",
    once: false,
    execute(client, info) {
        client.logger.log("Votre débit est limité !", "warn");
        client.logger.log(JSON.stringify(info, null, 4), "warn");
    },
};
