#!/usr/bin/env python3
"""Generate assets/collaborators-map.svg — a world map marking the cities where
Wenchang's doctoral collaborators are based.

Run only when the collaborator list changes:

    python3 tools/make_map.py path/to/ne_110m_land.geojson

Land outlines come from Natural Earth 1:110m (public domain). Coastlines and
markers use the same equirectangular projection, so the dots land where they
should rather than being eyeballed onto a background image.
"""
import json
import pathlib
import sys

OUT = pathlib.Path(__file__).resolve().parent.parent / "assets" / "collaborators-map.svg"

# Crop: full longitude, latitude trimmed to drop Antarctica and empty Arctic.
LON_MIN, LON_MAX = -180.0, 180.0
LAT_MAX, LAT_MIN = 78.0, -56.0
WIDTH = 1000.0
HEIGHT = WIDTH * (LAT_MAX - LAT_MIN) / (LON_MAX - LON_MIN)

LAND = "#e6e4e1"      # warm grey, sits quietly under the accent
MARKER = "#a82e2e"    # the site accent
RING = "#ffffff"

# City, lat, lon, how many collaborators are based there.
CITIES = [
    ("Bloomington", 39.1653, -86.5264, 2),
    ("Chapel Hill", 35.9132, -79.0558, 1),
    ("Atlanta", 33.7490, -84.3880, 1),
    ("Tianjin", 39.3434, 117.3616, 1),
    ("Hefei", 31.8206, 117.2272, 1),
    ("Shanghai", 31.2304, 121.4737, 2),
    ("Hong Kong", 22.3193, 114.1694, 1),
]


def project(lon: float, lat: float) -> tuple[float, float]:
    x = (lon - LON_MIN) / (LON_MAX - LON_MIN) * WIDTH
    y = (LAT_MAX - lat) / (LAT_MAX - LAT_MIN) * HEIGHT
    return x, y


def ring_to_path(ring: list) -> str:
    pts = []
    last = None
    for lon, lat in ring:
        x, y = project(lon, lat)
        p = (round(x, 1), round(y, 1))
        if p != last:                      # drop duplicates after rounding
            pts.append(p)
            last = p
    if len(pts) < 3:
        return ""
    xs = [p[0] for p in pts]
    ys = [p[1] for p in pts]
    if max(xs) - min(xs) < 1.5 and max(ys) - min(ys) < 1.5:
        return ""                          # islet smaller than a marker
    head = f"M{pts[0][0]} {pts[0][1]}"
    tail = "".join(f"L{x} {y}" for x, y in pts[1:])
    return head + tail + "Z"


def main() -> None:
    src = pathlib.Path(sys.argv[1])
    data = json.loads(src.read_text())

    paths = []
    for feat in data["features"]:
        geom = feat.get("geometry") or {}
        polys = geom.get("coordinates", [])
        if geom.get("type") == "Polygon":
            polys = [polys]
        for poly in polys:
            for ring in poly:
                d = ring_to_path(ring)
                if d:
                    paths.append(d)

    svg = [
        f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {WIDTH:.0f} {HEIGHT:.0f}" '
        f'role="img" aria-label="World map marking the cities where Wenchang Zhang\'s '
        f'doctoral collaborators are based">',
        f'<path fill="{LAND}" fill-rule="evenodd" d="{"".join(paths)}"/>',
    ]

    for name, lat, lon, count in CITIES:
        x, y = project(lon, lat)
        r = 5.5 + 1.8 * count
        svg.append(
            f'<circle cx="{x:.1f}" cy="{y:.1f}" r="{r:.1f}" fill="{MARKER}" '
            f'stroke="{RING}" stroke-width="2"><title>{name}</title></circle>'
        )

    svg.append("</svg>")
    OUT.write_text("\n".join(svg) + "\n", encoding="utf-8")
    total = sum(c for *_, c in CITIES)
    print(f"wrote {OUT.relative_to(OUT.parent.parent)} "
          f"({OUT.stat().st_size / 1024:.0f} KB, {len(paths)} land paths, "
          f"{len(CITIES)} cities, {total} collaborators)")


if __name__ == "__main__":
    main()
