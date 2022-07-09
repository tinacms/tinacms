---
title: Just Another Blog Post
excerpt: |
  ```typescript
  type Meh = {
    ok: string
  }

  const meh: Meh = {
    ok: '23'
  }
  ```
author: content/authors/napolean.md
date: '2021-07-12T07:00:00.000Z'
---

tricky beast, isn’t it? How do we actually know where we stand in terms of performance, and what <em>exactly</em> our performance bottlenecks are? Is it expensive JavaScript, slow web font delivery, heavy images, or sluggish rendering? Have we optimized enough with tree-shaking, scope hoisting, code-splitting, and all the fancy loading patterns with intersection observer, progressive hydration, clients hints, HTTP/3, service workers and &mdash; oh my &mdash; edge workers? And, most importantly, <strong>where do we even start improving performance</strong> and how do we establish a performance culture long-term?</p>

{{< rimg src="https://res.cloudinary.com/indysigner/image/upload/v1609336455/the-relevance-gap_kzwi6q.png" href="https://infrequently.org/2020/06/platform-adjacency-theory/" sizes="100vw" caption="Image credit: <a href='https://infrequently.org/2020/06/platform-adjacency-theory/'>Alex Russell</a>" alt="The Relevance Gap" >}}

<p>Back in the day, performance was often a mere <em>afterthought</em>. Often deferred till the very end of the project, it would boil down to minification, concatenation, asset optimization and potentially a few fine adjustments on the server’s <code>config</code> file. Looking back now, things seem to have changed quite significantly.</p>

<p>Performance isn’t just a technical concern: it affects everything from accessibility to usability to search engine optimization, and when baking it into the workflow, design decisions have to be informed by their performance implications. <strong>Performance has to be measured, monitored and refined continually</strong>, and the growing complexity of the web poses new challenges that make it hard to keep track of metrics, because data will vary significantly depending on the device, browser, protocol, network type and latency (CDNs, ISPs, caches, proxies, firewalls, load balancers and servers all play a role in performance).</p>

<p>So, if we created an overview of all the things we have to keep in mind when improving performance &mdash; from the very start of the project until the final release of the website &mdash; what would that look like? Below you’ll find a (hopefully unbiased and objective) <strong>front-end performance checklist for 2021</strong> &mdash; an updated overview of the issues you might need to consider to ensure that your response times are fast, user interaction is smooth and your sites don’t drain user’s bandwidth.</p>

## Table Of Contents

<ol>
  <li><a href="/2021/01/front-end-performance-getting-ready-planning-metrics/">Getting Ready: Planning And Metrics</a><br />Performance culture, Core Web Vitals, performance profiles, CrUX, Lighthouse, FID, TTI, CLS, devices.</li>
  <li><a href="/2021/01/front-end-performance-setting-realistic-goals/">Setting Realistic Goals</a><br />Performance budgets, performance goals, RAIL framework, 170KB/30KB budgets.</li>
  <li><a href="/2021/01/front-end-performance-defining-the-environment/">Defining The Environment</a><br />Choosing a framework, baseline performance cost, Webpack, dependencies, CDN, front-end architecture, CSR, SSR, CSR + SSR, static rendering, prerendering, PRPL pattern.</li>
  <li><a href="/2021/01/front-end-performance-assets-optimizations/">Assets Optimizations</a><br />Brotli, AVIF, WebP, responsive images, AV1, adaptive media loading, video compression, web fonts, Google fonts.</li>
  <li><a href="/2021/01/front-end-performance-build-optimizations/">Build Optimizations</a><br />JavaScript modules, module/nomodule pattern, tree-shaking, code-splitting, scope-hoisting, Webpack, differential serving, web worker, WebAssembly, JavaScript bundles, React, SPA, partial hydration, import on interaction, 3rd-parties, cache.</li>
  <li><a href="/2021/01/front-end-performance-delivery-optimizations/">Delivery Optimizations</a><br />Lazy loading, intersection observer, defer rendering and decoding, critical CSS, streaming, resource hints, layout shifts, service worker.</li>
  <li><a href="/2021/01/front-end-performance-networking-http2-http3/">Networking, HTTP/2, HTTP/3</a><br />OCSP stapling, EV/DV certificates, packaging, IPv6, QUIC, HTTP/3.</li>
  <li><a href="/2021/01/front-end-performance-testing-monitoring/">Testing And Monitoring</a><br />Auditing workflow, proxy browsers, 404 page, GDPR cookie consent prompts, performance diagnostics CSS, accessibility.</li>
  <li><a href="/2021/01/front-end-performance-quick-wins/">Quick Wins</a></li>
  <li><strong><a href="/2021/01/front-end-performance-2021-free-pdf-checklist-full/">Everything on one page</a></strong></li>
  <li><a href="/2021/01/front-end-performance-2021-free-pdf-checklist/#download-the-checklist">Download The Checklist (PDF, Apple Pages, MS Word)</a></li>
  <li><a href="https://www.smashingmagazine.com/the-smashing-newsletter/">Subscribe to our email newsletter</a> to not miss the next guides.</li>
</ol>

## Quick Wins

<p>This list is quite comprehensive, and completing all of the optimizations might take quite a while. So, if you had just 1 hour to get significant improvements, what would you do? Let’s boil it all down to <strong>17 low-hanging fruits</strong>. Obviously, before you start and once you finish, measure results, including Largest Contentful Paint and Time To Interactive on a 3G and cable connection.</p>

