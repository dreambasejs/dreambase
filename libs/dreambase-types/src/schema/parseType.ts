import { DBTypeStructure } from "./DBTypeStructure.js";
import { DBTypeSymbol } from "../symbols/DBTypeSymbol.js";
import { parseNativeTypeName } from "../native/parseNativeTypeName.js";
import { parseTypeMode } from "./parseTypeMode.js";
import { TypeOptions } from "../attributes/options/TypeOptions.js";
import { DBTypeContainer } from "./DBTypeContainer.js";

export function parseType(
  type: any,
  typeOptions?: TypeOptions<any>
): DBTypeStructure<any> {
  const hasSpecifiedDefault = typeOptions && "default" in typeOptions;
  const { default: givenDefault, nullable, ...typeSpecificOptions } =
    typeOptions || {};
  if (type && DBTypeSymbol in type) {
    // type is already in a structured format
    // Either fixed by inner indexed(), primaryKey() or type() attribute,
    // or is a dbtypes compatible type that has the typeName prop.
    const result = type[DBTypeSymbol];
    return hasSpecifiedDefault ? { ...result, default: givenDefault } : result;
  }
  const directTypeString = parseNativeTypeName(type);
  if (directTypeString) {
    return {
      type: directTypeString.typeName,
      ctor: type as Function,
      default: hasSpecifiedDefault
        ? givenDefault
        : nullable
        ? null
        : directTypeString.default,
      typeSpecificOptions,
    };
  }
  if (typeof type === "function" && type.prototype) {
    // Could be a class constructor.
    const parentTypeMode = parseTypeMode.on;
    try {
      const result: DBTypeStructure<any> = {
        ctor: type,
        default: null, //new type(),
        type: type.name,
        typeSpecificOptions,
      };
      parseTypeMode.on = true;
      // phase 1: instanciation:
      // Here, since activeType is truthy,
      // parseType() is called recursively for each declared field.
      // The declInstance will contain the structure of all declared props.
      // For POJOs, arrays and plain values, they will need to be converted
      // to DBTypeStructures afterwards.
      const declInstance = new type();
      // phase 2: proptype inspection
      parseTypeMode.on = false; // To retrieve instance as a default value.
      result.default = hasSpecifiedDefault
        ? givenDefault
        : nullable
        ? null
        : new type();
      const properties = parsePropertyDeclarations(declInstance);
      result.properties = properties;
      result.declInstance = declInstance;
      return result;
    } finally {
      parseTypeMode.on = parentTypeMode;
    }
  } else if (parseTypeMode.on) {
    // TODO: Support Object: See above impl. Move here?
    //  Array: Specially! See "TODO: FIXTHIS above . Serach for Array.isArray. Should be done here!"
    //  strings, numbers, booleans: Let them declare directly. Don't allow any type.
    if (type && type.constructor === Object) {
      const properties: { [prop: string]: DBTypeStructure<any> } = {};
      const deflt = {};
      for (const prop of Object.keys(type)) {
        const typeInfo = parseType(type[prop]);
        properties[prop] = typeInfo;
        deflt[prop] = typeInfo.default;
      }
      return {
        type: "structure",
        properties,
        ctor: Object,
        default: deflt,
      };
    }
  }
  // TODO: Remove this code below as we allow plain values, arrays and objects!
  if (parseTypeMode.on) {
    // When parsing. Never accept plain values TODO: OR SHOULD WE?!
    throw new Error("Invalid type was given: " + type);
  }
  // When instanciating from application code, let caller (Type() etc...) successfully forward the default.
  return {
    type: "resolved",
    properties: {},
    ctor: type?.prototype?.constructor,
    default: type as any,
  };
}

function parsePojoObject(obj: object): DBTypeStructure<unknown> {
  return {
    type: "structure",
    properties: parsePropertyDeclarations(obj),
    ctor: Object,
    default: {},
  };
}

