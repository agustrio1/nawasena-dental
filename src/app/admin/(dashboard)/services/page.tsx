import type { Metadata } from "next";
import Link from "next/link";

import { listAllServices } from "@/lib/admin-data";
import { ServiceRowActions } from "@/components/admin/service-row-actions";
import { Button } from "@/components/admin/ui/button";
import {
  Card,
  CardContent,
} from "@/components/admin/ui/card";
import { cn } from "@/lib/cn";

export const instant = false;

export const metadata: Metadata = {
  title: "Layanan",
  robots: { index: false, follow: false },
};

export default async function AdminServicesPage() {
  const items = await listAllServices();

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-serif text-2xl text-forest">Layanan</h1>
          <p className="mt-1 text-sm text-charcoal/65">
            {items.length} layanan · kelola konten halaman /layanan.
          </p>
        </div>
        <Button asChild>
          <Link href="/admin/services/new">Layanan Baru</Link>
        </Button>
      </div>

      {items.length === 0 ? (
        <Card>
          <CardContent className="py-10 text-center text-sm text-charcoal/60">
            Belum ada layanan. Klik &ldquo;Layanan Baru&rdquo; untuk membuat
            yang pertama.
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="divide-y divide-line p-0">
            {items.map((item) => (
              <div
                key={item.id}
                className="flex flex-wrap items-center justify-between gap-4 p-4"
              >
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-3">
                    <h2 className="truncate text-h3 text-forest">
                      {item.name}
                    </h2>
                    <span
                      className={cn(
                        "rounded-full px-2.5 py-0.5 text-xs font-medium",
                        item.status === "published"
                          ? "bg-forest text-ivory"
                          : "bg-sage text-forest"
                      )}
                    >
                      {item.status === "published" ? "Terbit" : "Draf"}
                    </span>
                  </div>
                  <p className="mt-1 truncate text-sm text-charcoal/65">
                    <span className="font-mono text-xs text-charcoal/50">
                      /layanan/{item.slug}
                    </span>
                    {" · "}
                    {item.summary}
                  </p>
                </div>

                <div className="flex items-center gap-4">
                  <span className="hidden text-xs text-charcoal/45 sm:inline">
                    Urutan {item.sortOrder}
                  </span>
                  <ServiceRowActions id={item.id} status={item.status} />
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
