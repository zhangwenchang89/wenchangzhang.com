# wenchangzhang.com — build the three pages from src/*.md
#
#   make          build all pages
#   make serve    build, then preview at http://localhost:8000
#   make clean    remove generated HTML
#
# Requires pandoc only. No runtime, no dependency tree, nothing to upgrade.

PANDOC   := pandoc
TEMPLATE := template.html
PAGES    := index.html teaching.html other.html

PANDOC_FLAGS := --from markdown+fenced_divs+bracketed_spans+header_attributes \
                --to html5 \
                --template=$(TEMPLATE) \
                --standalone \
                --wrap=none

.PHONY: all serve clean check

all: $(PAGES) sitemap.xml

index.html: src/index.md $(TEMPLATE)
	$(PANDOC) $(PANDOC_FLAGS) -o $@ $<

teaching.html: src/teaching.md $(TEMPLATE)
	$(PANDOC) $(PANDOC_FLAGS) -o $@ $<

other.html: src/other.md $(TEMPLATE)
	$(PANDOC) $(PANDOC_FLAGS) -o $@ $<

# Regenerated on every build so lastmod always reflects the build date.
sitemap.xml: $(PAGES)
	@printf '%s\n' \
	  '<?xml version="1.0" encoding="UTF-8"?>' \
	  '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">' \
	  '  <url><loc>https://www.wenchangzhang.com/</loc><lastmod>'"$$(date +%F)"'</lastmod><priority>1.0</priority></url>' \
	  '  <url><loc>https://www.wenchangzhang.com/teaching.html</loc><lastmod>'"$$(date +%F)"'</lastmod><priority>0.7</priority></url>' \
	  '  <url><loc>https://www.wenchangzhang.com/other.html</loc><lastmod>'"$$(date +%F)"'</lastmod><priority>0.7</priority></url>' \
	  '</urlset>' > $@
	@echo "wrote $@"

serve: all
	@echo "http://localhost:8000  (ctrl-c to stop)"
	@python3 -m http.server 8000

# Report every outbound link's HTTP status. Slow; run before a release.
#
# Only <a href> is checked — <link rel="preconnect"> points at bare hostnames,
# which are not pages. HTML entities are decoded first, or every URL carrying an
# &amp; is reported as a false 400. Uses a ranged GET with a browser User-Agent:
# many sites (SSRN, publishers) refuse HEAD or unknown agents with 403.
UA := Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151 Safari/537.36

check: $(PAGES)
	@python3 -c "import html,re,sys;\
	pages=sys.argv[1:];\
	urls=sorted({html.unescape(u) for p in pages for u in re.findall(r'<a [^>]*href=\"(https?://[^\"]+)\"', open(p, encoding='utf-8').read())});\
	print('\n'.join(urls))" $(PAGES) \
	  | while read -r url; do \
	      code=$$(curl -s -o /dev/null -w '%{http_code}' -L --max-time 25 -r 0-2048 \
	              -A "$(UA)" -H "Accept: text/html,application/xhtml+xml,*/*" "$$url"); \
	      printf '%s  %s\n' "$$code" "$$url"; \
	    done

clean:
	rm -f $(PAGES) sitemap.xml
