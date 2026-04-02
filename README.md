# NaviStats

A self-hosted listening statistics dashboard for [Navidrome](https://www.navidrome.org/). NaviStats connects directly to your Navidrome server and gives you a visual breakdown of your music listening history.

# This Project is purely vibecoded, so use at your own risk (Yes even the ReadMe.md for the most part)

Claude-Code: "All processing happens client-side — your credentials never leave your browser."

ZortexSenpai: "I've looked at this part of the code, This is true. You can find the code in `App.jsx` on line 22. The login credentials get saved to the localStorage of the browser. (Keep in mind this is the only part of the code I've actually looked at manually)"

---

## Features

- **Listening timeline** — bar chart of play time by hour, day, week, or month depending on the selected timespan
- **Top Artists** — ranked by play count with avatar images, configurable list size
- **Top Albums** — ranked by play count with cover art, configurable list size
- **Top Tracks** — most played songs in the selected period
- **Recent Tracks** — latest plays in chronological order
- **Top Genres** — breakdown of genres listened to, with optional grouping
- **Top Decades** — distribution of plays by release decade
- **Recently Listened** — quick summary card of recent activity
- **Unique Tracks** — count of distinct tracks played in the period
- **Timespan picker** — preset spans (1d / 7d / 30d / 1y) or a custom date range with an Apply button
- **Theme selector** — multiple built-in colour themes
- **Genre grouping** — map sub-genres to parent groups via `config.json` (e.g. Liquid DNB → Drum and Bass)
- **Configurable default timespan** — set the initial timespan via `config.json`

---

## Screenshots
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
| `genreGroups` | object | `{}` | Map of group name → array of sub-genre strings |

Available theme IDs: `navistats`, `catppuccin-mocha`, `catppuccin-latte`, `dracula`, `nord`, `gruvbox`, `tokyo-night`, `one-dark`, `material-dark`

### Example `config.json`
If you want a more complete genre grouping use the config from `public/config.json` as a base template

```json
{
  "defaultTimespan": 7,
  "defaultTheme": "navistats",
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
