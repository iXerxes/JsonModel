# JsonModel
My own crude, simplified, and half-cooked version of C# Newtonsoft.Json. Written in Typescript using the experimental parameter decorators feature

---

### Create a new class that extends `JsonModel`, and create a static method to serve as the JsonConstructor.

```ts
import JsonModel from "./JsonModel";

export default class Person extends JsonModel {

    public name: string;
    public age: number;
    public parent?: Person;

    constructor(name: string, age: number, parent?: Person) {
        super();
        this.name = name;
        this.age = age;
        this.parent = parent;
    }

    public toString() {
        return this.name;
    }

    // JsonConstructor
    private static _Person(
        @Person.jsonParam('name') name: string, // Required
        @Person.jsonParam('age') age: number,
        @Person.jsonOptParam('parent', Person) parent: Person, // Optional & Deserialize the value into a type of Person
    )
    {
        return new Person(name, age, parent);
    }
}
```

### Deserialize an object into a new Person.

```ts

const simonObj = {
    name: "Simon",
    age: 10
}

const janeObj = {
    name: "Jane",
    age: 2,
    parent: {
        name: "John",
        age: 28
    }
}

const errorObj = {
    name: "NoName"
}


try {

    const simon = Person.deserializeFrom(simonObj);
    console.log(`Hello, I'm ${simon} and I'm ${simon.age} years old. My parent is ${simon.parent}.`);
    // Hello, I'm Simon and I'm 30 years old. My parent is undefined.

    const jane = Person.deserializeFrom(janeObj);
    console.log(`Hello, I'm ${jane} and I'm ${jane.age} years old. My parent is ${jane.parent} who is ${jane.parent?.age} years old.`);
    // Hello, I'm Jane and I'm 2 years old. My parent is John who is 28 years old.

    const error = Person.deserializeFrom(errorObj);
    // Failed to deserialize JSON object into 'Person'; missing required parameter value: 'age'.


} catch (ex) {
    console.error((ex as Error).message);
}

```

---

###  TODO: Add serialization
blah blah blah blah blah blah blah blah blah blah 