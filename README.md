# oclweb3
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
