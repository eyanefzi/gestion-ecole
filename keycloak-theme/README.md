# 🎨 Thème Keycloak – Microservices Platform

Thème personnalisé Keycloak qui reproduit fidèlement le design du frontend Angular.

## 🎯 Design System

| Élément | Valeur |
|---------|--------|
| **Couleur primaire** | `#10b981` (Emerald Green) |
| **Sidebar / Dark** | `#1a1f35` |
| **Font** | Inter (Google Fonts) |
| **Border radius** | `0.75rem` – `1.5rem` |
| **Ombres** | Douces, multicouches |

## 📁 Structure

```
keycloak-theme/
└── microservices/
    ├── login/
    │   ├── theme.properties       # Config du thème
    │   ├── template.ftl           # Layout HTML principal
    │   ├── login.ftl              # Page de connexion
    │   ├── register.ftl           # Page d'inscription
    │   ├── login-reset-password.ftl  # Mot de passe oublié
    │   ├── css/
    │   │   └── login.css          # Styles complets
    │   ├── js/
    │   │   └── login.js           # Branding + UX enhancements
    │   └── messages/
    │       ├── messages_fr.properties  # Traductions FR
    │       └── messages_en.properties  # Traductions EN
    └── account/
        ├── theme.properties
        └── css/
            └── account.css        # Styles page compte
```

## 🚀 Activation via Docker Compose

Le thème est automatiquement monté via le volume dans `docker/docker-compose.yml` :

```yaml
volumes:
  - ../keycloak-theme:/opt/keycloak/themes
```

### Appliquer le thème au realm via l'Admin Console

1. Ouvrir **http://localhost:9090** → Se connecter avec `admin / admin`
2. Sélectionner le realm **microservices**
3. Aller dans **Realm Settings** → onglet **Themes**
4. Changer **Login Theme** → `microservices`
5. Changer **Account Theme** → `microservices`
6. Cliquer **Save**

### Appliquer via CLI (Keycloak Admin CLI)

```bash
# Dans le conteneur Keycloak
docker exec -it microservices-keycloak /opt/keycloak/bin/kcadm.sh \
  config credentials \
  --server http://localhost:9090 \
  --realm master \
  --user admin \
  --password admin

docker exec -it microservices-keycloak /opt/keycloak/bin/kcadm.sh \
  update realms/microservices \
  -s loginTheme=microservices \
  -s accountTheme=microservices
```

## 🖼️ Aperçu du design

### Page de connexion
- **Panneau gauche** (45%) : fond sombre `#1a1f35` avec branding animé, badges technologiques
- **Panneau droit** (55%) : fond clair avec carte blanche, barre verte en haut
- **Bouton** : gradient vert `#10b981 → #059669` avec effet ripple
- **Inputs** : focus ring vert, border-radius `0.75rem`
- **Toggle mot de passe** : icône œil animée

### Fonctionnalités UX
- ✅ Toggle visibilité mot de passe
- ✅ Auto-focus sur le premier champ
- ✅ État de chargement sur le bouton submit
- ✅ Animation d'entrée de la carte
- ✅ Messages d'erreur stylisés
- ✅ Responsive mobile (panneau gauche masqué)
- ✅ Traductions FR/EN

## 🔧 Personnalisation

Pour modifier les couleurs, éditer les variables CSS dans `login/css/login.css` :

```css
:root {
  --primary-500: #10b981;  /* Couleur principale */
  --primary-600: #059669;  /* Hover */
  --sidebar-bg:  #1a1f35;  /* Panneau gauche */
}
```
