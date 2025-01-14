import { definePreset } from '@primeng/themes';
import Aura from '@primeng/themes/aura';

export const MyPreset = definePreset(Aura, {
  components: {
    breadcrumb: {
      colorScheme: {
        light: {
          root: {
            background: '{#FFFFFF}',
          },
        },
        dark: {
          root: {
            background: '{#121212}',
          },
        }
      }
    }
  }
});
