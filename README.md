# NaviStats

A self-hosted listening statistics dashboard for [Navidrome](https://www.navidrome.org/). NaviStats connects directly to your Navidrome server and gives you a visual breakdown of your music listening history.

# This Project is purely vibecoded, so use at your own risk (Yes even the ReadMe.md for the most part)

Claude-Code: "All processing happens client-side — your credentials never leave your browser."

ZortexSenpai: "I've looked at this part of the code, This is true. You can find the code in `App.jsx` on line 22. The login credentials get saved to the localStorage of the browser. (Keep in mind this is the only part of the code I've actually looked at manually)"

---

## ⚠️ API Limitation

The Navidrome API returns **one record per unique song**, containing the song's all-time `playCount` and its most recent `playDate`. It does not expose individual play events or scrobble history (this is being worked on in [navidrome/navidrome#4770](https://github.com/navidrome/navidrome/pull/4770)).

This means:

- **Play counts are all-time totals**, not period-specific. "Top Tracks in the last 7 days" is really "highest all-time play count among songs touched in the last 7 days."
- **Repeat listens are invisible.** If you played a track 5 times in one day, it counts as 1 play in the timeline and pace charts.
- **Most charts measure breadth** (how many unique songs/artists/genres you listened to) rather than intensity (how many total times).

Charts that are **not affected** by this: Unique Tracks, Recent Tracks, Artist Loyalty, and BPM Distribution all work correctly with unique song records.

Once Navidrome exposes a scrobble history endpoint, the charts can be updated to reflect true per-play data.

**I'll try to figure out a way to overcome this limitation**

---

## Features
### How many stats do you want? This project: YES

- **Listening timeline** — bar chart of play time by hour, day, week, or month depending on the selected timespan
- **Top Artists** — ranked by play count with avatar images, configurable list size
- **Top Albums** — ranked by play count with cover art, configurable list size
- **Top Tracks** — most played songs in the selected period
- **Recent Tracks** — latest plays in chronological order
- **Top Genres** — breakdown of genres listened to, with optional grouping
- **Top Decades** — distribution of plays by release decade
- **Top Sessions** — ranked list of your longest listening sessions, with track count and relative duration bars
- **Recently Listened** — quick summary card of recent activity
- **Unique Tracks** — count of distinct tracks played in the period
- **Albums by Release** — bar chart of plays grouped by release decade or year, with a decade/year toggle and per-bucket top album tooltips
- **Timespan picker** — preset spans (1d / 7d / 30d / 1y / All) or a custom date range with an Apply button; **All** fetches your entire listening history
- **Theme selector** — multiple built-in colour themes
- **Genre grouping** — map sub-genres to parent groups via `config.json` (e.g. Liquid DNB → Drum and Bass)
- **Configurable default timespan** — set the initial timespan via `config.json`

### Special page

Accessible via the **Special** tab in the header (loads your complete listening history — a one-time confirmation is shown on first visit).

- **Listening Pace** — line chart of play counts over time with a Day / Week / Month / Year interval toggle; only the actual data range is displayed (no forced empty padding)
- **On This Day** — tracks you listened to exactly 1, 2, and 3 years ago today
- **Artist Loyalty Score** — ranked list of how consistently you return to each artist across months; score = percentage of months in your history that contain at least one play of that artist

### Library page

Accessible via the **Library** tab in the header (scans every track in your Navidrome library, including unplayed ones — a one-time confirmation is shown on first visit).

- **Format Distribution** — horizontal bar chart and summary table showing track counts, share, and average bitrate per audio format (FLAC, MP3, AAC, etc.)
- **Low Quality Tracks** — lossy files (MP3, AAC, OGG, etc.) below a configurable bitrate threshold (default 192 kbps), sorted by bitrate ascending
- **Untagged / Poorly Tagged** — filterable list of tracks missing genre, release year, or replay gain tags, with per-track badges indicating which tags are absent

---

## Example Screenshots
Note: this project is currently in development so the screenshots will not include all features
<img width="2252" height="1318" alt="image" src="https://github.com/user-attachments/assets/75b1c0e3-d7d2-488d-964d-c6cbb1533fd1" />
<img width="2252" height="831" alt="image" src="https://github.com/user-attachments/assets/28c112fc-3bac-4fb8-8ea3-2ec06eec5668" />
<img width="2252" height="907" alt="image" src="https://github.com/user-attachments/assets/ea8d2be0-eaa6-4ccf-862e-64701c3decd1" />
<img width="2252" height="1317" alt="image" src="https://github.com/user-attachments/assets/19acfa5b-ab6d-40fa-bcf9-9ae97c6ced45" />




## Quickstart

### Run locally

**Requirements:** Node.js 18+

```bash
git clone https://github.com/ZortexSenpai/NaviStats
cd NaviStats
npm install
npm run dev
```

Open [http://localhost:5173](http://localhost:5173), enter your Navidrome server URL, username, and password.

---

### Run with Docker

**Requirements:** Docker

Create a `docker-compose.yml` file:

```yaml
services:
  navistats:
    container_name: navistats
    image: ghcr.io/zortexsenpai/navistats:latest
    ports:
      - "3000:80"
    restart: unless-stopped
    volumes:
      - ./config.json:/usr/share/nginx/html/config.json:ro
```

Then start it:

```bash
docker compose up -d
```

NaviStats will be available at [http://localhost:3000](http://localhost:3000).

The `config.json` volume is optional — only needed if you want to customise genre groupings or other settings (see [Configuration](#configuration) below). If you mount one, place it next to your `docker-compose.yml` and restart the container after any changes:

```bash
docker compose restart
```

---

## Configuration

NaviStats reads an optional `public/config.json` at startup. When running via Docker you can volume-mount a custom file without rebuilding the image.

| Key | Type | Default | Description |
|---|---|---|---|
| `defaultTimespan` | number | `30` | Initial timespan in days shown on load |
| `defaultTheme` | string | `"navistats"` | Initial theme for new visitors (overridden by user's saved preference) |
| `timezone` | string | `null` | IANA timezone for all date grouping (e.g. `"Europe/Amsterdam"`). `null` uses the browser's local timezone |
| `recentTracksRefreshInterval` | number\|null | `null` | Auto-refresh interval in seconds (e.g. `30`). `null` disables auto-refresh |
| `recentTracksGenreGrouping` | boolean | `true` | Whether to apply genre grouping to genres shown in Recent Tracks. `false` shows raw genre tags |
| `lowQualityBitrateThreshold` | number | `192` | Bitrate threshold (kbps) for the Low Quality Tracks tile on the Library page. Only lossy formats (MP3, AAC, OGG, etc.) are checked |
| `genreGroups` | object | `{}` | Map of group name → array of sub-genre strings |

Available theme IDs: `navistats`, `catppuccin-mocha`, `catppuccin-latte`, `dracula`, `nord`, `gruvbox`, `tokyo-night`, `one-dark`, `material-dark`

### Example `config.json`
If you want a more complete genre grouping use the config from `public/config.json` as a base template

```json
{
  "defaultTimespan": 7,
  "defaultTheme": "navistats",
  "timezone": "Europe/Zurich",
  "recentTracksRefreshInterval": 20,
  "recentTracksGenreGrouping": false,
  "genreGroups": {
    "Drum and Bass": ["DNB", "Liquid DNB", "Neurofunk", "Jump Up"],
    "Dubstep": ["Dubstep", "Riddim", "Brostep", "Tearout"],
    "House": ["House", "Electro House", "Future House", "Progressive House"]
  }
}
```

Genre matching is case-insensitive. Sub-genres not listed in any group are shown with their original name.

---

## Tech Stack

- [React 18](https://react.dev/) + [Vite](https://vitejs.dev/)
- [Chart.js](https://www.chartjs.org/) via [react-chartjs-2](https://react-chartjs-2.js.org/)
- [date-fns](https://date-fns.org/)
- Served by nginx in Docker
