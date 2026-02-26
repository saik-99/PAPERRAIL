// Mock data for demo purposes - replace with real Supabase queries

export const MOCK_CROPS = [
  { id: 1, name_en: 'Wheat', name_hi: 'गेहूं', name_mr: 'गहू' },
  { id: 2, name_en: 'Tomato', name_hi: 'टमाटर', name_mr: 'टोमॅटो' },
  { id: 3, name_en: 'Soybean', name_hi: 'सोयाबीन', name_mr: 'सोयाबीन' },
  { id: 4, name_en: 'Chana', name_hi: 'चना', name_mr: 'हरभरा' },
  { id: 5, name_en: 'Onion', name_hi: 'प्याज', name_mr: 'कांदा' },
  { id: 6, name_en: 'Rice', name_hi: 'चावल', name_mr: 'तांदूळ' },
  { id: 7, name_en: 'Cotton', name_hi: 'कपास', name_mr: 'कापूस' },
]

export const MOCK_MANDIS = [
  { id: 1, name: 'Nagpur Mandi', district: 'Nagpur', state: 'Maharashtra', lat: 21.1458, lng: 79.0882, transport_rate: 2.5 },
  { id: 2, name: 'Wardha Mandi', district: 'Wardha', state: 'Maharashtra', lat: 20.7453, lng: 78.6022, transport_rate: 3.0 },
  { id: 3, name: 'Amravati Mandi', district: 'Amravati', state: 'Maharashtra', lat: 20.9333, lng: 77.75, transport_rate: 3.5 },
  { id: 4, name: 'Pune Mandi', district: 'Pune', state: 'Maharashtra', lat: 18.5204, lng: 73.8567, transport_rate: 6.0 },
  { id: 5, name: 'Mumbai APMC', district: 'Mumbai', state: 'Maharashtra', lat: 19.0760, lng: 72.8777, transport_rate: 8.5 },
]

export const MOCK_PRICE_HISTORY = {
  tomato: [22, 23, 21, 25, 26, 24, 27, 28, 26, 29, 30, 28, 27, 29, 31],
  wheat: [24, 24, 25, 24, 26, 25, 26, 27, 26, 27, 28, 27, 28, 29, 28],
  soybean: [55, 54, 56, 53, 52, 55, 57, 56, 58, 57, 59, 58, 60, 59, 61],
  chana: [62, 63, 61, 64, 65, 64, 66, 65, 67, 66, 68, 67, 69, 68, 70],
  onion: [18, 17, 19, 20, 18, 21, 22, 20, 23, 22, 24, 21, 25, 24, 26],
}

export const MOCK_LISTINGS = [
  {
    id: '1', farmer: 'Ramesh Patel', crop: 'Tomato', cropId: 2,
    quantity: 500, price: 28, harvestDate: '2026-03-01',
    spoilage: 'Medium' as const, status: 'Active' as const, location: 'Nagpur'
  },
  {
    id: '2', farmer: 'Sunita Devi', crop: 'Wheat', cropId: 1,
    quantity: 2000, price: 28, harvestDate: '2026-03-15',
    spoilage: 'Low' as const, status: 'Active' as const, location: 'Wardha'
  },
  {
    id: '3', farmer: 'Vijay Kumar', crop: 'Soybean', cropId: 3,
    quantity: 800, price: 61, harvestDate: '2026-02-28',
    spoilage: 'Low' as const, status: 'Pending_Sale' as const, location: 'Amravati'
  },
  {
    id: '4', farmer: 'Priya Sharma', crop: 'Onion', cropId: 5,
    quantity: 1200, price: 25, harvestDate: '2026-03-05',
    spoilage: 'High' as const, status: 'Active' as const, location: 'Nagpur'
  },
]

export const GOVERNMENT_SCHEMES = [
  {
    id: 1, name: 'PM-KISAN', crop: 'All', benefit: '₹6,000/year income support',
    description: 'Direct income support to small and marginal farmers',
    link: 'https://pmkisan.gov.in', shortcode: 'SMS PMKISAN to 1551'
  },
  {
    id: 2, name: 'Pradhan Mantri Fasal Bima Yojana', crop: 'All', benefit: 'Crop insurance at low premium',
    description: 'Financial support to farmers suffering crop loss/damage',
    link: 'https://pmfby.gov.in', shortcode: 'SMS PMFBY to 1551'
  },
  {
    id: 3, name: 'Kisan Credit Card', crop: 'All', benefit: 'Low-interest credit up to ₹3 lakh',
    description: 'Flexible credit for farming needs at subsidized rates',
    link: 'https://nabard.org', shortcode: 'Call 1800-180-1111'
  },
  {
    id: 4, name: 'eNAM Platform', crop: 'All', benefit: 'Better price discovery',
    description: 'Online trading portal linking mandis across India',
    link: 'https://enam.gov.in', shortcode: 'SMS ENAM to 56767'
  },
  {
    id: 5, name: 'Chana MSP Support', crop: 'Chana', benefit: 'Minimum Support Price ₹5,440/quintal',
    description: 'Government guaranteed price for chana procurement',
    link: 'https://agricoop.gov.in', shortcode: 'Call 1800-180-1551'
  },
]
