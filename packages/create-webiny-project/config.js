const os = require("os");
const path = require("path");
const readJson = require("load-json-file");
const writeJson = require("write-json-file");

const configPath = path.join(os.homedir(), ".webiny", "config");

const verifyConfig = async () => {
    // Check user ID
    try {
        const config = await readJson(configPath);
        if (!config.id) {
            throw Error("Invalid Webiny config!");
        }
    } catch (e) {
        const publicIp = require("public-ip");
        // A new config file is written if it doesn't exist or is invalid.
        writeJson.sync(configPath, { id: await publicIp.v4() });
    }
};

module.exports = { verifyConfig };
