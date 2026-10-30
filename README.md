# oclweb3

[![DPG Badge](https://img.shields.io/badge/Verified-DPG-3333AB?logo=data:image/svg%2bxml;base64,PHN2ZyB3aWR0aD0iMzEiIGhlaWdodD0iMzMiIHZpZXdCb3g9IjAgMCAzMSAzMyIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHBhdGggZD0iTTE0LjIwMDggMjEuMzY3OEwxMC4xNzM2IDE4LjAxMjRMMTEuNTIxOSAxNi40MDAzTDEzLjk5MjggMTguNDU5TDE5LjYyNjkgMTIuMjExMUwyMS4xOTA5IDEzLjYxNkwxNC4yMDA4IDIxLjM2NzhaTTI0LjYyNDEgOS4zNTEyN0wyNC44MDcxIDMuMDcyOTdMMTguODgxIDUuMTg2NjJMMTUuMzMxNCAtMi4zMzA4MmUtMDVMMTEuNzgyMSA1LjE4NjYyTDUuODU2MDEgMy4wNzI5N0w2LjAzOTA2IDkuMzUxMjdMMCAxMS4xMTc3TDMuODQ1MjEgMTYuMDg5NUwwIDIxLjA2MTJMNi4wMzkwNiAyMi44Mjc3TDUuODU2MDEgMjkuMTA2TDExLjc4MjEgMjYuOTkyM0wxNS4zMzE0IDMyLjE3OUwxOC44ODEgMjYuOTkyM0wyNC44MDcxIDI5LjEwNkwyNC42MjQxIDIyLjgyNzdMMzAuNjYzMSAyMS4wNjEyTDI2LjgxNzYgMTYuMDg5NUwzMC42NjMxIDExLjExNzdMMjQuNjI0MSA5LjM1MTI3WiIgZmlsbD0id2hpdGUiLz4KPC9zdmc+Cg==)](https://digitalpublicgoods.net/r/open-concept-lab)
OCL TermBrowser v3 user interface for terminology management using an OCL Terminology Server

### Run Dev
1. Create your local Compose override: `cp docker-compose.override.yml.bak docker-compose.override.yml`
2. Adjust `docker-compose.override.yml` if you need local build, volume, or port settings.
3. Run `docker compose up -d`
4. Visit the port configured by `WEB_PORT`, or `http://localhost:4002` by default.

`docker-compose.override.yml` is intentionally not versioned because each development environment may need different settings. To change the host port without editing the override, run `WEB_PORT=4012 docker compose up -d`, for example.

### Run Dev with KeyCloak (SSO)
1. Run `docker compose -f docker-compose.yml -f docker-compose.sso.yml up -d`.
2. Visit the port configured by `WEB_PORT`, or `http://localhost:4002` by default.

The SSO redirect follows `WEB_PORT`. You can still set `LOGIN_REDIRECT_URL` explicitly when a different callback URL is required. For example: `WEB_PORT=4012 docker compose -f docker-compose.yml -f docker-compose.sso.yml up -d`.

### Run Production (do check CORS origin policy with API_URL)
1. Run `docker compose -f docker-compose.yml up -d`.
2. Visit the port configured by `WEB_PORT`, or `http://localhost:4002` by default.

### Announcement banner
To show a banner above the app, for example for planned maintenance, set the optional `ANNOUNCEMENT` environment variable to JSON:

```json
{
  "id": "maintenance-2026-11",
  "text": {"en": "Planned maintenance on Saturday, 02:00-04:00 UTC.", "es": "Mantenimiento programado el sábado, de 02:00 a 04:00 UTC."},
  "links": [{"label": {"en": "Details", "es": "Detalles"}, "url": "https://status.example.org/"}],
  "until": "2026-11-09T00:00:00Z"
}
```

- `id`: dismissing the banner hides it in that browser until `id` changes.
- `text` and each link's `label`: plain text for each language code (`en`, `es`, `pt-BR`, `zh`). `en` is required, and shows for any language that has no entry.
- `links`: `https:` URLs, shown after the text. Use `[]` for none.
- `until` (optional): an ISO 8601 time with `Z` or an offset, such as `2026-11-09T00:00:00Z`. The banner stops showing after it, without a restart.

`start-prod.sh` writes the setting into `env-config.js` when the container starts, so a change shows after a restart. When it's unset, or isn't valid (bad JSON, a missing field, a link that isn't `https:`), no banner shows. With `npm start`, put `var ANNOUNCEMENT = <the JSON as a JavaScript string>;` in `public/env-config.js` instead (`node -p 'JSON.stringify(process.argv[1])' '<the JSON>'` prints one), and don't commit it.

### Eslint
docker exec -it <container_name> bash -c "eslint src/ --ext=.js*"


#### Major/minor version increase

In order to increase major/minor version you need to set the new version in [package.json](package.json).

## License

This repository is part of the [OCL Digital Public Good](https://github.com/OpenConceptLab/.github/blob/main/DIGITAL-PUBLIC-GOOD.md). It is licensed under the [Mozilla Public License 2.0](LICENSE) with the [OCL Healthcare Disclaimer](HEALTHCARE-DISCLAIMER.md).
