# Devmobil 51

# Evaluation

# Fonctionnalités de l'application

- Un utilisateur doit pouvoir s'inscrire et/ou se connecter (selon les capacités de l'API).  
- Un utilisateur doit pouvoir effectuer les opérations CRUD sur les ressources principales du modèle de domaine de l'API.  
- L'application doit utiliser des fonctionnalités basées sur WebSocket (par exemple, synchronisation des données en temps réel, notifications ou mise à jour automatique des listes).  
- Une liste de ressources avec filtres et paramètres de recherche doit être proposée.  

---

# Implémentation

- L'application doit respecter les meilleures pratiques de Vue.js.  
- L'interface utilisateur (UI) et l'expérience utilisateur (UX) doivent être bien pensées et optimisées pour une utilisation mobile (par exemple, navigation intuitive, design responsive et interactions fluides).  
- Le code asynchrone doit être correctement géré (par exemple, via des *promises* ou *async/await*).  
- L'application doit fournir des retours clairs à l'utilisateur en cas d'erreurs probables :  
  - Lors de la soumission d'un formulaire (saisie invalide ou échec d'appel à l'API).  
  - Lors de l'utilisation de fonctionnalités WebSocket (en cas de déconnexion ou problème de synchronisation).  

---

# Livrables

Chaque groupe devra envoyer un e-mail avant une date définie (probablement fin janvier) comprenant :  
- La liste des membres du groupe.  
- Le lien vers le dépôt GitHub contenant le code source et le README pour l'installation.
- Le lien vers la présentation (si elle n'est pas incluse dans le dépôt). 

Vous devez fournir une présentation de votre application. Cela peut être :  
- Une documentation utilisateur ou un argumentaire commercial, sous la forme de :  
  - Un guide ou une présentation dans le README ou le Wiki du dépôt GitHub.  
  - Une vidéo ou une démo expliquant ou vendant l'application.  
  - Un tutoriel intégré à l'application.  
  - Toute autre méthode de présentation (discutée au préalable).  
- Cette présentation doit être accessible en ligne.  



---


Si vous voulez aussi installer Vue dans votre projet, voici les étapes à suivre:

## installation de Vue

```bash
npm install vue@latest
npm install @vitejs/plugin-vue
```

## installation de Quasar (optionnel)

```bash
npm install --save quasar @quasar/extras
npm install --save-dev @quasar/vite-plugin
```

modifier le fichier vite.config.js avec:

Vue seulement:

```javascript
import vue from '@vitejs/plugin-vue';

// et dans la partie plugin:
plugins: [vue()],
```

Vue + Quasar:

```javascript
import vue from '@vitejs/plugin-vue';
import { quasar, transformAssetUrls } from '@quasar/vite-plugin';

// et  dans la partie plugin:
plugins: [
  vue({template: { transformAssetUrls }}),
  quasar(),
],
```
