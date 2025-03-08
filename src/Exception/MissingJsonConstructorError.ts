import { TNewableJsonModel } from "../JsonModel";

export default class MissingJsonConstructorError extends Error {

    public model: TNewableJsonModel<any>;

    constructor(model: TNewableJsonModel<any>) {
        super(`No json constructor found for model '${model.name}'; deserialization failed.`);
        this.model = model;
    }

}