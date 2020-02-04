/**

Copyright 2019 Forestry.io Inc

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

    http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.

*/
import { CMS, Field, AddContentPlugin } from 'tinacms';
declare type MaybePromise<T> = Promise<T> | T;
interface AnyField extends Field {
    [key: string]: any;
}
interface CreateMdxButtonOptions<FormShape, FrontmatterShape> {
    label: string;
    fields: AnyField[];
    filename(form: FormShape): MaybePromise<string>;
    frontmatter?(form: FormShape): MaybePromise<FrontmatterShape>;
    body?(form: FormShape): MaybePromise<string>;
}
/**
 *
 * @deprecated in favour of calling `CreateMdxPlugin` class directly.
 */
export declare function createMdxButton<FormShape = any, FrontmatterShape = any>(options: CreateMdxButtonOptions<FormShape, FrontmatterShape>): AddContentPlugin<FormShape>;
export declare class MdxCreatorPlugin<FormShape = any, FrontmatterShape = any> implements AddContentPlugin<FormShape> {
    __type: 'content-creator';
    name: AddContentPlugin<FormShape>['name'];
    fields: AddContentPlugin<FormShape>['fields'];
    filename: (form: FormShape) => MaybePromise<string>;
    frontmatter: (form: FormShape) => MaybePromise<FrontmatterShape>;
    body: (form: any) => MaybePromise<string>;
    constructor(options: CreateMdxButtonOptions<FormShape, FrontmatterShape>);
    onSubmit(form: FormShape, cms: CMS): Promise<void>;
}
export {};
