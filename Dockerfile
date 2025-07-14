# Étape 1 : Utiliser Node.js LTS
FROM node:lts

# Étape 2 : Installer pnpm globalement
RUN corepack enable && corepack prepare pnpm@latest --activate

# Étape 3 : Créer un dossier de travail
WORKDIR /app

# Étape 4 : Copier les fichiers de dépendances
COPY pnpm-lock.yaml package.json ./

# Étape 5 : Installer les dépendances
RUN pnpm install

# Étape 6 : Copier tout le reste de l'application
COPY . .

# Étape 7 : Exposer le port (ex : Vite = 5173, NestJS = 3000)
EXPOSE 5000

# Étape 8 : Lancer l’application en mode dev
CMD ["pnpm", "run", "dev"]
