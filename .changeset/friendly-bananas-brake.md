---
'next-tinacms-cloudinary': minor
---

The `persist` method on the Cloudinary Media Store was not returning a properly parsed response from the Cloudinary API. As such, the ImageFieldPlugin could not properly set the image field on drag and drop. The latest changes add new formatting logic to `persist`.
