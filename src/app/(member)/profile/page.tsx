import type { Metadata } from "next";
import Link from "next/link";
import { requireMember } from "@/lib/member-session";
import { MemberAvatar } from "@/components/auth/member-avatar";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = { title: "My Profile" };

export default async function ProfilePage() {
  const { user } = await requireMember("/profile");
  return (
    <section className="site-container member-workspace">
      <p className="section-eyebrow">Your membership</p>
      <h1 className="section-title mt-4">A little about you.</h1>
      <div className="profile-card">
        <div className="profile-heading">
          <MemberAvatar name={user.name} image={user.image} large />
          <div>
            <p className="section-eyebrow mb-3">BookBar member</p>
            <h2 className="display-heading text-3xl break-words">
              {user.name}
            </h2>
          </div>
        </div>
        <dl className="profile-details">
          <div>
            <dt>Full name</dt>
            <dd>{user.name}</dd>
          </div>
          <div>
            <dt>Email address</dt>
            <dd>{user.email}</dd>
          </div>
        </dl>
        <p className="auth-hint mt-6">
          These details belong to your BookBar account.
        </p>
        <div className="flex flex-wrap gap-3 mt-7">
          <Button asChild>
            <Link href="/my-borrows">My reading shelf</Link>
          </Button>
          <Button variant="outline" asChild>
            <Link href="/books">Browse books</Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
