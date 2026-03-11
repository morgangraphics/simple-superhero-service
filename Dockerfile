# ARG before FROM parameterises the base image tag; override with --build-arg NODE=22
ARG NODE=22

FROM node:${NODE}-slim
LABEL maintainer="MORGANGRAPHICS,INC"

ARG NODE_ENV=production
ARG PORT=3000

# Install curl (HEALTHCHECK), dumb-init (PID 1 / signal forwarding), and build
# tools required by native-module compilation (e.g. bunyan/dtrace-provider).
# --no-install-recommends keeps the layer lean.
# Clean up apt cache so it is not stored in the layer.
RUN apt-get update -y \
  && apt-get upgrade -y \
  && apt-get install -y --no-install-recommends curl dumb-init build-essential python3 \
  && rm -rf /var/lib/apt/lists/*

# The official node image ships with a non-root 'node' user (uid/gid 1000)
USER node

ENV NODE_ENV=${NODE_ENV}
ENV PORT=${PORT}

WORKDIR /home/node/service

# NOTE: sss-cert.pem and sss-key.pem are excluded via .dockerignore and must be
# mounted at runtime, e.g.:
#   docker run -v /path/to/certs:/home/node/service ...
COPY --chown=node:node . .

RUN npm ci --omit=dev

EXPOSE ${PORT}

HEALTHCHECK --interval=30s --timeout=5s --start-period=15s --retries=3 \
  CMD curl -fsk https://localhost:${PORT}/healthcheck || exit 1

# https://snyk.io/blog/10-best-practices-to-containerize-nodejs-web-applications-with-docker/
# https://github.com/Yelp/dumb-init#usage
ENTRYPOINT ["/usr/bin/dumb-init", "--"]
CMD ["node", "server.js"]
