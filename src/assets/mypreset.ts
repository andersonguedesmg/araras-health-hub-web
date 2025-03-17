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
    },

    menubar: {
      colorScheme: {
        light: {
          root: {
            borderRadius: '{0}',
            borderColor: '{surface.700}',
            background: '{surface.0}',
            color: '{surface.700}',
          },
        },
        dark: {
          root: {
            background: '{surface.900}',
            color: '{surface.0}',
            borderRadius: '{0}',
            borderColor: '{surface.900}',
          },
        }
      }
    },
  }
});
