import { AlertDialog as AlertDialogPrimitive } from 'bits-ui';

import Action from './alert-dialog-action.svelte';
import Cancel from './alert-dialog-cancel.svelte';
import Content from './alert-dialog-content.svelte';
import Description from './alert-dialog-description.svelte';
import Footer from './alert-dialog-footer.svelte';
import Header from './alert-dialog-header.svelte';
import Overlay from './alert-dialog-overlay.svelte';
import Portal from './alert-dialog-portal.svelte';
import Title from './alert-dialog-title.svelte';

const Root = AlertDialogPrimitive.Root;
const Trigger = AlertDialogPrimitive.Trigger;

export {
  Root,
  Content,
  Description,
  Footer,
  Header,
  Overlay,
  Portal,
  Title,
  Trigger,
  Action,
  Cancel,
  Root as AlertDialog,
  Content as AlertDialogContent,
  Description as AlertDialogDescription,
  Footer as AlertDialogFooter,
  Header as AlertDialogHeader,
  Overlay as AlertDialogOverlay,
  Portal as AlertDialogPortal,
  Title as AlertDialogTitle,
  Trigger as AlertDialogTrigger,
  Action as AlertDialogAction,
  Cancel as AlertDialogCancel,
};
