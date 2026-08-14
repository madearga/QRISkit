import type { TLV } from "./types";

/** Structural tags that carry nested TLV children. */
function isNested(tag: string): boolean {
  const n = Number.parseInt(tag, 10);
  return (n >= 26 && n <= 51) || tag === "62";
}

/** Parse a flat TLV string into a list of elements. Structural tags get parsed children. */
export function parseTLV(input: string): TLV[] {
  const elements: TLV[] = [];
  let i = 0;
  while (i < input.length) {
    if (i + 4 > input.length) {
      throw new Error(
        `truncated TLV at offset ${i}: need tag+length (4 chars), have ${input.length - i}`,
      );
    }
    const tag = input.slice(i, i + 2);
    const length = Number.parseInt(input.slice(i + 2, i + 4), 10);
    if (Number.isNaN(length)) {
      throw new Error(`non-numeric length for tag ${tag} at offset ${i}`);
    }
    const valueStart = i + 4;
    const valueEnd = valueStart + length;
    if (valueEnd > input.length) {
      throw new Error(
        `truncated value for tag ${tag}: declared ${length}, remaining ${input.length - valueStart}`,
      );
    }
    const value = input.slice(valueStart, valueEnd);
    const children = isNested(tag) ? safeParse(value) : undefined;
    elements.push({ tag, length, value, children });
    i = valueEnd;
  }
  return elements;
}

function safeParse(value: string): TLV[] | undefined {
  // Not every nested-looking value is well-formed TLV; don't fail the whole parse.
  try {
    return parseTLV(value);
  } catch {
    return undefined;
  }
}

/** Rebuild a TLV string from elements (children take precedence over `value`). */
export function buildTLV(elements: TLV[]): string {
  return elements
    .map((el) => {
      const v = el.children ? buildTLV(el.children) : el.value;
      return `${el.tag}${v.length.toString().padStart(2, "0")}${v}`;
    })
    .join("");
}

/** Construct a flat TLV element. */
export function makeTLV(tag: string, value: string): TLV {
  return { tag, length: value.length, value };
}
