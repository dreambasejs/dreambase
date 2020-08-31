Reference implementation (MemStorage)

```ts
db.use(new MemStorage());
```

[V] Create a MemStorage implementation skelleton
[V] Make sure Dreambase implements parts of the DBStoreBinder interface so that MemStorage can query it for getting type information from the entity class.
[V] Extend DBTypeStructure with comparers, primary key and indexes informtion
[V] Limit built-in types to string, number, boolean, bigint, Date, and Typed Arrays.
[V] Define comparers for all built-in types.
[V] Define comparer for entities (compare primary keys)
[V] Implement binary search algorithm for MemStorage.
[V] Complete the three mutation types of DBStore (insert, update, delete) (todo: add upsert mutation?)

Goal:

- Have a MemStorage reference implementation.
- Have example app that uses it
- Have some basic unit tests for it.

Missing:
[ ] Define new Expression based on mongo-style queries.
[ ] Expression examples (md files)
[ ] Define prettymongo expression format. What operators do we have? On which types?
[ ] Write typings for prettymongo expression.
[ ] Implement expression interpreter in MemStorage. Should this be refactored to be used from other libs?
[ ] Can TS compiler give nice compile errors when trying to use an operator that is not compatible with the field type?

Misc missing:
[ ] Function generator for primary key: To give a random value or so.
[ ] More react real-world examples.
[ ] Rollup-based build with minification for production builds.
[ ] Optimistic updaters for DBStore
[ ] Transaction stöd

Next step:

- Implement IDBStorage
- Docs and samples.
- Migrations
- Landing page
- Blog and story

Dreambase Cloud:

- SQLStorage
- PLV8Storage?
