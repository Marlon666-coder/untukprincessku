/**
 * SAMPLE DATA — FOR UI PREVIEW ONLY.
 *
 * This is not a database. It is loaded into memory when the app starts so the
 * pages have something to show, and every change disappears on refresh.
 * When Supabase is connected, the services stop reading from this file.
 */

const COUPLE_ID = 'preview-couple';
const created = '2026-09-01T10:00:00.000Z';

export const previewPlaces = [
  {
    id: 'place-1',
    couple_id: COUPLE_ID,
    name: 'Grand Indonesia',
    address: 'Jl. M.H. Thamrin No.1, Jakarta Pusat',
    latitude: -6.1951,
    longitude: 106.8209,
    maps_url: '',
    category: 'shopping',
    photo_url: null,
    rating: { food: 4, atmosphere: 5, experience: 5, overall: 5 },
    review: 'Jalan-jalan sampai kaki pegal, tapi seru banget.',
    favorite: true,
    visited: true,
    created_at: created,
  },
  {
    id: 'place-2',
    couple_id: COUPLE_ID,
    name: 'Little Ramen House',
    address: 'Senopati, Jakarta Selatan',
    latitude: null,
    longitude: null,
    maps_url: '',
    category: 'restaurant',
    photo_url: null,
    rating: { food: 5, atmosphere: 4, experience: 4, overall: 5 },
    review: 'Kuahnya enak, kamu habisin semua ♡',
    favorite: true,
    visited: true,
    created_at: created,
  },
  {
    id: 'place-3',
    couple_id: COUPLE_ID,
    name: 'Sunday Bloom Cafe',
    address: 'Kemang, Jakarta Selatan',
    latitude: null,
    longitude: null,
    maps_url: '',
    category: 'cafe',
    photo_url: null,
    rating: { food: 0, atmosphere: 0, experience: 0, overall: 0 },
    review: '',
    favorite: false,
    visited: false,
    created_at: created,
  },
  {
    id: 'place-4',
    couple_id: COUPLE_ID,
    name: 'Taman Literasi',
    address: 'Blok M, Jakarta Selatan',
    latitude: null,
    longitude: null,
    maps_url: '',
    category: 'park',
    photo_url: null,
    rating: { food: 0, atmosphere: 5, experience: 4, overall: 4 },
    review: 'Sore-sore duduk sambil ngobrol lama.',
    favorite: false,
    visited: true,
    created_at: created,
  },
];

export const previewDates = [
  {
    id: 'date-1',
    couple_id: COUPLE_ID,
    title: 'Our First Date',
    date: '2026-09-06',
    planned_start: '16:00',
    planned_end: '20:00',
    actual_start: '2026-09-06T09:05:00.000Z',
    actual_end: '2026-09-06T13:40:00.000Z',
    status: 'finished',
    location: 'Taman Literasi',
    place_id: 'place-4',
    description: 'Pertama kali jalan berdua ♡',
    notes: 'Gugup tapi bahagia.',
    rating: 5,
    favorite: true,
    activities: [
      { id: 'a1', date_id: 'date-1', time: '16:00', emoji: '🌳', label: 'Walk in the park', position: 0 },
      { id: 'a2', date_id: 'date-1', time: '18:00', emoji: '🍜', label: 'Ramen', position: 1 },
    ],
    created_at: created,
  },
  {
    id: 'date-2',
    couple_id: COUPLE_ID,
    title: 'Dinner Date',
    date: '2026-10-12',
    planned_start: '18:00',
    planned_end: '22:00',
    actual_start: null,
    actual_end: null,
    status: 'planned',
    location: 'Grand Indonesia',
    place_id: 'place-1',
    description: 'Dinner → Walk → Movie',
    notes: 'Jangan lupa pesan tiket film dulu ♡',
    rating: null,
    favorite: false,
    activities: [
      { id: 'b1', date_id: 'date-2', time: '18:00', emoji: '🍽️', label: 'Dinner', position: 0 },
      { id: 'b2', date_id: 'date-2', time: '19:30', emoji: '🚶', label: 'Walk around', position: 1 },
      { id: 'b3', date_id: 'date-2', time: '20:30', emoji: '🎬', label: 'Movie', position: 2 },
      { id: 'b4', date_id: 'date-2', time: '22:00', emoji: '🌙', label: 'Finish', position: 3 },
    ],
    created_at: created,
  },
  {
    id: 'date-3',
    couple_id: COUPLE_ID,
    title: 'Cafe Hopping',
    date: '2026-10-25',
    planned_start: '13:00',
    planned_end: '17:00',
    actual_start: null,
    actual_end: null,
    status: 'planned',
    location: 'Sunday Bloom Cafe',
    place_id: 'place-3',
    description: 'Coba cafe baru yang lucu.',
    notes: '',
    rating: null,
    favorite: false,
    activities: [],
    created_at: created,
  },
];

