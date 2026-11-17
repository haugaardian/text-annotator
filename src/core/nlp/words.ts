export const getWords = (text: string): string[] => {
  const trimmed = text.trim();
  return trimmed === "" ? [] : trimmed.split(/\s+/);
};

export const containWords = (text: string): boolean =>
  getWords(text).length > 0;
