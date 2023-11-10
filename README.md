# oclweb3
Overhauled OCL Web Authoring Interface v2

### Run Dev
1. docker-compose up -d
2. Visit http://localhost:4002

### Run Dev with KeyCloak (SSO)
1. docker-compose -f docker-compose.yml -f docker-compose.sso.yml up -d
2. Visit http://localhost:4002

### Run Production (do check CORS origin policy with API_URL)
1. docker-compose -f docker-compose.yml up -d
2. Visit http://localhost:4002


### Eslint
docker exec -it <container_name> bash -c "eslint src/ --ext=.js*"


#### Major/minor version increase

In order to increase major/minor version you need to set the new version in [package.json](package.json).
