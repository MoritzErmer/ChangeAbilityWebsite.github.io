# ChangeAbility — Static Website

Dieses Repository enthält eine schlanke, performante statische Website für das studentische Projekt "ChangeAbility".

Inhalt
- `index.html` — Startseite
- `about.html` — Über das Projekt
- `projects.html` — Projekte / Green Lab
- `css/` — Styles
- `js/` — Kleine Interaktionen & Lazyloading
- `assets/` — Bilder, Icons, Fonts
- `manifest.webmanifest` — PWA Meta

Lokales Testen

1. Starte einen statischen Server (empfohlen: Python3)

```bash
python3 -m http.server 8000
```

Und öffne dann http://localhost:8000

GitHub Pages

- Push dieses Repository zu GitHub.
- In den Repository-Einstellungen GitHub Pages aktivieren (Branch: main, root).

Tipps zur Performance

- Ersetze Platzhalterbilder durch optimierte WebP/AVIF-Dateien.
- Preload für kritische Fonts: Verwende variable WOFF2.
- Minifiziere CSS/JS für Produktion.
- Nutze Lighthouse (Chrome) für weitere Optimierungen.

Weiteres

Wenn du möchtest, kann ich ein kleines GitHub Actions-Workflow-File hinzufügen, das bei Push automatisch die Seite bündelt oder in einen `gh-pages` Branch deployed.