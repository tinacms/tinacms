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

import { z } from 'zod'
export const name = z
  .string({
    required_error: 'Name is required but not provided',
    invalid_type_error: 'Name must be a string',
  })
  .regex(/^[a-zA-Z0-9_]*$/, {
    message: 'Name must be alphanumeric and can only contain underscores',
  })
