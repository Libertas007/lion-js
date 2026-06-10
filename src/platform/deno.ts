import { __registerIO } from "../main";

// Inject Deno's native file system
__registerIO({
    readFile: async (path: string) => await Deno.readTextFile(path),
});

export * from "../main";
