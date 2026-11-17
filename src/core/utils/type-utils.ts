import { Serializable } from "../serialization.ts";

export type PartialWithRequired<T, K extends keyof T> = Partial<T> & { [P in K]-?: T[P] };

export type RecursivePartial<T> = {
    [P in keyof T]?: T[P] extends (infer U)[]
        ? RecursivePartial<U>[]
        : T[P] extends object | undefined
          ? RecursivePartial<T[P]>
          : T[P];
};

export type Result<T extends Record<string, unknown>, E> = (T & { error?: undefined }) | { error: E };

export const isDefined = <T>(value: T | undefined): value is T => {
    return value !== undefined;
};

export const isIterable = (value: Serializable): value is Iterable<Serializable> | AsyncIterable<Serializable> =>
    typeof value === "object" &&
    value !== null &&
    !Array.isArray(value) &&
    !(value instanceof Set) &&
    !(value instanceof Map) &&
    (Symbol.iterator in value || Symbol.asyncIterator in value);
