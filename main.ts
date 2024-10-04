import { analyzeText, parseText } from "./src/main";

parseText(`
    @schema {
    @definition {
        name: String,
        version: Integer,
        description: String,
        dependencies: Array<String>,
        env: Env,
    }

    @subschema Env {
        number: Integer,
        host: String,
        port: Integer,
        boolean: Boolean,
    }
}

@doc {
    name: "config",
    version: 1,
    description: "Configuration file for the application",
    dependencies: [
        "lios"
        "test"
    ],
    env: {
        number: 11,
        host: "localhost",
        port: 8080,
        boolean: true,
    },
}
    `);
