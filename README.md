# Warren Chanansingh: personal site

A static, dependency-free site. `build.mjs` renders the content file into plain HTML pages, so the site loads fast, works without JavaScript, and can be hosted anywhere (Netlify, Vercel, Cloudflare Pages, GitHub Pages).

## Run it locally

Requires Node 18 or newer. There is nothing to install.

```
node serve.mjs          # or: npm run dev
```

Open http://localhost:4173. The site rebuilds automatically when you save a file in `src/`.

## Build for production

```
node build.mjs          # outputs ./dist (upload this folder)
node check.mjs          # checks links, anchors, headings and stray placeholders
```

The build also writes `dist-preview/index.html`, a single self-contained file that is handy for sharing a quick preview.

## What to edit

| To change | Edit |
|---|---|
| Copy, links, projects, expertise, insights, contact routes | `src/content.js` |
| Portrait | Put `portrait.jpg` in `src/assets/`, then set `person.portrait: 'portrait.jpg'` |
| Case-study images | Put them in `src/assets/` and list them in a project's `media` array |
| Colours, type, spacing | Tokens at the top of `src/styles.css` |
| Markup | `src/templates.js` |
| Motion and interaction | `src/main.js` |

## Placeholders

Values in `[BRACKETS]` are never shown on the site. Instead, the feature they control is switched off.

- `links.email`: the three "Email about…" buttons and the footer email link appear once this is set. Until then, the contact section links to your existing Adobe Portfolio.
- `links.linkedin`: the LinkedIn links appear once this is set.
- `site.url`: enables canonical URLs, the Open Graph image and `sitemap.xml`.

`node build.mjs` lists whichever placeholders are still set.

## Needs Warren's approval before publishing

Every item is marked `REVIEW` in `content.js`.

1. **Insurance case study.** Confirm that Lonsdale Saatchi & Saatchi, ANSA, TATIL and TATIL Life may be named publicly, and check the wording of the challenge and approach. No results are shown.
2. **"12 years" and "Over $10M USD managed".** These appear in the hero and About sections.
3. **About bio.** This is a draft written in your voice.
4. **The Move and Pixel Press.** Only the one-line descriptions are included. Add your role, year, format and links.
5. **Meta Ads 101.** Check the mention of the proposed three-part series.
6. **Insights.** These are topic ideas labelled "Draft". They are not published articles.

## Add a case study

Add an object to `projects` in `src/content.js`:

```js
{
  slug: 'my-project',            // becomes /work/my-project/
  title: 'Project title',
  category: 'Performance media',
  summary: 'One sentence.',
  pattern: 'wave',               // artwork: rise | wave | converge | orbit | band
  status: 'in-development',      // or 'published' to remove the "in development" note
  year: '2026', client: '', role: '', channels: ['Meta'],
  context: '', challenge: '', approach: [''], decisions: [''],
  outcome: '',                   // real, approved results only
  learnings: '',
  media: [{ src: 'my-image.jpg', alt: 'Describe the image', caption: '' }],
  link: { href: 'https://…', label: 'Listen to the series' },
  related: ['the-move'],
}
```

Any field you leave out is hidden. Nothing else needs to change; the page and the sitemap entry are generated for you.

## Add an insight

Add an entry to `insights`. When the piece is live, set `status: 'published'` and `href: 'https://…'` so the title becomes a link.

## Notes

- The fonts are Bricolage Grotesque and Source Serif 4. They are self-hosted, subset to Latin characters, and licensed under the SIL Open Font License.
- Motion respects `prefers-reduced-motion`. The hero field pauses when it is offscreen or the tab is hidden.
- There is no contact form, because a form needs a real submission service. Email links are simpler and cannot fail silently. If you want a form later, a hosted service such as Formspree or Netlify Forms is the easiest route.
- `src/assets/og.png` is the social share image and can be replaced.
