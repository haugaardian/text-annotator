# text-annotator

Annotates plain text by detecting and labeling segments such as headers, URLs, file paths, attachment references, and list items.

## Usage

```ts
import { getAnnotatedText } from "text-annotator";

const result = getAnnotatedText(`
Project update

Here are the deliverables:
- See report.pdf for details
- Check https://example.com for the latest build
- The config lives at /etc/app/config.json
`);

for (const segment of result.segments) {
  console.log(segment.type, segment.text);
}
```

Example output:

```
Set { 'header' }   "Project update"
Set { 'listItem' } "See report.pdf for details"
Set { 'listItem' } "Check https://example.com for the latest build"
Set { 'url' }      "https://example.com"
Set { 'listItem' } "The config lives at /etc/app/config.json"
Set { 'path' }     "/etc/app/config.json"
```

Segments can have multiple types (e.g. a list item that also contains a URL). Overlapping segments are preserved so you can layer annotations.
