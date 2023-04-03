# https://github.com/docker/cli/issues/2762#issuecomment-776298308
# ARG NODE=12.22.3

# Use an official Ubuntu Minimal 18.04 runtime as a parent image
FROM ubuntu:bionic AS base
LABEL maintainer="MORGANGRAPHICS,INC"
ARG NODE=14.21.3
ARG USER=node-user
ARG NODE_VERSION=$NODE
ARG NODE_ENV=${NODE_ENV:-development}
ARG PORT=port

# ==============================================================================
# RUN AS ROOT
# ==============================================================================

# Update the base OS, install dumb-init Curl, Sudo, build-essentials & python for node-gyp
# Create A standard Non ROOT User
# When you clean up the apt cache by removing /var/lib/apt/lists it
# reduces the image size, since the apt cache is not stored in a layer.
RUN apt-get update -y \
  && apt-get dist-upgrade -y \
  && apt install -y curl sudo dumb-init build-essential python3 \
  && rm -rf /var/lib/apt/lists/* \
  && adduser --disabled-password --gecos '' ${USER} \
  && adduser ${USER} sudo \
  && echo '%sudo ALL=(ALL) NOPASSWD:ALL' >> /etc/sudoers


# Warn users if they are running as root. See the "Invoked with name sh" section of
# https://www.gnu.org/software/bash/manual/html_node/Bash-Startup-Files.html .
# See also https://www.tldp.org/LDP/Linux-Filesystem-Hierarchy/html/etc.html .
RUN printf "%s" "if [ "\$\(whoami\)" = 'root' ]; then printf \"\n\033[1;31m%s\033[0m\n\n\" \"WARNING: YOU ARE RUNNING AS THE ROOT USER!\"; fi" \
>> /etc/profile.d/warn-root.sh

# ==============================================================================
# RUN AS User
# ==============================================================================

# Run install as user
USER ${USER}

ENV NVM_DIR /home/${USER}/.nvm
ENV PATH $NVM_DIR/versions/node/v${NODE_VERSION}/bin:$PATH
ENV NODE_ENV ${NODE_ENV}
ENV PORT ${PORT}

# Set working Directory - This creates the dir as root
WORKDIR /home/${USER}/service

# Copy Application files to the working directory
COPY --chown=${USER}:${USER} . .

# Because WORKDIR creates directory as root we need to change the owner so npm doesn't thow
# EACCESS errors on install
RUN sudo chown ${USER}:${USER} ../service \
  && curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.38.0/install.sh | bash \
  && . $NVM_DIR/nvm.sh \
  && nvm install ${NODE_VERSION} \
  && npm ci --only=production

EXPOSE $

# https://snyk.io/blog/10-best-practices-to-containerize-nodejs-web-applications-with-docker/
# https://github.com/Yelp/dumb-init#usage
# https://docs.docker.com/engine/reference/builder/#cmd
ENTRYPOINT ["/usr/bin/dumb-init", "--"]
CMD ["/bin/bash", "-ic", "node server.js"]
