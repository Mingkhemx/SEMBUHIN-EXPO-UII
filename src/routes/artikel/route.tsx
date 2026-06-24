import { createFileRoute } from '@tanstack/react-router'
import { useState, useEffect } from 'react'
import { motion, type Variants } from 'framer-motion'
import {
  BookOpen,
  Search,
  Clock,
  User,
  ChevronRight,
  Eye,
  Heart,
  Brain,
  Activity,
  Apple,
  Moon,
  Dumbbell,
  Flame,
  Shield,
  TrendingUp,
  ArrowLeft,
  Bookmark,
  Share2,
  Calendar,
  ExternalLink,
} from 'lucide-react'
import { cn } from '@/lib/utils'

export const Route = createFileRoute('/artikel')({
  head: () => ({
    meta: [
      { title: 'Artikel Kesehatan — Sembuhin' },
      { name: 'description', content: 'Kumpulan riset dan artikel medis terpercaya untuk kesehatan Anda.' },
    ],
  }),
  component: ArtikelPage,
})

/* ─── Types ──────────────────────────────────────────────────────── */
type ViewMode = 'list' | 'detail'

interface Article {
  id: string
  title: string
  excerpt: string
  content: string
  category: string
  categoryColor: string
  author: string
  authorRole: string
  date: string
  readTime: string
  views: number
  featured?: boolean
  imageEmoji?: string
  imageUrl?: string
  sourceUrl?: string
}

/* ─── Mock Data ──────────────────────────────────────────────────── */
const CATEGORIES = [
  { id: 'semua', label: 'Semua', icon: BookOpen },
  { id: 'jantung', label: 'Jantung', icon: Heart },
  { id: 'nutrisi', label: 'Nutrisi', icon: Apple },
  { id: 'mental', label: 'Mental Health', icon: Brain },
  { id: 'olahraga', label: 'Olahraga', icon: Dumbbell },
  { id: 'tidur', label: 'Tidur', icon: Moon },
  { id: 'diabetes', label: 'Diabetes', icon: Activity },
]

const ARTICLES: Article[] = [
  {
    id: '1',
    title: 'Panduan Lengkap Menjaga Kesehatan Jantung di Usia 30-an',
    excerpt: 'Memasuki usia 30-an, risiko penyakit kardiovaskular mulai meningkat. Pelajari langkah-langkah pencegahan yang efektif berdasarkan riset terkini.',
    content: 'Penyakit jantung masih menjadi penyebab kematian nomor satu di dunia. Memasuki usia 30-an, metabolisme tubuh mulai melambat dan risiko penumpukan plak di pembuluh darah meningkat secara signifikan. Banyak orang di usia ini merasa masih muda dan kebal terhadap penyakit kronis, padahal kebiasaan buruk yang ditanamkan sekarang akan membuahkan hasil negatif di usia 40-an atau 50-an.\n\nBerikut panduan lengkap dan komprehensif yang bisa Anda terapkan mulai hari ini:\n\n1. Olahraga Kardiovaskular Teratur\nJangan tunggu sampai berat badan naik untuk mulai berolahraga. The American Heart Association merekomendasikan setidaknya 150 menit olahraga aerobik intensitas sedang per minggu. Ini bisa berupa jalan cepat, bersepeda, berenang, atau jogging. Bagilah menjadi 30 menit per hari, 5 hari seminggu. Olahraga memperkuat otot jantung, menurunkan tekanan darah, dan membantu mengontrol kadar kolesterol.\n\n2. Terapkan Pola Makan Jantung Sehat (Diet Mediterania)\nFokus pada konsumsi ikan berlemak yang kaya omega-3 seperti salmon, sarden, atau tuna minimal 2-3 kali seminggu. Perbanyak sayuran berdaun hijau, buah-buahan segar, biji-bijian utuh (whole grains), dan kacang-kacangan. Ganti lemak jenuh (seperti mentega) dengan lemak tak jenuh sehat seperti minyak zaitun extra virgin atau alpukat. Batasi asupan garam harian kurang dari 5 gram untuk menjaga tekanan darah tetap stabil.\n\n3. Manajemen Stres yang Efektif\nStres kronis memicu pelepasan hormon kortisol dan adrenalin yang secara langsung dapat meningkatkan tekanan darah dan detak jantung. Dalam jangka panjang, ini merusak pembuluh darah. Temukan cara pelepasan stres yang cocok untuk Anda, apakah itu meditasi, yoga, latihan pernapasan dalam (deep breathing), atau sekadar meluangkan waktu untuk hobi. Terapi mindfulness terbukti menurunkan risiko serangan jantung pada populasi pekerja.\n\n4. Pemantauan Angka Kesehatan Secara Rutin\nJangan menebak-nebak kondisi tubuh Anda. Lakukan medical check-up rutin setidaknya setahun sekali. Pantau 4 angka penting ini: Tekanan Darah (idealnya di bawah 120/80 mmHg), Kolesterol Total dan LDL (Kolesterol jahat), Gula Darah Puasa, dan Indeks Massa Tubuh (BMI). Mengetahui angka-angka ini sejak dini memungkinkan Anda mengambil tindakan pencegahan sebelum masalah menjadi serius.\n\n5. Tidur Berkualitas dan Berhenti Merokok\nKurang tidur (kurang dari 7 jam) dikaitkan dengan peningkatan tekanan darah dan penambahan berat badan. Pastikan Anda mendapatkan tidur yang restoratif setiap malam. Terakhir, jika Anda merokok, berhentilah segera. Merokok adalah faktor risiko terbesar untuk serangan jantung mendadak pada usia muda karena merusak lapisan pembuluh darah dan memicu pembekuan darah abnormal.\n\nStudi jangka panjang dari American Heart Association (2024) menunjukkan bahwa kombinasi dari kelima pilar gaya hidup sehat ini dapat menurunkan risiko penyakit kardiovaskular hingga 80% pada individu yang menerapkannya sejak usia awal 30-an.',
    category: 'jantung',
    categoryColor: 'bg-red-100 text-red-700',
    author: 'Dr. Ahmad Fauzi, Sp.JP',
    authorRole: 'Kardiolog',
    date: '10 Feb 2026',
    readTime: '8 min',
    views: 2450,
    featured: true,
    imageUrl: 'https://images.unsplash.com/photo-1505751172876-fa1923c5c528?auto=format&fit=crop&w=800&q=80',
    imageEmoji: '❤️',
  },
  {
    id: '2',
    title: '5 Makanan yang Terbukti Menurunkan Kolesterol Jahat',
    excerpt: 'Kolesterol LDL yang tinggi bisa meningkatkan risiko stroke dan serangan jantung. Simak daftar makanan yang terbukti secara ilmiah menurunkan LDL.',
    content: 'Kolesterol LDL (low-density lipoprotein) sering dijuluki sebagai "kolesterol jahat" karena kemampuannya menumpuk di dinding arteri, membentuk plak yang dapat menyumbat aliran darah, dan pada akhirnya memicu serangan jantung atau stroke. Mengendalikan kolesterol tidak melulu harus bergantung pada obat-obatan statin; intervensi diet seringkali menjadi garis pertahanan pertama yang paling efektif.\n\nBerdasarkan berbagai penelitian klinis, berikut adalah 5 jenis makanan yang terbukti ampuh membantu menurunkan kadar kolesterol LDL secara alami:\n\n1. Oatmeal dan Biji-bijian Utuh (Whole Grains)\nOatmeal mengandung sejenis serat larut yang disebut beta-glucan. Saat dicerna, beta-glucan membentuk gel kental di saluran pencernaan yang mengikat kolesterol dan asam empedu, mencegahnya diserap kembali ke dalam aliran darah dan akhirnya membuangnya melalui feses. Konsumsi 1,5 cangkir oatmeal matang per hari dapat memberikan cukup beta-glucan untuk menurunkan kolesterol secara signifikan.\n\n2. Kacang-kacangan (Almond, Walnut, dan Kedelai)\nKacang-kacangan kaya akan lemak tak jenuh tunggal dan ganda yang sehat bagi jantung. Mereka juga mengandung sterol tumbuhan (fitosterol), zat alami yang strukturnya mirip dengan kolesterol sehingga dapat bersaing dalam proses penyerapan di usus. Mengonsumsi segenggam kacang almond atau kenari setiap hari terbukti menurunkan kolesterol LDL hingga 5%. Kedelai dan produk olahannya (tempe, tahu, susu kedelai) juga mengandung isoflavon yang bekerja dengan mekanisme serupa.\n\n3. Alpukat\nBuah yang lezat ini adalah sumber luar biasa dari lemak tak jenuh tunggal, khususnya asam oleat. Lemak jenis ini sangat unik karena tidak hanya membantu menurunkan kolesterol jahat (LDL), tetapi secara bersamaan dapat mempertahankan atau bahkan meningkatkan kolesterol baik (HDL). Alpukat juga kaya akan serat dan beta-sitosterol, menjadikannya "superfood" sejati untuk profil lipid Anda.\n\n4. Ikan Berlemak Tinggi (Salmon, Mackerel, Sarden)\nMengganti daging merah (yang tinggi lemak jenuh penambah kolesterol) dengan ikan berlemak memberikan manfaat ganda. Pertama, Anda mengurangi asupan lemak jenuh. Kedua, Anda mendapatkan asupan tinggi asam lemak Omega-3. Meskipun Omega-3 tidak secara langsung menurunkan LDL, zat ini sangat efektif dalam menurunkan trigliserida dalam darah, mengurangi peradangan arteri, dan mencegah aritmia jantung.\n\n5. Terong, Okra, dan Buah Beri\nSayuran dan buah-buahan tertentu memiliki kandungan serat larut pektin yang sangat tinggi. Pektin bekerja mirip dengan beta-glucan pada gandum, yaitu mengikat kolesterol di usus. Buah-buahan seperti apel, anggur, stroberi, dan buah sitrus juga kaya akan pektin. Selain itu, mereka mengandung antioksidan polifenol yang mencegah kolesterol LDL teroksidasi—tahap awal dari pembentukan plak aterosklerosis yang berbahaya.\n\nUntuk hasil maksimal, konsumsi makanan ini harus dikombinasikan dengan pengurangan asupan lemak trans dan lemak jenuh yang biasa ditemukan pada makanan olahan, gorengan, dan daging berlemak. Perubahan diet yang konsisten selama 6 hingga 8 minggu biasanya sudah dapat memperlihatkan penurunan LDL yang nyata pada hasil tes darah Anda.',
    category: 'nutrisi',
    categoryColor: 'bg-emerald-100 text-emerald-700',
    author: 'Ns. Siti Rahma, S.Gz',
    authorRole: 'Ahli Gizi Klinis',
    date: '8 Feb 2026',
    readTime: '5 min',
    views: 1890,
    imageUrl: 'https://images.unsplash.com/photo-1490645935967-10de6ba17061?auto=format&fit=crop&w=800&q=80',
    imageEmoji: '🥗',
  },
  {
    id: '3',
    title: 'Mengenal Burnout: Tanda, Penyebab, dan Cara Mengatasinya',
    excerpt: 'Burnout bukan sekadar lelah biasa. Kenali gejala fisik dan mentalnya, serta strategi berbasis CBT untuk pulih.',
    content: 'Organisasi Kesehatan Dunia (WHO) secara resmi telah mengklasifikasikan burnout sebagai fenomena okupasional dalam revisi ke-11 International Classification of Diseases (ICD-11). Sangat penting untuk dipahami bahwa burnout bukanlah sekadar kelelahan biasa setelah hari yang sibuk, melainkan sebuah sindrom kronis akibat stres di tempat kerja yang tidak berhasil dikelola dengan baik.\n\nBurnout ditandai oleh tiga dimensi utama:\n1. Perasaan kehabisan energi atau kelelahan yang ekstrem (exhaustion).\n2. Peningkatan jarak mental dari pekerjaan, atau perasaan sinisme dan negativitas terkait dengan pekerjaan.\n3. Penurunan efikasi profesional atau merasa tidak kompeten dan tidak produktif lagi.\n\nGejala Fisik dan Mental Burnout\nBurnout tidak hanya menyerang pikiran, tetapi juga memanifestasikan dirinya secara fisik. Gejala fisik yang sering dilaporkan meliputi sakit kepala kronis, ketegangan otot (terutama di area leher dan bahu), gangguan pencernaan, insomnia parah, dan penurunan sistem imunitas sehingga seseorang menjadi lebih sering jatuh sakit (misalnya sering flu atau radang). Secara mental, penderita mungkin mengalami kecemasan konstan, mudah marah, kehilangan motivasi total, hingga depresi.\n\nFaktor Penyebab Utama\nBurnout jarang terjadi secara tiba-tiba. Ia merupakan hasil dari penumpukan berbagai faktor, antara lain: beban kerja yang tidak realistis (workload), kurangnya kontrol atas pekerjaan sendiri, ketidakseimbangan antara usaha dan penghargaan (reward), lingkungan kerja yang toksik atau minim dukungan, dan ketidakselarasan nilai-nilai personal dengan budaya perusahaan.\n\nStrategi Pemulihan Berbasis Cognitive Behavioral Therapy (CBT)\nPemulihan dari burnout membutuhkan waktu dan usaha sadar. Beberapa strategi psikologis yang terbukti efektif meliputi:\n\n- Identifikasi dan Tantang Pikiran Negatif: CBT mengajarkan kita untuk menyadari "cognitive distortions" (distorsi kognitif) seperti perfeksionisme ekstrem atau pemikiran "all-or-nothing". Belajarlah untuk menetapkan ekspektasi yang realistis terhadap diri sendiri.\n\n- Tetapkan Batasan (Boundaries) yang Jelas: Di era remote working, garis batas antara kerja dan istirahat seringkali kabur. Beranikan diri untuk mengatakan "tidak" pada tugas tambahan di luar kapasitas, matikan notifikasi email pekerjaan setelah jam kerja, dan dedikasikan waktu murni untuk unplugged.\n\n- Praktikkan Self-Compassion: Jangan menghukum diri sendiri karena merasa lelah. Perlakukan diri Anda dengan kebaikan yang sama seperti Anda memperlakukan sahabat yang sedang kesusahan.\n\n- Re-evaluasi Prioritas: Tanyakan pada diri sendiri apa yang benar-benar bermakna dalam hidup Anda. Kadang, pemulihan dari burnout menuntut perubahan besar seperti berganti peran, mengurangi jam kerja, atau bahkan berpindah karir.\n\nJika gejala burnout berlanjut selama lebih dari 2-3 minggu dan mulai mengganggu fungsi harian secara signifikan, mencari bantuan dari profesional kesehatan mental seperti psikolog klinis atau psikiater adalah langkah yang sangat disarankan.',
    category: 'mental',
    categoryColor: 'bg-violet-100 text-violet-700',
    author: 'Dr. Maya Putri, M.Psi',
    authorRole: 'Psikolog Klinis',
    date: '5 Feb 2026',
    readTime: '7 min',
    views: 3120,
    imageUrl: 'https://images.unsplash.com/photo-1555685812-4b943f1cb0eb?auto=format&fit=crop&w=800&q=80',
    imageEmoji: '🧠',
  },
  {
    id: '4',
    title: 'HIIT vs Steady-State Cardio: Mana yang Lebih Efektif?',
    excerpt: 'Dua pendekatan olahraga ini memiliki manfaat berbeda. Temukan mana yang paling cocok untuk tujuan kebugaran Anda.',
    content: 'Dalam dunia kebugaran dan penurunan berat badan, perdebatan antara efektivitas High-Intensity Interval Training (HIIT) dan Steady-State Cardio seolah tidak pernah berakhir. Keduanya adalah bentuk latihan kardiovaskular, namun memiliki mekanisme kerja, intensitas, dan adaptasi fisiologis yang sangat berbeda pada tubuh.\n\nMemahami High-Intensity Interval Training (HIIT)\nHIIT adalah metode latihan yang melibatkan periode latihan intensitas sangat tinggi (di mana detak jantung mencapai 80-95% dari kapasitas maksimal) diselingi dengan periode pemulihan atau latihan intensitas rendah. Misalnya: sprint sekuat tenaga selama 30 detik, diikuti dengan jalan kaki santai selama 60 detik, diulang selama 15-20 menit.\n\nKeunggulan HIIT:\n- Efisiensi Waktu: Karena intensitasnya yang tinggi, Anda bisa mendapatkan manfaat kardio yang sama (atau lebih baik) hanya dalam waktu 20-30 menit dibandingkan 60 menit lari santai.\n- Efek Afterburn (EPOC): HIIT memicu Excess Post-exercise Oxygen Consumption. Artinya, tubuh Anda akan terus membakar kalori pada tingkat yang lebih tinggi selama berjam-jam bahkan setelah latihan selesai, demi mengembalikan tubuh ke kondisi homeostasis.\n- Peningkatan Kapasitas Aerobik dan Anaerobik: HIIT sangat cepat dalam meningkatkan VO2 Max (kemampuan tubuh menggunakan oksigen maksimal).\n\nMemahami Steady-State Cardio (LISS)\nLow-Intensity Steady-State (LISS) atau steady-state cardio adalah latihan kardio yang dilakukan pada intensitas rendah hingga sedang (sekitar 50-70% dari detak jantung maksimal) dengan kecepatan yang konstan selama durasi yang lebih lama, biasanya 45 hingga 60 menit. Contohnya adalah jogging santai, bersepeda santai, atau berenang jarak jauh.\n\nKeunggulan Steady-State Cardio:\n- Lebih Ramah Sendi dan Aman: Risiko cedera jauh lebih rendah dibandingkan gerakan eksplosif pada HIIT, menjadikannya pilihan ideal untuk pemula, orang tua, atau mereka yang sedang dalam masa pemulihan cedera.\n- Pemulihan Cepat: Anda bisa melakukan LISS hampir setiap hari karena tidak terlalu membebani sistem saraf pusat.\n- Pembakaran Lemak Langsung: Pada intensitas rendah, tubuh menggunakan lemak sebagai sumber bahan bakar utama (meskipun total kalori yang dibakar per menit lebih sedikit dibanding HIIT).\n\nMana yang Lebih Baik?\nJawabannya sangat bergantung pada tujuan spesifik, tingkat kebugaran, dan ketersediaan waktu Anda. Jika Anda sangat sibuk dan ingin meningkatkan kebugaran metabolisme dengan cepat, HIIT adalah jawabannya. Namun, jika Anda menyukai olahraga yang menenangkan pikiran, sedang membangun daya tahan dasar, atau menghindari tekanan sendi, LISS lebih cocok.\n\nRekomendasi ahli kebugaran modern adalah "Polarized Training": menggabungkan keduanya. Melakukan 1-2 sesi HIIT per minggu dikombinasikan dengan 2-3 sesi LISS akan memberikan keseimbangan sempurna antara stimulus intensitas tinggi dan pemulihan aktif, memberikan hasil yang paling optimal tanpa risiko overtraining.',
    category: 'olahraga',
    categoryColor: 'bg-amber-100 text-amber-700',
    author: 'Coach Rendy, S.Or',
    authorRole: 'Sports Science',
    date: '3 Feb 2026',
    readTime: '6 min',
    views: 1560,
    imageUrl: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&w=800&q=80',
    imageEmoji: '🏃',
  },
  {
    id: '5',
    title: 'Sleep Hygiene: 10 Kebiasaan untuk Tidur Lebih Berkualitas',
    excerpt: 'Kualitas tidur sama pentingnya dengan durasi. Terapkan sleep hygiene untuk tidur yang lebih nyenyak dan menyegarkan.',
    content: 'Kita seringkali hanya berfokus pada durasi tidur (7-8 jam semalam), tetapi mengabaikan aspek yang sama pentingnya: kualitas tidur. Anda mungkin tidur selama 8 jam, tetapi jika Anda sering terbangun, tidur gelisah, atau tidak mencapai fase tidur dalam (Deep Sleep) dan REM (Rapid Eye Movement), Anda tetap akan merasa lelah keesokan harinya.\n\nDi sinilah konsep "Sleep Hygiene" atau kebersihan tidur berperan penting. Sleep hygiene mengacu pada serangkaian kebiasaan sehat dan modifikasi lingkungan yang dirancang untuk mengoptimalkan kualitas tidur Anda secara alami tanpa bantuan obat-obatan.\n\nBerikut adalah 10 pilar utama Sleep Hygiene yang direkomendasikan oleh para spesialis tidur:\n\n1. Konsistensi Jadwal Sirkadian\nTidurlah dan bangunlah pada jam yang persis sama setiap hari, termasuk di akhir pekan. Inkonsistensi (seperti begadang di hari Sabtu dan tidur seharian di hari Minggu) akan mengacaukan ritme sirkadian internal Anda, memicu kondisi yang disebut "social jetlag".\n\n2. Atur Paparan Cahaya\nRitme sirkadian sangat bergantung pada cahaya. Dapatkan paparan sinar matahari pagi segera setelah bangun tidur untuk memberi sinyal pada otak agar menghentikan produksi melatonin (hormon tidur). Sebaliknya, kurangi pencahayaan ruangan di malam hari.\n\n3. Jeda Layar (Screen Curfew)\nMatikan semua layar elektronik (smartphone, TV, tablet) minimal 60-90 menit sebelum tidur. Cahaya biru (blue light) dari layar menghambat pelepasan melatonin secara signifikan, menipu otak Anda untuk berpikir bahwa hari masih siang.\n\n4. Optimalkan Suhu Kamar\nKondisi tubuh perlu mengalami sedikit penurunan suhu inti agar bisa tertidur lelap. Jaga agar suhu kamar tidur Anda tetap sejuk, idealnya antara 18°C hingga 22°C.\n\n5. Perhatikan Konsumsi Kafein\nWaktu paruh kafein di dalam tubuh bisa mencapai 5-7 jam. Artinya, secangkir kopi jam 4 sore masih akan tersisa setengahnya di sistem Anda pada jam 9 malam. Hindari kafein sepenuhnya setidaknya 6-8 jam sebelum target jam tidur Anda.\n\n6. Hati-hati dengan Alkohol\nMeskipun alkohol mungkin membuat Anda merasa mengantuk pada awalnya, ia sangat merusak arsitektur tidur Anda. Alkohol memblokir fase tidur REM dan menyebabkan fragmentasi tidur (sering terbangun) di paruh kedua malam.\n\n7. Lingkungan Tidur yang Tenang dan Gelap\nGunakan tirai blackout untuk memblokir cahaya jalan, dan pertimbangkan penggunaan earplug atau mesin white noise jika Anda tinggal di lingkungan yang bising.\n\n8. Hindari Makan Besar Dekat Jam Tidur\nMakan makanan berat, pedas, atau asam dalam 2-3 jam sebelum tidur dapat memicu refluks asam lambung (GERD) saat Anda berbaring, yang sangat mengganggu kenyamanan tidur.\n\n9. Asosiasi Tempat Tidur\nLatih otak Anda untuk mengasosiasikan tempat tidur hanya dengan dua hal: tidur dan keintiman. Jangan bekerja, menonton TV, atau makan di atas tempat tidur.\n\n10. Rutinitas Relaksasi (Wind-down Routine)\nCiptakan ritual transisi sebelum tidur untuk menurunkan detak jantung dan menenangkan pikiran. Ini bisa berupa mandi air hangat, membaca buku fisik (bukan e-book), mendengarkan musik ambient, atau melakukan peregangan ringan dan meditasi.\n\nMemperbaiki sleep hygiene membutuhkan disiplin dan waktu, namun dampaknya terhadap kesehatan fisik, fungsi kognitif, dan stabilitas emosional sangatlah transformatif.',
    category: 'tidur',
    categoryColor: 'bg-indigo-100 text-indigo-700',
    author: 'Dr. Lisa Permata, Sp.KJ',
    authorRole: 'Spesialis Tidur',
    date: '1 Feb 2026',
    readTime: '5 min',
    views: 2100,
    imageUrl: 'https://images.unsplash.com/photo-1541781774459-bb2af2f05b55?auto=format&fit=crop&w=800&q=80',
    imageEmoji: '😴',
  },
  {
    id: '6',
    title: 'Diabetes Tipe 2: Perubahan Gaya Hidup yang Bisa Membalikkan Kondisi',
    excerpt: 'Riset terbaru menunjukkan diabetes tipe 2 stadium awal bisa direversal dengan perubahan gaya hidup yang tepat.',
    content: 'Selama beberapa dekade, Diabetes Mellitus Tipe 2 (DMT2) dianggap sebagai penyakit kronis progresif yang tidak dapat disembuhkan, di mana pasien harus bergantung pada obat seumur hidup dan perlahan-lahan menghadapi komplikasi. Namun, paradigma medis modern telah bergeser drastis. Riset klinis terbaru yang kuat membuktikan bahwa pada banyak kasus, terutama di tahun-tahun awal diagnosis, DMT2 dapat dikendalikan hingga mencapai fase "remisi" atau pembalikan kondisi (reversal).\n\nStudi Landmark: DiRECT Trial\nSalah satu bukti paling kuat datang dari studi DiRECT (Diabetes Remission Clinical Trial) yang dipublikasikan pada tahun 2018 dan diikuti studi lanjutannya di 2023. Studi ini menunjukkan bahwa penurunan berat badan yang signifikan—khususnya sekitar 10 hingga 15 kilogram—dapat memicu remisi diabetes pada hampir setengah dari pesertanya (46%).\n\nMekanisme Reversi\nDiabetes tipe 2 berkaitan erat dengan penumpukan lemak ektopik (lemak yang berada di tempat yang salah), khususnya di organ hati dan pankreas. Lemak di hati memicu resistensi insulin, sementara lemak di pankreas mencekik sel-sel beta yang memproduksi insulin. Penurunan berat badan yang intensif dan terstruktur membantu "menguras" lemak beracun dari organ-organ ini, memungkinkan pankreas untuk kembali memproduksi insulin dengan normal dan hati untuk meresponsnya kembali.\n\nPilar Gaya Hidup untuk Remisi Diabetes:\n\n1. Diet Rendah Kalori dan Padat Nutrisi\nKunci utamanya adalah menciptakan defisit kalori yang sehat. Banyak protokol medis menggunakan pendekatan diet rendah karbohidrat (low-carb) atau diet Mediterania untuk mengontrol lonjakan gula darah secara instan sambil menurunkan berat badan. Menghilangkan gula tambahan, minuman manis, dan karbohidrat olahan (tepung putih, roti putih) adalah langkah absolut pertama.\n\n2. Intermittent Fasting (Puasa Intermiten)\nMetode seperti puasa 16:8 (berpuasa 16 jam, jendela makan 8 jam) telah terbukti sangat efektif dalam menurunkan kadar insulin puasa dan memperbaiki sensitivitas insulin, memberikan organ pencernaan dan metabolisme waktu untuk beristirahat dan memperbaiki sel.\n\n3. Aktivitas Fisik Kombinasi\nOlahraga bukan sekadar membakar kalori, tetapi "memaksa" otot untuk menyerap glukosa dari aliran darah tanpa perlu bantuan insulin berlebih. Kombinasikan latihan kekuatan (angkat beban) untuk membangun massa otot penyerap glukosa, dengan latihan kardio rutin.\n\n4. Manajemen Tidur dan Stres\nKortisol yang tinggi akibat stres kronis atau kurang tidur secara langsung memicu hati untuk melepaskan glukosa ke dalam aliran darah, mengacaukan kontrol gula darah terlepas dari seberapa baik diet Anda.\n\nPeringatan Medis\nSangat penting untuk dicatat bahwa program pembalikan diabetes (reversal) HARUS dilakukan di bawah pengawasan medis yang ketat, terutama jika pasien sudah menggunakan obat penurun gula darah atau insulin. Penurunan karbohidrat yang drastis dikombinasikan dengan obat-obatan dapat memicu hipoglikemia (gula darah drop berbahaya). Dokter perlu menyesuaikan atau menghentikan dosis obat secara bertahap seiring membaiknya kondisi metabolik pasien.',
    category: 'diabetes',
    categoryColor: 'bg-sky-100 text-sky-700',
    author: 'Dr. Hendra Wijaya, Sp.PD',
    authorRole: 'Spesialis Penyakit Dalam',
    date: '28 Jan 2026',
    readTime: '9 min',
    views: 4230,
    imageUrl: 'https://images.unsplash.com/photo-1579684385127-1ef15d508118?auto=format&fit=crop&w=800&q=80',
    imageEmoji: '🩸',
  },
  {
    id: '7',
    title: 'Pentingnya Mikrobioma Usus untuk Kekebalan Tubuh',
    excerpt: 'Kesehatan saluran cerna sangat erat kaitannya dengan sistem imun. Temukan bagaimana bakteri baik melindungi Anda dari penyakit.',
    content: 'Pernahkah Anda bertanya-tanya mengapa beberapa orang tampaknya kebal terhadap musim flu, sementara yang lain terus-menerus jatuh sakit? Jawabannya mungkin tidak terletak di udara yang mereka hirup, melainkan di dalam saluran pencernaan mereka. Ilmu pengetahuan medis terkini mengungkap fakta mengejutkan: sekitar 70% hingga 80% sel sistem kekebalan tubuh manusia berpusat di usus.\n\nKoneksi Usus-Imun (Gut-Immune Axis)\nSaluran pencernaan kita dihuni oleh triliunan mikroorganisme, termasuk bakteri, virus, dan jamur, yang secara kolektif dikenal sebagai mikrobioma usus (gut microbiome). Hubungan antara mikrobioma ini dengan sistem kekebalan tubuh adalah simbiosis mutualisme yang sangat kompleks. Bakteri baik (probiotik) bertindak layaknya "pelatih" bagi sel-sel imun, mengajarkan mereka untuk membedakan mana patogen berbahaya yang harus diserang, dan mana jaringan tubuh sendiri atau makanan tidak berbahaya yang harus diabaikan.\n\nKetika mikrobioma usus berada dalam kondisi seimbang, mereka memproduksi senyawa penting yang disebut Asam Lemak Rantai Pendek (Short-Chain Fatty Acids/SCFAs), terutama butirat. SCFAs ini memiliki sifat anti-inflamasi yang kuat, memperkuat dinding usus agar tidak bocor (mencegah leaky gut syndrome), dan menjaga respons imun agar tidak berlebihan (yang merupakan akar dari alergi dan penyakit autoimun).\n\nBahaya Disbiosis\nSebaliknya, gaya hidup modern seringkali merusak keseimbangan ini, sebuah kondisi yang disebut disbiosis. Faktor pemicu utama meliputi: penggunaan antibiotik yang berlebihan, diet tinggi gula dan makanan ultra-proses, stres kronis, serta kurangnya asupan serat. Disbiosis melemahkan dinding pelindung usus, memungkinkan racun masuk ke aliran darah dan memicu peradangan sistemik yang menurunkan daya tahan tubuh.\n\nCara Memelihara Mikrobioma Usus yang Sehat:\n\n1. Perbanyak Asupan Prebiotik (Makanan untuk Bakteri)\nBakteri baik di usus bertahan hidup dengan memfermentasi serat yang tidak bisa dicerna tubuh manusia. Makanan kaya prebiotik meliputi bawang putih, bawang bombay, daun bawang, asparagus, pisang hijau (kurang matang), gandum utuh, dan apel.\n\n2. Konsumsi Probiotik Alami (Bakteri Hidup)\nMasukkan makanan fermentasi alami ke dalam diet harian Anda. Yogurt murni (tanpa pemanis), kefir, tempe, miso, kimchi, dan kombucha adalah sumber bakteri hidup yang fantastis untuk mengisi ulang populasi usus Anda.\n\n3. Diversifikasi Diet Berbasis Tumbuhan\nSemakin beragam jenis tanaman yang Anda makan, semakin beragam pula spesies bakteri menguntungkan di usus Anda. Targetkan untuk mengonsumsi setidaknya 30 jenis makanan nabati yang berbeda setiap minggunya (termasuk sayur, buah, kacang-kacangan, biji-bijian, dan rempah).\n\n4. Batasi Gula dan Pemanis Buatan\nGula rafinasi berlebih akan memberi makan bakteri patogen dan jamur (seperti Candida), mengalahkan populasi bakteri baik. Pemanis buatan tertentu juga terbukti dapat mengubah komposisi mikrobioma secara negatif.\n\nMerawat usus bukan sekadar tentang mencegah masalah pencernaan, melainkan membangun fondasi utama bagi pertahanan tubuh yang tangguh terhadap infeksi dan penyakit kronis.',
    category: 'nutrisi',
    categoryColor: 'bg-emerald-100 text-emerald-700',
    author: 'Dr. Budi Santoso, Sp.PD-KGEH',
    authorRole: 'Ahli Pencernaan',
    date: '20 Jan 2026',
    readTime: '6 min',
    views: 1340,
    imageUrl: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&w=800&q=80',
    imageEmoji: '🦠',
  },
  {
    id: '8',
    title: 'Digital Detox: Mengapa Rehat dari Media Sosial Penting untuk Otak',
    excerpt: 'Terlalu lama menatap layar dan scrolling tanpa henti dapat merusak rentang perhatian dan kesehatan mental. Saatnya melakukan detoks.',
    content: 'Di era modern di mana kita rata-rata menghabiskan lebih dari 7 jam sehari menatap layar, ketergantungan digital telah menjadi epidemi diam-diam. Media sosial dan aplikasi hiburan dirancang secara spesifik oleh para insinyur menggunakan psikologi perilaku untuk membajak sistem dopamin otak kita—menciptakan putaran kecanduan yang mirip dengan perjudian.\n\nDampak Neurologis dan Psikologis\nPapar terus-menerus terhadap rentetan informasi instan (seperti video pendek berdurasi 15 detik) melatih otak kita untuk menuntut stimulasi konstan. Hal ini secara drastis menurunkan rentang perhatian (attention span), membuat kita kesulitan untuk fokus pada tugas-tugas mendalam, membaca buku panjang, atau bahkan sekadar hadir secara penuh saat mengobrol dengan orang di depan kita.\n\nSelain itu, fenomena "Doomscrolling" (mengonsumsi berita negatif secara kompulsif) dan ilusi kesempurnaan hidup orang lain di media sosial memicu pelepasan hormon kortisol. Ini secara konsisten meningkatkan tingkat kecemasan, perasaan tidak cukup (insecurity), FOMO (Fear Of Missing Out), hingga depresi klinis, terutama di kalangan remaja dan dewasa muda.\n\nApa itu Digital Detox?\nDetoks digital bukan berarti membuang smartphone Anda dan hidup di hutan. Ini adalah praktik sengaja untuk memutus siklus kecanduan dengan mengambil jarak terukur dari perangkat elektronik, guna mereset baseline dopamin otak dan mendapatkan kembali kontrol atas perhatian Anda.\n\nPanduan Melakukan Digital Detox yang Efektif:\n\n1. Mulai dengan Auditing Waktu Layar\nGunakan fitur "Screen Time" atau "Digital Wellbeing" di ponsel Anda. Hadapi realitas yang tidak nyaman tentang berapa jam per hari yang Anda habiskan di Instagram, TikTok, atau Twitter.\n\n2. Terapkan "Screen-Free Mornings" dan "Screen-Free Nights"\nSatu jam pertama setelah bangun dan satu jam sebelum tidur adalah waktu yang sakral. Jangan sentuh ponsel Anda. Gunakan pagi hari untuk meditasi, jurnal, atau peregangan, dan malam hari untuk relaksasi. Ini mencegah lonjakan kortisol di pagi hari dan hambatan melatonin di malam hari.\n\n3. Hapus Frictionless Access (Hapus Aplikasi)\nJika Anda benar-benar ingin mengurangi konsumsi, hapus aplikasi media sosial dari ponsel Anda. Anda tetap bisa mengaksesnya melalui browser komputer yang lebih tidak nyaman (menambah friction), sehingga mencegah kebiasaan scrolling tanpa sadar saat bosan.\n\n4. Manajemen Notifikasi yang Radikal\nMatikan SEMUA notifikasi push kecuali panggilan telepon, pesan teks dari kontak penting, dan aplikasi kalender. Anda tidak perlu diberi tahu setiap kali seseorang menyukai foto Anda.\n\n5. Tetapkan "Tech-Free Zones" di Rumah\nJadikan ruang makan dan kamar tidur sebagai zona bebas layar mutlak. Ini akan memaksa Anda untuk berinteraksi dengan keluarga saat makan dan meningkatkan kualitas tidur Anda.\n\nSetelah beberapa minggu melakukan detoks digital, Anda akan merasakan kejernihan mental yang luar biasa (brain fog menghilang), peningkatan produktivitas, tidur yang jauh lebih nyenyak, dan apresiasi yang lebih dalam terhadap momen-momen kecil di dunia nyata.',
    category: 'mental',
    categoryColor: 'bg-violet-100 text-violet-700',
    author: 'Nadia Larasati, M.Psi',
    authorRole: 'Psikolog',
    date: '15 Jan 2026',
    readTime: '5 min',
    views: 2890,
    imageUrl: 'https://images.unsplash.com/photo-1512314889357-e157c22f938d?auto=format&fit=crop&w=800&q=80',
    imageEmoji: '📱',
  },
  {
    id: '9',
    title: 'Panduan Memulai Lari untuk Pemula Tanpa Risiko Cedera',
    excerpt: 'Ingin mulai rutin berlari tapi takut lutut sakit? Ikuti metode run-walk yang aman dan efektif bagi pemula.',
    content: 'Lari sering dianggap sebagai olahraga kardio paling mudah diakses—Anda hanya butuh sepasang sepatu dan niat. Manfaatnya pun luar biasa: memperkuat jantung, membakar kalori secara masif, dan melepaskan endorfin pemicu kebahagiaan (runner\'s high). Sayangnya, lari juga merupakan olahraga berdampak tinggi (high-impact) yang menempatkan tekanan besar pada sendi lutut, pergelangan kaki, dan pinggul.\n\nKesalahan paling umum yang dilakukan pemula adalah "Too Much, Too Soon, Too Fast" (Terlalu Jauh, Terlalu Cepat, Terlalu Dini). Semangat yang menggebu di minggu pertama sering berujung pada cedera shin splints, plantar fasciitis, atau nyeri lutut (runner\'s knee) di minggu kedua, membuat mereka trauma dan berhenti total.\n\nBerikut adalah panduan biomekanis dan metodologis untuk mulai berlari dengan aman:\n\n1. Fondasi Utama: Sepatu yang Tepat\nJangan berlari menggunakan sepatu kets biasa. Kunjungi toko perlengkapan lari khusus untuk menganalisis bentuk lengkungan kaki Anda (gait analysis). Apakah Anda memiliki kaki datar (overpronation), lengkungan tinggi (supination), atau netral? Sepatu lari yang tepat akan meredam kejut dan menyejajarkan sendi Anda.\n\n2. Gunakan Metode Galloway (Run-Walk-Run)\nIni adalah aturan emas bagi pemula. Jangan memaksakan diri berlari tanpa henti selama 30 menit. Mulailah dengan rasio jalan-lari. Misalnya: Lari santai 1 menit, jalan kaki 2 menit. Ulangi siklus ini 8-10 kali. Metode ini memungkinkan sistem kardiovaskular Anda bekerja maksimal sambil memberi kesempatan bagi ligamen dan tendon untuk beradaptasi dengan benturan secara perlahan.\n\n3. Jangan Abaikan Pemanasan Dinamis\nPeregangan statis (menahan satu pose) sebelum lari justru bisa memicu cedera. Lakukan pemanasan dinamis (dynamic stretching) selama 5 menit: leg swings, lunge walking, high knees, dan butt kicks untuk melumasi sendi dan mengaktifkan otot.\n\n4. Fokus pada Postur, Bukan Kecepatan (Cadence)\nJaga postur tubuh tetap tegak dengan sedikit condong ke depan dari pergelangan kaki. Perhatikan langkah kaki Anda (cadence). Langkah yang terlalu panjang (overstriding) di mana tumit mendarat jauh di depan lutut adalah penyebab utama cedera lutut. Usahakan kaki mendarat tepat di bawah titik berat tubuh Anda dengan langkah yang lebih pendek namun lebih cepat (ideal cadence sekitar 160-180 langkah per menit).\n\n5. Terapkan Aturan Peningkatan 10%\nUntuk membangun jarak atau durasi lari, bersabarlah. Jangan pernah meningkatkan total volume lari mingguan Anda lebih dari 10% dari minggu sebelumnya. Jika minggu ini Anda total berlari 10 km, minggu depan maksimal targetkan 11 km.\n\n6. Integrasikan Latihan Kekuatan (Strength Training)\nLari saja tidak cukup. Anda harus memiliki otot inti (core) dan otot kaki (glutes, quads, hamstrings) yang kuat untuk menyerap benturan. Lakukan latihan kekuatan seperti squat, lunge, plank, dan calf raises setidaknya 2 kali seminggu.\n\nIngatlah, perjalanan menjadi pelari bukanlah sprint, melainkan lari maraton itu sendiri. Konsistensi dalam menjaga ritme yang aman akan jauh lebih membuahkan hasil daripada memaksakan kecepatan yang berujung cedera.',
    category: 'olahraga',
    categoryColor: 'bg-amber-100 text-amber-700',
    author: 'Bimo Prakoso, S.Ft',
    authorRole: 'Fisioterapis Olahraga',
    date: '12 Jan 2026',
    readTime: '7 min',
    views: 1950,
    imageUrl: 'https://images.unsplash.com/photo-1476480862126-209bfaa8edc8?auto=format&fit=crop&w=800&q=80',
    imageEmoji: '👟',
  },
  {
    id: '10',
    title: 'Aturan 20-20-20: Menjaga Kesehatan Mata di Era Digital',
    excerpt: 'Mata lelah, kering, dan pandangan kabur sering terjadi akibat paparan layar berlebih. Terapkan aturan 20-20-20 untuk melindunginya.',
    content: 'Dengan pergeseran gaya hidup ke arah pekerjaan jarak jauh, pembelajaran daring, dan hiburan berbasis layar, mata kita menanggung beban kerja evolusioner yang belum pernah terjadi sebelumnya. Kondisi kelelahan visual akibat layar kini secara medis dikenal sebagai Computer Vision Syndrome (CVS) atau Digital Eye Strain, dan memengaruhi lebih dari 60% populasi pekerja modern.\n\nMengapa Layar Merusak Mata?\nMasalah utamanya bukan sekadar radiasi layar, melainkan bagaimana mata kita bereaksi secara biomekanis saat menatap objek dua dimensi dalam jarak dekat secara konstan. Secara alami, otot siliaris mata harus berkontraksi terus-menerus untuk memfokuskan lensa pada layar. Selain itu, tingkat kedipan mata (blink rate) manusia turun drastis—dari normalnya 15-20 kali per menit menjadi hanya 5-7 kali per menit saat menatap layar. Akibatnya, air mata menguap dengan cepat, menyebabkan mata kering, perih, kemerahan, pandangan kabur sementara, hingga sakit kepala tegang (tension headache).\n\nSolusi Emas: Aturan 20-20-20\nUntuk mencegah kelelahan kronis dan miopia (rabun jauh) progresif, asosiasi oftalmologi global sangat merekomendasikan intervensi perilaku yang dikenal sebagai Aturan 20-20-20:\n\nSetiap 20 menit menatap layar, istirahatkan mata Anda dengan melihat objek sejauh minimal 20 kaki (sekitar 6 meter) selama 20 detik.\n\nMengapa 20 detik? Karena butuh waktu kurang lebih 20 detik bagi otot fokus mata (siliaris) untuk benar-benar rileks dan melepaskan ketegangannya. Anda bisa melihat keluar jendela atau sekadar melihat ke ujung koridor ruangan.\n\nStrategi Tambahan Ergonomi Visual:\n\n1. Atur Jarak dan Posisi Layar\nJarak ideal antara mata dan layar monitor adalah sepanjang lengan Anda (sekitar 50-70 cm). Bagian atas monitor harus berada sedikit di bawah atau sejajar dengan ketinggian mata Anda. Posisi ini memaksa Anda menatap sedikit ke bawah, yang menutupi sebagian kornea dengan kelopak mata, sehingga meminimalkan penguapan air mata.\n\n2. Sesuaikan Pencahayaan (Lighting)\nLayar komputer tidak boleh menjadi benda paling terang di ruangan (yang akan menyilaukan), maupun terlalu redup dibanding sekitarnya. Seimbangkan kecerahan layar dengan penerangan ruangan, dan hindari cahaya matahari langsung atau lampu yang memantul pada layar untuk mencegah glare.\n\n3. Latihan Berkedip Sadar\nIngatkan diri Anda untuk melakukan "kedipan penuh" setiap kali Anda mengklik tombol "Simpan" atau "Kirim". Jika mata Anda rentan kering akibat AC ruangan yang kuat, pertimbangkan penggunaan obat tetes mata pelumas (artificial tears) yang tidak mengandung bahan pengawet.\n\n4. Mode Malam dan Filter Cahaya Biru\nMeski kacamata anti-radiasi blue light masih menjadi perdebatan klinis efektivitasnya, menggunakan fitur night-mode (warna hangat) pada layar sangat membantu mengurangi kelelahan visual dan mencegah gangguan siklus tidur Anda.\n\nKesehatan mata adalah investasi jangka panjang. Mengintegrasikan jeda mikro seperti 20-20-20 ke dalam rutinitas kerja harian Anda akan memastikan penglihatan Anda tetap tajam dan nyaman hingga usia senja.',
    category: 'umum',
    categoryColor: 'bg-slate-100 text-slate-700',
    author: 'Dr. Anita Wijaya, Sp.M',
    authorRole: 'Spesialis Mata',
    date: '05 Jan 2026',
    readTime: '4 min',
    views: 1720,
    imageUrl: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=800&q=80',
    imageEmoji: '👁️',
  },
]

