export { TemplateManager } from './manager.js';

export type {
  Template,
  TemplateFile,
  InjectionPoint,
  InjectionRequest,
  Platform,
} from './types.js';

// Re-export template IDs for convenience
export const TEMPLATE_IDS = {
  WEB: 'sveltekit-web',
  MOBILE: 'expo-mobile',
  API: 'hono-backend',
} as const;
