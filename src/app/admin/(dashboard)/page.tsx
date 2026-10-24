import type { Metadata } from "next";
import Link from "next/link";
import { and, desc, eq, sql } from "drizzle-orm";

import { db } from "@/db";
import {
  appointmentRequests,
  articles,
  doctors,
  services,
} from "@/db/schema";
import { getSessionActor } from "@/lib/admin-authz";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/admin/ui/card";
import { cn } from "@/lib/cn";

export const instant = false;

export const metadata: Metadata = {
  title: "Dashboard",
  robots: { index: false, follow: false },
};

const APPT_LABEL: Record<string, string> = {
  baru: "Baru",
  dihubungi: "Dihubungi",
  selesai: "Selesai",
};

const APPT_TONE: Record<string, string> = {
  baru: "bg-sage text-forest",
  dihubungi: "bg-ivory text-charcoal border border-line",
  selesai: "bg-forest text-ivory",
};

function formatDateTime(iso: Date | string): string {
  const d = iso instanceof Date ? iso : new Date(iso);
  return d.toLocaleString("id-ID", {
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default async function AdminDashboardPage() {
  const actor = await getSessionActor();

  const [
    appointmentCount,
    newAppointmentCount,
    publishedArticles,
    draftArticles,
    publishedServices,
    draftServices,
    doctorCount,
    recentAppointments,
    recentContent,
  ] = await Promise.all([
    db
      .select({ value: sql<number>`count(*)::int` })
      .from(appointmentRequests)
      .then((r) => r[0]?.value ?? 0),
    db
      .select({ value: sql<number>`count(*)::int` })
      .from(appointmentRequests)
      .where(and(eq(appointmentRequests.status, "baru"), sql`${appointmentRequests.anonymizedAt} is null`))
      .then((r) => r[0]?.value ?? 0),
    db
      .select({ value: sql<number>`count(*)::int` })
      .from(articles)
      .where(eq(articles.status, "published"))
      .then((r) => r[0]?.value ?? 0),
    db
      .select({ value: sql<number>`count(*)::int` })
      .from(articles)
      .where(eq(articles.status, "draft"))
      .then((r) => r[0]?.value ?? 0),
    db
      .select({ value: sql<number>`count(*)::int` })
      .from(services)
      .where(eq(services.status, "published"))
      .then((r) => r[0]?.value ?? 0),
    db
      .select({ value: sql<number>`count(*)::int` })
      .from(services)
      .where(eq(services.status, "draft"))
      .then((r) => r[0]?.value ?? 0),
    db
      .select({ value: sql<number>`count(*)::int` })
      .from(doctors)
      .then((r) => r[0]?.value ?? 0),
    db
      .select({
        id: appointmentRequests.id,
        name: appointmentRequests.name,
        status: appointmentRequests.status,
        createdAt: appointmentRequests.createdAt,
      })
      .from(appointmentRequests)
      .orderBy(desc(appointmentRequests.createdAt))
      .limit(5),
    // Konten terakhir yang disentuh (artikel + layanan, digabung berdasar updatedAt).
    Promise.all([
      db
        .select({
          kind: sql<string>`'artikel'`,
          id: articles.id,
          title: articles.title,
          status: articles.status,
          updatedAt: articles.updatedAt,
        })
        .from(articles)
        .orderBy(desc(articles.updatedAt))
        .limit(5),
      db
        .select({
          kind: sql<string>`'layanan'`,
          id: services.id,
          title: services.name,
          status: services.status,
          updatedAt: services.updatedAt,
        })
        .from(services)
        .orderBy(desc(services.updatedAt))
        .limit(5),
    ]).then(([a, s]) =>
      [
        ...a.map((x) => ({ ...x, href: `/admin/articles/${x.id}/edit` })),
        ...s.map((x) => ({ ...x, href: `/admin/services/${x.id}/edit` })),
      ]
        .sort((x, y) => +new Date(y.updatedAt) - +new Date(x.updatedAt))
        .slice(0, 6)
    ),
  ]);

  const stats = [
    {
      label: "Permintaan janji",
      value: appointmentCount,
      note: `${newAppointmentCount} menunggu tindak lanjut`,
      href: "/admin/appointments",
    },
    {
      label: "Artikel",
      value: publishedArticles,
      note: `${draftArticles} masih draft`,
      href: "/admin/articles",
    },
    {
      label: "Layanan",
      value: publishedServices,
      note: `${draftServices} masih draft`,
      href: "/admin/services",
    },
    {
      label: "Dokter",
      value: doctorCount,
      note: "Total profil dokter",
      href: "/admin/doctors",
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-serif text-2xl text-forest">
          Halo{actor?.name ? `, ${actor.name}` : ""}
        </h1>
        <p className="mt-1 text-sm text-charcoal/65">
          Ringkasan situs demo Nawasena Dental Care.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Link key={stat.label} href={stat.href}>
            <Card className="h-full transition-colors hover:border-forest/40">
              <CardHeader className="pb-2">
                <CardDescription>{stat.label}</CardDescription>
                <CardTitle className="font-serif text-3xl">
                  {stat.value}
                </CardTitle>
              </CardHeader>
              <CardContent className="text-xs text-charcoal/55">
                {stat.note}
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Permintaan terbaru</CardTitle>
            <CardDescription>5 permintaan janji terakhir masuk.</CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            {recentAppointments.length === 0 ? (
              <p className="px-4 py-6 text-center text-sm text-charcoal/55">
                Belum ada permintaan.
              </p>
            ) : (
              <ul className="divide-y divide-line">
                {recentAppointments.map((a) => (
                  <li
                    key={a.id}
                    className="flex items-center justify-between gap-3 px-4 py-3"
                  >
                    <span className="min-w-0 truncate text-sm text-forest">
                      {a.name}
                    </span>
                    <span className="flex items-center gap-2">
                      <span className="text-xs text-charcoal/45">
                        {formatDateTime(a.createdAt)}
                      </span>
                      <span
                        className={cn(
                          "rounded-full px-2 py-0.5 text-xs font-medium",
                          APPT_TONE[a.status] ?? "bg-sage text-forest"
                        )}
                      >
                        {APPT_LABEL[a.status] ?? a.status}
                      </span>
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Aktivitas konten</CardTitle>
            <CardDescription>Artikel & layanan terakhir diubah.</CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            {recentContent.length === 0 ? (
              <p className="px-4 py-6 text-center text-sm text-charcoal/55">
                Belum ada konten.
              </p>
            ) : (
              <ul className="divide-y divide-line">
                {recentContent.map((c) => (
                  <li key={`${c.kind}-${c.id}`}>
                    <Link
                      href={c.href}
                      className="flex items-center justify-between gap-3 px-4 py-3 transition-colors hover:bg-sage/30"
                    >
                      <span className="min-w-0 truncate text-sm text-forest">
                        {c.title}
                      </span>
                      <span className="flex items-center gap-2 text-xs text-charcoal/45">
                        <span className="capitalize">{c.kind}</span>
                        <span
                          className={cn(
                            "rounded-full px-2 py-0.5 font-medium",
                            c.status === "published"
                              ? "bg-forest text-ivory"
                              : "bg-sage text-forest"
                          )}
                        >
                          {c.status === "published" ? "Terbit" : "Draft"}
                        </span>
                        <span>{formatDateTime(c.updatedAt)}</span>
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
