import JsonConstructorParameter from "../JsonConstructorParameter";
import { TNewableJsonModel } from "../JsonModel";
import JsonDeserializationError from "./JsonDeserializationError";

export default class MissingJsonConstructorParameterError extends JsonDeserializationError {

    public model: TNewableJsonModel<any>;
    public parameter: JsonConstructorParameter;

    constructor(model: TNewableJsonModel<any>, parameter: JsonConstructorParameter) {
        super(`Failed to deserialize JSON object into '${model.name}'; missing required parameter value: '${parameter.name}'.`);
        this.model = model;
        this.parameter = parameter;
    }

}