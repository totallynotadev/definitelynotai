/**
 * Toast utility - lazy loads svelte-sonner to avoid SSR store issues
 */

// Lazy-loaded toast function
let toastFn: typeof import('svelte-sonner').toast | null = null;

async function getToast() {
	if (!toastFn) {
		const module = await import('svelte-sonner');
		toastFn = module.toast;
	}
	return toastFn;
}

export const notify = {
	success: async (message: string, description?: string) => {
		const toast = await getToast();
		toast.success(message, { description });
	},

	error: async (message: string, description?: string) => {
		const toast = await getToast();
		toast.error(message, { description });
	},

	info: async (message: string, description?: string) => {
		const toast = await getToast();
		toast.info(message, { description });
	},

	warning: async (message: string, description?: string) => {
		const toast = await getToast();
		toast.warning(message, { description });
	},

	loading: async (message: string) => {
		const toast = await getToast();
		return toast.loading(message);
	},

	dismiss: async (id?: string | number) => {
		const toast = await getToast();
		toast.dismiss(id);
	},

	promise: async <T>(
		promise: Promise<T>,
		messages: {
			loading: string;
			success: string | ((data: T) => string);
			error: string | ((error: Error) => string);
		}
	) => {
		const toast = await getToast();
		return toast.promise(promise, messages);
	},

	// Custom styled toasts
	custom: async (message: string, options?: { description?: string; duration?: number }) => {
		const toast = await getToast();
		toast(message, options);
	},

	// Project-specific toasts
	projectCreated: async (name: string) => {
		const toast = await getToast();
		toast.success('Project created', { description: `"${name}" is ready to build` });
	},

	projectUpdated: async (name: string) => {
		const toast = await getToast();
		toast.success('Project updated', { description: `Changes to "${name}" saved` });
	},

	projectDeleted: async (name: string) => {
		const toast = await getToast();
		toast.success('Project deleted', { description: `"${name}" has been removed` });
	},

	buildStarted: async (name: string) => {
		const toast = await getToast();
		toast.info('Build started', { description: `Building "${name}"...` });
	},

	buildComplete: async (name: string) => {
		const toast = await getToast();
		toast.success('Build complete', { description: `"${name}" is ready to deploy` });
	},

	buildFailed: async (name: string, error?: string) => {
		const toast = await getToast();
		toast.error('Build failed', { description: error || `Failed to build "${name}"` });
	},

	deployStarted: async (platform: string) => {
		const toast = await getToast();
		toast.info('Deployment started', { description: `Deploying to ${platform}...` });
	},

	deployComplete: async (platform: string, url?: string) => {
		const toast = await getToast();
		toast.success('Deployment complete', {
			description: url ? `Live at ${url}` : `Successfully deployed to ${platform}`
		});
	},

	deployFailed: async (platform: string, error?: string) => {
		const toast = await getToast();
		toast.error('Deployment failed', { description: error || `Failed to deploy to ${platform}` });
	},

	// Settings toasts
	settingsSaved: async () => {
		const toast = await getToast();
		toast.success('Settings saved');
	},

	// Auth toasts
	signedOut: async () => {
		const toast = await getToast();
		toast.info('Signed out', { description: 'See you next time!' });
	},

	// Generic API error
	apiError: async (message?: string) => {
		const toast = await getToast();
		toast.error('Something went wrong', {
			description: message || 'Please try again later'
		});
	},

	// Copy to clipboard
	copied: async (what?: string) => {
		const toast = await getToast();
		toast.success('Copied to clipboard', {
			description: what ? `${what} copied` : undefined
		});
	}
};

// Export a function to get toast for advanced usage
export async function toast(...args: Parameters<typeof import('svelte-sonner').toast>) {
	const t = await getToast();
	return t(...args);
}
