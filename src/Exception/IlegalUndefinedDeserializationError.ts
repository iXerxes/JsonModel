import JsonConstructor from "../JsonConstructor";
import JsonConstructorParameter, { TJsonParameterArgConverter } from "../JsonConstructorParameter";
import JsonDeserializationError from "./JsonDeserializationError";

function getPath(currentParameter: JsonConstructorParameter, inner: undefined | IlegalUndefinedDeserializationError): string {
    if (inner === undefined) return currentParameter.name;

    let pathNodes = [currentParameter.name];
    while (inner.inner !== undefined) {
        pathNodes.push(inner.currentParameter.name);
        inner = inner.inner;
    }

    return pathNodes.join('.');
}

export default class IlegalUndefinedDeserializationError extends JsonDeserializationError {

    /**
     * The json constructor used for deserialization.
     */
    public jsonConstructor: JsonConstructor;

    /**
     * The parameter for the value that failed deserialization.
     */
    public failedParameter: JsonConstructorParameter;

    /**
     * The property key this error has been thrown on. Used to determine the full path of the error when deserializing nested values.
     */
    public currentParameter: JsonConstructorParameter;

    /**
     * The converter that was used.
     */
    public converter: TJsonParameterArgConverter<any>;
    
    /**
     * The inner exception.
     */
    public inner?: IlegalUndefinedDeserializationError;

    constructor(jsonConstructor: JsonConstructor, parameter: JsonConstructorParameter, converter: TJsonParameterArgConverter<any>, inner?: IlegalUndefinedDeserializationError) {
        super(`Deserialized value of property '${getPath(parameter, inner)}' as type of ${converter.name} resulted in undefined, but it is required in model ${jsonConstructor.model}.`);
        this.jsonConstructor = jsonConstructor;
        this.failedParameter = inner ? inner.failedParameter : parameter;
        this.currentParameter = parameter;
        this.converter = converter;
        this.inner = inner;
    }

}