export const removeDuplicates = (arr: string[]): string[] => {
  return Array.from(new Set(arr));
};

export const splitOnNewlines = (text: string): string[] => text.split(/\n+/);
