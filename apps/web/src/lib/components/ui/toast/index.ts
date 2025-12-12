import { Toaster } from 'svelte-sonner';

import Action from './toast-action.svelte';
import Close from './toast-close.svelte';
import Description from './toast-description.svelte';
import Title from './toast-title.svelte';
import Root from './toast.svelte';

export {
  Toaster,
  Root,
  Action,
  Close,
  Description,
  Title,
  Root as Toast,
  Action as ToastAction,
  Close as ToastClose,
  Description as ToastDescription,
  Title as ToastTitle,
};

export { toast } from 'svelte-sonner';
