export const capitalizeFirstLetter = (string: string): string => {
    return string.charAt(0).toUpperCase() + string.slice(1);
};

export const cleanString = (string: string): string => string.replace(/[\n\t\s]/g, "");

export const java = (strings: TemplateStringsArray, ...values: unknown[]): string =>
    dedent(
        strings.reduce((result, str, i) => {
            const val = i < values.length ? values[i] : "";
            return result + str + val;
        }, "")
    );

export const kotlinString = (code: string): string => dedent(code);

export const dedent = (str: string): string => {
    const lines = str.split("\n");

    while (lines[0]?.trim() === "") lines.shift();
    while (lines[lines.length - 1]?.trim() === "") lines.pop();

    const indentLengths = lines.filter(line => line.trim() !== "").map(line => line.match(/^ */)![0].length);
    const minIndent = Math.min(...indentLengths);

    return lines.map(line => line.slice(minIndent)).join("\n");
};

export const areStringListsIdentical = (list1: string[], list2: string[]): boolean => {
    if (list1.length !== list2.length) return false;

    for (let i = 0; i < list1.length; i++) {
        if (list1[i] !== list2[i]) return false;
    }

    return true;
};

export const removeDuplicates = (arr: string[]): string[] => {
    return Array.from(new Set(arr));
};

export const splitOnNewlines = (text: string): string[] => text.split(/\n+/);

export const isSpecialCharacter = (char: string): boolean => {
    if (char.length !== 1) {
        return false;
    }

    return /[^a-zA-Z0-9]/.test(char);
};

export const indentOf = (line: string): number => line.length - line.trimStart().length;
