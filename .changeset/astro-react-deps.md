---
'@tinacms/cli': patch
---

Astro init now installs matched `react` and `react-dom` (`^18.3.1`) as **dev dependencies**. The Astro site stays React-free, but the TinaCMS admin SPA is built with React; a bare Astro project ships none, and tinacms' loose peer range (`>=16.14.0`) could otherwise resolve mismatched react/react-dom majors, leaving the CMS admin blank. Skipped when the project already declares React.
