// src/node.ts
import { __registerIO } from "../main";

// Inject Bun's native high-performance file system
__registerIO({
    readFile: async (path: string) => await Bun.file(path).text(),
});

export * from "../main";
