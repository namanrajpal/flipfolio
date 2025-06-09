import React from 'react';
import { ExtractedTheme } from '@/types/pdf-extract';

interface DocumentThemeContextValue {
  colors: string[];
  fonts: string[];
  layout: 'magazine' | 'article' | 'minimal';
  scale: {
    baseFontSize: number;
    headingScale: number;
    spacing: number;
  };
  typography: {
    paragraphSpacing: number;
    lineHeight: number;
    headingFontFamily?: string;
    bodyFontFamily?: string;
  };
}

const defaultTheme: DocumentThemeContextValue = {
  colors: ['#000000'],
  fonts: ['system-ui'],
  layout: 'minimal',
  scale: {
    baseFontSize: 16,
    headingScale: 1.5,
    spacing: 1.5
  },
  typography: {
    paragraphSpacing: 1.4,
    lineHeight: 1.5
  }
};

const DocumentThemeContext = React.createContext<DocumentThemeContextValue>(defaultTheme);

interface DocumentThemeProviderProps {
  children: React.ReactNode;
  theme: ExtractedTheme;
}

export function DocumentThemeProvider({ children, theme }: DocumentThemeProviderProps) {
  const processedTheme: DocumentThemeContextValue = {
    colors: theme.colors || defaultTheme.colors,
    fonts: theme.fonts || defaultTheme.fonts,
    layout: theme.layout || defaultTheme.layout,
    scale: {
      baseFontSize: theme.scale?.baseFontSize || defaultTheme.scale.baseFontSize,
      headingScale: theme.scale?.headingScale || defaultTheme.scale.headingScale,
      spacing: theme.scale?.spacing || defaultTheme.scale.spacing
    },
    typography: {
      paragraphSpacing: theme.typography?.paragraphSpacing || defaultTheme.typography.paragraphSpacing,
      lineHeight: theme.typography?.lineHeight || defaultTheme.typography.lineHeight,
      headingFontFamily: theme.typography?.headingFontFamily,
      bodyFontFamily: theme.typography?.bodyFontFamily
    }
  };

  return (
    <DocumentThemeContext.Provider value={processedTheme}>
      {children}
    </DocumentThemeContext.Provider>
  );
}

export function useDocumentTheme() {
  const context = React.useContext(DocumentThemeContext);
  if (!context) {
    throw new Error('useDocumentTheme must be used within a DocumentThemeProvider');
  }
  return context;
}

export function useThemeStyles() {
  const theme = useDocumentTheme();
  
  return React.useMemo(() => {
    const baseStyles = {
      fontFamily: theme.typography.bodyFontFamily || theme.fonts[0],
      fontSize: `${theme.scale.baseFontSize}px`,
      lineHeight: theme.typography.lineHeight,
      color: theme.colors[0]
    };

    const headingStyles = {
      fontFamily: theme.typography.headingFontFamily || theme.fonts[0],
      fontSize: `${theme.scale.baseFontSize * theme.scale.headingScale}px`,
      lineHeight: theme.typography.lineHeight * 0.9,
      color: theme.colors[0],
      fontWeight: 600
    };

    const layoutStyles = {
      magazine: {
        maxWidth: '1200px',
        columnCount: 2,
        columnGap: '2rem'
      },
      article: {
        maxWidth: '800px',
        margin: '0 auto'
      },
      minimal: {
        maxWidth: '100%'
      }
    }[theme.layout];

    return {
      base: baseStyles,
      heading: headingStyles,
      layout: layoutStyles
    };
  }, [theme]);
}