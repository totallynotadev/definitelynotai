<script lang="ts">
  import {
    User,
    Mail,
    ExternalLink,
    Sun,
    Moon,
    Monitor,
    Globe,
    Smartphone,
    Server,
    Bell,
    BellOff,
    Key,
    Eye,
    EyeOff,
    Save,
    Trash2,
    AlertTriangle,
    Check,
    Loader2,
  } from 'lucide-svelte';
  import { fade } from 'svelte/transition';
  import { UserButton } from 'svelte-clerk';

  import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
  } from '$lib/components/ui/alert-dialog/index.js';
  import { Button } from '$lib/components/ui/button/index.js';
  import { Card, CardContent, CardHeader, CardTitle } from '$lib/components/ui/card/index.js';
  import { Input } from '$lib/components/ui/input/index.js';
  import { notify } from '$lib/utils/toast';


  import type { PageData } from './$types';

  import { browser } from '$app/environment';

  interface Props {
    data: PageData;
  }

  const { data }: Props = $props();

  // Theme state
  type Theme = 'light' | 'dark' | 'system';
  let theme = $state<Theme>('dark');

  // Default platforms state
  let defaultPlatforms = $state({
    web: true,
    ios: false,
    android: false,
    api: true,
  });

  // Notification preferences state
  let notifications = $state({
    buildComplete: true,
    buildFailure: true,
  });

  // API Keys state
  const apiKeys = $state({
    anthropic: '',
    openai: '',
  });
  let showAnthropicKey = $state(false);
  let showOpenaiKey = $state(false);
  let savingApiKeys = $state(false);
  let apiKeysSaved = $state(false);

  // Preferences state
  let savingPreferences = $state(false);
  let preferencesSaved = $state(false);

  // Delete account state
  let deleteDialogOpen = $state(false);
  let isDeleting = $state(false);
  let deleteConfirmText = $state('');

  // Load saved preferences from localStorage
  $effect(() => {
    if (browser) {
      // Load theme
      const savedTheme = localStorage.getItem('theme') as Theme | null;
      if (savedTheme && ['light', 'dark', 'system'].includes(savedTheme)) {
        theme = savedTheme;
      }

      // Load default platforms
      const savedPlatforms = localStorage.getItem('defaultPlatforms');
      if (savedPlatforms) {
        try {
          defaultPlatforms = JSON.parse(savedPlatforms);
        } catch {
          // Use defaults
        }
      }

      // Load notification preferences
      const savedNotifications = localStorage.getItem('notifications');
      if (savedNotifications) {
        try {
          notifications = JSON.parse(savedNotifications);
        } catch {
          // Use defaults
        }
      }
    }
  });

  // Theme options
  const themeOptions = [
    { value: 'light' as const, label: 'Light', icon: Sun },
    { value: 'dark' as const, label: 'Dark', icon: Moon },
    { value: 'system' as const, label: 'System', icon: Monitor },
  ];

  // Platform options
  const platformOptions = [
    { id: 'web', label: 'Web', icon: Globe, color: 'text-blue-400' },
    { id: 'ios', label: 'iOS', icon: Smartphone, color: 'text-gray-300' },
    { id: 'android', label: 'Android', icon: Smartphone, color: 'text-green-400' },
    { id: 'api', label: 'API', icon: Server, color: 'text-purple-400' },
  ];

  function setTheme(newTheme: Theme) {
    theme = newTheme;
    if (browser) {
      localStorage.setItem('theme', newTheme);
      // Apply theme to document
      if (newTheme === 'dark' || (newTheme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    }
  }

  function togglePlatform(platformId: string) {
    defaultPlatforms[platformId as keyof typeof defaultPlatforms] =
      !defaultPlatforms[platformId as keyof typeof defaultPlatforms];
  }

  async function savePreferences() {
    savingPreferences = true;
    preferencesSaved = false;

    // Save to localStorage
    if (browser) {
      localStorage.setItem('defaultPlatforms', JSON.stringify(defaultPlatforms));
      localStorage.setItem('notifications', JSON.stringify(notifications));
    }

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 500));

    savingPreferences = false;
    preferencesSaved = true;
    notify.settingsSaved();

    // Reset saved indicator after 2 seconds
    setTimeout(() => {
      preferencesSaved = false;
    }, 2000);
  }

  async function saveApiKeys() {
    savingApiKeys = true;
    apiKeysSaved = false;

    // TODO: Save API keys to backend
    console.log('Saving API keys...');

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 500));

    savingApiKeys = false;
    apiKeysSaved = true;
    notify.success('API keys saved');

    // Reset saved indicator after 2 seconds
    setTimeout(() => {
      apiKeysSaved = false;
    }, 2000);
  }

  function _maskApiKey(key: string): string {
    if (!key) {return '';}
    if (key.length <= 8) {return '•'.repeat(key.length);}
    return key.slice(0, 4) + '•'.repeat(key.length - 8) + key.slice(-4);
  }

  async function handleDeleteAccount() {
    if (deleteConfirmText !== 'delete my account') {
      return;
    }

    isDeleting = true;

    try {
      // TODO: Call Clerk API to delete account
      console.log('Deleting account...');

      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));

      notify.success('Account deleted', 'Your account has been permanently removed');

      // Redirect to home after deletion
      window.location.href = '/';
    } catch (error) {
      console.error('Failed to delete account:', error);
      notify.apiError('Failed to delete account');
      isDeleting = false;
    }
  }

  function _openClerkProfile() {
    // The UserButton component handles this, but we can also use Clerk's openUserProfile
    // For now, we'll just show a message
    // eslint-disable-next-line no-console
    console.log('Open Clerk profile');
  }
