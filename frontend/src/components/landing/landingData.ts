export type WorkspaceTabTarget = 'prediksi' | 'batch' | 'komparasi' | 'evaluasi';

export interface LandingPageProps {
  corpusTotal?: number;
  accuracyPct?: string;
  f1MacroPct?: string;
  totalCategories?: number;
  onEnterWorkspace: (initialTab?: WorkspaceTabTarget, initialQuery?: string) => void;
}

export interface ProductTabItem {
  id: string;
  label: string;
  description: string;
  ctaTab: WorkspaceTabTarget;
}

export interface CustomerStoryItem {
  brand: string;
  metricBadge: string;
  quote: string;
  author: string;
  querySample: string;
  bgAccent: string;
  textAccent: string;
}

export interface SemanticTabItem {
  id: string;
  label: string;
  description: string;
}

/* --------------------------------------------------------------------------
   Math Helpers for Scroll-Scrubbed Timeline (t in [0, 1.2])
   -------------------------------------------------------------------------- */
export function clamp(val: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, val));
}

export function invLerp(t: number, start: number, duration: number): number {
  if (duration <= 0) return t >= start ? 1 : 0;
  return clamp((t - start) / duration, 0, 1);
}

export function easeOutQuad(x: number): number {
  return 1 - (1 - x) * (1 - x);
}

export function lerp(a: number, b: number, p: number): number {
  return a + (b - a) * p;
}

export function lerpColorHex(hexA: string, hexB: string, p: number): string {
  const cA = parseInt(hexA.replace('#', ''), 16);
  const cB = parseInt(hexB.replace('#', ''), 16);
  const r = Math.round(lerp((cA >> 16) & 255, (cB >> 16) & 255, p));
  const g = Math.round(lerp((cA >> 8) & 255, (cB >> 8) & 255, p));
  const b = Math.round(lerp(cA & 255, cB & 255, p));
  return `rgb(${r}, ${g}, ${b})`;
}

/* --------------------------------------------------------------------------
   Static Landing Data Constants
   -------------------------------------------------------------------------- */
export const MARKETPLACE_BRANDS: string[] = [
  'Tokopedia',
  'Shopee Indonesia',
  'Lazada',
  'Blibli',
  'ZALORA',
  'Sociolla',
  'Eraspace',
  'Ruparupa',
  'PRDECT-ID Corpus',
];

export const PRODUCT_TABS: ProductTabItem[] = [
  {
    id: 'AI',
    label: 'AI',
    description:
      'Ajukan pertanyaan kompleks dan dapatkan wawasan yang mendalam serta andal. Seluruhnya ditenagai oleh metrik terukur.',
    ctaTab: 'prediksi',
  },
  {
    id: 'explore',
    label: 'Eksplorasi',
    description:
      'Selami metrik sentimen dan eksplorasi visualisasi lintas kategori dalam hitungan detik dengan dukungan AI.',
    ctaTab: 'prediksi',
  },
  {
    id: 'reports',
    label: 'Laporan',
    description:
      'Buat atau hasilkan berbagai jenis konten. Mulai dari dasbor dan tinjauan bisnis hingga analisis komparasi mendalam.',
    ctaTab: 'komparasi',
  },
  {
    id: 'drilldown',
    label: 'Bedah Data',
    description:
      'Klik pada metrik mana pun dan bedah rincian tingkat baris dari ulasan pelanggan, token TF-IDF, atau produk.',
    ctaTab: 'batch',
  },
  {
    id: 'targets',
    label: 'Target KPI',
    description:
      'Muat data target akurasi dan kepuasan secara terpusat agar selalu tersedia untuk setiap metrik di ruang kerja Anda.',
    ctaTab: 'evaluasi',
  },
  {
    id: 'maps',
    label: 'Peta Korpus',
    description:
      'Peta distribusi marketplace yang intuitif untuk dieksplorasi semua orang. Buka peta dan telusuri metrik secara instan.',
    ctaTab: 'evaluasi',
  },
];

export const CUSTOMER_STORIES: CustomerStoryItem[] = [
  {
    brand: 'Voi · Elektronik',
    metricBadge: '1.373 Ulasan Terverifikasi',
    quote: '“Saya belum pernah melihat adopsi analitik sentimen secepat ini sepanjang karier produk saya.”',
    author: 'Mengapa tim kategori Elektronik beralih dari rekap spreadsheet ke Sentimen',
    querySample: 'Suara jernih bass mantap pengiriman cepat packing aman',
    bgAccent: '#fbe1d1',
    textAccent: '#5d2a1a',
  },
  {
    brand: 'Juni · Fashion',
    metricBadge: '930 Ulasan Terverifikasi',
    quote: '“Sentimen mencapai keseimbangan sempurna antara kekuatan model statistik dan kemudahan penggunaan.”',
    author: 'Dari buta data menjadi dipimpin oleh wawasan ulasan pelanggan di kategori Fashion',
    querySample: 'Bahan adem jahitan rapi ukuran pas sesuai deskripsi',
    bgAccent: '#fbe1d1',
    textAccent: '#5d2a1a',
  },
  {
    brand: 'Bounce · Rumah Tangga',
    metricBadge: '745 Ulasan Terverifikasi',
    quote: '“Kami menguji 5 skenario arsitektur pipeline sebelum memilih konfigurasi N-Gram terbaik.”',
    author: 'Bagaimana tim evaluasi beralih dari dasbor statis ke metrik reputasi terukur',
    querySample: 'Kualitas teflon tebal anti lengket pengiriman sangat aman',
    bgAccent: '#fbe1d1',
    textAccent: '#5d2a1a',
  },
  {
    brand: 'Once Upon · Kesehatan',
    metricBadge: '432 Ulasan Terverifikasi',
    quote: '“Kini ada satu tempat terpusat di mana setiap anggota tim dapat mencari jawaban yang objektif.”',
    author: 'Perjalanan membangun analitik berbasis metrik pada kategori Kesehatan & Kecantikan',
    querySample: 'Produk original segel rapi cocok di kulit pengiriman cepat',
    bgAccent: '#fbe1d1',
    textAccent: '#5d2a1a',
  },
];

export const SEMANTIC_TABS: SemanticTabItem[] = [
  {
    id: 'Semantic platform',
    label: 'Platform semantik',
    description:
      'Definisikan metrik, dimensi, serta entitas produk dan tenagai seluruh analisis maupun pelaporan dengan blok pembangun yang terukur.',
  },
  {
    id: 'Steep API',
    label: 'Sentimen API',
    description:
      'Gunakan metrik Anda di mana saja. Ekspor data, hubungkan ke notebook Python, atau sematkan di aplikasi Anda sendiri.',
  },
  {
    id: 'Metrics catalog',
    label: 'Katalog metrik',
    description:
      'Kelola dan publikasikan seluruh metrik korpus di satu tempat. Tidak ada lagi dokumentasi yang tidak pernah dilihat.',
  },
  {
    id: 'Define in code',
    label: 'Definisi dalam kode',
    description:
      'Kelola model semantik TF-IDF dan kamus Sastrawi di dalam kode dengan tinjauan sejawat serta kontrol versi yang kuat.',
  },
  {
    id: 'Manage in app',
    label: 'Kelola di aplikasi',
    description:
      'Kelola model semantik dan koreksi label Online Learning secara efisien menggunakan antarmuka admin yang komprehensif.',
  },
];

export const SEMANTIC_FEATURES = [
  {
    icon: '◈',
    title: 'Izin akses terperinci',
    desc: 'Kendalikan siapa yang dapat mengakses metrik korpus dan melakukan pelatihan ulang model.',
  },
  {
    icon: '✦',
    title: 'Caching cerdas',
    desc: 'Kurangi beban komputasi server. Respons prediksi instan di bawah 15ms bagi pengguna.',
  },
  {
    icon: '❖',
    title: 'Integrasi scikit-learn + Sastrawi',
    desc: 'Integrasi mulus ke lapisan pemrosesan bahasa alami bahasa Indonesia mandiri.',
  },
  {
    icon: '◎',
    title: 'Siap standar terbuka',
    desc: 'Kompatibel dengan standar industri terbaru untuk ekspor CSV, PDF, dan REST API.',
  },
];

export const AI_TEAM_PERSONAS = [
  {
    initial: 'M',
    name: 'Mary',
    role: 'Finance',
    gradient: 'linear-gradient(135deg, #5d2a1a, #c96b46)',
    question: 'Apakah pertumbuhan ulasan positif sejalan dengan ekspektasi pendapatan kuartal ini?',
    positionStyle: { left: '0%', top: '19%', width: '300px' } as const,
  },
  {
    initial: 'C',
    name: 'Carl',
    role: 'Sales',
    gradient: 'linear-gradient(135deg, #163252, #4a85e8)',
    question: 'Analisis segmen pelanggan untuk memahami kategori mana yang berkinerja terbaik dan paling potensial tumbuh',
    positionStyle: { left: '0%', bottom: '4%', width: '340px' } as const,
  },
  {
    initial: 'J',
    name: 'Josephine',
    role: 'Marketing',
    gradient: 'linear-gradient(135deg, #6b21a8, #d946ef)',
    question: 'Kampanye mana yang mendorong konversi ulasan tertinggi? Apakah kita perlu mengalokasikan ulang anggaran?',
    positionStyle: { right: '0%', top: '45%', width: '360px' } as const,
  },
];

export const AI_FEATURE_CARDS = [
  {
    title: 'Jawaban yang dapat dipercaya',
    desc: 'Sentimen AI ditenagai oleh model semantik Anda sehingga setiap jawaban mencerminkan metrik yang terukur.',
    badge: 'TF-IDF + MultinomialNB Verified',
    accent: '#fbe1d1',
    visualTitle: '85,90% Akurasi',
  },
  {
    title: 'Hasilkan laporan instan',
    desc: 'Ubah percakapan analisis apa pun menjadi laporan yang siap dibagikan, diedit, dan dikembangkan bersama tim.',
    badge: 'Ekspor PDF & Eksekutif',
    accent: '#dce8fc',
    visualTitle: 'Laporan Reputasi',
  },
  {
    title: 'Dukung tim di tempat mereka bekerja',
    desc: 'Agen dan analis di seluruh tim bekerja dari metrik terukur yang sama melalui REST API dan Batch CSV.',
    badge: '8 Marketplace + CSV',
    accent: '#dfece3',
    visualTitle: 'Sinkronisasi Korpus',
  },
];
