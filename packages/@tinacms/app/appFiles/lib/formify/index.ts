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

import { formify } from './formify'
import * as util from './util'

import type { FormifiedDocumentNode, DocumentBlueprint } from './types'
import { FormNode } from './types'

export { formify }

export const buildForms = ({ addForm, result, blueprints }) => {
  blueprints.map((blueprint) => {
    const responseAtBlueprint =
      util.getValueForBlueprint<FormifiedDocumentNode>(
        result,
        util.getBlueprintAliasPath(blueprint)
      )
    const location = []
    const findFormNodes = (
      res: typeof responseAtBlueprint,
      location: number[]
    ): void => {
      if (Array.isArray(res)) {
        res.forEach((item, index) => {
          if (Array.isArray(item)) {
            findFormNodes(item, [...location, index])
          } else {
            if (item) {
              addForm(buildFormNode(blueprint, item, [...location, index]))
            }
          }
        })
      } else {
        if (res) {
          addForm(buildFormNode(blueprint, res, location))
        }
      }
    }
    findFormNodes(responseAtBlueprint, location)
  })
}

const buildFormNode = (
  documentBlueprint: DocumentBlueprint,
  res: FormifiedDocumentNode,
  location: number[]
): FormNode => {
  const r = {
    documentBlueprintId: documentBlueprint.id,
    documentFormId: res._internalSys.path,
    values: res._values,
    internalSys: res._internalSys,
    location,
  }
  return r
}
