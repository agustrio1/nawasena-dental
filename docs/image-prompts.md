# Prompt Bank — Gambar Demo Nawasena Dental Care

Dibuat sesuai data seed (6 dokter, 8 layanan, 6 artikel, galeri).
Gunakan dengan model image-generation (Midjourney / DALL-E / Flux / Ideogram / dll).

## Aturan penting (dari AGENTS.md)

- Semua hasil adalah **DATA DEMO**. Foto dokter wajib hasil AI dan diberi label
  "data demo" — jangan memakai wajah orang sungguhan, dan jangan menampilkan
  sertifikat/izin nyata.
- DILARANG: gradient, glow/efek cahaya, glassmorphism, neon, shadow berlebihan.
- Hindari AI-slop: anatomi wajah/tangan aneh, jari cacat, gigi artifisial/terlalu
  putih sempurna, alat medis tidak masuk akal, teks acak pada poster/signage.
- Palet visual konsisten: warm ivory `#F8F7F3`, deep forest green `#173D35`,
  muted sage `#DCE6DF`, charcoal `#242B28`, putih bersih.
- Gaya umum: fotografi editorial klinik gigi modern, cahaya alami jendela,
  tenang, bersih, humanis — bukan rumah sakit kaku, bukan klinik kecantikan berlebihan.

## Blok gaya (tempel di akhir SEMUA prompt)

```
Editorial healthcare photography, modern dental clinic, soft natural window
light, warm ivory and deep forest green color palette, clean minimal interior,
calm and professional atmosphere, realistic proportions, shot on 35mm lens,
high detail, no text, no watermark, no gradient, no glow effects.
```

## Negative prompt (universal)

```
deformed hands, extra fingers, asymmetrical face, uncanny eyes, fake teeth,
oversaturated smile, hospital blue tones, neon, lens flare, glow, gradient
background, glassmorphism, cartoon, 3d render look, stock photo collage,
readable text, logos, signage with letters, low quality, blurry.
```

## Rasio aspek per penempatan

| Dipakai di | Rasio | Catatan |
|---|---|---|
| Cover layanan (list & detail) | 16:10 | crop `cover` otomatis |
| Hero detail layanan | ~4:3 potrait/landscape bebas | bleed ke tepi |
| Cover artikel | 16:10 | |
| Foto dokter | 1:1 | dibulatkan di UI |
| Galeri / hero Tentang | 4:3 | |

---

## A. Foto Dokter (6) — wajib berlabel demo

> Setelah jadi, tambahkan caption/label "Foto demo (AI)" di metadata atau
> penamaan file, dan isi alt text di admin sesuai anjuran.

1. **drg. Anindya Putri — Dokter Gigi Umum**
```
Portrait of a friendly Indonesian female general dentist in her early 30s,
wearing a clean white dental coat, warm confident smile, standing in a modern
dental consultation room with soft natural light, sage green accents,
head-and-shoulders framing, square composition.
```

2. **drg. Raka Wijaya — Ortodonti**
```
Portrait of a professional Indonesian male orthodontist in his late 30s,
short black hair, wearing white coat over forest green shirt, calm and
trustworthy expression, modern dental clinic background softly blurred,
soft window light, head-and-shoulders framing, square composition.
```

3. **drg. Sekar Ayu Handayani, Sp.KG — Konservasi Gigi & Restorasi Estetika**
```
Portrait of an elegant Indonesian female dental specialist in her early 40s,
wearing loupes around her neck and a white dental coat, kind professional
smile, in a bright restorative dental operatory, ivory and sage tones,
head-and-shoulders framing, square composition.
```

4. **drg. Bagus Prayoga, Sp.Perio — Periodontologi**
```
Portrait of an Indonesian male periodontist in his mid 30s, neat short hair,
white coat, standing beside a dental chair in a clean modern clinic, natural
daylight from a large window, composed and approachable expression,
head-and-shoulders framing, square composition.
```

5. **dr. Citra Lestari, Sp.BM — Bedah Mulut & Implan**
```
Portrait of a confident Indonesian female oral surgeon in her late 30s,
hair tied back, wearing a white coat, standing in a tidy surgical dental
room with minimal equipment visible, soft cool daylight, calm authoritative
but warm expression, head-and-shoulders framing, square composition.
```

6. **drg. Ayu Puspita — Dokter Gigi Umum**
```
Portrait of a young Indonesian female dentist, early 20s, warm genuine
smile, white dental coat, sitting at the edge of a desk in a bright modern
clinic waiting area with plants, soft natural light, head-and-shoulders
framing, square composition.
```

---

## B. Cover Layanan (8)

1. **Pemeriksaan Gigi Rutin**
```
A dentist gently consulting with an adult patient using a dental mirror and
light in a modern examination room, patient seated calmly, focus on
conversation and trust, ivory walls, forest green chair upholstery.
```

2. **Scaling & Pembersihan Gigi**
```
Close-up editorial shot of a dental hygienist performing a professional
teeth cleaning with an ultrasonic scaler, realistic dental chair setting,
soft natural light, clean and precise, shallow depth of field.
```

