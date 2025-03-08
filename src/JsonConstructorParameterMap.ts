import DuplicateParameterError from "./Exception/DuplicateParameterError";
import JsonConstructorParameter from "./JsonConstructorParameter";

export default class JsonConstructorParameterMap {

    private _store = new Map<number, JsonConstructorParameter>();
    private _names = new Set<string>(); // A set of extisting parameter names.

    /**
     * Get the number of parameters this map holds.
     */
    public get size() {
        return this._store.size;
    }

    /**
     * Add a new parameter to this map.
     */
    public add(...args: ConstructorParameters<typeof JsonConstructorParameter>) {
        const newParam = new JsonConstructorParameter(...args);

        if (this._names.has(newParam.name)) throw new DuplicateParameterError(this, newParam);

        this._store = new Map(...[this._store.set(newParam.index, newParam).entries()].sort());
        this._names.add(newParam.name);
    }

    /**
     * Check whether this map contains a parameter by the specified name.
     * @param name The name of the parameter to check.
     * @returns true of this map contains a parameter by the specified name; false if otherwise.
     */
    public has(name: string): boolean;
    /**
     * Check whether or not this map contains the specified parameter.
     * @param param The parameter to check for.
     * @returns true of this map contains the specified parameter; false if otherwise.
     */
    public has(param: JsonConstructorParameter): boolean;
    public has(nameOrParam: string | JsonConstructorParameter) {
        if (nameOrParam instanceof JsonConstructorParameter) {
            for (const param of this._store.values()) if (nameOrParam === param) return true;
        } else {
            for (const param of this._store.values()) if (nameOrParam === param.name) return true;
        }
        return false;
    }

    /**
     * Get a parameter from this map by it's index.
     * @param index The parameter index.
     * @returns the parameter if it exists; undefined if otherwise.
     */
    public get(index: number): undefined | JsonConstructorParameter;
    /**
     * Get a parameter from this map by it's name.
     * @param name The parameter name.
     * @returns the parameter if it exists; undefined if otherwise.
     */
    public get(name: string): undefined | JsonConstructorParameter;
    public get(indexOrName: number | string): undefined | JsonConstructorParameter {
        if (typeof(indexOrName) === 'number') return this._store.get(indexOrName);
        for (const param of this._store.values()) if (indexOrName === param.name) return param;
        return undefined;
    }

}