<ol>
  <li>Measure the real world experience and set appropriate goals. Aim to be at least 20% faster than your fastest competitor. Stay within Largest Contentful Paint &lt; 2.5s, a First Input Delay &lt; 100ms, Time to Interactive &lt; 5s on slow 3G, for repeat visits, TTI &lt; 2s. Optimize at least for First Contentful Paint and Time To Interactive.</li>
  <li>Optimize images with <a href="https://squoosh.app/">Squoosh</a>, <a href="https://github.com/mozilla/mozjpeg">mozjpeg</a>, <a href="https://github.com/google/guetzli">guetzli</a>, <a href="https://css-ig.net/pingo">pingo</a> and <a href="https://jakearchibald.github.io/svgomg/">SVGOMG</a>, and serve AVIF/WebP with an image CDN.</li>
  <li>Prepare critical CSS for your main templates, and inline them in the <code>&lt;head&gt;</code> of each template. For CSS/JS, operate within a critical file size <a href="https://infrequently.org/2017/10/can-you-afford-it-real-world-web-performance-budgets/">budget of max. 170KB gzipped</a> (0.7MB decompressed).</li>
  <li>Trim, optimize, defer and lazy-load scripts. Invest in the config of your bundler to remove redundancies and check lightweight alternatives.</li>
  <li>Always self-host your static assets and always prefer to self-host third-party assets. Limit the impact of third-party scripts. Use facades, load widgets on interaction and beware of anti-flicker snippets.</li>
  <li>Be selective when choosing a framework. For single-page-applications, identify critical pages and serve them statically, or at least prerender them, and use progressive hydration on component-level and import modules on interaction.</li>
  <li>Client-side rendering alone isn't a good choice for performance. Prerender if your pages don’t change much, and defer the booting of frameworks if you can. If possible, use streaming server-side rendering.</li>
  <li>Serve legacy code only to legacy browsers with <code>&lt;script type="module"&gt;</code> and <a href="https://philipwalton.com/articles/using-native-javascript-modules-in-production-today/">module/nomodule pattern</a>.</li>
  <li>Experiment with regrouping your CSS rules and test in-body CSS.</li>
  <li>Add resource hints to speed up delivery with faster <code>dns-lookup</code>, <code>preconnect</code>, <code>prefetch</code>, <code>preload</code> and <code>prerender</code>.</li>
  <li>Subset web fonts and load them asynchronously, and utilize <code>font-display</code> in CSS for fast first rendering.</li>
  <li>Check that HTTP cache headers and security headers are set properly.</li>
  <li>Enable Brotli compression on the server. (If that’s not possible, at least make sure that Gzip compression is enabled.)</li>
  <li>Enable TCP BBR congestion as long as your server is running on the Linux kernel version 4.9+.</li>
  <li>Enable OCSP stapling and IPv6 if possible. Always serve an OCSP stapled DV certificate.</li>
  <li>Enable HPACK compression for HTTP/2 and move to HTTP/3 if it's available.</li>
  <li>Cache assets such as fonts, styles, JavaScript and images in a service worker cache.</li>
</ol>

## Download The Checklist (PDF, Apple Pages)

<p>With this checklist in mind, you should be prepared for any kind of front-end performance project. Feel free to download the print-ready PDF of the checklist as well as an <strong>editable Apple Pages document</strong> to customize the checklist for your needs:</p>

<ul>
<li><a href="https://www.dropbox.com/s/34noajrbm324iai/performance-checklist-1.4.pdf?dl=0">Download the checklist PDF</a> (PDF, 166 KB)</li>
<li><a href="https://www.dropbox.com/s/ikuk5ikcxxv39uu/performance-checklist-1.4.pages?dl=0">Download the checklist in Apple Pages</a> (.pages, 275 KB)</li>
<li><a href="https://www.dropbox.com/scl/fi/s7ctdj89zd5zlvtt7dkhi/performance-checklist-1.4.docx?dl=0&rlkey=2xzs55e3kdg1jcraw5u1tnpl8">Download the checklist in MS Word</a> (.docx, 151 KB)</li>
</ul>

<p>If you need alternatives, you can also check the <a href="https://github.com/drublic/checklist">front-end checklist by Dan Rublic</a>, the "<a href="https://jonyablonski.com/designers-wpo-checklist/">Designer’s Web Performance Checklist</a>" by Jon Yablonski and the <a href="https://github.com/thedaviddias/Front-End-Performance-Checklist">FrontendChecklist</a>.</p>

## Off We Go!

<p>Some of the optimizations might be beyond the scope of your work or budget or might just be overkill given the legacy code you have to deal with. That’s fine! Use this checklist as a general (and hopefully comprehensive) guide, and create your own list of issues that apply to your context. But most importantly, test and measure your own projects to identify issues before optimizing. Happy performance results in 2021, everyone!</p>

<hr />

<p><em>A huge thanks to Guy Podjarny, Yoav Weiss, Addy Osmani, Artem Denysov, Denys Mishunov, Ilya Pukhalski, Jeremy Wagner, Colin Bendell, Mark Zeman, Patrick Meenan, Leonardo Losoviz, Andy Davies, Rachel Andrew, Anselm Hannemann, Barry Pollard, Patrick Hamann, Gideon Pyzer, Andy Davies, Maria Prosvernina, Tim Kadlec, Rey Bango, Matthias Ott, Peter Bowyer, Phil Walton, Mariana Peralta, Pepijn Senders, Mark Nottingham, Jean Pierre Vincent, Philipp Tellis, Ryan Townsend, Ingrid Bergman, Mohamed Hussain S. H., Jacob Groß, Tim Swalling, Bob Visser, Kev Adamson, Adir Amsalem, Aleksey Kulikov and Rodney Rehm for reviewing this article, as well as our fantastic community which has shared techniques and lessons learned from its work in performance optimization for everybody to use. You are truly smashing!</em></p>

{{< signature "il" >}}
