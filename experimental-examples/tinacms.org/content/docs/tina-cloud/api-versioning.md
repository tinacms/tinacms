---
title: GraphQL API Versioning
---

Tina is still evolving. In order to support a range of clients using different versions of Tina, Tina's [Content Api](../#content-api) leverages version metadata in your site's generated schema to select the appropriate version of the GraphQL API in Tina Cloud. Starting with version 0.59.3, this version metadata will be compiled into your site's schema json.

## What to know

### Backwards compatibility for previous versions

Versions prior to 0.59.3 will continue to work as expected

### Minor version compatibility

Prior to the 1.0.0 release, there may be breaking changes between _minor_ versions. For a given minor version, Tina Cloud will have the latest patch version of the GraphQL API, depending on what has been compiled into your site's schema. Users should expect compatibility between patch versions.

For example:


| Local Version | Tina Cloud Version |
| ------ | ---------- |
| 0.59.1 |     0.59.3 |
| 0.59.2 |     0.59.3 |
| 0.59.3 |     0.59.3 |
| 0.60.0 |     0.60.1 |
| 0.60.1 |     0.60.1 |


### What if my local version of Tina is different than what is in GitHub?

If you are running Tina locally with Tina Cloud, it is possible to upgrade the GraphQL API to a different version than what is compiled into the schema and committed to GitHub. Since Tina Cloud uses the version in GitHub to determine what version of the GraphQL API to serve, you may encounter incompatibilities. To resolve the issue, commit and changes to your Tina schema directory (`.tina`) whenever you upgrade Tina and make sure these changes are pushed to GitHub whenever you are working locally.
