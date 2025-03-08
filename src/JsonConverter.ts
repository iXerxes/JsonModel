
interface IJsonConverter<T> {

    /**
     * Determines whether or not this converter can convert the given value type.
     * @param value The value to convert.
     */
    canConvert(value: any): boolean;

    /**
     * Whether or not this converter can deserialize the given value type.
     */
    canDeserialize(): boolean;

    /**
     * Whether or not this converter can serialize the given value type.
     */
    canSerialize(): boolean;

    /**
     * A custom deserializer for the given value.
     * @param key The key index of this value in an object.
     * @param value The value to be converted to the desired type.
     */
    deserialize(key: undefined | string, value: any): T;

    // TODO: Add the serialization method.

}

export type TNewableJsonConverter<T extends JsonConverter<unknown>> = new (...args: any[]) => T;

export default abstract class JsonConverter<T> implements IJsonConverter<T> {
    private _x: number = 0;

    abstract canConvert(value: any): boolean;
    abstract canDeserialize(): boolean;
    abstract canSerialize(): boolean;
    abstract deserialize(key: undefined | string, value: any): T;
    
}