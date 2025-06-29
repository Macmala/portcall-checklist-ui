#!/bin/bash

# Script pour force push vers GitHub (écrase le contenu distant)

echo "🚀 Force Push vers GitHub - PortCall AI Frontend"
echo "⚠️  ATTENTION: Ceci va écraser le contenu du repository distant"

# Charger les variables d'environnement
if [ -f .env.git ]; then
    export $(cat .env.git | grep -v '^#' | xargs)
else
    echo "❌ Fichier .env.git non trouvé !"
    exit 1
fi

# Construire l'URL avec le token
REPO_URL="https://$GITHUB_TOKEN@github.com/Macmala/portcall-checklist-ui.git"

# Mettre à jour l'origine avec le token
git remote set-url origin "$REPO_URL"

# Force push vers GitHub
echo "📤 Force push en cours..."
git push --force-with-lease origin main

# Remettre l'URL propre (sans token)
git remote set-url origin "https://github.com/Macmala/portcall-checklist-ui.git"

echo "✅ Force push terminé avec succès !"
echo "📍 Repository: https://github.com/Macmala/portcall-checklist-ui"
echo "🌐 Votre interface PortCall AI est maintenant en ligne !"