import { Region } from "./lexer";

/**
 * Represents an error specific to the Lion format.
 *
 * @remarks
 * This class is used to encapsulate error details including a message,
 * the region where the error occurred, and an optional description.
 *
 *
 * @public
 */
export class LionError {
    public message: string;
    public region: Region;
    public description: string = "";

    constructor(message: string, region: Region, description?: string) {
        this.message = message;
        this.region = region;
        this.description = description || "";
    }

    public toString(): string {
        if (this.description) {
            return `${this.message} at ${this.region.startLine}:${this.region.startCol}\n${this.description}`;
        }
        return `${this.message} at ${this.region.startLine}:${this.region.startCol}`;
    }

    public process() {
        throw new Error(this.toString());
    }
}

class LionErrorList {
    public errors: LionError[];
    public processWhenAdded: boolean = false;

    constructor(errors?: LionError[], processWhenAdded?: boolean) {
        this.errors = errors || [];
        this.processWhenAdded = processWhenAdded || false;
    }

    public addError(error: LionError) {
        this.errors.push(error);
        if (this.processWhenAdded) {
            this.process();
        }
    }

    public toString(): string {
        return this.errors.map((error) => error.toString()).join("\n");
    }

    public process() {
        if (this.errors.length > 0) {
            throw new Error(this.toString());
        }
    }
}

export let errors: LionErrorList = new LionErrorList();
