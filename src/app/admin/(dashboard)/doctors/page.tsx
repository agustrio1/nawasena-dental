import type { Metadata } from "next";
import Link from "next/link";

import { listAllDoctors } from "@/lib/admin-data";
import { DoctorRowActions } from "@/components/admin/doctor-row-actions";
import { Button } from "@/components/admin/ui/button";
import { Card, CardContent } from "@/components/admin/ui/card";
import { cn } from "@/lib/cn";

export const instant = false;

export const metadata: Metadata = {
  title: "Dokter",
  robots: { index: false, follow: false },
};

export default async function AdminDoctorsPage() {
  const items = await listAllDoctors();

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-serif text-2xl text-forest">Tim Dokter</h1>
          <p className="mt-1 text-sm text-charcoal/65">
            {items.length} dokter · kelola profil pada halaman /dokter.
          </p>
        </div>
        <Button asChild>
          <Link href="/admin/doctors/new">Dokter Baru</Link>
        </Button>
      </div>

      {items.length === 0 ? (
        <Card>
          <CardContent className="py-10 text-center text-sm text-charcoal/60">
            Belum ada dokter. Klik &ldquo;Dokter Baru&rdquo; untuk membuat yang
            pertama.
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
                    {item.specialty}
                  </p>
                </div>

                <div className="flex items-center gap-4">
                  <span className="hidden text-xs text-charcoal/45 sm:inline">
                    Urutan {item.sortOrder}
                  </span>
                  <DoctorRowActions id={item.id} status={item.status} />
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
