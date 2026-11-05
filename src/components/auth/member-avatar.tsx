"use client";

import Image from "next/image";
import { useState } from "react";

export function MemberAvatar({
  name,
  image,
  large = false,
}: {
  name: string;
  image?: string | null;
  large?: boolean;
}) {
  const [failedSource, setFailedSource] = useState<string | null>(null);
  const initials =
    name
      .trim()
      .split(/\s+/)
      .slice(0, 2)
      .map((part) => part[0])
      .join("")
      .toUpperCase() || "B";
  return (
    <span className={`member-avatar${large ? " member-avatar-large" : ""}`}>
      {image && /^https?:\/\//i.test(image) && image !== failedSource ? (
        <Image
          src={image}
          alt={`${name}'s profile photo`}
          width={large ? 104 : 36}
          height={large ? 104 : 36}
          unoptimized
          onError={() => setFailedSource(image)}
        />
      ) : (
        <span role="img" aria-label={`${name}'s initials`}>
          {initials}
        </span>
      )}
    </span>
  );
}
