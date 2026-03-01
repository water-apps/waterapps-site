const http = require("node:http");
const fs = require("node:fs");
const path = require("node:path");

const CONTENT_TYPES = {
    ".css": "text/css; charset=utf-8",
    ".gif": "image/gif",
    ".html": "text/html; charset=utf-8",
    ".ico": "image/x-icon",
    ".jpeg": "image/jpeg",
    ".jpg": "image/jpeg",
    ".js": "application/javascript; charset=utf-8",
    ".json": "application/json; charset=utf-8",
    ".png": "image/png",
    ".svg": "image/svg+xml",
    ".txt": "text/plain; charset=utf-8",
    ".webp": "image/webp",
    ".xml": "application/xml; charset=utf-8"
};

function createStaticServer(rootDir) {
    return http.createServer((req, res) => {
        const urlPath = new URL(req.url, "http://127.0.0.1").pathname;
        const relativePath = urlPath === "/" ? "/index.html" : urlPath;
        const requestedPath = path.normalize(path.join(rootDir, relativePath));

        if (!requestedPath.startsWith(path.normalize(rootDir + path.sep))) {
            res.writeHead(403, { "Content-Type": "text/plain; charset=utf-8" });
            res.end("Forbidden");
            return;
        }

        fs.readFile(requestedPath, (error, data) => {
            if (error) {
                const statusCode = error.code === "ENOENT" ? 404 : 500;
                res.writeHead(statusCode, { "Content-Type": "text/plain; charset=utf-8" });
                res.end(statusCode === 404 ? "Not found" : "Internal server error");
                return;
            }

            const ext = path.extname(requestedPath).toLowerCase();
            const contentType = CONTENT_TYPES[ext] || "application/octet-stream";
            res.writeHead(200, { "Content-Type": contentType, "Cache-Control": "no-store" });
            res.end(data);
        });
    });
}

function startStaticServer(rootDir, preferredPort = 4173) {
    const server = createStaticServer(rootDir);
    return new Promise((resolve, reject) => {
        server.once("error", reject);
        server.listen(preferredPort, "127.0.0.1", () => {
            server.removeListener("error", reject);
            const address = server.address();
            resolve({
                server,
                baseUrl: `http://127.0.0.1:${address.port}`
            });
        });
    });
}

module.exports = {
    startStaticServer
};
