// ============================================================
//  content.js — SATU-SATUNYA sumber isi website Ikaaa
//  Cara edit: ubah file ini, atau buka admin.html,
//  lalu download content.js baru dan push ke GitHub.
//  Semua teks, foto, soal quiz, dan surat tinggal di sini.
// ============================================================
window.IKAAA_CONTENT = {
  meta: {
    title: "Happy Birthday Ikaaa!",
    name: "Ikaaa",
    age: 27,
    birthDate: "08-11-1999",
    birthYear: 1999
  },

  // Gerbang tanggal lahir (gerbang iseng, bukan pengaman beneran).
  // Diterima: 08-11-1999, 08/11/1999, 08111999, 8-11-1999
  gate: {
    title: "Halo, Ikaaa!",
    question: "Masukin tanggal lahirmu dulu ya",
    hint: "Format: DD-MM-YYYY — contoh 08-11-1999",
    placeholder: "08-11-1999",
    button: "Buka Kadonya",
    wrong: "Hmm, bukan itu. Coba lagi ya, canciikuuu!",
    correct: "Yay, bener! Yuk masuk!"
  },

  opening: {
    title: "Happy Birthday Ikaaa!",
    subtitle: "Yuk ikut petualang dulu!",
    button: "Mulai",
    note: "27 tahun • 8 November • buat Ikaaa, dari Daimmm"
  },

  outfits: [
    {
      id: "black",
      name: "Formal Hitam",
      desc: "Blazer hitam, inner putih, rok panjang hitam. Anggun banget.",
      image: "images/character/outfit-black.jpg"
    },
    {
      id: "pink",
      name: "Pink Manis",
      desc: "Outer pink motif bunga, atasan putih, rok putih panjang.",
      image: "images/character/outfit-pink.jpg"
    },
    {
      id: "navy",
      name: "Casual Navy",
      desc: "Jaket navy, kaos putih, jeans biru, sneakers putih.",
      image: "images/character/outfit-navy.jpg"
    }
  ],

  map: {
    title: "Peta Petualangan Ikaaa",
    hint: "Kamu harus berkeliling rumah pakai joystick di bawah atau kontrol di laptop. Deketin stasiun berdenyut oranye trus klik buka.",
    checkpoints: [
      { id: "outfit", icon: "👗", label: "Pilih Outfit", sub: "Checkpoint 1" },
      { id: "gallery", icon: "📸", label: "Galeri Foto", sub: "Checkpoint 2" },
      { id: "cake", icon: "🎂", label: "Tiup Lilin", sub: "Checkpoint 3" },
      { id: "quiz", icon: "🧩", label: "Quick Quiz", sub: "Checkpoint 4" },
      { id: "letter", icon: "💌", label: "Surat", sub: "Finale" }
    ]
  },

  gallery: {
    title: "Galeri Kita",
    subtitle: "12 momen kita. Klik fotonya buat lihat ceritanya.",
    photos: [
      { src: "images/gallery/1.jpg", caption: "Pegi ngopi ke TeDe" },
      { src: "images/gallery/2.jpg", caption: "Pegi makan yang proper pake outfit couple" },
      { src: "images/gallery/3.jpg", caption: "Jiwani; aku kayak pulu-pulu ixixixi" },
      { src: "images/gallery/4.jpg", caption: "After SKD CPNS cusss kondangan" },
      { src: "images/gallery/5.jpg", caption: "Gunung Padang date" },
      { src: "images/gallery/6.jpg", caption: "Ngedate after kondangan 💖" },
      { src: "images/gallery/7.jpg", caption: "Touring jauhhhh" },
      { src: "images/gallery/8.jpg", caption: "Yeyyyy bukber" },
      { src: "images/gallery/9.jpg", caption: "Uniqlo date" },
      { src: "images/gallery/10.jpg", caption: "Finally, Badminton" },
      { src: "images/gallery/11.jpg", caption: "After work date!" },
      { src: "images/gallery/12.jpg", caption: "Nemenin CFD pertama akuuu!" }
    ]
  },

  cake: {
    title: "Tiup Lilinnya!",
    subtitle: "Ikaaa udah 27 tahun! Tekan dan tahan tombolnya buat meniup lilinnya sampai padam. Jangan lupa buat permohonan dulu ya.",
    button: "🎂 Tekan & Tahan buat Tiup",
    blowing: "Fuuuuuh… terus tahan!",
    doneTitle: "Yeay, lilinnya padam!",
    doneText: "Semoga semua permohonan Ikaaa terkabul tahun ini. Amin!",
    next: "Lanjut ke Quiz →"
  },

  quiz: {
    title: "Quick Quiz",
    subtitle: "Seberapa Daimmm kenal Ikaaa? 5 soal receh tentang kita berdua.",
    questions: [
      {
        q: "Kalau Ikaaa lagi bad mood, paling ampuh dihibur pakai apa?",
        options: ["Dibujuk", "Ditraktir", "Didiemin dulu", "Dikasih waktu sendiri"],
        correct: [0, 1],
        explain: "Jawabannya dua-duanya benar: dibujuk, sama ditraktir!"
      },
      {
        q: "Minuman apa yang paling Ikaaa banget?",
        options: ["Thai Tea", "Es Kopi", "Matcha Latte", "Es Teh Manis"],
        correct: [0],
        explain: "Thai Tea! Udah paling Ikaaa banget."
      },
      {
        q: "Di mana Im dan Ikaa ketemu pertama kali?",
        options: ["Minarko", "Gunung Padang", "TeDe", "Uniqlo"],
        correct: [0],
        explain: "Minarko — tempat pertama kali kita ketemu."
      },
      {
        q: "Warna apa yang paling Ikaa banget?",
        options: ["Biru", "Merah", "Pink", "Kuning"],
        correct: [0],
        explain: "Biru!"
      },
      {
        q: "Kalau ulang tahun, Ikaaa paling seneng dikasih apa?",
        options: ["Waktu bareng", "Cincin", "Bunga", "Makanan"],
        correct: [0, 1],
        explain: "Waktu bareng, sama cincin. Dan hadiah yang paling dia mau: Nikah!"
      }
    ],
    facts: [
      "Makanan favorit Ikaaa: dimsum",
      "Lagu favorit: semua lagu Juicy Luicy",
      "Kebiasaan khas Ikaaa: bilang \"gaakk\" pakai ekspresi khas",
      "Ini tahun ke-3 Daimmm nemenin Ikaaa ngerayain ultah"
    ]
  },

  letter: {
    title: "Surat buat Ikaaa",
    from: "— Daimmm",
    // Teks verbatim dari Im, jangan diubah tanpa izin Im.
    text: "Ikaaa, selamat ulang tahun yang ke-27.\n\nGa kerasa daimm udah tahun ke-3 nemenin ikaa ngerayain ultah. Selamat yaa canciikuuu! 💖\n\nBangga nya daimm punya Ikaa, ketangguhan ikaa, kekuatan ikaa semuanya daimm luv dan support!\n\nSemoga ikaaa sehat terus, dilancarkan planning nya, dilancarkan rejekinya, banyak duit, sehat dan bahagia selalu bareng aku.\n\nSemoga sukaa sama gift ini yaa! Terima kasih udah jadi Ikaaa nya daimmm, wopyuu."
  },

  finale: {
    title: "Selamat Ulang Tahun, Ikaaa!",
    text: "Makasih udah main sampai akhir. Sekali lagi, selamat 27 tahun, canciikuuu!",
    replay: "🔄 Main Lagi",
    scoreLabel: "Skor quiz kamu"
  }
};
