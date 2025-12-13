export type Platform = 'web' | 'mobile' | 'api';

export interface Template {
  id: string;
  name: string;
  description: string;
  platform: Platform;
  path: string;
  injectionPoints: InjectionPoint[];
  dependencies: Record<string, string>;
  devDependencies: Record<string, string>;
}

export interface InjectionPoint {
  marker: string;           // e.g., '@agent:inject:schema'
  file: string;             // e.g., 'src/lib/server/db/schema.ts'
  type: 'replace' | 'append' | 'prepend';
  description: string;
}

export interface TemplateFile {
  path: string;
  content: string;
}

export interface InjectionRequest {
  marker: string;
  content: string;
}
