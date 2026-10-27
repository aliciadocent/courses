# Inhoud per topic (Multisemester 2)

De tabellen per topic op `index.html` komen uit deze JSON-bestanden. Pas je hier iets aan, dan verandert de pagina mee.

- `topics.json`: welke topics er zijn en in welke volgorde ze op de pagina staan.
- `topics/<id>.json`: één bestand per topic, met `code`, `naam`, `rol` en per activiteit (`analyseren`, `adviseren`, `ontwerpen`, `realiseren`, `manage-control`) de `theorie`, het `product` en de lijst `overlap`.
- `team.json`: overlappende thema's die het hele team samen oppakt (bijvoorbeeld stakeholderanalyse).

## Overlap

De tabel "Overlappende thema's" wordt automatisch gemaakt: een thema hoort bij elk topic dat het in zijn `overlap`-lijst noemt. Schrijf een thema daarom in elk bestand precies hetzelfde, ook hoofdletters en haakjes.

## Nieuw topic toevoegen

1. Kopieer een bestaand bestand in `topics/`, bijvoorbeeld `sde.json`, naar `topics/nieuw.json` en vul het in.
2. Zet `"nieuw"` in de lijst in `topics.json`.

## Lokaal bekijken

Browsers lezen geen JSON-bestanden in als je `index.html` dubbelklikt. Bekijk de pagina via Vercel of via een lokale server (bijvoorbeeld Live Server in VS Code, of `python3 -m http.server` in de map `courses`).
