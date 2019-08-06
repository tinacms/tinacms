/// <reference types="react" />
import { Form, FormOptions } from '@forestryio/cms';
interface JsonNode {
    fields: {
        fileRelativePath: string;
    };
    [key: string]: any;
}
export declare function useJsonForm(jsonNode: JsonNode, formOptions?: Partial<FormOptions<any>>): any[];
interface RemarkFormProps extends Partial<FormOptions<any>> {
    jsonNode: JsonNode;
    render(renderProps: {
        form: Form;
        data: any;
    }): JSX.Element;
}
export declare function RemarkForm({ jsonNode, render, ...options }: RemarkFormProps): JSX.Element;
export {};
