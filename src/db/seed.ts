import { eq } from "drizzle-orm";

import { db } from "./index";
import {
  articles,
  categories,
  doctors,
  faqs,
  services,
  siteSettings,
  users,
} from "./schema";
import { hashPassword } from "@/lib/password";

async function seedAdminUser() {
  const email = process.env.ADMIN_EMAIL;
  const password = process.env.ADMIN_PASSWORD;

  if (!email || !password) {
    console.warn(
      "ADMIN_EMAIL / ADMIN_PASSWORD belum diatur — melewatkan pembuatan user admin."
    );
    return;
  }

  const passwordHash = await hashPassword(password);

  await db
    .insert(users)
    .values({
      email,
      name: "Administrator",
      passwordHash,
      role: "admin",
    })
    .onConflictDoUpdate({
      target: users.email,
      set: { passwordHash, role: "admin" },
    });
}

async function seedCategories() {
  await db
    .insert(categories)
    .values([
      { name: "Kebersihan gigi", slug: "kebersihan-gigi" },
      { name: "Perawatan", slug: "perawatan" },
      { name: "Ortodonti", slug: "ortodonti" },
      { name: "Keluarga", slug: "keluarga" },
    ])
    .onConflictDoNothing({ target: categories.slug });
}

async function seedSiteSettings() {
  await db
    .insert(siteSettings)
    .values({
      id: 1,
      clinicName: "Nawasena Dental Care",
      addressText: "Jl. Mawar No. 18, Denpasar, Bali (alamat demo)",
      hoursText: "Senin - Jumat: 08.00 - 20.00 | Sabtu: 08.00 - 17.00",
      whatsappNumber: "6281234567890",
    })
    .onConflictDoUpdate({
      target: siteSettings.id,
      set: {
        clinicName: "Nawasena Dental Care",
        addressText: "Jl. Mawar No. 18, Denpasar, Bali (alamat demo)",
        hoursText: "Senin - Jumat: 08.00 - 20.00 | Sabtu: 08.00 - 17.00",
        whatsappNumber: "6281234567890",
      },
    });
}

async function seedServices() {
  await db
    .insert(services)
    .values([
      {
        slug: "pemeriksaan-gigi-rutin",
        name: "Pemeriksaan Gigi Rutin",
        summary:
          "Pemeriksaan menyeluruh untuk menjaga kesehatan gigi dan mulut Anda.",
        description:
          "Konsultasi dan pemeriksaan rutin untuk mendeteksi masalah sejak dini, termasuk pembersihan, edukasi, dan rencana perawatan yang jelas.",
        availabilityNote: "Mulai dari 1 jam konsultasi",
        consultReasons: [
          "Periksa gigi berkala",
          "Keluhan sensitif",
          "Konsultasi pencegahan",
        ],
        processSteps: ["Anamnesis", "Pemeriksaan gigi", "Rencana perawatan"],
        faqs: [
          {
            question: "Apakah perlu pemeriksaan rutin?",
            answer:
              "Ya, untuk menjaga kesehatan gigi dan mencegah masalah yang lebih besar.",
          },
        ],
        sortOrder: 1,
        status: "published",
      },
      {
        slug: "scaling-pembersihan-gigi",
        name: "Scaling & Pembersihan Gigi",
        summary:
          "Pembersihan karang gigi untuk menjaga kebersihan dan kesehatan gusi.",
        description:
          "Penanganan plak dan karang gigi menggunakan peralatan yang sesuai, disertai edukasi cara merawat kebersihan gigi sehari-hari.",
        availabilityNote: "Tersedia pada jam layanan klinik",
        consultReasons: ["Karang gigi", "Gusi berdarah", "Napas tidak segar"],
        processSteps: ["Pemeriksaan", "Scaling", "Pembersihan & edukasi"],
        faqs: [
          {
            question: "Berapa sering scaling sebaiknya dilakukan?",
            answer:
              "Umumnya setiap 6 bulan, namun disesuaikan dengan kondisi masing-masing pasien.",
          },
        ],
        sortOrder: 2,
        status: "published",
      },
      {
        slug: "ortodonti",
        name: "Ortodonti",
        summary:
          "Perawatan gigi berjejal dan penyesuaian susunan gigi untuk estetika dan fungsi.",
        description:
          "Evaluasi posisi gigi, rencana perawatan yang sesuai, dan pemantauan progres untuk hasil yang lebih nyaman dan estetik.",
        availabilityNote: "Konsultasi dengan dokter ortodonti",
        consultReasons: [
          "Gigi berjejal",
          "Kekurangan ruang",
          "Penyesuaian susunan gigi",
        ],
        processSteps: ["Konsultasi", "Evaluasi foto", "Perawatan bertahap"],
        faqs: [
          {
            question: "Berapa lama perawatan ortodonti?",
            answer:
              "Tergantung kebutuhan pasien dan jenis alat yang digunakan.",
          },
        ],
        sortOrder: 3,
        status: "published",
      },
      {
        slug: "perawatan-gigi-berlubang",
        name: "Tambal Gigi (Perawatan Gigi Berlubang)",
        summary:
          "Perawatan gigi berlubang untuk menghentikan kerusakan dan mengembalikan bentuk gigi.",
        description:
          "Penanganan karies dengan membersihkan bagian gigi yang rusak lalu menutupnya dengan bahan tambal yang sesuai. Jenis bahan dan teknik ditentukan dokter berdasarkan lokasi dan luas kerusakan.",
        availabilityNote: "Tersedia pada jam layanan klinik",
        consultReasons: [
          "Gigi berlubang",
          "Nyeri saat makan manis atau dingin",
          "Ada lubang atau celah pada gigi",
        ],
        processSteps: [
          "Pemeriksaan (rontgen bila perlu)",
          "Pembersihan jaringan karies",
          "Penambalan",
          "Kontrol bila diperlukan",
        ],
        faqs: [
          {
            question: "Apakah menambal gigi sakit?",
            answer:
              "Umumnya dilakukan dengan bius lokal sesuai penilaian dokter agar proses lebih nyaman. Sensasi setiap pasien dapat berbeda.",
          },
        ],
        sortOrder: 4,
        status: "published",
      },
      {
        slug: "perawatan-saluran-akar",
        name: "Perawatan Saluran Akar",
        summary:
          "Perawatan untuk membantu menyelamatkan gigi yang saraf atau jaringannya meradang atau terinfeksi.",
        description:
          "Perawatan saluran akar membersihkan dan menutup saluran di dalam gigi yang mengalami peradangan atau infeksi, sesuai indikasi dokter. Tidak semua kasus dapat dipertahankan; sebagian memerlukan perawatan lanjutan seperti mahkota.",
        availabilityNote:
          "Konsultasi dengan dokter; beberapa kasus dapat dirujuk ke spesialis",
        consultReasons: [
          "Nyeri gigi hebat",
          "Sensitivitas berkepanjangan",
          "Gusi bengkak di sekitar gigi",
        ],
        processSteps: [
          "Pemeriksaan & foto rontgen",
          "Pembersihan saluran akar",
          "Pengisian saluran",
          "Restorasi lanjutan (mis. mahkota)",
        ],
        faqs: [
          {
            question: "Berapa kali kunjungan untuk perawatan saluran akar?",
            answer:
              "Bergantung kondisi gigi; dapat satu atau beberapa kunjungan sesuai penilaian dokter.",
          },
        ],
        sortOrder: 5,
        status: "published",
      },
      {
        slug: "implan-gigi",
        name: "Implan Gigi",
        summary:
          "Opsi pengganti gigi yang hilang melalui penanaman implan, bila kondisi tulang dan kesehatan mendukung.",
        description:
          "Implan gigi merupakan salah satu opsi pengganti gigi hilang. Kelayakan ditentukan melalui pemeriksaan, termasuk kondisi tulang rahang dan kesehatan umum pasien. Proses dan hasilnya bervariasi antar individu.",
        availabilityNote:
          "Menurut penilaian dokter; ketersediaan bergantung fasilitas dan kondisi pasien",
        consultReasons: [
          "Gigi hilang",
          "Ingin pengganti tetap setelah pencabutan",
          "Gangguan fungsi kunyah akibat gigi hilang",
        ],
        processSteps: [
          "Konsultasi & pemeriksaan (rontgen bila perlu)",
          "Perencanaan implan",
          "Pemasangan implan",
          "Pemasangan mahkota/abutment",
        ],
        faqs: [
          {
            question: "Apakah semua orang bisa memasang implan?",
            answer:
              "Tidak. Kelayakan bergantung kondisi tulang, kesehatan umum, dan penilaian dokter.",
          },
        ],
        sortOrder: 6,
        status: "published",
      },
      {
        slug: "pemutihan-gigi",
        name: "Pemutihan Gigi (Bleaching)",
        summary:
          "Perawatan estetika untuk membantu mencerahkan warna gigi, dengan hasil yang bervariasi pada tiap orang.",
        description:
          "Pemutihan gigi membantu mencerahkan warna gigi menggunakan bahan yang sesuai dan di bawah pengawasan dokter. Hasil bergantung kondisi awal gigi dan tidak bersifat permanen; sebagian gigi atau restorasi mungkin tidak berubah warna.",
        availabilityNote:
          "Tersedia setelah pemeriksaan; tidak dianjurkan untuk kondisi tertentu",
        consultReasons: [
          "Warna gigi tampak kusam",
          "Noda permukaan tertentu",
          "Ingin mencerahkan sebelum acara",
        ],
        processSteps: [
          "Pemeriksaan & konsultasi",
          "Persiapan gigi",
          "Aplikasi bahan pemutih",
          "Edukasi perawatan & pembatasan",
        ],
        faqs: [
          {
            question: "Apakah pemutihan cocok untuk semua orang?",
            answer:
              "Tidak selalu. Dokter menilai kondisi gigi dan gusi terlebih dahulu; sensitivitas dan hasil berbeda tiap pasien.",
          },
        ],
        sortOrder: 7,
        status: "published",
      },
      {
        slug: "veneer-dan-restorasi-estetika",
        name: "Veneer & Restorasi Estetika",
        summary:
          "Perawatan estetika untuk membantu memperbaiki bentuk, warna, atau susunan gigi depan.",
        description:
          "Veneer dan restorasi estetika membantu memperbaiki tampilan gigi depan, misalnya bentuk atau warna. Perencanaan mempertimbangkan fungsi gigitan dan kondisi gigi; hasil bervariasi dan memerlukan penilaian dokter.",
        availabilityNote: "Konsultasi dengan dokter; tergantung kondisi gigi",
        consultReasons: [
          "Bentuk gigi depan ingin diperbaiki",
          "Warna atau retak ringan",
          "Jarak antar gigi (diastema)",
        ],
        processSteps: [
          "Konsultasi & perencanaan",
          "Persiapan gigi",
          "Pemasangan veneer/restorasi",
          "Kontrol & penyesuaian",
        ],
        faqs: [
          {
            question: "Apakah veneer merusak gigi asli?",
            answer:
              "Sebagian kasus memerlukan pengikisan email tipis. Dokter menjelaskan pilihan dan risikonya sebelum perawatan dimulai.",
          },
        ],
        sortOrder: 8,
        status: "published",
      },
    ])
    .onConflictDoNothing({ target: services.slug });
}

async function seedDoctors() {
  const existing = await db.select({ name: doctors.name }).from(doctors);
  const existingNames = new Set(existing.map((d) => d.name));

  // Seed additif: baris lama tidak dobel (dedup berdasarkan nama), baris baru masuk.
  const doctorRows: (typeof doctors.$inferInsert)[] = [
    {
      name: "drg. Anindya Putri (data demo)",
      specialty: "Dokter Gigi Umum",
      education: "S1 Kedokteran Gigi (data demo)",
      experience: "8 tahun pengalaman klinis (data demo)",
      sortOrder: 1,
      status: "published",
    },
    {
      name: "drg. Raka Wijaya (data demo)",
      specialty: "Ortodonti",
      education: "Spesialis Ortodonti (data demo)",
      experience: "10 tahun pengalaman (data demo)",
      sortOrder: 2,
      status: "published",
    },
    {
      name: "drg. Sekar Ayu Handayani, Sp.KG (data demo)",
      specialty: "Konservasi Gigi & Restorasi Estetika",
      education: "PPDS Konservasi Gigi (data demo)",
      experience: "7 tahun pengalaman (data demo)",
      sortOrder: 3,
      status: "published",
    },
    {
      name: "drg. Bagus Prayoga, Sp.Perio (data demo)",
      specialty: "Periodontologi",
      education: "PPDS Periodontologi (data demo)",
      experience: "9 tahun pengalaman (data demo)",
      sortOrder: 4,
      status: "published",
    },
    {
      name: "dr. Citra Lestari, Sp.BM (data demo)",
      specialty: "Bedah Mulut & Implan",
      education: "PPDS Bedah Mulut (data demo)",
      experience: "12 tahun pengalaman (data demo)",
      sortOrder: 5,
      status: "published",
    },
    {
      name: "drg. Ayu Puspita (data demo)",
      specialty: "Dokter Gigi Umum",
      education: "S1 Kedokteran Gigi (data demo)",
      experience: "5 tahun pengalaman (data demo)",
      sortOrder: 6,
      status: "published",
    },
  ];

  const toInsert = doctorRows.filter((d) => !existingNames.has(d.name));
  if (toInsert.length === 0) return;

  await db.insert(doctors).values(toInsert);
}

