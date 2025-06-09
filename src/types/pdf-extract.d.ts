export interface Position {
  x: number;
  y: number;
  width: number;
  height: number;
  margins?: {
    left: number;
    right: number;
    top?: number;
    bottom?: number;
  };
}

export interface ElementStyle {
  fontSize: string;
  fontFamily?: string;
  textAlign?: 'left' | 'center' | 'right';
  color?: string;
  backgroundColor?: string;
}

interface BaseElement {
  position: Position;
  style: ElementStyle;
}

export interface TextElement extends BaseElement {
  type: 'paragraph' | 'heading';
  content: string;
}

export interface ListElement extends BaseElement {
  type: 'list';
  listType: 'ordered' | 'unordered';
  items: string[];
}

export interface ImageElement extends BaseElement {
  type: 'image';
  content: string; // Base64 encoded image data
  alt?: string;
}

export type PageElement = TextElement | ListElement | ImageElement;

export interface ExtractedPage {
  pageNumber: number;
  elements: PageElement[];
}

export interface ExtractedTheme {
  colors?: string[];
  fonts?: string[];
  layout?: 'magazine' | 'article' | 'minimal';
  scale?: {
    baseFontSize?: number;
    headingScale?: number;
    spacing?: number;
  };
  typography?: {
    paragraphSpacing?: number;
    lineHeight?: number;
    headingFontFamily?: string;
    bodyFontFamily?: string;
  };
}

export interface ExtractedStyle {
  fontSize: string;
  fontFamily: string;
  fontWeight?: 'normal' | 'bold';
  fontStyle?: 'normal' | 'italic';
  color?: string;
  backgroundColor?: string;
  textAlign?: 'left' | 'center' | 'right';
  lineHeight?: number;
}

export interface Layout {
  columns: number;
  spacing: number | null;
  columnWidth?: number;
  hasHeader: boolean;
  hasFooter: boolean;
  margins: {
    top: number;
    bottom: number;
    left: number;
    right: number;
  };
}

export interface ExtractedContent {
  pages: Array<{
    width: number;
    height: number;
    elements: Array<ExtractedElement>;
    layout: Layout;
  }>;
  theme: {
    colors: string[];
    fonts: string[];
    layout: 'minimal' | 'article' | 'magazine';
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
  };
  metadata: {
    pageCount: number;
    createdAt: string;
  };
}