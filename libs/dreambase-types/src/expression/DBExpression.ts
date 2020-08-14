// TODO: Replace Expression.ts with this.
// Don't know if we need these exact typings or not.
// The important thing is the concrete generic typings in Collection.where()
// We are not there here. We are in DBStore.
// But ... it will be the same type, so maybe...
// If so, we should add generic to DBExpression to make it more restrictive.
export type DBExpression =
  | { [field: string]: any | DBOperator }
  | DBOrExpression
  | DBAndExpression
  | DBNotExpression;

export type DBOrExpression = {
  $or: DBExpression[];
};

export type DBAndExpression = {
  $and: DBExpression[];
};

export type DBNotExpression = {
  $not: DBExpression;
};

export type DBOperator = {
  $lt?: any;
  $lte?: any;
  $gt?: any;
  $gte?: any;
  $eq?: any;
  $in?: any[];
  $regex?: RegExp;
};
