# Roadmap

The TinaCMS core team is a part of Forestry.io. The purpose of
this document is to communicate to the greater community how the
TinaCMS core team will prioritize upcoming development.

## Process

The TinaCMS core team follows an 8 week development cycle:

- 6 weeks of development
- 2 week cooldown.

TinaCMS is a toolkit for building content management systems. In
order to improve this toolkit, the core team works on various
projects to directly or indirectly push TinaCMS forward. These
projects are pitched to the team in well scoped documents that
describe their value to the TinaCMS open source toolkit and it's
sponsors. The team chooses the projects it wants to take on for
the next 6 weeks. Any improvements that are made to the `tinacms/tinacms` repository during that time will be part of the regular weekly release.
At the end of that 6 weeks the team takes 2 weeks to step back, gain
perspective, and plan the next 6 week period.

## Cycles

### Cycle 5: Jan 11th to Feb 19th


| Begins        | Ends           |
| ------------- | -------------- |
| January 11th 2021 | February 19th 2021 |

As a result of last cycle's dogfooding, we have identified some specific things that we want to improve with how inline editing is used. We will be focused on two priorities:

1. HTML markup between edit mode and production should be as similar as possible
2. Configuring sidebar forms and inline forms should not feel like two different things and require two different mental models.

For elaboration on our thinking regarding these priorities, checkout [our cycle kickoff blog post](https://tina.io/blog/more-changes-coming-to-inline-editing/).

### Cycle 4: Nov 2nd to Dec 11th

| Begins        | Ends           |
| ------------- | -------------- |
| November 2nd 2020 | December 11th 2020 |

For this cycle, we don't have any specific features planned. We are dogfooding Tina by working on a flexible, blocks-based starter project with what we believe are the best practices for using Tina right now. We expect some improvements to come to Tina in the process, with a particular focus on:
- Inline Editing
- Using Tina with a componentized design system
- Minimizing the impact of Tina on page weight when not editing

### Cycle 3: Sept 7th to October 16th

| Begins        | Ends           |
| ------------- | -------------- |
| September 7th 2020 | October 16th 2020 |

This cycle we are working on adding a true media manager to TinaCMS as detailed in [RFC 0003](https://github.com/tinacms/rfcs/blob/master/0003-media-api.md). Media management is a fundamental feature of a CMS. Websites today contain more dog GIFs and landscape hero photos than ever. Content editors need a way to work with that media when creating and updating web pages, blogs, or articles. Currently media changes are handled solely through image fields. By clicking on the field, the editors can upload new images from their local filesystem. There is a 'store' uploading and handling previously added images under the hood, but editors have no way of interacting with that store.


### Cycle 2: July 13th to August 21st

| Begins        | Ends           |
| ------------- | -------------- |
| July 13th 2020 | August 21st 2020 |

As the project has grown the website's structure has proved problematic for contributors.
Deciding where to put new docs and where to look for files to be changed has been
challenging. We've also found that our messaging around Tina has lead to some misconceptions
that we would like to correct. **This cycle we are focussing on improving the documentation and
messaging around TinaCMS.**


### Cycle 1: May 18th to June 26th

| Begins        | Ends           |
| ------------- | -------------- |
| May 18th 2020 | June 26th 2020 |

**Projects**

- Improving the Inline Editing Experience
- Github Based Authoring with `create-react-app`
