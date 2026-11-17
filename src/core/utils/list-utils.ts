export type Index = number & { __brand: Index };

export const getNewIndex = (index: number): Index => index as Index;

export const getIndexes = <T>(list: T[], indexes: Index[]): T[] => {
    const result: T[] = [];
    for (const index of indexes) {
        if (index < 0 || index > list.length - 1) throw new Error("Index " + index + " is not in list");
        result.push(list[index]);
    }
    return result;
};

export const keepFirstOfIdentical = <T>(items: T[], isEqual: (a: T, b: T) => boolean): T[] => {
    const result: T[] = [];
    for (const item of items) {
        const exists = result.some(existing => isEqual(item, existing));
        if (!exists) {
            result.push(item);
        }
    }
    return result;
};

export const keepLastOfIdentical = <T>(items: T[], isEqual: (a: T, b: T) => boolean): T[] => {
    const result: T[] = [];

    for (let i = items.length - 1; i >= 0; i--) {
        const item = items[i];
        const exists = result.some(existing => isEqual(item, existing));
        if (!exists) {
            result.unshift(item);
        }
    }

    return result;
};

export const hasAllUniqueValues = <T>(values: T[]): boolean => {
    return new Set(values).size === values.length;
};

export const isLaterInList =
    <T>(list: T[]) =>
    (maybeLater: T, than: T): boolean => {
        const baseIndex = list.indexOf(maybeLater);
        const candidateIndex = list.indexOf(than);
        if (baseIndex === -1 || candidateIndex === -1) return false;

        return candidateIndex < baseIndex;
    };

export const range = (l: number): number[] => {
    const r: number[] = [];
    for (let i = 0; i < l; i++) {
        r.push(i);
    }
    return r;
};
