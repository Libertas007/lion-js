import { promises as fs } from "node:fs";
import { __registerIO } from "../main";

// Inject Node's native file system
__registerIO({
    readFile: async (path: string) => await fs.readFile(path, "utf-8"),
    // Node 18+ has native fetch, but you could inject node-fetch here if targeting Node 16 or older
});

export * from "../main";