async function seedArticles() {
  const existing = await db.select({ slug: articles.slug }).from(articles);
  const existingSlugs = new Set(existing.map((a) => a.slug));

  const catRows = await db
    .select({ id: categories.id, slug: categories.slug })
    .from(categories);
  const catId = (slug: string) =>
    catRows.find((c) => c.slug === slug)?.id;

  // Sumber otoritatif untuk sinyal E-E-A-T (bagian "Sumber" pada konten + schema citation).
  const source = {
    who: {
      name: "WHO — Fact sheet: Oral health",
      url: "https://www.who.int/news-room/fact-sheets/detail/oral-health",
    },
    fdi: { name: "FDI World Dental Federation", url: "https://www.fdiworlddental.org" },
    pdgi: {
      name: "PDGI (Persatuan Dokter Gigi Indonesia)",
      url: "https://pdgi.or.id",
    },
    kemkes: { name: "Kementerian Kesehatan RI", url: "https://www.kemkes.go.id" },
    medline: {
      name: "NIH MedlinePlus — Dental Disorders",
      url: "https://medlineplus.gov/dentaldisorders.html",
    },
    mouth: {
      name: "MouthHealthy (ADA) — Oral Health Topics",
      url: "https://www.mouthhealthy.org/all-topics-a-z",
    },
  };

  const articleRows = [
    {
      slug: "cara-menjaga-kesehatan-gigi-sehari-hari",
      title: "Cara menjaga kesehatan gigi sehari-hari",
      excerpt:
        "Tiga kebiasaan sederhana yang bisa membantu menjauhkan Anda dari masalah gigi dan mulut.",
      categorySlug: "kebersihan-gigi",
      datePublished: "2026-01-15",
      dateModified: "2026-06-10",
      lastReviewed: "2026-06-10",
      authorName: "drg. Anindya Putri (data demo)",
      authorJob: "Dokter Gigi Umum",
      reviewerName: "drg. Raka Wijaya (data demo)",
      reviewerJob: "Dokter Gigi",
      seoDescription:
        "Panduan sederhana menjaga kesehatan gigi dan mulut: menyikat, membersihkan sela gigi, dan membatasi gula.",
      body: `<p>Menjaga kesehatan gigi tidak harus rumit. Tiga kebiasaan sederhana di bawah ini membantu menurunkan risiko gigi berlubang dan masalah gusi.</p><h2>Tiga kebiasaan utama</h2><ul><li>Menyikat gigi dua kali sehari dengan pasta gigi berfluoride.</li><li>Membersihkan sela gigi setiap hari (benang gigi atau sikat interdental).</li><li>Membatasi makanan dan minuman tinggi gula, terutama di antara waktu makan.</li></ul><h2>Jadwal pemeriksaan</h2><p>Pemeriksaan rutin membantu menemukan masalah lebih dini. Konsultasikan frekuensi yang sesuai dengan dokter gigi Anda, karena kebutuhan tiap orang berbeda.</p>`,
      sources: [source.who, source.mouth, source.kemkes],
    },
    {
      slug: "kapan-saatnya-scaling-gigi",
      title: "Kapan Saatnya Scaling Gigi?",
      excerpt:
        "Kenali tanda karang gigi dan pahami seberapa sering pembersihan dianjurkan.",
      categorySlug: "kebersihan-gigi",
      datePublished: "2026-02-05",
      dateModified: "2026-06-12",
      lastReviewed: "2026-06-12",
      authorName: "drg. Sekar Ayu Handayani, Sp.KG (data demo)",
      authorJob: "Dokter Gigi Spesialis Konservasi Gigi",
      reviewerName: "drg. Bagus Prayoga, Sp.Perio (data demo)",
      reviewerJob: "Dokter Gigi Spesialis Periodontologi",
      seoDescription:
        "Tanda Anda mungkin membutuhkan scaling dan perkiraan interval pembersihan karang gigi berdasarkan pemeriksaan.",
      body: `<p>Scaling (pembersihan karang gigi) membantu menghilangkan plak dan karang yang tidak dapat dibersihkan hanya dengan menyikat gigi.</p><h2>Tanda Anda mungkin membutuhkan scaling</h2><ul><li>Gusi mudah berdarah saat menyikat gigi.</li><li>Napas tidak segar berulang.</li><li>Terdapat endapan keras di sekitar leher gigi.</li></ul><h2>Seberapa sering?</h2><p>Banyak dokter gigi menyarankan pembersihan rutin, umumnya setiap enam bulan. Namun interval yang tepat bergantung pada kondisi masing-masing pasien dan hasil pemeriksaan.</p>`,
      sources: [source.who, source.pdgi, source.medline],
    },
    {
      slug: "mitos-dan-fakta-pemutihan-gigi",
      title: "Mitos dan Fakta Pemutihan Gigi (Bleaching)",
      excerpt:
        "Harapan yang realistis sebelum menjalani perawatan pemutihan gigi.",
      categorySlug: "perawatan",
      datePublished: "2026-03-20",
      dateModified: "2026-07-01",
      lastReviewed: "2026-07-01",
      authorName: "drg. Sekar Ayu Handayani, Sp.KG (data demo)",
      authorJob: "Dokter Gigi Spesialis Konservasi Gigi",
      reviewerName: "drg. Anindya Putri (data demo)",
      reviewerJob: "Dokter Gigi Umum",
      seoDescription:
        "Penjelasan berimbang tentang pemutihan gigi: hasil bervariasi, keterbatasan, dan pentingnya pengawasan dokter gigi.",
      body: `<p>Pemutihan gigi (bleaching) adalah perawatan estetika untuk membantu mencerahkan warna gigi. Berikut hal yang perlu diketahui agar harapan Anda realistis.</p><h2>Yang perlu dipahami</h2><ul><li>Hasil bervariasi tergantung kondisi awal gigi dan tidak bersifat permanen.</li><li>Restorasi seperti tambalan, mahkota, atau veneer umumnya tidak ikut berubah warna.</li><li>Perawatan sebaiknya dilakukan di bawah pengawasan dokter gigi, bukan produk tanpa pengawasan.</li></ul><h2>Kapan konsultasi?</h2><p>Dokter akan menilai kondisi gigi dan gusi, serta menjelaskan opsi, manfaat, dan risikonya sebelum perawatan dimulai.</p>`,
      sources: [source.fdi, source.mouth, source.pdgi],
    },
    {
      slug: "yang-perlu-diketahui-sebelum-kawat-gigi",
      title: "Yang Perlu Diketahui Sebelum Kawat Gigi",
      excerpt:
        "Langkah awal dan hal yang perlu disiapkan sebelum memulai perawatan ortodonti.",
      categorySlug: "ortodonti",
      datePublished: "2026-04-18",
      dateModified: "2026-07-05",
      lastReviewed: "2026-07-05",
      authorName: "drg. Raka Wijaya (data demo)",
      authorJob: "Dokter Gigi Spesialis Ortodonti",
      reviewerName: "drg. Anindya Putri (data demo)",
      reviewerJob: "Dokter Gigi Umum",
      seoDescription:
        "Gambaran alur perawatan ortodonti, dari konsultasi hingga kontrol, serta catatan bahwa hasil bervariasi tiap pasien.",
      body: `<p>Perawatan ortodonti (kawat gigi atau aligner) bertujuan membantu memperbaiki susunan gigi dan gigitan. Berikut hal yang sebaiknya disiapkan sebelum memulai.</p><h2>Langkah awal</h2><ol><li>Konsultasi dan pemeriksaan, termasuk foto dan rontgen bila diperlukan.</li><li>Pembahasan rencana perawatan, durasi, dan pilihan alat.</li><li>Perawatan bertahap dengan kontrol berkala.</li></ol><h2>Hal yang perlu diketahui</h2><p>Durasi dan hasil perawatan bervariasi pada tiap pasien dan bergantung pada penilaian dokter gigi atau dokter gigi spesialis ortodonti.</p>`,
      sources: [source.fdi, source.pdgi, source.medline],
    },
    {
      slug: "gigi-sensitif-penyebab-dan-penanganannya",
      title: "Gigi Sensitif: Penyebab dan Penanganannya",
      excerpt:
        "Mengapa gigi terasa ngilu dan langkah yang dapat membantu meredakan keluhan.",
      categorySlug: "perawatan",
      datePublished: "2026-05-22",
      dateModified: "2026-07-18",
      lastReviewed: "2026-07-18",
      authorName: "drg. Sekar Ayu Handayani, Sp.KG (data demo)",
      authorJob: "Dokter Gigi Spesialis Konservasi Gigi",
      reviewerName: "dr. Citra Lestari, Sp.BM (data demo)",
      reviewerJob: "Dokter Spesialis Bedah Mulut",
      seoDescription:
        "Penjelasan umum penyebab gigi sensitif dan mengapa pemeriksaan diperlukan untuk menentukan penanganan yang tepat.",
      body: `<p>Gigi sensitif umumnya terasa ngilu saat mengonsumsi makanan atau minuman panas, dingin, manis, atau asam.</p><h2>Beberapa kemungkinan penyebab</h2><ul><li>Email gigi menipis.</li><li>Leher gigi terbuka karena gusi menurun.</li><li>Retakan kecil pada gigi.</li></ul><h2>Apa yang dapat membantu</h2><p>Pasta gigi khusus gigi sensitif dapat membantu meringankan keluhan ringan. Namun penyebabnya perlu dipastikan melalui pemeriksaan agar penanganannya tepat.</p>`,
      sources: [source.mouth, source.who, source.medline],
    },
    {
      slug: "menjaga-kesehatan-gigi-anak-sejak-dini",
      title: "Menjaga Kesehatan Gigi Anak Sejak Dini",
      excerpt:
        "Kebiasaan kebersihan gigi untuk anak sesuai tahapan usia.",
      categorySlug: "keluarga",
      datePublished: "2026-06-15",
      dateModified: "2026-08-02",
      lastReviewed: "2026-08-02",
      authorName: "drg. Ayu Puspita (data demo)",
      authorJob: "Dokter Gigi Umum",
      reviewerName: "drg. Anindya Putri (data demo)",
      reviewerJob: "Dokter Gigi Umum",
      seoDescription:
        "Tips menjaga kesehatan gigi anak sejak dini dan anjuran pemeriksaan awal ke dokter gigi.",
      body: `<p>Kebiasaan kebersihan gigi yang dibangun sejak dini membantu menjaga kesehatan gigi permanen anak di kemudian hari.</p><h2>Tips sesuai usia</h2><ul><li>Mulai membersihkan mulut bayi bahkan sebelum gigi tumbuh.</li><li>Gunakan pasta gigi berfluoride dalam jumlah sekecil butiran beras saat gigi pertama tumbuh.</li><li>Dampingi menyikat gigi hingga anak terampil, umumnya sekitar usia 6-8 tahun.</li></ul><h2>Pemeriksaan pertama</h2><p>Pemeriksaan dini ke dokter gigi dianjurkan. Konsultasikan waktu yang paling sesuai untuk anak Anda.</p>`,
      sources: [source.who, source.pdgi, source.kemkes],
    },
  ];

  const origin = (process.env.NEXT_PUBLIC_SITE_URL ?? "").replace(/\/$/, "");

  const person = (name: string, jobTitle: string) => ({
    "@type": "Person",
    name,
    jobTitle,
    affiliation: { "@type": "Organization", name: "Nawasena Dental Care" },
  });

  // Sinyal E-E-A-T yang terlihat di halaman: byline penulis & peninjau, daftar
  // sumber tepercaya, dan disclaimer edukatif (bukan pengganti konsultasi).
  const bylineAndRefs = (a: (typeof articleRows)[number]) =>
    `<h2>Ditulis dan ditinjau</h2><p>Disusun oleh <strong>${a.authorName}</strong> (${a.authorJob}) dan ditinjau oleh <strong>${a.reviewerName}</strong> (${a.reviewerJob}) di Nawasena Dental Care. Nama dan kredensial pada halaman demo ini bersifat fiktif.</p><h2>Sumber</h2><ul>${a.sources
      .map(
        (s) =>
          `<li><a href="${s.url}" target="_blank" rel="noopener noreferrer">${s.name}</a></li>`
      )
      .join("")}</ul><p><em>Konten ini bersifat edukatif secara umum dan bukan pengganti diagnosis atau konsultasi dengan dokter gigi.</em></p>`;

  // Data terstruktur (JSON-LD) khusus medis untuk mendukung E-E-A-T: penulis &
  // peninjau (Person), sitasi sumber, serta tanggal terbit/modifikasi/review.
  const buildJsonLd = (a: (typeof articleRows)[number]) => ({
    "@context": "https://schema.org",
    "@type": ["Article", "MedicalWebPage"],
    inLanguage: "id",
    ...(origin
      ? {
          mainEntityOfPage: {
            "@type": "WebPage",
            "@id": `${origin}/artikel/${a.slug}`,
          },
        }
      : {}),
    headline: a.title,
    description: a.seoDescription,
    datePublished: a.datePublished,
    dateModified: a.dateModified,
    lastReviewed: a.lastReviewed,
    author: person(a.authorName, a.authorJob),
    reviewedBy: person(a.reviewerName, a.reviewerJob),
    publisher: {
      "@type": "Organization",
      name: "Nawasena Dental Care",
      ...(origin ? { url: origin } : {}),
    },
    relevantSpecialty: "Dental",
    appropriateMedicalAudience: { "@type": "Patient" },
    citation: a.sources.map((s) => ({
      "@type": "CreativeWork",
      name: s.name,
      url: s.url,
    })),
  });

  const insertRows: (typeof articles.$inferInsert)[] = [];
  for (const a of articleRows) {
    const categoryId = catId(a.categorySlug);
    if (!categoryId) {
      console.warn(
        `Kategori '${a.categorySlug}' tidak ditemukan — lewati artikel '${a.slug}'.`
      );
      continue;
    }
    insertRows.push({
      slug: a.slug,
      title: a.title,
      excerpt: a.excerpt,
      content: `${a.body}${bylineAndRefs(a)}`,
      categoryId,
      status: "published",
      publishedAt: new Date(a.datePublished),
      isProfessionallyReviewed: true,
      seoTitle: a.title,
      seoDescription: a.seoDescription,
      schemaJson: buildJsonLd(a),
    });
  }

  // Seed additif: artikel lama (slug sama) tidak dobel/ditimpa, yang baru masuk.
  const toInsert = insertRows.filter((r) => !existingSlugs.has(r.slug));
  if (toInsert.length === 0) return;

  await db.insert(articles).values(toInsert);
}

