import {Provider} from "incarnation";

export interface DreambaseConstructor {
  new<TSchema>(schema: TSchema): Dreambase<TSchema>;
}

export type Dreambase<TSchema> = {
  use(provider: Provider): void;
} & {[TableName in keyof TSchema]: Collection<InstanceType<TSchema[TableName]>>}

export const Dreambase: DreambaseConstructor = function<TSchema>(schema: TSchema) {

}