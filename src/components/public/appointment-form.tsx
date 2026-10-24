"use client";

import { useActionState } from "react";

import { requestAppointment } from "@/lib/actions/appointment";
import { initialAppointmentState } from "@/lib/appointment-state";

type ServiceOption = { id: string; name: string };

const inputClass =
  "mt-1 w-full rounded-site border border-line bg-white px-4 py-3 text-charcoal outline-none transition-colors focus:border-forest";

export function AppointmentForm({ services }: { services: ServiceOption[] }) {
  const [state, formAction, pending] = useActionState(
    requestAppointment,
    initialAppointmentState
  );

  const errors = state.fieldErrors ?? {};

  if (state.status === "ok") {
    return (
      <div className="rounded-[1.25rem] border border-line bg-white p-8">
        <h3 className="text-h3 text-forest">Permintaan diterima</h3>
        <p className="mt-3 text-charcoal/80">{state.message}</p>
        <p className="mt-2 text-small text-charcoal/60">
          Ini bukan konfirmasi jadwal. Tim klinik akan menindaklanjuti melalui
          percakapan WhatsApp di bawah.
        </p>
        {state.waUrl && (
          <a
            href={state.waUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-6 inline-flex items-center justify-center rounded-site bg-forest px-6 py-3 font-medium text-ivory transition-colors hover:bg-charcoal"
          >
            Lanjut ke WhatsApp
          </a>
        )}
      </div>
    );
  }

  return (
    <form action={formAction} className="rounded-[1.25rem] border border-line bg-white p-6 md:p-8">
      {state.status === "error" && state.message && (
        <p
          role="alert"
          className="mb-6 rounded-site border border-error/30 bg-error/5 px-4 py-3 text-sm text-error"
        >
          {state.message}
        </p>
      )}

      <div className="space-y-5">
        <Field label="Nama" htmlFor="name" error={errors.name}>
          <input
            id="name"
            name="name"
            type="text"
            required
            maxLength={100}
            aria-invalid={!!errors.name}
            className={inputClass}
          />
        </Field>

        <Field
          label="Nomor WhatsApp"
          htmlFor="whatsapp"
          error={errors.whatsapp}
          hint="Format angka, misalnya 081234567890 atau 6281234567890."
        >
          <input
            id="whatsapp"
            name="whatsapp"
            type="tel"
            inputMode="numeric"
            required
            aria-invalid={!!errors.whatsapp}
            className={inputClass}
          />
        </Field>

        <Field label="Layanan yang diminati" htmlFor="serviceId" optional>
          <select id="serviceId" name="serviceId" className={inputClass} defaultValue="">
            <option value="">Belum menentukan / konsultasi umum</option>
            {services.map((service) => (
              <option key={service.id} value={service.id}>
                {service.name}
              </option>
            ))}
          </select>
        </Field>

        <div className="grid gap-5 sm:grid-cols-2">
          <Field label="Tanggal preferensi" htmlFor="preferredDate" error={errors.preferredDate}>
            <input
              id="preferredDate"
              name="preferredDate"
              type="date"
              required
              aria-invalid={!!errors.preferredDate}
              className={inputClass}
            />
          </Field>

          <Field
            label="Waktu preferensi"
            htmlFor="preferredTimeRange"
            error={errors.preferredTimeRange}
          >
            <select
              id="preferredTimeRange"
              name="preferredTimeRange"
              required
              className={inputClass}
              defaultValue=""
            >
              <option value="" disabled>
                Pilih rentang waktu
              </option>
              <option value="pagi">Pagi</option>
              <option value="siang">Siang</option>
              <option value="sore">Sore</option>
            </select>
          </Field>
        </div>

        <Field
          label="Catatan (opsional)"
          htmlFor="note"
          error={errors.note}
          hint="Cukup kebutuhan umum atau pertanyaan jadwal. Jangan menuliskan diagnosis atau riwayat medis."
        >
          <textarea
            id="note"
            name="note"
            rows={3}
            maxLength={300}
            aria-invalid={!!errors.note}
            className={inputClass}
          />
        </Field>

        <div>
          <label className="flex items-start gap-3 text-sm text-charcoal/80">
            <input
              type="checkbox"
              name="consent"
              required
              className="mt-1 h-4 w-4 shrink-0 accent-forest"
            />
            <span>
              Saya menyetujui data nama dan nomor WhatsApp saya digunakan untuk
              menindaklanjuti permintaan janji ini.
            </span>
          </label>
          {errors.consent && (
            <p className="mt-2 text-small text-error">{errors.consent}</p>
          )}
        </div>
      </div>

      <button
        type="submit"
        disabled={pending}
        className="mt-8 inline-flex items-center justify-center rounded-site bg-forest px-6 py-3 font-medium text-ivory transition-colors hover:bg-charcoal disabled:cursor-not-allowed disabled:opacity-60"
      >
        {pending ? "Mengirim..." : "Kirim Permintaan Janji"}
      </button>
    </form>
  );
}

function Field({
  label,
  htmlFor,
  error,
  hint,
  optional,
  children,
}: {
  label: string;
  htmlFor: string;
  error?: string;
  hint?: string;
  optional?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label htmlFor={htmlFor} className="text-sm font-medium text-forest">
        {label}
        {optional && <span className="text-charcoal/50"> (opsional)</span>}
      </label>
      {children}
      {hint && !error && <p className="mt-1 text-small text-charcoal/60">{hint}</p>}
      {error && <p className="mt-1 text-small text-error">{error}</p>}
    </div>
  );
}
