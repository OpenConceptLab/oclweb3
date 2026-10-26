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


### Eslint
docker exec -it <container_name> bash -c "eslint src/ --ext=.js*"


#### Major/minor version increase

In order to increase major/minor version you need to set the new version in [package.json](package.json).

## License

This repository is part of the [OCL Digital Public Good](https://github.com/OpenConceptLab/.github/blob/main/DIGITAL-PUBLIC-GOOD.md). It is licensed under the [Mozilla Public License 2.0](LICENSE) with the [OCL Healthcare Disclaimer](HEALTHCARE-DISCLAIMER.md).
