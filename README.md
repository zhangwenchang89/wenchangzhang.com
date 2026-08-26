# wenchangzhang.com

The source for <https://www.wenchangzhang.com>. Three pages, built from Markdown
with `pandoc`, served by GitHub Pages.

## Editing

Content lives in `src/`. Nothing else normally needs touching.

| File | Page |
|---|---|
| `src/index.md` | `/` — bio, working papers, publications |
| `src/teaching.md` | `/teaching.html` |
| `src/other.md` | `/other.html` — education, awards, seminars, service |

```sh
make          # rebuild the three pages + sitemap.xml
make serve    # build, then preview at http://localhost:8000
make check    # report the HTTP status of every outbound link (slow)
make clean    # delete generated HTML
```

Then commit and push. GitHub Pages serves the committed HTML directly — there is
no CI step, so what you push is exactly what goes live.

## Paper entries

Each entry in a `::: papers` block follows one shape. The parts are optional
after the first, but the order matters:

```markdown
-   **Title in bold**, with [Coauthor](https://…), and [Coauthor](https://…). \[[SSRN](https://…)\]

    Venue or status line.

    -   award, presentation, or media item
    -   another one
```

- The **bold title** renders in the accent red.
- The **second paragraph** is the venue/status line — plain, unbulleted, small.
- The **nested list** holds awards, presentations, and media coverage.
- Student coauthors carry a trailing `\*` (escaped, so Markdown doesn't read it
  as emphasis).

## Front matter

Each `src/*.md` opens with YAML controlling the page's head and hero:

| Key | Purpose |
|---|---|
| `pagetitle` | `<title>` — keep under 60 characters |
| `ogtitle` | `og:title` and `twitter:title` |
| `description` | meta description — aim for 120–155 characters |
| `keywords` | meta keywords (ignored by Google; kept short and truthful) |
| `canonical` | path after the domain, e.g. `teaching.html`; empty for the home page |
| `hero` | `whiteboard` or `lines` — picks `assets/hero-<name>.{jpg,mp4}` |
| `is_research` / `is_teaching` / `is_other` | marks the current nav item; `is_research` also emits the JSON-LD block |
| `big_headings` | larger `h2`s, used only on `other.md` |

## Design

`assets/style.css` reproduces the previous Weebly "Unite" theme. Values were read
off the live site before migration, so the look carried over deliberately.
Departures from the original are marked in comments — currently just one: content
links have no underline and are a shade darker than body text instead.

The site is light-only by intent; there are no dark-mode blocks.

## Files

```
src/*.md          content — the only files you normally edit
template.html     pandoc HTML template: head, header, hero, footer
assets/style.css  all styling
assets/           headshot and the two hero clips
Makefile          build
*.html            generated — committed, because Pages serves them directly
sitemap.xml       generated
```
