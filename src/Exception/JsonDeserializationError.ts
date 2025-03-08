
export default class JsonDeserializationError extends Error {

    constructor(message?: string) {
        super(message ?? "Failed to deserialize JSON object.");
    }

}