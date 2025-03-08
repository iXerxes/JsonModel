import JsonConstructor from "../JsonConstructor";
import JsonConstructorParameter from "../JsonConstructorParameter";
import DuplicateParameterError from "./DuplicateParameterError";

export default class DuplicateJsonConstructorParameterError extends DuplicateParameterError {

    /**
     * The {@link JsonConstructor} that the parameter was being added to.
     */
    public jsonConstructor: JsonConstructor;

    constructor(jsonConstructor: JsonConstructor, param: JsonConstructorParameter) {
        super(jsonConstructor.parameters, param, `Cannot add parameter '${param.name}' to model '${jsonConstructor.model.name}'; parameter name already exists.'`);
        this.jsonConstructor = jsonConstructor;
    }

}