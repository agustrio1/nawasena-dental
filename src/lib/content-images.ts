// Pemrosesan ringan HTML konten artikel (sisi tampil saja, tidak menyentuh editor).
// Gambar dalam konten disimpan editor sebagai <img src="{secureUrl Cloudinary}">
// tanpa transform. Fungsi ini menambahkan f_auto,q_auto (format & kualitas otomatis
// dari Cloudinary) serta lazy/async decoding, tanpa menggandakan atribut bila sudah ada.

export function optimizeContentImages(html: string): string {
  return html.replace(/<img\b[^>]*>/gi, (tag) => {
    let out = tag;

    // Sisipkan f_auto,q_auto tepat setelah segmen /image/upload/ (bila belum ada).
    out = out.replace(
      /(src=["']https:\/\/res\.cloudinary\.com\/[^/]+\/image\/upload\/)(?!f_auto)/i,
      "$1f_auto,q_auto/"
    );

    // Tambahkan lazy + async decoding bila pemanggil/editor belum menyetingnya.
    if (!/\bloading=/i.test(out)) {
      out = out.replace(/^<img/i, '<img loading="lazy"');
    }
    if (!/\bdecoding=/i.test(out)) {
      out = out.replace(/^<img/i, '<img decoding="async"');
    }

    return out;
  });
}
