import JsonConverter, { TNewableJsonConverter } from "./JsonConverter";
import JsonModel, { TNewableJsonModel } from "./JsonModel";

export type TJsonParameterArgConverter<T extends JsonModel | JsonConverter<any>> = T extends JsonModel ? TNewableJsonModel<T> : (T extends JsonConverter<any> ? TNewableJsonConverter<T> : never);

export default class JsonConstructorParameter {

    /**
     * The numerical index used to determine the position of this parameter.
     */
    public readonly index: number;

    /**
     * The name of the parameter.  
     * This name is used as the property key to extract the value from a JSON object.
     */
    public readonly name: string;

    /**
     * Weather or not this parameter is optional.
     */
    public readonly isOptional: boolean;

    /**
     * The converter type used to convert the value to the desired type before binding it to the constructor parameter.  
     * Can be a type of {@link JsonConverter}, or a type of {@link JsonModel} that will be used to deserialise the value as a JSON object.
     * 
     */
    public readonly converter?: TJsonParameterArgConverter<any>;

    /**
     * Create a new {@link JsonConstructorParameter}.
     * @param index The numerical index used to determine the position of this parameter. 
     * @param name The name of the parameter.  
     * @param isOptional Weather or not this parameter is optional.
     * @param converter The converter type used to convert the value to the desired type before binding it to the constructor parameter.
     */
    constructor(index: number, name: string, isOptional: boolean = false, converter?: TJsonParameterArgConverter<any>) {
        this.index = index;
        this.name = name.trim(); // Prevent headaches by trimming.
        this.isOptional = isOptional;
        this.converter = converter;
    }

}