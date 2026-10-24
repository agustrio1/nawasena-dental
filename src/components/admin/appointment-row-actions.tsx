"use client";

import * as React from "react";
import { useRouter } from "next/navigation";

import {
  anonymizeAppointment,
  markAppointmentContacted,
  updateAppointmentStatus,
} from "@/lib/actions/admin-appointments";
import { cn } from "@/lib/cn";

const STATUS_OPTIONS = [
  { value: "baru", label: "Baru" },
  { value: "dihubungi", label: "Dihubungi" },
  { value: "selesai", label: "Selesai" },
] as const;

export function AppointmentRowActions({
  id,
  status,
  anonymized,
  whatsapp,
  patientName,
  serviceName,
  preferredDate,
}: {
  id: string;
  status: string;
  anonymized: boolean;
  whatsapp: string | null;
  patientName: string;
  serviceName: string | null;
  preferredDate: string;
}) {
  const router = useRouter();
  const [pending, setPending] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  async function run(action: () => Promise<{ ok: boolean; error?: string }>) {
    setPending(true);
    setError(null);
    const result = await action();
    setPending(false);
    if (!result.ok) {
      setError(result.error ?? "Gagal memproses.");
      return;
    }
    router.refresh();
  }

  const waDigits = (whatsapp ?? "").replace(/\D/g, "");
  const canReply = !anonymized && waDigits.length >= 8;

  function replyViaWhatsApp() {
    if (!canReply) return;
    const dateText = new Date(preferredDate).toLocaleDateString("id-ID", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
    const parts = [
      `Halo ${patientName || "Anda"}, kami dari Nawasena Dental Care`,
      serviceName ? `menerima permintaan janji untuk layanan ${serviceName}` : "menerima permintaan janji Anda",
      `dengan preferensi tanggal ${dateText}.`,
      "Boleh kami konfirmasi ketersediaan waktunya lewat chat ini? Terima kasih.",
    ];
    const text = encodeURIComponent(parts.join(" "));
    window.open(`https://wa.me/${waDigits}?text=${text}`, "_blank", "noopener,noreferrer");
    // Tindak lanjut tercatat: status 'baru' otomatis naik ke 'dihubungi'.
    void run(() => markAppointmentContacted(id));
  }

  if (anonymized) {
    return (
      <p className="text-xs text-charcoal/50">
        Data pribadi telah dianonimkan.
      </p>
    );
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      {canReply && (
        <button
          type="button"
          disabled={pending}
          onClick={replyViaWhatsApp}
          className="rounded-lg border border-forest bg-forest px-2.5 py-1 text-xs text-ivory transition-colors hover:bg-forest/90 disabled:cursor-not-allowed disabled:opacity-60"
        >
          Balas via WhatsApp
        </button>
      )}

      <div className="flex flex-wrap items-center gap-2">
        {STATUS_OPTIONS.map((option) => {
          const active = option.value === status;
          return (
            <button
              key={option.value}
              type="button"
              disabled={pending || active}
              onClick={() => run(() => updateAppointmentStatus(id, option.value))}
              className={cn(
                "rounded-lg border px-2.5 py-1 text-xs transition-colors disabled:cursor-not-allowed disabled:opacity-60",
                active
                  ? "border-forest bg-forest text-ivory"
                  : "border-line bg-white text-forest hover:bg-sage"
              )}
            >
              {option.label}
            </button>
          );
        })}
      </div>

      <button
        type="button"
        disabled={pending}
        onClick={() => {
          if (
            window.confirm(
              "Anonimkan data pribadi permintaan ini? Nama, nomor WhatsApp, dan catatan akan dihapus. Tindakan tidak bisa dibatalkan."
            )
          ) {
            void run(() => anonymizeAppointment(id));
          }
        }}
        className="ml-auto rounded-lg border border-error/40 bg-white px-2.5 py-1 text-xs text-error transition-colors hover:bg-error/5 disabled:cursor-not-allowed disabled:opacity-60"
      >
        Anonimkan
      </button>

      {error && <span className="text-xs text-error">{error}</span>}
    </div>
  );
}
