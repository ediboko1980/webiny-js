import { ContextPlugin } from "@webiny/graphql/types";
import models from "./models";
import modelFields from "./modelFields";
import filterOperators from "./filterOperators";
import graphqlFields from "./graphqlFields";
import graphql from "./graphql";
import { TypeValueEmitter } from "./utils/TypeValueEmitter";
import addRefFieldHooks from "./modelFields/refField/addRefFieldHooks";
import authenticationPlugin from "./authentication";
import checkRefFieldsBeforeSave from "./modelFields/refField/checkRefFieldsBeforeSave";

type HeadlessPluginsOptions = {
    type: string;
    environment: string;
    dataManagerFunction?: string;
};

export default (
    options: HeadlessPluginsOptions = {
        type: null,
        environment: null,
        dataManagerFunction: null
    }
) => [
    {
        name: "context-cms-context",
        type: "context",
        preApply(context) {
            context.cms = context.cms || {};
            context.cms.type = options.type || "read";
            context.cms.environment = options.environment;
            context.cms.dataManagerFunction = options.dataManagerFunction;

            context.cms.READ = options.type === "read";
            context.cms.PREVIEW = options.type === "preview";
            context.cms.MANAGE = options.type === "manage";

            if (!context.cms.MANAGE) {
                context.resolvedValues = new TypeValueEmitter();
            }
        }
    } as ContextPlugin,
    checkRefFieldsBeforeSave(),
    addRefFieldHooks(),
    models(),
    graphql(options),
    modelFields,
    graphqlFields,
    authenticationPlugin,
    filterOperators()
];
