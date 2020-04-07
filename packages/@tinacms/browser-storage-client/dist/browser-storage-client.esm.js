import { useCMS, useWatchFormValues } from 'tinacms';
import { useCallback, useEffect } from 'react';
import get from 'lodash.get';

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
function flattenFormData(form) {
  var flatData = {};
  var values = form.getState().values;
  form.getRegisteredFields().forEach(function (field) {
    var data = get(values, field);
    if (typeof data === 'object') return;
    flatData[field] = data;
  });
  return flatData;
}

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
// and load from localstorage on boot

var useLocalStorageCache = function useLocalStorageCache(path, form, editMode) {
  var cms = useCMS();
  var saveToStorage = useCallback(function (_formData) {
    cms.api.storage.save(path, flattenFormData(form.finalForm));
  }, [path]); // save to storage on change

  useWatchFormValues(form, saveToStorage); // load from storage on boot

  useEffect(function () {
    if (!editMode) return;
    var values = cms.api.storage.load(path);

    if (values) {
      form.updateValues(values);
    }
  }, [form, editMode]);
};

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
var BrowserStorageApi =
/*#__PURE__*/
function () {
  function BrowserStorageApi(storage, namespace) {
    if (namespace === void 0) {
      namespace = null;
    }

    this.data = {};
    this.timeout = null;

    if (!namespace) {
      this.namespace = "tina-local-storage:" + window.location.hostname;
    } else {
      this.namespace = namespace;
    }

    this.storage = storage;
    var persistedData = this.storage.getItem(this.namespace);

    if (persistedData) {
      this.data = JSON.parse(persistedData);
    }
  }

  var _proto = BrowserStorageApi.prototype;

  _proto.save = function save(id, content) {
    this.data[id] = content;
    this.debouncePersist();
  };

  _proto.load = function load(id) {
    return this.data[id];
  };

  _proto.clear = function clear(id) {
    delete this.data[id];
    this.debouncePersist();
  };

  _proto.debouncePersist = function debouncePersist() {
    this.timeout && clearTimeout(this.timeout); //@ts-ignore

    this.timeout = setTimeout(this.persist.bind(this), 1000);
  };

  _proto.persist = function persist() {
    this.storage.setItem(this.namespace, JSON.stringify(this.data));
  };

  return BrowserStorageApi;
}();

export { BrowserStorageApi, flattenFormData, useLocalStorageCache };
//# sourceMappingURL=browser-storage-client.esm.js.map
