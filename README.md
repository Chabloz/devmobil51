# Devmobil 51

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