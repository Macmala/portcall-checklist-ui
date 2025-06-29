#!/bin/bash

# Script pour push GitHub avec credentials depuis .env.git

# Charger les variables d'environnement
if [ -f .env.git ]; then
    export $(cat .env.git | grep -v '^#' | xargs)
else
    echo "❌ Fichier .env.git non trouvé !"
    echo "Créez le fichier .env.git avec :"
    echo "GITHUB_USERNAME=Macmala"
    echo "GITHUB_TOKEN=ghp_votre_token"
    exit 1
fi

# Vérifier que les variables sont définies
if [ -z "$GITHUB_USERNAME" ] || [ -z "$GITHUB_TOKEN" ]; then
    echo "❌ GITHUB_USERNAME ou GITHUB_TOKEN manquant dans .env.git"
    exit 1
fi

# Construire l'URL avec le token
REPO_URL="https://$GITHUB_TOKEN@github.com/Macmala/portcall-checklist-ui.git"

# Mettre à jour l'origine avec le token
git remote set-url origin "$REPO_URL"

# Push vers GitHub
echo "🚀 Push vers GitHub..."
git push -u origin main

# Remettre l'URL propre (sans token)
git remote set-url origin "https://github.com/Macmala/portcall-checklist-ui.git"

echo "✅ Push terminé !"
echo "📍 Repository: https://github.com/Macmala/portcall-checklist-ui"