</script>

<svelte:head>
  <title>Settings | Definitely Not AI</title>
</svelte:head>

<div class="mx-auto max-w-2xl space-y-8" in:fade={{ duration: 200 }}>
  <div>
    <p class="text-gray-400">
      Configure your Definitely Not AI workspace and preferences.
    </p>
  </div>

  <!-- Profile Section -->
  <Card class="border-gray-800 bg-gray-900">
    <CardHeader>
      <CardTitle class="text-white">Profile</CardTitle>
    </CardHeader>
    <CardContent class="space-y-6">
      <p class="text-sm text-gray-400">Your account information is managed by Clerk.</p>

      <div class="flex items-start gap-6">
        <!-- Avatar -->
        <div class="flex-shrink-0">
          <UserButton
            appearance={{
              elements: {
                avatarBox: 'h-20 w-20',
              },
            }}
          />
        </div>

        <!-- User Info -->
        <div class="flex-1 space-y-4">
          <div>
            <label class="flex items-center gap-2 text-sm font-medium text-gray-400">
              <User class="h-4 w-4" />
              Name
            </label>
            <p class="mt-1 text-lg text-white">
              {data.user?.name || 'Not set'}
            </p>
          </div>

          <div>
            <label class="flex items-center gap-2 text-sm font-medium text-gray-400">
              <Mail class="h-4 w-4" />
              Email
            </label>
            <p class="mt-1 text-lg text-white">
              {data.user?.email || 'Not set'}
            </p>
          </div>
        </div>
      </div>

      <div class="border-t border-gray-800 pt-4">
        <p class="mb-3 text-sm text-gray-400">
          To update your profile, password, or connected accounts, use the Clerk profile manager.
        </p>
        <Button
          variant="outline"
          class="border-gray-700 text-gray-300 hover:bg-gray-800"
          onclick={openClerkProfile}
        >
          <ExternalLink class="mr-2 h-4 w-4" />
          Manage Account
        </Button>
      </div>
    </CardContent>
  </Card>

  <!-- Preferences Section -->
  <Card class="border-gray-800 bg-gray-900">
    <CardHeader>
      <CardTitle class="text-white">Preferences</CardTitle>
    </CardHeader>
    <CardContent class="space-y-6">
      <!-- Theme -->
      <div>
        <label class="mb-3 block text-sm font-medium text-gray-300">Theme</label>
        <div class="flex gap-2">
          {#each themeOptions as option}
            {@const Icon = option.icon}
            <button
              type="button"
              onclick={() => setTheme(option.value)}
              class="flex flex-1 items-center justify-center gap-2 rounded-lg border-2 px-4 py-3 transition-all {theme ===
              option.value
                ? 'border-purple-500 bg-purple-500/10 text-white'
                : 'border-gray-700 bg-gray-800 text-gray-400 hover:border-gray-600 hover:text-gray-300'}"
            >
              <Icon class="h-4 w-4" />
              <span class="text-sm font-medium">{option.label}</span>
            </button>
          {/each}
        </div>
      </div>

      <!-- Default Platforms -->
      <div>
        <label class="mb-3 block text-sm font-medium text-gray-300">
          Default Platforms for New Projects
        </label>
        <p class="mb-3 text-sm text-gray-500">
          These platforms will be pre-selected when creating new projects.
        </p>
        <div class="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {#each platformOptions as platform}
            {@const Icon = platform.icon}
            {@const isSelected = defaultPlatforms[platform.id as keyof typeof defaultPlatforms]}

            <button
              type="button"
              onclick={() => togglePlatform(platform.id)}
              class="flex flex-col items-center gap-2 rounded-lg border-2 p-4 transition-all {isSelected
                ? 'border-purple-500 bg-purple-500/10'
                : 'border-gray-700 bg-gray-800 hover:border-gray-600'}"
            >
              <Icon class="h-6 w-6 {isSelected ? platform.color : 'text-gray-500'}" />
              <span class="text-sm font-medium {isSelected ? 'text-white' : 'text-gray-400'}">
                {platform.label}
              </span>
              {#if isSelected}
                <Check class="h-4 w-4 text-purple-400" />
              {/if}
            </button>
          {/each}
        </div>
      </div>

      <!-- Notification Preferences -->
      <div>
        <label class="mb-3 block text-sm font-medium text-gray-300">
          Email Notifications
        </label>
        <div class="space-y-3">
          <label class="flex cursor-pointer items-center justify-between rounded-lg border border-gray-700 bg-gray-800 p-4">
            <div class="flex items-center gap-3">
              <Bell class="h-5 w-5 text-green-400" />
              <div>
                <p class="font-medium text-white">Build Complete</p>
                <p class="text-sm text-gray-400">Get notified when your project finishes building</p>
              </div>
            </div>
            <button
              type="button"
              onclick={() => (notifications.buildComplete = !notifications.buildComplete)}
              class="relative inline-flex h-6 w-11 items-center rounded-full transition-colors {notifications.buildComplete
                ? 'bg-purple-600'
                : 'bg-gray-700'}"
              role="switch"
              aria-checked={notifications.buildComplete}
              aria-label="Toggle build complete notifications"
            >
              <span
                class="inline-block h-4 w-4 transform rounded-full bg-white transition-transform {notifications.buildComplete
                  ? 'translate-x-6'
                  : 'translate-x-1'}"
              ></span>
            </button>
          </label>

          <label class="flex cursor-pointer items-center justify-between rounded-lg border border-gray-700 bg-gray-800 p-4">
            <div class="flex items-center gap-3">
              <BellOff class="h-5 w-5 text-red-400" />
              <div>
                <p class="font-medium text-white">Build Failure</p>
                <p class="text-sm text-gray-400">Get notified when a build fails</p>
              </div>
            </div>
            <button
              type="button"
              onclick={() => (notifications.buildFailure = !notifications.buildFailure)}
              class="relative inline-flex h-6 w-11 items-center rounded-full transition-colors {notifications.buildFailure
                ? 'bg-purple-600'
                : 'bg-gray-700'}"
              role="switch"
              aria-checked={notifications.buildFailure}
              aria-label="Toggle build failure notifications"
            >
              <span
                class="inline-block h-4 w-4 transform rounded-full bg-white transition-transform {notifications.buildFailure
                  ? 'translate-x-6'
                  : 'translate-x-1'}"
              ></span>
            </button>
          </label>
        </div>
      </div>

      <div class="border-t border-gray-800 pt-4">
        <Button
          onclick={savePreferences}
          disabled={savingPreferences}
          class="bg-purple-600 hover:bg-purple-700 disabled:opacity-50"
        >
          {#if savingPreferences}
            <Loader2 class="mr-2 h-4 w-4 animate-spin" />
            Saving...
          {:else if preferencesSaved}
            <Check class="mr-2 h-4 w-4" />
            Saved!
          {:else}
            <Save class="mr-2 h-4 w-4" />
            Save Preferences
          {/if}
        </Button>
      </div>
    </CardContent>
  </Card>

  <!-- API Keys Section -->
  <Card class="border-gray-800 bg-gray-900">
    <CardHeader>
      <CardTitle class="flex items-center gap-2 text-white">
        <Key class="h-5 w-5" />
        API Keys
      </CardTitle>
    </CardHeader>
    <CardContent class="space-y-6">
      <div class="rounded-lg border border-yellow-500/30 bg-yellow-500/10 p-4">
        <div class="flex items-start gap-3">
          <AlertTriangle class="mt-0.5 h-5 w-5 flex-shrink-0 text-yellow-400" />
          <div>
            <p class="font-medium text-yellow-400">Coming Soon</p>
            <p class="mt-1 text-sm text-yellow-300/80">
              Connect your own API keys to use your personal quotas. This feature is under development.
            </p>
          </div>
        </div>
      </div>

      <!-- Anthropic API Key -->
      <div>
        <label for="anthropic-key" class="mb-2 block text-sm font-medium text-gray-300">
          Anthropic API Key
        </label>
        <div class="flex gap-2">
          <div class="relative flex-1">
            <Input
              id="anthropic-key"
              type={showAnthropicKey ? 'text' : 'password'}
              bind:value={apiKeys.anthropic}
              placeholder="sk-ant-••••••••••••••••"
              disabled
              class="border-gray-700 bg-gray-800 pr-10 font-mono text-white disabled:opacity-50"
            />
          </div>
          <Button
            variant="outline"
            onclick={() => (showAnthropicKey = !showAnthropicKey)}
            disabled
            class="border-gray-700 text-gray-300 hover:bg-gray-800 disabled:opacity-50"
          >
            {#if showAnthropicKey}
              <EyeOff class="h-4 w-4" />
            {:else}
              <Eye class="h-4 w-4" />
            {/if}
          </Button>
        </div>
        <p class="mt-1.5 text-xs text-gray-500">
          Used for Claude models. Get your key from{' '}
          <a
            href="https://console.anthropic.com"
            target="_blank"
            rel="noopener noreferrer"
            class="text-purple-400 hover:text-purple-300"
          >
            console.anthropic.com
          </a>
        </p>
      </div>

      <!-- OpenAI API Key -->
      <div>
        <label for="openai-key" class="mb-2 block text-sm font-medium text-gray-300">
          OpenAI API Key
        </label>
        <div class="flex gap-2">
          <div class="relative flex-1">
            <Input
              id="openai-key"
              type={showOpenaiKey ? 'text' : 'password'}
              bind:value={apiKeys.openai}
              placeholder="sk-••••••••••••••••••••••••"
              disabled
              class="border-gray-700 bg-gray-800 pr-10 font-mono text-white disabled:opacity-50"
            />
          </div>
          <Button
            variant="outline"
            onclick={() => (showOpenaiKey = !showOpenaiKey)}
            disabled
            class="border-gray-700 text-gray-300 hover:bg-gray-800 disabled:opacity-50"
          >
            {#if showOpenaiKey}
              <EyeOff class="h-4 w-4" />
            {:else}
              <Eye class="h-4 w-4" />
            {/if}
          </Button>
        </div>
        <p class="mt-1.5 text-xs text-gray-500">
          Used as fallback. Get your key from{' '}
          <a
            href="https://platform.openai.com/api-keys"
            target="_blank"
            rel="noopener noreferrer"
            class="text-purple-400 hover:text-purple-300"
          >
            platform.openai.com
          </a>
        </p>
      </div>

      <div class="border-t border-gray-800 pt-4">
        <Button
          onclick={saveApiKeys}
          disabled={true}
          class="bg-purple-600 hover:bg-purple-700 disabled:opacity-50"
        >
          {#if savingApiKeys}
            <Loader2 class="mr-2 h-4 w-4 animate-spin" />
            Saving...
          {:else if apiKeysSaved}
            <Check class="mr-2 h-4 w-4" />
            Saved!
          {:else}
            <Save class="mr-2 h-4 w-4" />
            Save API Keys
          {/if}
        </Button>
      </div>
    </CardContent>
  </Card>

  <!-- Danger Zone -->
  <Card class="border-red-500/30 bg-gray-900">
    <CardHeader>
      <CardTitle class="flex items-center gap-2 text-red-400">
        <AlertTriangle class="h-5 w-5" />
        Danger Zone
      </CardTitle>
    </CardHeader>
    <CardContent class="space-y-4">
      <p class="text-sm text-gray-400">
        These actions are irreversible. Please proceed with caution.
      </p>

      <div class="rounded-lg border border-red-500/30 bg-red-500/5 p-4">
        <div class="flex items-start justify-between gap-4">
          <div>
            <h4 class="font-medium text-white">Delete Account</h4>
            <p class="mt-1 text-sm text-gray-400">
              Permanently delete your account and all associated data including projects,
              deployments, and settings. This action cannot be undone.
            </p>
          </div>
          <Button
            onclick={() => (deleteDialogOpen = true)}
            class="flex-shrink-0 bg-red-600 hover:bg-red-700"
          >
            <Trash2 class="mr-2 h-4 w-4" />
            Delete Account
          </Button>
        </div>
      </div>
    </CardContent>
  </Card>
</div>

<!-- Delete Account Confirmation Dialog -->
<AlertDialog bind:open={deleteDialogOpen}>
  <AlertDialogContent class="border-gray-800 bg-gray-900">
    <AlertDialogHeader>
      <AlertDialogTitle class="flex items-center gap-2 text-red-400">
        <AlertTriangle class="h-5 w-5" />
        Delete Account
      </AlertDialogTitle>
      <AlertDialogDescription class="text-gray-400">
        This action is permanent and cannot be undone. Deleting your account will:
      </AlertDialogDescription>
    </AlertDialogHeader>

    <div class="my-4 space-y-2">
      <div class="flex items-center gap-2 text-sm text-gray-300">
        <span class="h-1.5 w-1.5 rounded-full bg-red-400"></span>
        Delete all your projects and generated code
      </div>
      <div class="flex items-center gap-2 text-sm text-gray-300">
        <span class="h-1.5 w-1.5 rounded-full bg-red-400"></span>
        Remove all deployments and their URLs
      </div>
      <div class="flex items-center gap-2 text-sm text-gray-300">
        <span class="h-1.5 w-1.5 rounded-full bg-red-400"></span>
        Erase your account settings and preferences
      </div>
      <div class="flex items-center gap-2 text-sm text-gray-300">
        <span class="h-1.5 w-1.5 rounded-full bg-red-400"></span>
        Remove your authentication from Clerk
      </div>
    </div>

    <div class="my-4">
      <label for="delete-confirm" class="mb-2 block text-sm text-gray-400">
        Type <span class="font-mono text-red-400">delete my account</span> to confirm:
      </label>
      <Input
        id="delete-confirm"
        type="text"
        bind:value={deleteConfirmText}
        placeholder="delete my account"
        class="border-gray-700 bg-gray-800 text-white"
      />
    </div>

    <AlertDialogFooter>
      <AlertDialogCancel
        class="border-gray-700 text-gray-300 hover:bg-gray-800"
        onclick={() => {
          deleteConfirmText = '';
        }}
      >
        Cancel
      </AlertDialogCancel>
      <AlertDialogAction
        class="bg-red-600 text-white hover:bg-red-700 disabled:opacity-50"
        onclick={handleDeleteAccount}
        disabled={deleteConfirmText !== 'delete my account' || isDeleting}
      >
        {#if isDeleting}
          <Loader2 class="mr-2 h-4 w-4 animate-spin" />
          Deleting...
        {:else}
          <Trash2 class="mr-2 h-4 w-4" />
          Delete Account
        {/if}
      </AlertDialogAction>
    </AlertDialogFooter>
  </AlertDialogContent>
</AlertDialog>
