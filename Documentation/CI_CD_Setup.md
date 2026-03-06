# CI - CD pipeline
The Core Infrastructure
---

We used Docker Compose to define three distinct services:

- login-backend: A FastAPI container running Uvicorn.
- sms-service: Your secondary microservice.
- nginx-proxy: The "Front Door" that routes all traffic.


## 1. Create docker-compose.override.yml file
 ```Reason``` - overrides the docker config docker-compose.yml; the original file is used on the production server; the override file is located only on your localhost; the override files
 - the docker-compose.override.yml should NEVER be pushed on the main branch

```Content```
```
# docker-compose.override.yml
services:
  frontend:
    ports: !override []
    networks:
        - ci_cd_network  # <--- CRITICAL: Must match the others
  login-backend:
    ports: !override
      - "9002:8002" # Expose Login Service
    env_file: .env
    extra_hosts:
      - "host.docker.internal:host-gateway"
    networks:
    - ci_cd_network  # <--- CRITICAL: Must match the others
      

  sms-service:
    ports: !override
      - "9001:8001" # Expose SMS Service
    env_file: .env
    extra_hosts:
      - "host.docker.internal:host-gateway"
    networks:
      - ci_cd_network  # <--- CRITICAL: Must match the others

  # We add a local Nginx container to manage the flow
  nginx-proxy:
    image: nginx:latest
    ports: !override
      - "9000:80"
    volumes:
      - ./nginx.conf:/etc/nginx/conf.d/default.conf:ro
      - ./frontend:/usr/share/nginx/html:ro
      - ./backend_services:/usr/share/nginx/html:ro
      - ./form_sms_services:/usr/share/nginx/html:ro
    depends_on:
      login-backend:
        condition: service_started
      sms-service:
        condition: service_started
    networks:
    - ci_cd_network  # <--- CRITICAL: Must match the others

networks:
  ci_cd_network:
    external: true
    name: ci_cd_network
``` 

## 2. Check .env && ssh tunneling
To use live database from the server on your local code, we established an SSH Tunnel. 
```
ssh -L 15432:172.18.0.3:5432 sbs_root -N
```

This maps the remote Postgres port to localhost:15432 on your Windows machine. We then told the Docker containers to look at host.docker.internal to find that tunnel.
The file should point on the docker localhost 

```
DATABASE_URL_LOGIN=postgresql://{account}:{pw}@host.docker.internal:15432/{db} # -- with docker
```

## 3. Start docker:
