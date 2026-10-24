// Membangun tautan WhatsApp. nomor = digit saja tanpa "+" (mis. 6281234567890),
// sesuai constraint di schema.ts. Pesan hanya memuat informasi non-sensitif (§9):
// tanpa diagnosis, riwayat kesehatan, atau data medis pribadi.
export function buildWhatsAppUrl(whatsappNumber: string, message: string): string {
  const digits = whatsappNumber.replace(/\D/g, "");
  return `https://wa.me/${digits}?text=${encodeURIComponent(message)}`;
}

// Pesan awal berdasarkan layanan terpilih (§9). Hanya memakai nama layanan.
export function serviceConsultMessage(serviceName: string): string {
  return `Halo, saya ingin bertanya mengenai layanan ${serviceName} dan jadwal kunjungan.`;
}
