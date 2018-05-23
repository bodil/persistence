export function stripGhciPrompt(buf: string): string {
  if (buf.match(/^[A-Za-z0-9.*]+> $/)) {
    return "";
  }
  return buf;
};

export function writeBuf(oldbuf: string, data: string, callback: (s: string) => void): string {
  let buf = oldbuf + data;
  let line;
  while ((line = buf.indexOf("\n")) >= 0) {
    const out = buf.slice(0, line);
    buf = buf.slice(line + 1);
    callback(out);
  }
  return buf;
};