export const previewMemories = [
  {
    id: 'memory-1',
    couple_id: COUPLE_ID,
    title: 'Senja di taman',
    description: 'Langitnya oranye-pink, kayak dibuat khusus buat kita.',
    date: '2026-09-06',
    place_id: 'place-4',
    place_name: 'Taman Literasi',
    rating: 5,
    favorite: true,
    photos: [],
    created_at: '2026-09-06T14:00:00.000Z',
  },
  {
    id: 'memory-2',
    couple_id: COUPLE_ID,
    title: 'Ramen pertama',
    description: 'Kamu bilang ini ramen terenak. Aku setuju, karena makannya sama kamu.',
    date: '2026-09-06',
    place_id: 'place-2',
    place_name: 'Little Ramen House',
    rating: 5,
    favorite: false,
    photos: [],
    created_at: '2026-09-06T15:00:00.000Z',
  },
  {
    id: 'memory-3',
    couple_id: COUPLE_ID,
    title: 'Movie night',
    description: 'Popcorn caramel, dan kamu ketiduran di tengah film.',
    date: '2026-09-20',
    place_id: 'place-1',
    place_name: 'Grand Indonesia',
    rating: 4,
    favorite: true,
    photos: [],
    created_at: '2026-09-20T15:00:00.000Z',
  },
  {
    id: 'memory-4',
    couple_id: COUPLE_ID,
    title: 'Photobox',
    description: 'Empat pose, semuanya lucu.',
    date: '2026-09-20',
    place_id: 'place-1',
    place_name: 'Grand Indonesia',
    rating: 5,
    favorite: false,
    photos: [],
    created_at: '2026-09-20T16:00:00.000Z',
  },
];

export const previewStory = [
  {
    id: 'story-1',
    couple_id: COUPLE_ID,
    date: '2026-09-06',
    title: 'Our First Date',
    place: 'Taman Literasi',
    description: 'Hari di mana semuanya dimulai.',
    photo_url: null,
    emoji: '🌸',
    favorite: true,
    created_at: created,
  },
  {
    id: 'story-2',
    couple_id: COUPLE_ID,
    date: '2026-09-20',
    title: 'Our First Movie',
    place: 'Grand Indonesia',
    description: 'Film pertama yang kita tonton berdua.',
    photo_url: null,
    emoji: '🎬',
    favorite: true,
    created_at: created,
  },
  {
    id: 'story-3',
    couple_id: COUPLE_ID,
    date: '2026-10-12',
    title: 'Night Date',
    place: 'Grand Indonesia',
    description: 'Dinner, jalan-jalan, lalu nonton.',
    photo_url: null,
    emoji: '🌙',
    favorite: false,
    created_at: created,
  },
];

export const previewWheelItems = [
  { id: 'w1', couple_id: COUPLE_ID, name: 'Ramen', emoji: '🍜', category: 'restaurant', maps_url: '', created_at: created },
  { id: 'w2', couple_id: COUPLE_ID, name: 'Cafe', emoji: '☕', category: 'cafe', maps_url: '', created_at: created },
  { id: 'w3', couple_id: COUPLE_ID, name: 'Cinema', emoji: '🎬', category: 'cinema', maps_url: '', created_at: created },
  { id: 'w4', couple_id: COUPLE_ID, name: 'Mall', emoji: '🛍️', category: 'shopping', maps_url: '', created_at: created },
  { id: 'w5', couple_id: COUPLE_ID, name: 'Park', emoji: '🌳', category: 'park', maps_url: '', created_at: created },
  { id: 'w6', couple_id: COUPLE_ID, name: 'Restaurant', emoji: '🍽️', category: 'restaurant', maps_url: '', created_at: created },
];

export const previewSettings = {
  couple_id: COUPLE_ID,
  my_name: 'Aku',
  partner_name: 'Nasywa',
  anniversary: '2026-09-06',
  theme: 'sakura',
  secret_message: `Nasywa,

website ini bukan cuma tempat untuk merencanakan
kita mau pergi ke mana.

Aku ingin setiap tempat yang kita datangi,
setiap foto yang kita ambil,
dan setiap waktu yang kita habiskan bersama
punya tempat untuk disimpan.

Supaya suatu hari nanti,
kita bisa melihat semuanya kembali
dan berkata:

ternyata kita sudah sejauh ini. ♡`,
};
