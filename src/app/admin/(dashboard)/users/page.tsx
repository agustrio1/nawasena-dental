import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";

import { getAdminActor } from "@/lib/admin-authz";
import { listAllUsers } from "@/lib/admin-data";
import { UserRowActions } from "@/components/admin/user-row-actions";
import { Button } from "@/components/admin/ui/button";
import { Card, CardContent } from "@/components/admin/ui/card";
import { formatDate } from "@/lib/format";
import { cn } from "@/lib/cn";

export const instant = false;

export const metadata: Metadata = {
  title: "Pengguna",
  robots: { index: false, follow: false },
};

export default async function AdminUsersPage() {
  const actor = await getAdminActor();
  if (!actor) redirect("/admin");

  const items = await listAllUsers();

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-serif text-2xl text-forest">Pengguna</h1>
          <p className="mt-1 text-sm text-charcoal/65">
            {items.length} akun · hanya admin yang dapat membuka halaman ini.
          </p>
        </div>
        <Button asChild>
          <Link href="/admin/users/new">Pengguna Baru</Link>
        </Button>
      </div>

      {items.length === 0 ? (
        <Card>
          <CardContent className="py-10 text-center text-sm text-charcoal/60">
            Belum ada pengguna.
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="divide-y divide-line p-0">
            {items.map((item) => {
              const isSelf = item.id === actor.id;
              return (
                <div
                  key={item.id}
                  className="flex flex-wrap items-center justify-between gap-4 p-4"
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-3">
                      <h2 className="truncate text-h3 text-forest">
                        {item.name || item.email}
                      </h2>
                      <span
                        className={cn(
                          "rounded-full px-2.5 py-0.5 text-xs font-medium capitalize",
                          item.role === "admin"
                            ? "bg-forest text-ivory"
                            : "bg-sage text-forest"
                        )}
                      >
                        {item.role}
                      </span>
                      {isSelf && (
                        <span className="text-xs text-charcoal/45">(Anda)</span>
                      )}
                      {!item.isActive && (
                        <span className="rounded-full bg-error/10 px-2.5 py-0.5 text-xs font-medium text-error">
                          Nonaktif
                        </span>
                      )}
                    </div>
                    <p className="mt-1 truncate text-sm text-charcoal/65">
                      {item.email}
                    </p>
                  </div>

                  <div className="flex items-center gap-4">
                    <span className="hidden text-xs text-charcoal/45 sm:inline">
                      Dibuat {formatDate(item.createdAt)}
                    </span>
                    <UserRowActions id={item.id} isSelf={isSelf} isActive={item.isActive} />
                  </div>
                </div>
              );
            })}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
