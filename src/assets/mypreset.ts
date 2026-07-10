import { definePreset } from '@primeng/themes';
import Aura from '@primeng/themes/aura';

export const MyPreset = definePreset(Aura, {
  components: {
    breadcrumb: {
      colorScheme: {
        light: {
          root: {
            background: 'transparent',
            borderColor: 'transparent',
            padding: '0px',
          },
          item: {
            color: '{surface.500}',
            focusColor: '{surface.900}',
            iconColor: '{surface.500}',
            iconFocusColor: '{surface.900}',
          },
          separator: {
            color: '{surface.300}',
          },
        },
        dark: {
          root: {
            background: 'transparent',
            borderColor: 'transparent',
            padding: '0px',
          },
          item: {
            color: '{surface.400}',
            focusColor: '#ffffff',
            iconColor: '{surface.400}',
            iconFocusColor: '#ffffff',
          },
          separator: {
            color: '{surface.700}',
          },
        },
      },
    },

    menubar: {
      colorScheme: {
        light: {
          root: {
            borderRadius: '0px',
            borderColor: '{surface.200}',
            background: '{surface.50}',
            color: '{surface.700}',
            padding: '0.75rem 1.5rem',
          },
          item: {
            focusBackground: '{surface.200}',
            activeBackground: '{surface.200}',
            color: '{surface.800}',
            focusColor: '{primary.600}',
            iconColor: '{surface.500}',
            iconFocusColor: '{primary.600}',
          },
          submenu: {
            background: '{surface.0}',
            borderColor: '{surface.200}',
            shadow:
              '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
          },
        },
        dark: {
          root: {
            background: '#09090b',
            color: '#d4d4d8',
            borderRadius: '0px',
            borderColor: 'transparent',
            padding: '0.75rem 1.5rem',
          },
          item: {
            focusBackground: '#18181b',
            activeBackground: '#18181b',
            color: '#d4d4d8',
            focusColor: '#ffffff',
            iconColor: '#a1a1aa',
            iconFocusColor: '#ffffff',
          },
          submenu: {
            background: '#09090b',
            borderColor: '#27272a',
            shadow:
              '0 20px 25px -5px rgba(0, 0, 0, 0.3), 0 10px 10px -5px rgba(0, 0, 0, 0.3)',
          },
        },
      },
    },

    menu: {
      colorScheme: {
        light: {
          root: {
            background: '{surface.0}',
            borderColor: '{surface.200}',
            shadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
          },
          item: {
            focusBackground: '{surface.100}',
            color: '{surface.700}',
            focusColor: '{surface.900}',
            iconColor: '{surface.500}',
            iconFocusColor: '{surface.700}',
          },
        },
        dark: {
          root: {
            background: '#09090b',
            borderColor: '#27272a',
            shadow: '0 25px 50px -12px rgba(0, 0, 0, 0.4)',
          },
          item: {
            focusBackground: '#18181b',
            color: '#d4d4d8',
            focusColor: '#ffffff',
            iconColor: '#71717a',
            iconFocusColor: '#ffffff',
          },
        },
      },
    },
  },
});
