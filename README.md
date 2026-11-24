# KLAY Interior Studio — independent redesign concept

The finalized design for **KLAY Interior Studio**, Guwahati, Assam, is **Architectural Monograph (A)**: warm ivory, editorial typography, generous whitespace, photography-led portfolio. The alternate direction is archived in the source and is no longer selectable.

This is an independent, unofficial speculative concept. It is **not** KLAY's official website and has not been endorsed by the studio.

## Run

Requires Node.js 20.19+ / 22+.

```bash
npm install
npm run dev
```

Build for Cloudflare Pages or other static hosting:

```bash
npm run build
npm run preview
```

- Framework: static HTML, vanilla JavaScript and CSS; Vite for development/build.
- Cloudflare Pages build command: `npm run build`
- Output directory: `dist`
- No environment variables, paid services, or runtime backend required.
- The site uses hash navigation, so refreshes and deep links work on any static host.
- Demo routes: `#/`, `#/work`, `#/studio`, `#/contact`, `#/project/protech-prime`, and the other project routes.

## Included functionality

- Responsive navigation and accessible mobile menu (close on link, outside header, Escape; focus trap)
- Projects archive with category filters
- Four individual project case studies and photo galleries with lightbox, keys and swipe support
- Studio story and service overview
- Contact information and a functional email-composer enquiry form (no server-side submission or data storage)
- Studio Notes newsletter invitation on every route; valid email addresses prepare a subscription-request email, not an actual subscription.
- Image fallback to KLAY's existing image CDN
- Focus-visible styles, reduced-motion support, lazy-loading and SEO metadata
- An explicit noindex rule so this unsolicited preview does not compete with the studio's official site

## Asset provenance and accuracy

Project names, areas and descriptions are based on the public portfolio at https://klayinteriorstudio.com/index.php/portfolio/ . Founder background is based on https://klayinteriorstudio.com/index.php/about/ . Photographs are loaded **from KLAY's existing publicly hosted website**, not copied into this repository. All rights remain with the respective owners. Use of these assets in any official or commercial deployment should be approved by KLAY. If they replace or relocate assets, update URLs in `index.html`.

Contact details are based on https://klayinteriorstudio.com/index.php/contact/ . Address and project statistics should be verified with the studio before publishing as official.

## Production handoff after approval

1. Obtain image usage permission, original high-resolution photos, brand assets, final copy and verified studio address.
2. Export owned photography to optimized responsive AVIF/WebP variants; host it within the approved project.
3. Decide whether to add an actual hosted enquiry endpoint, privacy terms, spam control and notification routing. Both preview forms are deliberately `mailto:`. Connect a consent-aware newsletter provider and a verified signup endpoint before enabling real subscriptions.
4. Replace noindex with intentional canonical metadata, sitemap and local-business structured data at the official domain.
5. QA final images, responsive layouts, keyboard navigation and Core Web Vitals on the live hosting provider.

**Design/development:** independently prepared website concept for outreach and portfolio presentation.
