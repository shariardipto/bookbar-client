import { Sparkles } from "lucide-react";

export function PreviewNotice() {
  return (
    <p className="preview-notice">
      <Sparkles className="size-3.5 shrink-0" aria-hidden="true" />
      <span>
        A first look at our shelves. These are sample titles; borrowing opens
        soon.
      </span>
    </p>
  );
}
