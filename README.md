# Libertas Object Notation parser

This library can be used to parse text in `lion` format.

## Usage

```js
import { parseText, stringifyDocument } from "lion-parser";

const document = parseText('@doc {example: "example"}');

console.log(stringifyDocument(document));
```
