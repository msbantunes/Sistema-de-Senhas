export type ThemeName = 'blue' | 'green' | 'orange' | 'red' | 'yellow' | 'purple';

export interface ColorPalette {
  '50': string;
  '100': string;
  '200': string;
  '300': string;
  '400': string;
  '500': string;
  '600': string;
  '700': string;
  '800': string;
  '900': string;
}

export interface Theme {
  name: string;
  colors: ColorPalette;
}

export const THEMES: Record<ThemeName, Theme> = {
  blue: {
    name: 'Azul (Padrão)',
    colors: {
      '50': '#f0f9ff', '100': '#e0f2fe', '200': '#bae6fd', '300': '#7dd3fc',
      '400': '#38bdf8', '500': '#0ea5e9', '600': '#0284c7', '700': '#0369a1',
      '800': '#075985', '900': '#0c4a6e',
    },
  },
  green: {
    name: 'Verde (Floresta)',
    colors: {
      '50': '#f0fdf4', '100': '#dcfce7', '200': '#bbf7d0', '300': '#86efac',
      '400': '#4ade80', '500': '#22c55e', '600': '#16a34a', '700': '#15803d',
      '800': '#166534', '900': '#14532d',
    },
  },
  orange: {
    name: 'Laranja (Crepúsculo)',
    colors: {
      '50': '#fff7ed', '100': '#ffedd5', '200': '#fed7aa', '300': '#fdba74',
      '400': '#fb923c', '500': '#f97316', '600': '#ea580c', '700': '#c2410c',
      '800': '#9a3412', '900': '#7c2d12',
    },
  },
  red: {
    name: 'Vermelho (Rubi)',
    colors: {
      '50': '#fef2f2', '100': '#fee2e2', '200': '#fecaca', '300': '#fca5a5',
      '400': '#f87171', '500': '#ef4444', '600': '#dc2626', '700': '#b91c1c',
      '800': '#991b1b', '900': '#7f1d1d',
    },
  },
  yellow: {
    name: 'Amarelo (Sol)',
    colors: {
        '50': '#fefce8', '100': '#fef9c3', '200': '#fef08a', '300': '#fde047',
        '400': '#facc15', '500': '#eab308', '600': '#ca8a04', '700': '#a16207',
        '800': '#854d0e', '900': '#713f12',
    },
  },
  purple: {
      name: 'Roxo (Ametista)',
      colors: {
        '50': '#f5f3ff', '100': '#ede9fe', '200': '#ddd6fe', '300': '#c4b5fd',
        '400': '#a78bfa', '500': '#8b5cf6', '600': '#7c3aed', '700': '#6d28d9',
        '800': '#5b21b6', '900': '#4c1d95',
      }
  }
};