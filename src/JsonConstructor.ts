import DuplicateJsonConstructorParameterError from "./Exception/DuplicateJsonConstructorParameterError";
import DuplicateParameterError from "./Exception/DuplicateParameterError";
import JsonConstructorParameter from "./JsonConstructorParameter";
import JsonConstructorParameterMap from "./JsonConstructorParameterMap";
import JsonModel, { TNewableJsonModel } from "./JsonModel";

export type TJsonConstructor = (...args: any[]) => JsonModel;

export default class JsonConstructor {

    public readonly model: TNewableJsonModel<JsonModel>;
    /**
     * The callback method that creates the new {@link JsonModel} instance.
     */
    public readonly callback: TJsonConstructor;

    /**
     * The parameters of this constructor.
     */
    public readonly parameters: JsonConstructorParameterMap = new JsonConstructorParameterMap();

    /**
     * 
     * @param callback The callback method that creates the new {@link JsonModel} instance.
     */
    constructor(model: TNewableJsonModel<JsonModel>, callback: TJsonConstructor) {
        this.model = model;
        this.callback = callback;
    }

    /**
     * Add a new parameter to this constructor.
     */
    public addParameter(...args: ConstructorParameters<typeof JsonConstructorParameter>) {
        try {
            this.parameters.add(...args);
            // console.log(`Added ${this.parameters.get(args[0])?.isOptional ? "optional" : "required"} parameter '${args[1]}' to model '${this.model.name}' | Converter: ${args[3] ? (args[3] as { name: string })['name'] : "None"}`);
        } catch (ex) {
            if (ex instanceof DuplicateParameterError) {
                throw new DuplicateJsonConstructorParameterError(this, ex.parameter);
            }
            throw ex;
        }
    }

}