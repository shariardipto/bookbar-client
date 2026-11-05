"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { DropdownMenu } from "radix-ui";
import { ChevronDown, LogOut, UserRound } from "lucide-react";
import { toast } from "sonner";
import { authClient } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";
import { MemberAvatar } from "./member-avatar";

export function LogoutButton({
  onComplete,
  ...props
}: React.ComponentProps<"button"> & { onComplete?: () => void }) {
  const [pending, setPending] = useState(false);
  const router = useRouter();
  async function logout() {
    setPending(true);
    try {
      const result = await authClient.signOut();
      if (result.error) {
        toast.error("We could not log you out. Please try again.");
        return;
      }
      onComplete?.();
      toast.success("You have been logged out.");
      router.replace("/");
      router.refresh();
    } catch {
      toast.error("We could not log you out. Please try again.");
    } finally {
      setPending(false);
    }
  }
  return (
    <button
      {...props}
      type="button"
      className="account-menu-item w-full"
      disabled={pending || props.disabled}
      onClick={(event) => {
        props.onClick?.(event);
        if (!event.defaultPrevented) void logout();
      }}
    >
      <LogOut className="size-4" aria-hidden="true" />
      {pending ? "Logging out…" : "Log out"}
    </button>
  );
}

export function AccountMenu({
  user,
}: {
  user: { name: string; email: string; image?: string | null };
}) {
  return (
    <DropdownMenu.Root>
      <DropdownMenu.Trigger asChild>
        <Button
          variant="ghost"
          className="account-trigger"
          aria-label={`Open account menu for ${user.name}`}
          title={user.name}
        >
          <MemberAvatar name={user.name} image={user.image} />
          <span className="max-w-24 truncate">{user.name.split(" ")[0]}</span>
          <ChevronDown aria-hidden="true" />
        </Button>
      </DropdownMenu.Trigger>
      <DropdownMenu.Portal>
        <DropdownMenu.Content
          className="account-menu"
          align="end"
          sideOffset={12}
        >
          <DropdownMenu.Label className="account-menu-label">
            <span className="block font-bold">{user.name}</span>
            <span className="block text-slate mt-1 text-xs">{user.email}</span>
          </DropdownMenu.Label>
          <DropdownMenu.Separator className="my-2 h-px bg-mist" />
          <DropdownMenu.Item asChild>
            <Link href="/profile" className="account-menu-item">
              <UserRound className="size-4" aria-hidden="true" />
              My profile
            </Link>
          </DropdownMenu.Item>
          <DropdownMenu.Item
            asChild
            onSelect={(event) => event.preventDefault()}
          >
            <LogoutButton />
          </DropdownMenu.Item>
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  );
}
