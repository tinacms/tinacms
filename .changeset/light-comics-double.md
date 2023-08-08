---
'tinacms': patch
---

Updated so a user can add an absolute path to the filename

Before all files where created reletive to the users current folder and we gave an error if the filename started with a `/`.

Now we check if the filename starts with a `/` and if it does we use that as the absolute path to the file.


Demo: https://www.loom.com/share/5256114d1ce648eda69881e33f8f6bd4?sid=3eafb588-c4da-49eb-ace2-d6b02313e14c
