import { Temporal } from "temporal-polyfill";
import IlegalUndefinedDeserializationError from "./Exception/IlegalUndefinedDeserializationError";
import MissingJsonConstructorError from "./Exception/MissingJsonConstructorError";
import MissingJsonConstructorParameterError from "./Exception/MissingJsonConstructorParameterError";
import JsonConstructor from "./JsonConstructor";
import JsonConstructorParameter, { TJsonParameterArgConverter } from "./JsonConstructorParameter";
import { TNewableJsonConverter } from "./JsonConverter";

export type TNewableJsonModel<T extends JsonModel> = new (...args: any[]) => T;

const ISO8601_UTC_PATTERN = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d+)?Z$/;

export default abstract class JsonModel {

    //
    // -- Decorator functionality.
    //

    private static readonly _modelConstructorMap = new Map<TNewableJsonModel<any>, JsonConstructor>();

    private static _jsonParam(model: TNewableJsonModel<any>, constructorMethodName: string, paramIndex: number, name: string, isOptional: boolean, converter?: TJsonParameterArgConverter<any>) {
        
        let modelConstructor = JsonModel._modelConstructorMap.get(model);

        // If it hasn't already been mapped, map a new json constructor to the model.
        if (modelConstructor === undefined) {
            const callback = model[constructorMethodName as keyof TNewableJsonModel<any>];
            modelConstructor = new JsonConstructor(model, callback);
            JsonModel._modelConstructorMap.set(model, modelConstructor);
        }

        modelConstructor.addParameter(paramIndex, name, isOptional, converter);
    }

    /**
     * Register a required parameter for this constructor.  
     * @param name The name of this parameter.
     * @param converter An optional converter.
     */
    protected static jsonParam(name: string, converter?: TJsonParameterArgConverter<any>) {
        return function<T>(model: T extends TNewableJsonModel<any> ? T : "⚠ Make sure the method is static, you idiot ⚠", constructorMethodName: string, paramIndex: number) {
            JsonModel._jsonParam.apply(model, [model as TNewableJsonModel<any>, constructorMethodName, paramIndex, name, false, converter]); // Make sure 'this' is bound to the model it was called from.
        }
    }

    /**
     * Register an optional parameter for this constructor.  
     * If missing upon deserialization, the value will be set as null.
     * @param name The name of this parameter.
     * @param converter An optional converter.
     */
    protected static jsonOptParam(name: string, converter?: TJsonParameterArgConverter<any>) {
        return function<T>(model: T extends TNewableJsonModel<any> ? T : "⚠ Make sure the method is static, you idiot ⚠", constructorMethodName: string, paramIndex: number) {
            JsonModel._jsonParam.apply(model, [model as TNewableJsonModel<any>, constructorMethodName, paramIndex, name, true, converter]); // Make sure 'this' is bound to the model it was called from.
        }
    }


    //
    // -- --
    //

    /**
     * Key/values from a JSON object that were not required arguments to construct a new instance of a specified {@link JsonModel}..
     */
    public looseValues?: Map<string, any>;

