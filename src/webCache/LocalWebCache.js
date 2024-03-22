const path = require("path");
const fs = require("fs");

const { WebCache, VersionResolveError } = require("./WebCache");

/**
 * LocalWebCache - Fetches a WhatsApp Web version from a local file store
 * @param {object} options - options
 * @param {string} options.path - Path to the directory where cached versions are saved, default is: "./.wwebjs_cache/"
 * @param {boolean} options.strict - If true, will throw an error if the requested version can't be fetched. If false, will resolve to the latest version.
 */
class LocalWebCache extends WebCache {
    constructor(options = {}) {
        super();

        this.path = options.path || "./.wwebjs_cache/";
        this.strict = options.strict || false;
    }

    async resolve(version) {
        const filePath = path.join(this.path, `${version}.html`);

        try {
            return fs.readFileSync(filePath, "utf-8");
        } catch (err) {
            if (this.strict)
                throw new VersionResolveError(
                    `Couldn't load version ${version} from the cache`
                );
            return null;
        }
    }

    // async persist(indexHtml) {
    //     // extract version from index (e.g. manifest-2.2206.9.json -> 2.2206.9)
    //     const version = indexHtml.match(/manifest-([\d\\.]+)\.json/)[1];
    //     if(!version) return;

    //     const filePath = path.join(this.path, `${version}.html`);
    //     fs.mkdirSync(this.path, { recursive: true });
    //     fs.writeFileSync(filePath, indexHtml);
    // }

    async persist(indexHtml) {
        // Extract version using a capturing group
        const match = indexHtml.match(/manifest-(\d+\.\d+\.\d+)\.json/);

        // Check for successful match and handle missing version gracefully
        if (!match) {
            console.warn(
                "Failed to extract version from indexHtml. Skipping cache persistence."
            );
            return;
        }

        const version = match[1]; // Access captured group
        const filePath = path.join(this.path, `${version}.html`);

        try {
            // Create directory if it doesn't exist with optional recursive option
            await fs.promises.mkdir(this.path, { recursive: true });
        } catch (err) {
            console.error("Error creating directory:", err);
            // Handle directory creation error appropriately (e.g., retry or log)
            return;
        }

        try {
            // Write the file asynchronously using promises
            await fs.promises.writeFile(filePath, indexHtml);
        } catch (err) {
            console.error("Error writing file:", err);
            // Handle file writing error appropriately (e.g., retry or log)
            return;
        }
    }
}

module.exports = LocalWebCache;
