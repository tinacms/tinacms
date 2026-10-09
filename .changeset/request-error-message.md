---
"tinacms": patch
---

Report the status code when a failed TinaCloud response carries no status text, and keep the HTTP error when the response body is not JSON. Over HTTP/2 the error read `Unable to complete request, ` with nothing after the comma, and a gateway answering with HTML replaced the error with a JSON parse error. This also applies to creating branches and pull requests, checking the latest version, and polling editorial workflow status.
