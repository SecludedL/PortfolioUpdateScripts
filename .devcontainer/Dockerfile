# See here for image contents: https://github.com/microsoft/vscode-dev-containers/tree/v0.166.1/containers/typescript-node/.devcontainer/base.Dockerfile

ARG VARIANT="16"
FROM mcr.microsoft.com/vscode/devcontainers/typescript-node:0-${VARIANT}

# [Optional] Uncomment this section to install additional OS packages.
# RUN apt-get update && export DEBIAN_FRONTEND=noninteractive \
#     && apt-get -y install --no-install-recommends <your-package-list-here>

# [Optional] Uncomment if you want to install an additional version of node using nvm
# ARG EXTRA_NODE_VERSION=10
# RUN su node -c "source /usr/local/share/nvm/nvm.sh && nvm install ${EXTRA_NODE_VERSION}"
USER root

# [Optional] Uncomment if you want to install more global node packages
RUN npm install -g @google/clasp
