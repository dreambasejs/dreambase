import {
  Provider,
  LazyRef,
  include,
  Environment,
  inject,
  Middleware,
} from "incarnation";
import { Collection, DBStoreBinder, DBSchema } from "dreambase-types";
import { DreambaseSchema } from "./DreambaseSchema";

export interface DreambaseConstructor {
  new <TSchema extends DreambaseSchema>(schema: TSchema): Dreambase<TSchema>;
}

class _Dreambase<TSchema extends DreambaseSchema> {
  private _env = new Environment();
  private _tableMap: SchemaToCollectionSet<
    TSchema
  > = {} as SchemaToCollectionSet<TSchema>;
  private _entityToNameMap = new Map<new () => any, string>();
  readonly configuration: DBSchema;

  constructor(schema: TSchema) {
    for (const [tableName, Entity] of Object.entries(schema)) {
      if (typeof Entity === "function" && Entity.prototype) {
        this._entityToNameMap.set(Entity, tableName);
        this[tableName] = this._tableMap[tableName as keyof TSchema] = LazyRef(
          createIncarnator(Entity, this._env)
        );
      }
    }
    const entityToNameMap = this._entityToNameMap;
    const configuration: DBSchema = {
      collections: Object.entries(schema).map(([name, EntityClass]) => ({
        name,
        CollectionClass: Collection.of(EntityClass),
        EntityClass,
        fields: null, // TODO: FIXTHIS: Instanciate EntityClass in a context to get its schema.
      })),
    };
    this._env.add(
      new Middleware(
        DBStoreBinder,
        (Super) =>
          class extends Super {
            getName(Entity: new () => any) {
              return entityToNameMap.get(Entity) || super.getName(Entity);
            }
            getDatabaseConfig(Entity: new () => any) {
              return entityToNameMap.has(Entity)
                ? configuration
                : super.getDatabaseConfig(Entity);
            }
          }
      )
    );
  }

  /** Get Collection instance by name.
   *
   * @param collectionName Name of the collection to get.
   */
  collection<TCollectionName extends keyof TSchema>(
    collectionName: TCollectionName
  ): Collection<InstanceType<TSchema[TCollectionName]>> {
    return this._tableMap[collectionName];
  }

  use(...providers: Provider[]): this {
    this._env.add(...providers);
    return this;
  }
}

// Keep this as a sample for how to filter props. Use it from Pick or whatever...
/*type SchemaToCollectionKeys<TSchema> = {
  [P in keyof TSchema]: TSchema[P] extends new () => any ? P : never;
}[keyof TSchema];*/

type SchemaToCollectionSet<TSchema extends DreambaseSchema> = {
  [P in keyof TSchema]: Collection<InstanceType<TSchema[P]>>;
};

export type Dreambase<TSchema extends DreambaseSchema> = _Dreambase<TSchema> &
  SchemaToCollectionSet<TSchema>;

export const Dreambase: DreambaseConstructor = _Dreambase as DreambaseConstructor;

/*
var x = new Dreambase({
  foo: class Friend {
    name: string;
    age: number;
  },
  bar: class Apa {},
});
x.foo.toArray().then(x => x[0].name);
*/

function createIncarnator(
  Entity: new () => any,
  env: Environment
): () => Collection<any> {
  let lastContext = Object.create(null);
  let lastResult: Collection<any> = null!;
  return () =>
    env.context === lastContext
      ? lastResult
      : ((lastContext = env.context),
        (lastResult = inject(Collection.of(Entity), env)));
}
