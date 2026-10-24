import type { Metadata } from "next";
import Link from "next/link";

import {
  countAppointmentsByStatus,
  listAppointments,
} from "@/lib/admin-data";
import { AppointmentRowActions } from "@/components/admin/appointment-row-actions";
import { Card, CardContent } from "@/components/admin/ui/card";
import { cn } from "@/lib/cn";
import { formatDate } from "@/lib/format";

export const instant = false;

export const metadata: Metadata = {
  title: "Permintaan Janji",
  robots: { index: false, follow: false },
};

const STATUS_LABEL: Record<string, string> = {
  baru: "Baru",
  dihubungi: "Dihubungi",
  selesai: "Selesai",
};

const STATUS_TONE: Record<string, string> = {
  baru: "bg-sage text-forest",
  dihubungi: "bg-ivory text-charcoal border border-line",
  selesai: "bg-forest text-ivory",
};

const TABS = [
  { value: "all", label: "Semua" },
  { value: "baru", label: "Baru" },
  { value: "dihubungi", label: "Dihubungi" },
  { value: "selesai", label: "Selesai" },
];

function formatDateTime(iso: string): string {
  return new Date(iso).toLocaleString("id-ID", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

type Props = {
  searchParams: Promise<{ status?: string }>;
};

export default async function AdminAppointmentsPage({ searchParams }: Props) {
  const { status } = await searchParams;

  const [{ items, filter }, counts] = await Promise.all([
    listAppointments(status),
    countAppointmentsByStatus(),
  ]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-serif text-2xl text-forest">Permintaan Janji</h1>
        <p className="mt-1 text-sm text-charcoal/65">
          {counts.total} total permintaan · {counts.baru} baru ·{" "}
          {counts.dihubungi} dihubungi · {counts.selesai} selesai
        </p>
      </div>

      <div className="flex flex-wrap gap-2">
        {TABS.map((tab) => {
          const active = tab.value === filter;
          return (
            <Link
              key={tab.value}
              href={
                tab.value === "all"
                  ? "/admin/appointments"
                  : `/admin/appointments?status=${tab.value}`
              }
              className={cn(
                "rounded-lg border px-3 py-1.5 text-sm transition-colors",
                active
                  ? "border-forest bg-forest text-ivory"
                  : "border-line bg-white text-forest hover:bg-sage"
              )}
            >
              {tab.label}
            </Link>
          );
        })}
      </div>

      {items.length === 0 ? (
        <Card>
          <CardContent className="py-10 text-center text-sm text-charcoal/60">
            Belum ada permintaan janji untuk filter ini.
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {items.map((item) => (
            <Card key={item.id}>
              <CardContent className="space-y-4 py-5">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-3">
                      <h2 className="text-h3 text-forest">{item.name}</h2>
                      <span
                        className={cn(
                          "rounded-full px-2.5 py-0.5 text-xs font-medium",
                          STATUS_TONE[item.status] ?? "bg-sage text-forest"
                        )}
                      >
                        {STATUS_LABEL[item.status] ?? item.status}
                      </span>
                    </div>
                    <p className="mt-1 text-sm text-charcoal/70">
                      {item.whatsapp ? `WhatsApp: ${item.whatsapp}` : "Kontak dihapus (dianonimkan)"}
                      {item.serviceName ? ` · ${item.serviceName}` : ""}
                    </p>
                  </div>
                  <p className="text-xs text-charcoal/50">
                    Masuk: {formatDateTime(item.createdAt)}
                  </p>
                </div>

                <dl className="grid gap-2 text-sm sm:grid-cols-2">
                  <div className="flex gap-2">
                    <dt className="text-charcoal/55">Preferensi:</dt>
                    <dd className="text-charcoal/85">
                      {formatDate(item.preferredDate)} ·{" "}
                      {item.preferredTimeRange}
                    </dd>
                  </div>
                  <div className="flex gap-2">
                    <dt className="text-charcoal/55">Catatan:</dt>
                    <dd className="text-charcoal/85">
                      {item.note ? item.note : "—"}
                    </dd>
                  </div>
                </dl>

                <AppointmentRowActions
                  id={item.id}
                  status={item.status}
                  anonymized={item.anonymizedAt !== null}
                  whatsapp={item.whatsapp}
                  patientName={item.name}
                  serviceName={item.serviceName}
                  preferredDate={item.preferredDate}
                />
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <p className="text-xs text-charcoal/50">
        Data ini mengandung informasi pribadi calon pasien. Gunakan seperlunya,
        dan anonimisasi permintaan yang sudah selesai untuk memangkas retensi.
      </p>
    </div>
  );
}
