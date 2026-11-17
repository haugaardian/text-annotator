export type Index = number & { __brand: Index };

export const getNewIndex = (index: number): Index => index as Index;
