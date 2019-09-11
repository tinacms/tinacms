/// <reference types="react" />
import { Form, FormOptions } from '@tinacms/core';
interface JsonNode {
    fields: {
        fileRelativePath: string;
    };
    [key: string]: any;
}
export declare function useJsonForm(jsonNode: JsonNode, formOptions?: Partial<FormOptions<any>>): any[];
interface JsonFormProps extends Partial<FormOptions<any>> {
    data: JsonNode;
    render(renderProps: {
        form: Form;
        data: any;
    }): JSX.Element;
}
export declare function JsonForm({ data, render, ...options }: JsonFormProps): JSX.Element;
export {};