3. **Ortodonti**
```
A young adult patient smiling slightly while an orthodontist examines
braces on upper teeth with a mirror, modern orthodontic practice, bright
and airy, sage green interior accents, realistic brackets and wires.
```

4. **Tambal Gigi (Perawatan Gigi Berlubang)**
```
A dentist applying a tooth-colored composite filling with proper instruments
during a calm appointment, realistic operatory, natural window light, focus
on careful hands and instrument tips, no exaggerated whiteness.
```

5. **Perawatan Saluran Akar**
```
A dentist working attentively during a root canal treatment in a modern
dental operatory, rubber dam realistically placed, professional and
sterile-but-warm mood, soft daylight, shallow depth of field.
```

6. **Implan Gigi**
```
An oral surgeon reviewing a dental X-ray lightbox or digital screen showing
jaw anatomy with an implant plan, white coat, clinic background, calm
editorial lighting, focus on planning and precision.
```

7. **Pemutihan Gigi (Bleaching)**
```
A dental professional applying a whitening treatment with a tray to a
relaxed adult patient in a bright modern clinic, natural realistic tooth
shade (not glowing), soft window light, ivory and sage palette.
```

8. **Veneer & Restorasi Estetika**
```
A dentist comparing a porcelain veneer shade guide against a patient's front
teeth during an aesthetic consultation, realistic dental lab-crafted ceramic,
warm natural light, editorial close-up, subtle and elegant.
```

---

## C. Cover Artikel (6)

1. **Cara menjaga kesehatan gigi sehari-hari**
```
A bright bathroom shelf scene with a toothbrush, fluoride toothpaste and
dental floss arranged minimally on ivory ceramic, soft morning window
light, editorial still-life, calm and clean.
```

2. **Kapan Saatnya Scaling Gigi?**
```
Close-up of a dental mirror and ultrasonic scaler resting on a clean
tray in a modern clinic, soft natural light, editorial medical still-life,
sage green cloth underneath, realistic instruments.
```

3. **Mitos dan Fakta Pemutihan Gigi (Bleaching)**
```
A neutral editorial photo of a natural relaxed smile of an adult person
next to a small shade guide on ivory background, realistic tooth color,
soft daylight, no glow, subtle and honest.
```

4. **Yang Perlu Diketahui Sebelum Kawat Gigi**
```
A teenager holding a clear aligner case near a modern clinic window,
soft natural light, hopeful calm mood, editorial lifestyle photography,
ivory and forest green tones.
```

5. **Gigi Sensitif: Penyebab dan Penanganannya**
```
A close-up editorial scene of a glass of cold water with ice and a straw
beside a tube of sensitive-tooth toothpaste on a marble-look ivory table,
soft daylight, calm minimal composition.
```

6. **Menjaga Kesehatan Gigi Anak Sejak Dini**
```
A young child brushing teeth happily with a parent helping in a bright,
safe bathroom, warm natural light, gentle lifestyle photography, realistic
child proportions, soft sage accents.
```

---

## D. Galeri Klinik (5) — jadi hero "Tentang" + fallback beranda

Gambar **tanpa wajah** untuk aman dari klaim pasien/dokter nyata.

1. **Ruang perawatan (jadi `gallery[0]` → hero Tentang & beranda)**
```
A modern dental treatment room with a forest green dental chair, large
window with sheer curtains and soft daylight, ivory walls, minimal plants,
clean and welcoming editorial interior photography, wide angle, no people.
```

2. **Resepsionis / ruang tunggu**
```
A calm dental clinic reception area with a warm wood counter, ivory
walls, sage green seating, soft natural light from a side window,
editorial interior photography, no people.
```

3. **Sudut interior detail**
```
A minimal detail shot of a dental clinic corner: a small table with a
plant, magazines and soft daylight on an ivory wall, editorial interior
photography, shallow depth of field, no people.
```

4. **Sterilisasi peralatan (tanpa klaim sertifikasi)**
```
A tidy instrument sterilization corner in a modern dental clinic, sealed
trays arranged neatly, soft cool daylight, honest documentary style,
no readable labels, no people.
```

5. **Koridor klinik**
```
A quiet clinic corridor with warm ivory walls, forest green doors,
natural light from the far end, minimal signage without readable text,
editorial architectural photography, no people.
```

---

## E. Cara mengisi ke website

1. Login admin → **Pustaka Media** otomatis terisi saat upload, atau langsung
   dari masing-masing form:
   - **Admin → Dokter** → unggah foto per dokter (rasio 1:1).
   - **Admin → Layanan** → isi "cover" per layanan (16:10).
   - **Admin → Artikel** → isi "gambar sampul" per artikel (16:10).
   - **Admin → Galeri** → tambah foto (4:3); atur **sortOrder 1 + aktif** untuk
     gambar yang mau jadi hero halaman Tentang / fallback hero beranda.
2. Isi **alt text** deskriptif (Bahasa Indonesia) di tiap gambar.
3. Beri penandaan "data demo" pada nama dokter & foto (label "(data demo)"
   sudah ada di data seed — jangan dihapus).
