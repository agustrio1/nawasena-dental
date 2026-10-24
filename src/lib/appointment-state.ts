// Tipe & nilai awal untuk alur permintaan janji.
// Dipisahkan dari file "use server" agar dapat diimpor komponen klien.
// (File dengan "use server" hanya boleh mengekspor fungsi async.)

export type AppointmentState = {
  status: "idle" | "error" | "ok";
  message?: string;
  fieldErrors?: Record<string, string>;
  // Jalur A: tautan WhatsApp ke klinik dengan pesan terisi otomatis.
  waUrl?: string;
};

export const initialAppointmentState: AppointmentState = { status: "idle" };