async function seedFaqs() {
  const existingFaqs = await db.select({ id: faqs.id }).from(faqs);
  if (existingFaqs.length > 0) return;

  await db.insert(faqs).values([
    {
      question: "Bagaimana cara membuat janji?",
      answer:
        "Gunakan tombol WhatsApp atau kirim permintaan janji melalui halaman Kontak. Jadwal final dikonfirmasi setelah tim klinik menindaklanjuti permintaan Anda.",
      sortOrder: 1,
    },
    {
      question: "Apakah perlu membuat janji sebelum datang?",
      answer:
        "Disarankan membuat janji lebih awal agar waktu konsultasi lebih teraturan. Untuk keluhan mendadak, hubungi kami terlebih dahulu.",
      sortOrder: 2,
    },
    {
      question: "Bagaimana mengetahui biaya perawatan?",
      answer:
        "Biaya disampaikan setelah dokter melakukan pemeriksaan dan menyusun rencana perawatan, karena kebutuhan setiap pasien berbeda.",
      sortOrder: 3,
    },
    {
      question: "Apa yang perlu dipersiapkan sebelum konsultasi?",
      answer:
        "Cukup sampaikan keluhan atau kebutuhan Anda serta riwayat perawatan gigi sebelumnya jika ada. Anda tidak perlu membawa diagnosis sendiri.",
      sortOrder: 4,
    },
    {
      question: "Apakah tersedia konsultasi untuk beberapa pilihan perawatan?",
      answer:
        "Ya. Dokter dapat menjelaskan beberapa opsi perawatan beserta pertimbangannya agar Anda memutuskan dengan tenang.",
      sortOrder: 5,
    },
  ]);
}

async function seed() {
  console.log("Menjalankan seed data demo Nawasena Dental Care...");

  await seedSiteSettings();
  await seedCategories();
  await seedServices();
  await seedDoctors();
  await seedArticles();
  await seedFaqs();
  await seedAdminUser();

  console.log("Seed selesai.");
}

async function main() {
  try {
    await seed();
  } catch (error) {
    console.error("Seed gagal:", error);
    process.exitCode = 1;
  } finally {
    // Tutup pool agar proses CLI keluar bersih, tidak menggantung.
    await db.$client.end();
  }
}

void main();
