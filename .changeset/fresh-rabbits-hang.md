---
'@tinacms/search': patch
---

Fixes issue where copying the full text of a title into a search query would result in no results because of the stopwords used in the query not existing in the search index
