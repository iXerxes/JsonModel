import JsonConstructorParameter from "../JsonConstructorParameter";
import JsonConstructorParameterMap from "../JsonConstructorParameterMap";

/**
 * Thrown when trying to add a new {@link JsonConstructorParameter} to a {@link JsonConstructorParameterMap} using a name that has already been mapped.
 */
export default class DuplicateParameterError extends Error {

    /**
     * The map that the parameter was being added to.
     */
    public map: JsonConstructorParameterMap;

    /**
     * The parameter that was being added.
     */
    public parameter: JsonConstructorParameter;

    constructor(map: JsonConstructorParameterMap, param: JsonConstructorParameter, message?: string) {
        super(message ?? `Cannot map parameter: '${param.name}'; a parameter with this name already exists.`);
        this.map = map;
        this.parameter = param;
    }

}