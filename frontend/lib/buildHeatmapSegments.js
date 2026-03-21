const escapeRegExp = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

export function buildHeatmapSegments(text, strongPhrases, weakPhrases) {
  if (!text) {
    return [];
  }

  const normalizedStrong = strongPhrases
    .filter(Boolean)
    .map((phrase) => ({ phrase, strength: "strong" }));
  const normalizedWeak = weakPhrases
    .filter(Boolean)
    .map((phrase) => ({ phrase, strength: "weak" }));

  const phrases = [...normalizedStrong, ...normalizedWeak].sort(
    (a, b) => b.phrase.length - a.phrase.length,
  );

  const occupied = new Array(text.length).fill(false);
  const matches = [];

  for (const { phrase, strength } of phrases) {
    const regex = new RegExp(escapeRegExp(phrase), "gi");
    let match = regex.exec(text);

    while (match) {
      const start = match.index;
      const end = start + match[0].length;

      let hasOverlap = false;
      for (let i = start; i < end; i += 1) {
        if (occupied[i]) {
          hasOverlap = true;
          break;
        }
      }

      if (!hasOverlap) {
        for (let i = start; i < end; i += 1) {
          occupied[i] = true;
        }
        matches.push({
          start,
          end,
          strength,
          content: text.slice(start, end),
        });
      }

      match = regex.exec(text);
    }
  }

  if (matches.length === 0) {
    return [{ content: text, strength: "plain" }];
  }

  matches.sort((a, b) => a.start - b.start);

  const segments = [];
  let cursor = 0;

  for (const item of matches) {
    if (item.start > cursor) {
      segments.push({
        content: text.slice(cursor, item.start),
        strength: "plain",
      });
    }
    segments.push({ content: item.content, strength: item.strength });
    cursor = item.end;
  }

  if (cursor < text.length) {
    segments.push({ content: text.slice(cursor), strength: "plain" });
  }

  return segments;
}
