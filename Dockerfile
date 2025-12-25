# Dockerfile
FROM node:18-alpine

WORKDIR /app

# Copier les fichiers de configuration
COPY package*.json ./
COPY server.js ./
COPY base/init.sql ./base/

# Installer les dépendances
RUN npm ci --only=production

# Copier le frontend buildé (si nécessaire)
# Si le frontend est séparé, vous pourriez avoir besoin d'un multi-stage build
COPY front/public ./front/public
COPY front/build ./front/build

# Exposer le port
EXPOSE 3000

# Commande de démarrage
CMD ["node", "server.js"]