const fadeIn: Variants = {
  hidden: { opacity: 0, y: 12 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: 'easeOut' } },
}

/* ─── Component ──────────────────────────────────────────────────── */
function ArtikelPage() {
  const [viewMode, setViewMode] = useState<ViewMode>('list')
  const [activeCategory, setActiveCategory] = useState('semua')
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedArticle, setSelectedArticle] = useState<Article | null>(null)
  const [savedArticles, setSavedArticles] = useState<string[]>([])
  
  // Kita tidak lagi memanggil API berita eksternal, hanya menggunakan data mock yang sudah disiapkan.
  const [loading, setLoading] = useState(false)

  // Filter artikel yang ada di dalam mock data
  const filteredArticles = ARTICLES.filter((a) => {
    let matchCategory = false;
    if (activeCategory === 'semua') {
      matchCategory = true;
    } else {
      matchCategory = a.category === activeCategory;
    }
    
    const matchSearch = !searchQuery || a.title.toLowerCase().includes(searchQuery.toLowerCase()) || (a.excerpt && a.excerpt.toLowerCase().includes(searchQuery.toLowerCase()))
    return matchCategory && matchSearch
  })

  const featuredArticle = null // Diubah menjadi null agar Featured Article card tidak tampil
  const regularArticles = filteredArticles

  const toggleSave = (id: string) => {
    setSavedArticles((prev) => prev.includes(id) ? prev.filter((a) => a !== id) : [...prev, id])
  }

  const openArticle = (article: Article) => {
    setSelectedArticle(article)
    setViewMode('detail')
  }

  const backToList = () => {
    setViewMode('list')
    setSelectedArticle(null)
  }

  return (
    <div className="relative z-10 min-h-screen">
      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 py-16 sm:py-20 space-y-14">

        {/* ── Hero Card ──────────────────────────────────────────────── */}
        {viewMode === 'list' && (
          <motion.div
            variants={fadeIn} initial="hidden" animate="visible"
            className="rounded-3xl shadow-2xl shadow-sky-500/25 overflow-hidden relative min-h-[300px]"
          >
            {/* Background image */}
            <img
              src="/images/news.jpg"
              alt="Artikel Kesehatan"
              className="absolute inset-0 w-full h-full object-cover object-center"
            />
            {/* Gradient overlay */}
            <div className="absolute inset-0 bg-gradient-to-r from-sky-900/90 via-blue-800/70 to-indigo-700/40" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />

            <div className="relative z-10 p-8 sm:p-12 max-w-2xl">
              <div className="inline-flex items-center gap-2 rounded-full bg-white/15 border border-white/20 px-4 py-1.5 mb-5 backdrop-blur-sm">
                <BookOpen className="h-3.5 w-3.5 text-sky-200" />
                <span className="text-xs font-semibold text-white/90 tracking-wide uppercase">Edukasi Kesehatan</span>
              </div>
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white leading-tight tracking-tight">
                Artikel Kesehatan
              </h1>
              <p className="mt-3 text-base sm:text-lg text-sky-100 leading-relaxed max-w-lg">
                Kumpulan riset dan artikel medis terpercaya yang ditulis oleh dokter dan ahli kesehatan untuk Anda.
              </p>
            </div>
          </motion.div>
        )}

        {/* ═══════════════════ LIST VIEW ═══════════════════ */}
        {viewMode === 'list' && (
          <motion.div key="list" variants={fadeIn} initial="hidden" animate="visible" transition={{ delay: 0.1 }} className="space-y-8">

            {/* Search */}
            <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-3 shadow-sm">
              <Search className="h-4 w-4 text-slate-400" />
              <input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Cari artikel tentang kesehatan..."
                className="flex-1 text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none"
              />
            </div>

            {/* Categories */}
            <div className="flex items-center gap-2 overflow-x-auto pb-2 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
              {CATEGORIES.map((cat) => {
                const Icon = cat.icon
                const isActive = activeCategory === cat.id
                return (
                  <button
                    key={cat.id}
                    onClick={() => setActiveCategory(cat.id)}
                    className={cn(
                      'flex items-center gap-2 px-4 py-2 rounded-full text-xs font-semibold whitespace-nowrap border transition-all duration-200',
                      isActive
                        ? 'bg-sky-600 text-white border-sky-600 shadow-md shadow-sky-600/20'
                        : 'bg-white text-slate-600 border-slate-200 hover:border-sky-300 hover:bg-sky-50'
                    )}
                  >
                    <Icon className="h-3.5 w-3.5" />
                    {cat.label}
                  </button>
                )
              })}
            </div>

            {/* Featured Article */}
            {/* Fitur artikel pilihan disembunyikan berdasarkan permintaan */}
            {/*
            {featuredArticle && (
              <button
                onClick={() => openArticle(featuredArticle)}
                className="w-full rounded-2xl bg-gradient-to-br from-sky-600 via-blue-700 to-indigo-800 text-white p-6 sm:p-8 shadow-lg shadow-sky-600/20 hover:shadow-xl transition-all text-left group"
              >
                <div className="flex flex-col sm:flex-row gap-6">
                  <div className="flex h-28 w-28 sm:h-36 sm:w-36 shrink-0 items-center justify-center rounded-2xl bg-white/10 border border-white/20 text-5xl sm:text-6xl">
                    {featuredArticle.imageEmoji}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-white/20">Artikel Pilihan</span>
                    </div>
                    <h2 className="text-lg sm:text-xl font-bold leading-tight group-hover:underline">{featuredArticle.title}</h2>
                    <p className="text-sm text-sky-100 mt-2 leading-relaxed line-clamp-2">{featuredArticle.excerpt}</p>
                    <div className="flex items-center gap-4 mt-4 text-xs text-sky-200">
                      <span className="flex items-center gap-1"><User className="h-3 w-3" /> {featuredArticle.author}</span>
                      <span className="flex items-center gap-1"><Calendar className="h-3 w-3" /> {featuredArticle.date}</span>
                      <span className="flex items-center gap-1"><Clock className="h-3 w-3" /> {featuredArticle.readTime}</span>
                    </div>
                  </div>
                </div>
              </button>
            )}
            */}

            {/* Article Grid */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-slate-800">
                  {activeCategory === 'semua' ? 'Semua Artikel' : CATEGORIES.find((c) => c.id === activeCategory)?.label}
                </h2>
                <span className="text-xs text-slate-400">{loading ? 'Memuat...' : `${filteredArticles.length} artikel`}</span>
              </div>

              {loading ? (
                <div className="rounded-2xl bg-white border border-white/60 shadow-lg p-12 text-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-sky-600 mx-auto mb-3"></div>
                  <p className="text-sm font-medium text-slate-600">Memuat artikel terbaru...</p>
                </div>
              ) : regularArticles.length === 0 && !featuredArticle ? (
                <div className="rounded-2xl bg-white border border-white/60 shadow-lg p-12 text-center">
                  <BookOpen className="h-12 w-12 text-slate-300 mx-auto mb-3" />
                  <p className="text-sm font-medium text-slate-600">Tidak ada artikel ditemukan</p>
                  <p className="text-xs text-slate-400 mt-1">Coba kata kunci atau kategori lain.</p>
                </div>
              ) : (
                <div className="grid sm:grid-cols-2 gap-4">
                {regularArticles.map((article) => (
                  <button
                    key={article.id}
                    onClick={() => openArticle(article)}
                    className="rounded-2xl bg-white border border-white/60 shadow-lg shadow-slate-200/60 hover:shadow-xl hover:border-sky-200 transition-all text-left group overflow-hidden"
                  >
                    {/* Article thumbnail placeholder or API Image */}
                    <div className="h-48 bg-slate-100 flex items-center justify-center text-4xl border-b border-slate-100 overflow-hidden relative">
                      {article.imageUrl ? (
                        <img 
                          src={article.imageUrl} 
                          alt={article.title} 
                          className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105 z-10" 
                        />
                      ) : (
                        <span className="text-5xl drop-shadow-sm transition-transform duration-300 group-hover:scale-110 z-0">{article.imageEmoji}</span>
                      )}
                      
                      {/* Gradient overlay for better contrast */}
                      {article.imageUrl && (
                        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-20" />
                      )}
                    </div>
                    <div className="p-5">
                      <div className="flex items-center gap-2 mb-2">
                        <span className={cn('text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full', article.categoryColor)}>
                          {article.category}
                        </span>
                      </div>
                      <h3 className="text-sm font-bold text-slate-800 leading-snug group-hover:text-sky-700 transition-colors line-clamp-2">{article.title}</h3>
                      <p className="text-xs text-slate-500 mt-2 leading-relaxed line-clamp-2">{article.excerpt}</p>
                      <div className="flex items-center justify-between mt-4 pt-3 border-t border-slate-100">
                        <div className="flex items-center gap-3 text-[10px] text-slate-400">
                          <span className="flex items-center gap-1"><Clock className="h-3 w-3" /> {article.readTime}</span>
                          <span className="flex items-center gap-1"><Eye className="h-3 w-3" /> {article.views.toLocaleString()}</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <button
                            onClick={(e) => { e.stopPropagation(); toggleSave(article.id) }}
                            className={cn('p-1 rounded transition-colors', savedArticles.includes(article.id) ? 'text-sky-500' : 'text-slate-300 hover:text-sky-500')}
                          >
                            <Bookmark className={cn('h-3.5 w-3.5', savedArticles.includes(article.id) && 'fill-current')} />
                          </button>
                        </div>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
              )}
            </div>
          </motion.div>
        )}

        {/* ═══════════════════ DETAIL VIEW ═══════════════════ */}
        {viewMode === 'detail' && selectedArticle && (
          <motion.div key="detail" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
            {/* Back button */}
            <button onClick={backToList} className="flex items-center gap-1.5 text-sm font-medium text-slate-500 hover:text-slate-700 transition-colors">
              <ArrowLeft className="h-4 w-4" /> Kembali ke Daftar
            </button>

            {/* Article Header */}
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <span className={cn('text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full', selectedArticle.categoryColor)}>
                  {selectedArticle.category}
                </span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 leading-tight">{selectedArticle.title}</h1>
              <p className="text-base text-slate-500 leading-relaxed">{selectedArticle.excerpt}</p>

              {/* Author + Meta */}
              <div className="flex items-center gap-4 flex-wrap pt-2">
                <div className="flex items-center gap-2">
                  <div className="h-10 w-10 rounded-full bg-sky-100 flex items-center justify-center text-sky-700 font-bold text-sm">
                    {selectedArticle.author.split(' ').map((n) => n[0]).slice(0, 2).join('')}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-slate-800">{selectedArticle.author}</p>
                    <p className="text-[11px] text-slate-400">{selectedArticle.authorRole}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4 text-xs text-slate-400 ml-auto">
                  <span className="flex items-center gap-1"><Calendar className="h-3 w-3" /> {selectedArticle.date}</span>
                  <span className="flex items-center gap-1"><Clock className="h-3 w-3" /> {selectedArticle.readTime}</span>
                  <span className="flex items-center gap-1"><Eye className="h-3 w-3" /> {selectedArticle.views.toLocaleString()}</span>
                </div>
              </div>
            </div>

            {/* Article Cover */}
            <div className="h-64 sm:h-96 rounded-3xl bg-slate-100 border border-slate-100 flex items-center justify-center text-7xl overflow-hidden relative shadow-lg shadow-slate-200/50">
              {selectedArticle.imageUrl ? (
                <img 
                  src={selectedArticle.imageUrl} 
                  alt={selectedArticle.title} 
                  className="absolute inset-0 w-full h-full object-cover z-10" 
                />
              ) : (
                <span className="drop-shadow-md z-0">{selectedArticle.imageEmoji}</span>
              )}
            </div>

            {/* Actions bar */}
            <div className="flex items-center gap-3 py-3 border-y border-slate-100">
              <button
                onClick={() => toggleSave(selectedArticle.id)}
                className={cn('flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold border transition-all',
                  savedArticles.includes(selectedArticle.id) ? 'bg-sky-50 border-sky-200 text-sky-700' : 'bg-white border-slate-200 text-slate-600 hover:border-sky-300'
                )}
              >
                <Bookmark className={cn('h-3.5 w-3.5', savedArticles.includes(selectedArticle.id) && 'fill-current')} />
                {savedArticles.includes(selectedArticle.id) ? 'Tersimpan' : 'Simpan'}
              </button>
              <button className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold bg-white border border-slate-200 text-slate-600 hover:border-sky-300 transition-all">
                <Share2 className="h-3.5 w-3.5" /> Bagikan
              </button>
            </div>

            {/* Article Content in a clean Card */}
            <div className="bg-white rounded-3xl p-8 sm:p-12 shadow-xl shadow-sky-900/5 border border-slate-100">
              <div className="prose prose-slate prose-lg max-w-none">
                {selectedArticle.content.split('\n\n').map((para, i) => {
                  // Format list dengan dash/bullet
                  if (para.startsWith('- ')) {
                    const items = para.split('\n');
                    return (
                      <ul key={i} className="mb-6 space-y-2 text-slate-600">
                        {items.map((item, j) => (
                          <li key={j} className="flex items-start gap-3">
                            <span className="text-sky-500 mt-1">•</span>
                            <span>{item.replace('- ', '')}</span>
                          </li>
                        ))}
                      </ul>
                    )
                  }

                  // Format penomoran menjadi lebih tebal dan menarik
                  const isList = /^\d+\./.test(para);
                  if (isList) {
                    const lines = para.split('\n');
                    const [firstLine, ...restLines] = lines;
                    const [number, ...text] = firstLine.split(' ');
                    
                    return (
                      <div key={i} className="mb-8 mt-10 bg-slate-50 rounded-2xl p-6 border border-slate-100">
                        <h3 className="text-xl font-bold text-slate-800 mb-3 flex items-start gap-3">
                          <span className="flex-shrink-0 flex items-center justify-center w-8 h-8 rounded-full bg-sky-600 text-white text-sm shadow-md shadow-sky-600/20">{number.replace('.','')}</span>
                          <span className="mt-0.5">{text.join(' ')}</span>
                        </h3>
                        {restLines.length > 0 && (
                          <div className="ml-11 text-slate-600 leading-relaxed text-justify">
                            {restLines.join('\n')}
                          </div>
                        )}
                      </div>
                    )
                  }
                  
                  // Deteksi sub-judul biasa (kalimat pendek yang tidak diakhiri titik)
                  const isHeading = para.length < 100 && !para.endsWith('.') && !para.endsWith('?') && !para.includes(':');
                  if (isHeading) {
                    return <h3 key={i} className="text-2xl font-bold text-slate-800 mt-10 mb-4 pb-2 border-b border-slate-100">{para}</h3>
                  }

                  return <p key={i} className="text-slate-600 leading-relaxed mb-6 text-justify text-lg">{para}</p>
                })}
              </div>

              {/* Tags inside the card */}
              <div className="flex items-center gap-2 flex-wrap pt-8 mt-4 border-t border-slate-100">
                <span className="text-xs font-medium text-slate-400">Tags:</span>
                {['kesehatan', selectedArticle.category, 'edukasi', 'gaya hidup'].map((tag) => (
                  <span key={tag} className="text-[11px] font-medium px-3 py-1.5 rounded-full bg-slate-50 text-slate-600 border border-slate-200 hover:bg-sky-50 hover:text-sky-600 hover:border-sky-200 transition-colors cursor-pointer">
                    #{tag}
                  </span>
                ))}
              </div>
            </div>

            {/* Related articles */}
            <div className="pt-6">
              <h3 className="text-sm font-semibold text-slate-800 mb-4">Artikel Terkait</h3>
              <div className="grid sm:grid-cols-3 gap-3">
                {ARTICLES.filter((a) => a.category === selectedArticle.category && a.id !== selectedArticle.id).slice(0, 3).map((article) => (
                  <button key={article.id} onClick={() => { setSelectedArticle(article); window.scrollTo(0, 0) }} className="rounded-xl bg-white border border-white/60 shadow-sm hover:shadow-md transition-all text-left p-4 group">
                    <div className="text-2xl mb-2">{article.imageEmoji}</div>
                    <p className="text-xs font-bold text-slate-800 group-hover:text-sky-700 transition-colors line-clamp-2">{article.title}</p>
                    <p className="text-[10px] text-slate-400 mt-1">{article.readTime} • {article.date}</p>
                  </button>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  )
}
