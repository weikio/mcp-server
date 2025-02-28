export const dockerComposeConfig = `services:
  traefik:
    image: traefik:v2.10
    command:
      - "--api.insecure=true"
      - "--providers.docker=true"
      - "--providers.docker.exposedbydefault=false"
      - "--entrypoints.web.address=:80"
    ports:
      - "8000:80"  # Changed from 80:80 to 8000:80
      - "8080:8080" # Traefik dashboard
    volumes:
      - /var/run/docker.sock:/var/run/docker.sock:ro
    networks:
      - weikio-network

  nats:
    image: nats:latest
    command: ["-p", "4222", "-m", "8222", "-js", "-sd", "/var/data"]
    volumes:
      - data:/var/data
    ports:
      - "4222:4222" # Expose NATS TCP port
    networks:
      - weikio-network

  backend:
    image: weikio/backend:dev
    restart: unless-stopped
    environment:
      - 'WEIKIO_HOME=/etc/weikio'
      - 'ASPNETCORE_ENVIRONMENT=Development'
      - 'Weikio__Server__BaseAddress=http://backend/'
      - 'Weikio__Identity__LocalIdentity__IsEnabled=True'
      - 'Weikio__Identity__LocalIdentity__Username=dev@weik.io'
      - 'Weikio__Identity__LocalIdentity__Password=password'
      - 'Weikio__Identity__LocalIdentity__ApiKey=api.key'
      - 'Weikio__Nats__Url=nats://nats:4222'
      - 'ASPNETCORE_URLS=http://*:80'
    depends_on:
      - nats
    volumes:
      - data:/etc/weikio
    networks:
      - weikio-network
    labels:
      - "traefik.enable=true"
      - "traefik.http.routers.backend.rule=Host(\`backend.localtest.me\`)"
      - "traefik.http.routers.backend.entrypoints=web"
      - "traefik.http.services.backend-service.loadbalancer.server.port=80"
      - "traefik.http.routers.backend.service=backend-service"

  ui:
    image: weikio/ui:dev
    restart: unless-stopped
    environment:
      - 'WEIKIO_HOME=/etc/weikio'
      - 'ASPNETCORE_ENVIRONMENT=Development'
      - 'Weikio__Server__BaseAddress=http://backend/'
      - 'ASPNETCORE_URLS=http://*:80'
    depends_on:
      - backend
    volumes:
      - data:/etc/weikio
    networks:
      - weikio-network
    labels:
      - "traefik.enable=true"
      - "traefik.http.routers.ui.rule=Host(\`weikio.localtest.me\`)"
      - "traefik.http.routers.ui.entrypoints=web"
      - "traefik.http.services.ui-service.loadbalancer.server.port=80"
      - "traefik.http.routers.ui.service=ui-service"

  agent:
    image: weikio/agent:dev
    restart: unless-stopped
    environment:
      - 'WEIKIO_HOME=/etc/weikio'
      - 'ASPNETCORE_ENVIRONMENT=Development'
      - 'Weikio__Server__BaseAddress=http://backend/'
      - 'Weikio__Agent__JbangFromPath=true'
      - 'Weikio__Agent__Capabilities__Location=Local'
      - 'Weikio__Agent__Capabilities__Environment=DevTest'
      - 'Weikio__Nats__Url=nats://nats:4222'
    depends_on:
      - backend
    volumes:
      - data:/etc/weikio
    networks:
      - weikio-network

  apim:
    image: weikio/apim:dev
    restart: unless-stopped
    environment:
      - 'WEIKIO_HOME=/etc/weikio'
      - 'ASPNETCORE_ENVIRONMENT=Development'
      - 'Weikio__Server__BaseAddress=http://backend/'
      - 'Weikio__Nats__Url=nats://nats:4222'
      - 'ASPNETCORE_URLS=http://*:80'
    depends_on:
      - backend
    volumes:
      - data:/etc/weikio
    networks:
      - weikio-network
    labels:
      - "traefik.enable=true"
      - "traefik.http.routers.apim.rule=Host(\`api.localtest.me\`)"
      - "traefik.http.routers.apim.entrypoints=web"
      - "traefik.http.services.apim-service.loadbalancer.server.port=80"
      - "traefik.http.routers.apim.service=apim-service"

networks:
  weikio-network:

volumes:
  data:`;
