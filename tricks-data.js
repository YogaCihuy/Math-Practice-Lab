/* =========================================================================
   TRICKS_DATA — Data semua trik cepat MathTrik
   Mau nambah trik baru? Tinggal copy salah satu object di bawah,
   tempel di array kategori yang sesuai, ganti isinya. Gak perlu
   sentuh index.html atau script.js sama sekali!

   Format tiap trik:
   {
     title: "Judul Trik",
     description: "Penjelasan singkat kapan/kenapa trik ini dipakai",
     trick: "Rumus / cara triknya",
     examples: ["Contoh 1", "Contoh 2", ...]   // boleh 1 atau lebih
   }
   ========================================================================= */

const TRICKS_DATA = {

  perkalian: [
    {
      title: "Perkalian dengan 9",
      description: "Cara cepat kalikan angka berapapun dengan 9 tanpa hafalan.",
      trick: "A × 9 = (A × 10) − A",
      examples: [
        "5 × 9 = (5 × 10) − 5 = 50 − 5 = 45",
        "8 × 9 = (8 × 10) − 8 = 80 − 8 = 72"
      ]
    },
        // Tambah trik perkalian lain di sini, contoh:
    {
      title: "Perkalian 4",
      description: "Cara cepat kalikan angka berapapun dengan 4 tanpa hafalan.",
      trick: "N x 4 = N x 2 x 2",
      examples: ["4 x 4 = 4 x 2 = 8 x 2 = 16"]
    },
    {
      title: "Perkalian 5",
      description: "Cara cepat kalikan angka berapapun dengan 5 tanpa hafalan.",
      trick: "N x 5 = N x 10 : 2",
      examples: ["7 x 5 = 7 x 10 = 70 : 2 = 35"]
    }
    // Tambah trik perkalian lain di sini, contoh:
    // {
    //   title: "Perkalian dengan 11 (2 digit)",
    //   description: "...",
    //   trick: "...",
    //   examples: ["..."]
    // }
  ],

  pembagian: [
    {
      title: "Bagi 5",
      description: "Kalikan dulu dengan 2, baru bagi 10 — lebih gampang secara mental.",
      trick: "N ÷ 5 = (N × 2) ÷ 10",
      examples: [
        "65 ÷ 5 → 65 × 2 = 130 → 130 ÷ 10 = 13",
        "240 ÷ 5 → 240 × 2 = 480 → 480 ÷ 10 = 48"
      ]
    },
    {
      title: "Bagi 4",
      description: "Bagi 4 sama saja dengan bagi 2 dua kali berturut-turut.",
      trick: "N ÷ 4 = (N ÷ 2) ÷ 2",
      examples: [
        "48 ÷ 4 → 48 ÷ 2 = 24 → 24 ÷ 2 = 12",
        "132 ÷ 4 → 132 ÷ 2 = 66 → 66 ÷ 2 = 33"
      ]
    }
  ],

  pangkat: [
    {
      title: "Kuadrat Angka Berakhiran 5",
      description: "Untuk angka berbentuk A5 (puluhan A, satuan 5).",
      trick: "A5² = [A × (A+1)] lalu tempel \"25\" di belakang",
      examples: [
        "25² → A=2 → 2×3=6 → tempel 25 → 625",
        "45² → A=4 → 4×5=20 → tempel 25 → 2025",
        "95² → A=9 → 9×10=90 → tempel 25 → 9025"
      ]
    }
  ],

  akar: [
    {
      title: "Tebak Cepat Digit Terakhir Akar",
      description: "Hafalkan kuadrat 1–15, lalu lihat digit terakhir angka untuk menebak digit terakhir hasil akarnya.",
      trick: "Akhiran 1→akar akhiran 1/9 | Akhiran 4→akar akhiran 2/8 | Akhiran 9→akar akhiran 3/7 | Akhiran 6→akar akhiran 4/6 | Akhiran 5→akar akhiran 5",
      examples: [
        "√81 berakhiran 1 → akarnya berakhiran 1 atau 9 → cek: 9²=81 → akarnya 9"
      ]
    }
  ],

  faktorial: [
    {
      title: "Multifaktorial (Double Factorial n‼)",
      description: "Mengalikan angka dengan loncat 2 langkah, bukan loncat 1 seperti faktorial biasa.",
      trick: "n‼ = n × (n−2) × (n−4) × ... (berhenti di 1 atau 2)",
      examples: [
        "7‼ = 7 × 5 × 3 × 1 = 105 (ganjil)",
        "8‼ = 8 × 6 × 4 × 2 = 384 (genap)"
      ]
    }
  ]

};
