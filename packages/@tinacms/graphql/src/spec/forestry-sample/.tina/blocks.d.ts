/**
Copyright 2021 Forestry.io Holdings, Inc.
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
export declare const blocksCollection: {
    label: string;
    name: string;
    path: string;
    fields: ({
        type: string;
        label: string;
        name: string;
        fields?: undefined;
        list?: undefined;
        templates?: undefined;
    } | {
        type: string;
        label: string;
        name: string;
        fields: {
            type: string;
            name: string;
            label: string;
        }[];
        list?: undefined;
        templates?: undefined;
    } | {
        type: string;
        list: boolean;
        label: string;
        name: string;
        templates: {
            label: string;
            name: string;
            fields: ({
                type: string;
                label: string;
                name: string;
                options?: undefined;
            } | {
                type: string;
                label: string;
                name: string;
                options: {
                    label: string;
                    value: string;
                }[];
            })[];
        }[];
        fields?: undefined;
    })[];
};
