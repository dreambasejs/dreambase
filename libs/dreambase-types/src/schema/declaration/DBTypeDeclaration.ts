import { NativeTypeConstructor } from "../../native/NativeTypeConstructor.js";
import { DBTypeContainer } from "../DBTypeContainer.js";

export type DBTypeDeclaration = NativeTypeConstructor | DBTypeContainer<any>;
