FROM mcr.microsoft.com/devcontainers/typescript-node:1-22-bookworm

# Instalar SQLite y dependencias del sistema necesarias
RUN apt-get update && apt-get install -y \
    sqlite3 \
    libsqlite3-dev \
    && rm -rf /var/lib/apt/lists/*

# Cambiar al usuario no-root por defecto ("node") para la instalación de herramientas de usuario
USER node
WORKDIR /home/node

# Instalar Bun de forma oficial para el usuario node
RUN curl -fsSL https://bun.sh/install | bash

# Instalar Moonrepo globalmente para el usuario node
RUN curl -fsSL https://moonrepo.dev/install.sh | bash

# Añadir Bun y Moon al PATH del usuario
ENV PATH="/home/node/.bun/bin:/home/node/.moon/bin:${PATH}"

# Volver al directorio de trabajo del workspace
WORKDIR /workspace