    /**
     * Attempt to deserialize the specified JSON string/object into the an extending type of {@link JsonModel}.
     * @param jsonObject The JSON string/object to deserialize.
     * 
     * @throws  
     * - `MissingJsonConstructorError`: if there Is no json constructor registered for the target model.
     * - `MissingJsonConstructorParameterError`: If the given JSON object doesn't contain a required property to construct a new instance.
     * - `IlegalUndefinedDeserializationError`: If the parameter's converter returned undefined.
     * 
     * @returns a new instance of the deserialized object.
     */
    public static deserializeFrom<T extends JsonModel>(this: TNewableJsonModel<T>, jsonObject: string | { [key: number | string]: any }): T {
        if (!(this.prototype instanceof JsonModel) || this.prototype === JsonModel) throw new Error("You can only deserialize an object into an extending type of JsonModel.");
        jsonObject = ((typeof(jsonObject) === 'string') ? JSON.parse(jsonObject) : jsonObject) as { [key: string]: any };

        const model = this;
        const modelConstructor = JsonModel._modelConstructorMap.get(model);

        if (modelConstructor === undefined || modelConstructor?.callback === undefined) throw new MissingJsonConstructorError(model);

        const params = modelConstructor.parameters;
        const paramValues = [];
        const looseValues = new Map<string, any>()

        // Separate the constructor's parameter values from the extra, unwanted values.
        for (const key of Object.keys(jsonObject)) {
            const paramIndex = params.get(key)?.index;
            if (paramIndex !== undefined) {
                paramValues[paramIndex] = jsonObject[key];
            } else {
                looseValues.set(key, jsonObject[key])
            }
        }

        // Make sure the object has the required parameter values before processing them.
        for (let paramIndex = 0; paramIndex < params.size; paramIndex++) {
            const param = params.get(paramIndex) as JsonConstructorParameter;
            if (!param.isOptional && paramValues[paramIndex] === undefined) throw new MissingJsonConstructorParameterError(model, param);
        }

        // Process the parameter values
        for (let paramIndex = 0; paramIndex < params.size; paramIndex++) {
            const param = params.get(paramIndex) as JsonConstructorParameter;
            const value: any = paramValues[paramIndex];


            // If the value is undefined, but the parameter has a converter type of JsonConverter, 
            // set the value to the result of the converter; otherwise set the value to null.
            // if (value === undefined) {
            //     if (param.converter && param.converter.prototype instanceof JsonConverter) {
            //         const converterInstance = new (param.converter as TNewableJsonConverter<any>)();
            //         if (converterInstance.canConvert(value) && converterInstance.canDeserialize()) paramValues[paramIndex] = converterInstance.deserialize(param.name, value);
            //     } else {
            //         paramValues[paramIndex] = null;
            //     }
            //     continue;
            // }
            // TODO: I don't think this block is necessary


            // Process the value using the parameter's converter if one exists.
            if (value !== undefined && param.converter !== undefined)  {
                let newValue;

                if (param.converter.prototype instanceof JsonModel && value !== null) { // Cannot convert null into an instance of JsonModel
                    try {
                        newValue = (param.converter as TNewableJsonConverter<any> & typeof JsonModel).deserializeFrom(value);
                    } catch (ex) {
                        if (ex instanceof IlegalUndefinedDeserializationError) throw new IlegalUndefinedDeserializationError(modelConstructor, param, param.converter, ex); // Rebuild the error to show the nested path to the value that was deserialized.
                        throw ex;
                    }
                } else {
                    try {
                        const converterInstance = new (param.converter as TNewableJsonConverter<any>)();
                        if (converterInstance.canConvert(value) && converterInstance.canDeserialize()) newValue = converterInstance.deserialize(param.name, value);
                    } catch (ex) {
                        if (ex instanceof IlegalUndefinedDeserializationError) throw new IlegalUndefinedDeserializationError(modelConstructor, param, param.converter, ex); // Rebuild the error to show the nested path to the value that was deserialized.
                        throw ex;
                    }
                }

                if (!param.isOptional && newValue === undefined) throw new IlegalUndefinedDeserializationError(modelConstructor, param, param.converter); // The parameter was required and the converter resulted in undefined.
                paramValues[paramIndex] = newValue;

            // If the parameter doesn't have a converter, process some common data types.
            } else {

                // Parse date/time strings - ISO 8601 UTC
                if (typeof(value) === 'string') {
                    if (value.match(ISO8601_UTC_PATTERN)) {
                        try {
                            const time = Temporal.Instant.from(value);
                            paramValues[paramIndex] = time;
                        } catch (ex) {}
                    }
                }

            }

        }

        const result =  modelConstructor.callback(...paramValues);
        result.looseValues = looseValues;
        return result as T;
    }


}