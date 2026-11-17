# text-annotator

Annotates plain text by detecting and labeling segments such as headers, URLs, file paths, attachment references, and list items.

## Usage

```ts
import { getAnnotatedText } from "text-annotator";

const result = getAnnotatedText(`
Project update

Here are the deliverables:
1. See report.pdf for details
2. Check https://example.com for the latest build
3. The config lives at /etc/app/config.txt
`);

for (const segment of result.segments) {
  const text = result.srcText.substring(segment.interval.start, segment.interval.end);
  console.log(segment.type, text);
}
```

Example output:

```
Set { 'header' }              Project update
Set { 'header', 'listLeadIn' } Here are the deliverables:
Set { 'listItem' }             1. See report.pdf for details
Set { 'listItem' }             2. Check https://example.com for the latest build
Set { 'url' }                  https://example.com
Set { 'listItem' }             3. The config lives at /etc/app/config.txt
Set { 'path' }                 /etc/app/config.txt
```

Segments can have multiple types (e.g. a list item that also contains a URL). Overlapping segments are preserved so you can layer annotations.
