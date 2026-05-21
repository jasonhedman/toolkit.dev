import { inflateSync } from "node:zlib";

const MAX_CHUNKS_PER_FILE = 40;
const MAX_CHUNK_LENGTH = 1_200;
const CHUNK_OVERLAP = 160;

type IndexableFile = {
  name: string;
  contentType: string;
  arrayBuffer: ArrayBuffer;
};

export function getIndexableText(file: IndexableFile) {
  const metadataText = `File name: ${file.name}. MIME type: ${file.contentType}.`;

  if (file.contentType === "application/pdf") {
    const pdfText = extractPdfText(Buffer.from(file.arrayBuffer));
    return cleanText(`${metadataText}\n\n${pdfText}`);
  }

  if (file.contentType.startsWith("image/")) {
    return `${metadataText} Uploaded image. Use the file name and surrounding chat context when searching image uploads.`;
  }

  return metadataText;
}

export function chunkText(text: string) {
  const cleanedText = cleanText(text);

  if (!cleanedText) {
    return [];
  }

  const chunks: string[] = [];
  let start = 0;

  while (start < cleanedText.length && chunks.length < MAX_CHUNKS_PER_FILE) {
    let end = Math.min(start + MAX_CHUNK_LENGTH, cleanedText.length);

    if (end < cleanedText.length) {
      const lastSentenceBreak = Math.max(
        cleanedText.lastIndexOf(". ", end),
        cleanedText.lastIndexOf("? ", end),
        cleanedText.lastIndexOf("! ", end),
      );
      const lastWhitespace = cleanedText.lastIndexOf(" ", end);
      const preferredBreak =
        lastSentenceBreak > start + MAX_CHUNK_LENGTH * 0.55
          ? lastSentenceBreak + 1
          : lastWhitespace;

      if (preferredBreak > start + MAX_CHUNK_LENGTH * 0.55) {
        end = preferredBreak;
      }
    }

    chunks.push(cleanedText.slice(start, end).trim());

    if (end === cleanedText.length) {
      break;
    }

    start = Math.max(end - CHUNK_OVERLAP, start + 1);
  }

  return chunks.filter(Boolean);
}

function extractPdfText(buffer: Buffer) {
  const latin1 = buffer.toString("latin1");
  const parts: string[] = [];

  parts.push(...extractPdfTextOperators(latin1));

  const streamPattern = /stream\r?\n([\s\S]*?)\r?\nendstream/g;
  let match: RegExpExecArray | null;

  while ((match = streamPattern.exec(latin1))) {
    const rawStream = trimPdfStream(Buffer.from(match[1] ?? "", "latin1"));
    const dictionaryStart = Math.max(0, match.index - 700);
    const dictionary = latin1.slice(dictionaryStart, match.index);
    const streamBuffer = dictionary.includes("/FlateDecode")
      ? tryInflate(rawStream)
      : rawStream;

    if (streamBuffer) {
      parts.push(...extractPdfTextOperators(streamBuffer.toString("utf8")));
      parts.push(...extractPdfTextOperators(streamBuffer.toString("latin1")));
    }
  }

  return parts.join(" ");
}

function extractPdfTextOperators(source: string) {
  const parts: string[] = [];
  const literalPattern = /\((?:\\.|[^\\()])*\)/g;
  let match: RegExpExecArray | null;

  while ((match = literalPattern.exec(source))) {
    const literal = match[0];
    const decoded = decodePdfLiteral(literal.slice(1, -1));

    if (isReadableText(decoded)) {
      parts.push(decoded);
    }
  }

  return parts;
}

function decodePdfLiteral(value: string) {
  return value
    .replace(/\\([nrtbf()\\])/g, (_, escape: string) => {
      switch (escape) {
        case "n":
          return "\n";
        case "r":
          return "\r";
        case "t":
          return "\t";
        case "b":
          return "\b";
        case "f":
          return "\f";
        default:
          return escape;
      }
    })
    .replace(/\\([0-7]{1,3})/g, (_, octal: string) =>
      String.fromCharCode(Number.parseInt(octal, 8)),
    )
    .replace(/\\\r?\n/g, "");
}

function isReadableText(value: string) {
  const cleaned = cleanText(value);

  if (cleaned.length < 2) {
    return false;
  }

  const printableCharacters = cleaned.replace(/[^\x20-\x7E]/g, "").length;
  return printableCharacters / cleaned.length > 0.6;
}

function cleanText(value: string) {
  return value
    .replace(/\u0000/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

function trimPdfStream(buffer: Buffer) {
  let start = 0;
  let end = buffer.length;

  if (buffer[start] === 0x0d && buffer[start + 1] === 0x0a) {
    start += 2;
  } else if (buffer[start] === 0x0a) {
    start += 1;
  }

  if (buffer[end - 2] === 0x0d && buffer[end - 1] === 0x0a) {
    end -= 2;
  } else if (buffer[end - 1] === 0x0a) {
    end -= 1;
  }

  return buffer.subarray(start, end);
}

function tryInflate(buffer: Buffer) {
  try {
    return inflateSync(buffer);
  } catch {
    return null;
  }
}
