import http from "node:http";
import fs from "node:fs/promises";
import path from "node:path";
import { chromium } from "@playwright/test";

const rootDir = process.cwd();
const outputDir = path.join(rootDir, "assets", "docs");

const docs = [
  {
    slug: "capability-statement",
    page: "/capability-statement.html",
    output: "capability-statement.pdf",
    legacyCopy: path.join(rootDir, "capability-statement.pdf"),
  },
  {
    slug: "service-overview",
    page: "/service-overview.html",
    output: "service-overview.pdf",
  },
  {
    slug: "reference-architecture",
    page: "/reference-architecture.html",
    output: "reference-architecture.pdf",
  },
];

const contentTypes = new Map([
  [".html", "text/html; charset=utf-8"],
  [".css", "text/css; charset=utf-8"],
  [".js", "application/javascript; charset=utf-8"],
  [".json", "application/json; charset=utf-8"],
  [".png", "image/png"],
  [".jpg", "image/jpeg"],
  [".jpeg", "image/jpeg"],
  [".svg", "image/svg+xml"],
  [".pdf", "application/pdf"],
  [".txt", "text/plain; charset=utf-8"],
  [".xml", "application/xml; charset=utf-8"],
]);

function safePathname(urlPath) {
  const normalized = decodeURIComponent(urlPath.split("?")[0]);
  const requested = normalized === "/" ? "/index.html" : normalized;
  const resolved = path.join(rootDir, requested);
  if (!resolved.startsWith(rootDir)) {
    throw new Error(`Blocked path traversal for ${urlPath}`);
  }
  return resolved;
}

async function createServer() {
  const server = http.createServer(async (req, res) => {
    try {
      const filePath = safePathname(req.url || "/");
      const data = await fs.readFile(filePath);
      const ext = path.extname(filePath).toLowerCase();
      res.writeHead(200, { "Content-Type": contentTypes.get(ext) || "application/octet-stream" });
      res.end(data);
    } catch (error) {
      res.writeHead(404, { "Content-Type": "text/plain; charset=utf-8" });
      res.end("Not found");
    }
  });

  await new Promise((resolve) => server.listen(4173, "127.0.0.1", resolve));
  return server;
}

async function main() {
  await fs.mkdir(outputDir, { recursive: true });
  const server = await createServer();
  const browser = await chromium.launch();

  try {
    for (const doc of docs) {
      const page = await browser.newPage();
      await page.goto(`http://127.0.0.1:4173${doc.page}`, { waitUntil: "networkidle" });
      await page.pdf({
        path: path.join(outputDir, doc.output),
        format: "A4",
        margin: {
          top: "18mm",
          right: "14mm",
          bottom: "18mm",
          left: "14mm",
        },
        printBackground: true,
      });
      await page.close();

      if (doc.legacyCopy) {
        await fs.copyFile(path.join(outputDir, doc.output), doc.legacyCopy);
      }
    }
  } finally {
    await browser.close();
    await new Promise((resolve, reject) => server.close((error) => (error ? reject(error) : resolve())));
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
