import type { ThemeConfig } from 'antd';
import {
  AUTH_PRIMARY,
  AUTH_BORDER_RADIUS,
  AUTH_FONT,
} from './authTheme';

export const themeConfig: ThemeConfig = {
  token: {
    colorPrimary: AUTH_PRIMARY,
    colorInfo: AUTH_PRIMARY,
    colorSuccess: '#22C55E',
    colorWarning: '#EAB308',
    colorError: '#EF4444',
    borderRadius: AUTH_BORDER_RADIUS,
    fontFamily: AUTH_FONT,
  },
  components: {
    Button: {
      controlHeight: 40,
    },
    Input: {
      controlHeight: 40,
    },
    Menu: {
      itemBorderRadius: 4,
    },
  },
};
