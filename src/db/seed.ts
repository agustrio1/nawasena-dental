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
  const existingDoctors = await db.select({ id: doctors.id }).from(doctors);
  if (existingDoctors.length > 0) return;

  await db.insert(doctors).values([
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
  ]);
}

async function seedArticles() {
  const existingArticles = await db
    .select({ id: articles.id })
    .from(articles);
  if (existingArticles.length > 0) return;

  // Ambil id kategori untuk FK article.
  const categoryRows = await db
    .select({ id: categories.id, slug: categories.slug })
    .from(categories);
  const kebersihanId = categoryRows.find(
    (c) => c.slug === "kebersihan-gigi"
  )?.id;

  if (!kebersihanId) {
    console.warn("Kategori 'kebersihan-gigi' tidak ditemukan — lewati artikel.");
    return;
  }

  await db.insert(articles).values({
    slug: "cara-menjaga-kesehatan-gigi-sehari-hari",
    title: "Cara menjaga kesehatan gigi sehari-hari",
    excerpt:
      "Tiga kebiasaan sederhana yang bisa menjauhkan Anda dari masalah gigi dan mulut.",
    content:
      "<p>Menjaga kesehatan gigi tidak harus rumit. Ada tiga kebiasaan sederhana yang bisa Anda mulai hari ini.</p><h2>Tiga kebiasaan utama</h2><ul><li>Menyikat gigi dua kali sehari dengan pasta berfluoride.</li><li>Membersihkan sela gigi setiap hari.</li><li>Menjaga pola makan yang seimbang dan membatasi gula.</li></ul><p>Konsultasikan kondisi Anda dengan dokter gigi untuk rencana perawatan yang sesuai.</p>",
    categoryId: kebersihanId,
    status: "published",
    publishedAt: new Date(),
    isProfessionallyReviewed: true,
    seoTitle: "Cara menjaga kesehatan gigi sehari-hari",
    seoDescription:
      "Panduan sederhana menjaga kesehatan gigi dan mulut agar tetap optimal.",
  });
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
