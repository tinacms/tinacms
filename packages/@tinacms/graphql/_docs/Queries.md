- Split out the getOptimizedQuery resolver

- Split out the authenticate/authorize resolvers
- Split out the updatePassword resolvers

- Split out the collections resolver 
- Split out the collection resolver
- Split out the 'addPendingDocument' resolver
- Split out the 'document' resolver
- Split out the 'createDocument' resolver
- Split out the 'updateDocument' resolver
- Split out the 'deleteDocument' resolver
- Split out the 'createFolder' resolver
- Split out the 'documents' resolver

*** NOTE: No deleteFolder resolver

- Split out the dedicated creators (e.g. createPost) *** DOES NOT APPEAR TO WORK
- Split out the dedicated updators (e.g. updatePost) <-- Does work.

- Split out the node-specific getter (e.g. post)
- Split out the collections-specific getter (e.g. getPostDocument)
- Split out the collections-specific list getter (e.g. getPostList(first: 10))

- Split out the union data value.