function parsePropertyDeclarations(
  obj: object
): { [propName: string]: DBTypeStructure<any> } {
  const properties = {};
  for (const [propName, propVal] of Object.entries(obj)) {
    let resultProp: DBTypeStructure<any>;
    if (typeof propVal === "object" && propVal) {
      const propType = propVal[DBTypeSymbol] as DBTypeStructure<any>;
      if (propType) {
        resultProp = { ...propType };
      } else if (propVal.constructor === Object) {
        resultProp = parsePojoObject(propVal);
      } else if (propVal.constructor === Array) {
        resultProp = errorType(`Use ArrayOf() to declare array properties."`);
      } else {
        resultProp = errorType(
          `Use Type(${
            propVal.constructor?.name ?? "RequestedClass"
          }) to declare object properties of that class."`
        );
      }
    } else if (typeof propVal === "string") {
      resultProp = parseType(String, { default: propVal });
    } else if (typeof propVal === "number") {
      resultProp = parseType(Number, { default: propVal });
    } else if (typeof propVal === "boolean") {
      resultProp = parseType(Boolean, { default: propVal });
    } else if (typeof propVal === "bigint") {
      resultProp = parseType(BigInt, { default: propVal });
    } else {
      resultProp = errorType(
        `For all types but strings, numbers, booleans, arrays, objects and bigints, you must declare fields using Type(), ArrayOf(), Indexed(), PrimaryKey(), etc.`
      );
    }
    properties[propName] = resultProp;
  }
  return properties;
}

/*function parseArrayDeclaration(
  items: [DBTypeContainer<any>] | any[]
): DBTypeStructure<any[]> {
  const result: DBTypeStructure<any[]> = {
    ctor: Array,
    default: [],
    type: "array",
  };
  const propVal = items.length === 1 && items[0];
  const propType = propVal?.[DBTypeSymbol] as DBTypeStructure<any>;
  if (propType) {
    result.item = propType;
  } else if (propVal.constructor === Object) {
    // Öh Uouuh! Vi kan inte låta Type(Number) vara iterable!!!
    return errorType(
      `Declare array of objects like this: [...Type({foo: Type(String)})]`
    );
  } else if (propVal.constructor === Array) {
    return errorType(
      `Declare nested arrays like this: [...Type([...Type(String)])]`
    );
  } else {
    return errorType(`Arrays must be declared as [...Type(...)]`);
  }
  return result;
}*/

function errorType(errMsg: string): DBTypeStructure<any> {
  return {
    type: "error",
    ctor: TypeError,
    default: errMsg,
  };
}

export function finalizeType(type: DBTypeStructure<any>, keyPath = "") {
  if (!type.properties) return;
  if (type.declInstance) {
    // Make keypaths for compoundGetters
    populateDeclInstance(type.declInstance, type.properties);
    delete type.declInstance;
  }
  for (const [propName, propVal] of Object.entries(type.properties)) {
    propVal.indexes?.forEach?.((idx) => {
      const compoundKeys = idx.compoundGetters?.map?.((fn) => {
        const propContainer = fn();
        return propContainer?.[DBTypeSymbol] || propContainer;
      });
      if (compoundKeys) idx.compoundKeys = compoundKeys;
      delete idx.compoundGetters;
    });
    propVal.keyPath = keyPath + propName;
    propVal.parent = type;
    if (propVal.properties) {
      finalizeType(propVal, keyPath + propName + ".");
    } else if (propVal.item) {
      propVal.item.keyPath = keyPath + propName; // Do it the IndexedDB way.
      propVal.item.parent = propVal;
      if (propVal.item.properties) {
        finalizeType(propVal.item, keyPath + propName + "[].");
      }
    }
  }
}

function populateDeclInstance(
  declInstance: object,
  properties: { [propName: string]: DBTypeStructure<any> }
) {
  for (const [propName, typeDef] of Object.entries(properties)) {
    declInstance[propName] = { [DBTypeSymbol]: typeDef };
    if (typeDef.properties) {
      populateDeclInstance(declInstance[propName], typeDef.properties);
    }
  }
}
