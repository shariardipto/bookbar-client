"use client";
import { Dialog, AlertDialog } from "radix-ui";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useRef } from "react";

function useDialogFocus() {
  const opener = useRef<HTMLElement | null>(null);
  return {
    onOpenAutoFocus: () => {
      opener.current =
        document.activeElement instanceof HTMLElement
          ? document.activeElement
          : null;
    },
    onCloseAutoFocus: (event: Event) => {
      event.preventDefault();
      const target =
        opener.current?.isConnected && !opener.current.matches(":disabled")
          ? opener.current
          : document.querySelector<HTMLElement>(
              "#main-content a[href], #main-content button:not(:disabled)",
            );
      target?.focus({ preventScroll: true });
    },
  };
}

export function LibraryDialog({
  open,
  onOpenChange,
  title,
  description,
  children,
  busy = false,
  wide = false,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description: string;
  children: React.ReactNode;
  busy?: boolean;
  wide?: boolean;
}) {
  const focus = useDialogFocus();
  return (
    <Dialog.Root
      open={open}
      onOpenChange={(value) => {
        if (!busy) onOpenChange(value);
      }}
    >
      <Dialog.Portal>
        <Dialog.Overlay className="library-overlay" />
        <Dialog.Content
          {...focus}
          className={`library-dialog${wide ? " library-dialog-wide" : ""}`}
          onEscapeKeyDown={(event) => {
            if (busy) event.preventDefault();
          }}
          onPointerDownOutside={(event) => {
            if (busy) event.preventDefault();
          }}
        >
          <Dialog.Title className="display-heading text-3xl pr-10">
            {title}
          </Dialog.Title>
          <Dialog.Description className="body-copy text-sm! mt-3 mb-7">
            {description}
          </Dialog.Description>
          {children}
          <Dialog.Close asChild>
            <Button
              variant="ghost"
              size="icon"
              className="library-dialog-close"
              aria-label="Close dialog"
              disabled={busy}
            >
              <X aria-hidden="true" />
            </Button>
          </Dialog.Close>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
export function ConfirmDialog({
  open,
  onOpenChange,
  title,
  description,
  confirmLabel,
  onConfirm,
  pending,
  error,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description: string;
  confirmLabel: string;
  onConfirm: () => void;
  pending: boolean;
  error?: string;
}) {
  const focus = useDialogFocus();
  return (
    <AlertDialog.Root
      open={open}
      onOpenChange={(value) => {
        if (!pending) onOpenChange(value);
      }}
    >
      <AlertDialog.Portal>
        <AlertDialog.Overlay className="library-overlay" />
        <AlertDialog.Content
          {...focus}
          className="library-dialog"
          onEscapeKeyDown={(event) => {
            if (pending) event.preventDefault();
          }}
        >
          <AlertDialog.Title className="display-heading text-3xl">
            {title}
          </AlertDialog.Title>
          <AlertDialog.Description className="body-copy mt-4">
            {description}
          </AlertDialog.Description>
          {error && (
            <p role="alert" className="auth-error mt-4">
              {error}
            </p>
          )}
          <div className="flex flex-wrap justify-end gap-3 mt-8">
            <AlertDialog.Cancel asChild>
              <Button variant="outline" disabled={pending}>
                Cancel
              </Button>
            </AlertDialog.Cancel>
            <AlertDialog.Action asChild>
              <Button
                disabled={pending}
                onClick={(event) => {
                  event.preventDefault();
                  onConfirm();
                }}
              >
                {pending ? "Please wait…" : confirmLabel}
              </Button>
            </AlertDialog.Action>
          </div>
        </AlertDialog.Content>
      </AlertDialog.Portal>
    </AlertDialog.Root>
  );
}
