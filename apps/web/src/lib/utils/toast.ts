import { toast } from 'svelte-sonner';

export const notify = {
  success: (message: string, description?: string) =>
    toast.success(message, { description }),

  error: (message: string, description?: string) =>
    toast.error(message, { description }),

  info: (message: string, description?: string) =>
    toast.info(message, { description }),

  warning: (message: string, description?: string) =>
    toast.warning(message, { description }),

  loading: (message: string) => toast.loading(message),

  dismiss: (id?: string | number) => toast.dismiss(id),

  promise: <T>(
    promise: Promise<T>,
    messages: {
      loading: string;
      success: string | ((data: T) => string);
      error: string | ((error: Error) => string);
    }
  ) => toast.promise(promise, messages),

  // Custom styled toasts
  custom: (message: string, options?: { description?: string; duration?: number }) =>
    toast(message, options),

  // Project-specific toasts
  projectCreated: (name: string) =>
    toast.success('Project created', { description: `"${name}" is ready to build` }),

  projectUpdated: (name: string) =>
    toast.success('Project updated', { description: `Changes to "${name}" saved` }),

  projectDeleted: (name: string) =>
    toast.success('Project deleted', { description: `"${name}" has been removed` }),

  buildStarted: (name: string) =>
    toast.info('Build started', { description: `Building "${name}"...` }),

  buildComplete: (name: string) =>
    toast.success('Build complete', { description: `"${name}" is ready to deploy` }),

  buildFailed: (name: string, error?: string) =>
    toast.error('Build failed', { description: error || `Failed to build "${name}"` }),

  deployStarted: (platform: string) =>
    toast.info('Deployment started', { description: `Deploying to ${platform}...` }),

  deployComplete: (platform: string, url?: string) =>
    toast.success('Deployment complete', {
      description: url ? `Live at ${url}` : `Successfully deployed to ${platform}`,
    }),

  deployFailed: (platform: string, error?: string) =>
    toast.error('Deployment failed', { description: error || `Failed to deploy to ${platform}` }),

  // Settings toasts
  settingsSaved: () => toast.success('Settings saved'),

  // Auth toasts
  signedOut: () => toast.info('Signed out', { description: 'See you next time!' }),

  // Generic API error
  apiError: (message?: string) =>
    toast.error('Something went wrong', {
      description: message || 'Please try again later',
    }),

  // Copy to clipboard
  copied: (what?: string) =>
    toast.success('Copied to clipboard', {
      description: what ? `${what} copied` : undefined,
    }),
};

// Re-export the raw toast for advanced usage
export { toast };
