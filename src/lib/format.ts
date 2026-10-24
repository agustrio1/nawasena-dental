// Mengonversi ISO date (mis. "2026-10-01") ke format Indonesia.
// Deterministik dari argumen, tidak membaca jam sistem, sehingga aman saat prerender.
export function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}
