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
import type { TinaCloudSchema } from '@tinacms/schema-tools';
import { Database } from '../database';
import { Level } from '../database/level';
export declare const setup: (rootPath: string, schema: TinaCloudSchema<false>, level: Level) => Promise<{
    database: Database;
}>;
export declare const print: (fixture: Fixture) => string;
export declare type Fixture = {
    description?: string;
    name: string;
    assert: 'output';
    message?: string;
    expectError?: boolean;
} | {
    description?: string;
    name: string;
    assert: 'file';
    filename: string;
    message?: string;
    expectError?: boolean;
};
export declare const setupFixture: (rootPath: string, schema: TinaCloudSchema<false>, level: Level, fixture: Fixture, suffix?: string, queryName?: string, folder?: string) => Promise<{
    responses: string[];
    expectedResponsePaths: string[];
}>;
export declare const setupFixture2: (rootPath: string, schema: TinaCloudSchema<false>, level: Level, fixture: Fixture, suffix?: string, queryName?: string, folder?: string) => Promise<{
    responses: string[];
    expectedResponsePaths: string[];
}>;
