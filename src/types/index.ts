import type { PropertiesHyphen } from 'csstype';

export type Block =
  | `h1`
  | `h2`
  | `h3`
  | `h4`
  | `p`
  | `blockquote`
  | `blockquote_p`
  | `code_pre`
  | `code`
  | `image`
  | `ol`
  | `ul`
  | `footnotes`
  | `figure`
  | `hr`;
export type Inline =
  | `listitem`
  | `codespan`
  | `link`
  | `wx_link`
  | `strong`
  | `table`
  | `thead`
  | `td`
  | `footnote`
  | `figcaption`
  | `em`;

interface CustomCSSProperties {
  [`--md-primary-color`]?: string;
  [key: `--${string}`]: string | undefined;
}

export type ExtendedProperties = PropertiesHyphen & CustomCSSProperties;

export interface Theme {
  base: ExtendedProperties;
  block: Record<Block, PropertiesHyphen>;
  inline: Record<Inline, PropertiesHyphen>;
}

export interface IOpts {
  theme?: Theme;
  fonts: string;
  size: string;
  legend?: string;
  status?: boolean;
}

export type ThemeStyles = Record<Block | Inline, ExtendedProperties>;

export interface IConfigOption<VT = string> {
  label: string;
  value: VT;
  desc: string;
}

export interface PreviewTheme {
  label: string;
  name: string;
  content: string;
}

export interface Article {
  id: string;
  title?: string; // 标题
  content?: string; // 内容
  desc?: string; // 描述
  thumb?: string; // 封面
  createTs?: number;
}

export interface AiModel {
  name: string;
  from: string;
  desc?: string;
  baseUrl: string;
  apiKey?: string;
  refUrl?: string;
  temperature?: number;
  maxTokens?: number;
}

export enum AiGenerateType {
  rewrite = `优化`,
  expand = `扩写`,
  fullArticle = `优化全文`,
}

export interface PostArticleAccount {
  avatar: string;
  displayName: string;
  home: string;
  icon: string;
  supportTypes: string[];
  title: string;
  type: string;
  uid: string;
  checked?: boolean;
  status?: string;
  error?: string;
}
