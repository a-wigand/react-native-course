import 'styled-components';

declare module 'styled-components' {
  export interface DefaultTheme {
    // Color
    palette: {
      common: {
        black: string;
        darkGray: string;
      };
      gradient: {
        start: string;
        end: string;
      };
      primary: string;
      secondary: string;
    };

    // Font
    fontSizeSmall: string;
    fontSizeMedium: string;
    fontSizeLarge: string;
    fontWeightLight: number;
    fontWeightMedium: number;
    fontWeightHeavy: number;

    // Layout
    borderRadiusSmall: string;
    borderRadiusMedium: string;
    paddingMedium: string;
    paddingLarge: string;
    marginMedium: string;
    marginLarge: string;
  }
}
