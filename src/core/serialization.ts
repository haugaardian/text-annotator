type DataType = "Set" | "Map";

type DataWithType = { __dataType__: DataType; value: object };

const reviver = (_: unknown, value: DataWithType): object => {
    if (value.__dataType__ === "Set") return new Set(value.value as object[]);
    if (value.__dataType__ === "Map") return new Map(value.value as [string, object][]);
    return value;
};

const replacer = (_: unknown, value: object): DataWithType | object => {
    if (value instanceof Set)
        return {
            __dataType__: "Set",
            value: [...value]
        };
    if (value instanceof Map)
        return {
            __dataType__: "Map",
            value: [...value]
        };
    return value;
};

export type Obj = string | object | undefined;

export const parse = <T>(obj: string): T => JSON.parse(obj, reviver);

export const stringify = (obj: Obj): string => JSON.stringify(obj, replacer);

export type Serializable = string | object | number | boolean | bigint;
