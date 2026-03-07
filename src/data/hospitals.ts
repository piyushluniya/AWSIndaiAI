export interface Hospital {
  name: string
  address: string
  city: string
  lat: number
  lng: number
  specialties: string[]
  insurers: string[]
  phone: string
}

export const HOSPITALS: Hospital[] = [
  // Mumbai
  { name: "Kokilaben Dhirubhai Ambani Hospital", address: "Four Bungalows, Andheri West", city: "Mumbai", lat: 19.1136, lng: 72.8360, specialties: ["Cardiac", "Neuro", "Ortho", "Oncology", "Trauma"], insurers: ["Star Health", "HDFC ERGO", "Bajaj Allianz", "ICICI Lombard", "New India", "United India", "Aditya Birla"], phone: "022-30999999" },
  { name: "Lilavati Hospital", address: "Bandra Reclamation, Bandra West", city: "Mumbai", lat: 19.0526, lng: 72.8258, specialties: ["Cardiac", "Ortho", "Neuro"], insurers: ["Star Health", "HDFC ERGO", "Bajaj Allianz", "Max Bupa", "Religare"], phone: "022-26751000" },
  { name: "Fortis Hospital Mulund", address: "Mulund Goregaon Link Road, Mulund West", city: "Mumbai", lat: 19.1726, lng: 72.9562, specialties: ["Cardiac", "Ortho", "Neuro", "Trauma"], insurers: ["Star Health", "HDFC ERGO", "ICICI Lombard", "Bajaj Allianz", "Aditya Birla"], phone: "022-67994444" },
  { name: "Nanavati Super Speciality Hospital", address: "Vile Parle West", city: "Mumbai", lat: 19.0990, lng: 72.8390, specialties: ["Cardiac", "Ortho", "Neuro", "Oncology"], insurers: ["Star Health", "HDFC ERGO", "New India", "United India", "Bajaj Allianz"], phone: "022-26136300" },

  // Delhi
  { name: "Apollo Hospital Sarita Vihar", address: "Mathura Road, Sarita Vihar", city: "Delhi", lat: 28.5245, lng: 77.2855, specialties: ["Cardiac", "Ortho", "Neuro", "Oncology"], insurers: ["Star Health", "HDFC ERGO", "Bajaj Allianz", "ICICI Lombard", "Max Bupa", "Religare"], phone: "011-71791090" },
  { name: "Max Super Specialty Saket", address: "Press Enclave Road, Saket", city: "Delhi", lat: 28.5271, lng: 77.2186, specialties: ["Cardiac", "Ortho", "Neuro", "Trauma"], insurers: ["Star Health", "HDFC ERGO", "ICICI Lombard", "Bajaj Allianz", "Aditya Birla", "Max Bupa"], phone: "011-26515050" },
  { name: "Fortis Hospital Vasant Kunj", address: "Siri Fort Road, Vasant Kunj", city: "Delhi", lat: 28.5298, lng: 77.1584, specialties: ["Cardiac", "Ortho", "Neuro"], insurers: ["Star Health", "HDFC ERGO", "Bajaj Allianz", "ICICI Lombard"], phone: "011-42776222" },
  { name: "BLK Super Speciality Hospital", address: "Pusa Road, Rajinder Nagar", city: "Delhi", lat: 28.6435, lng: 77.1654, specialties: ["Cardiac", "Neuro", "Oncology", "Transplant"], insurers: ["Star Health", "HDFC ERGO", "ICICI Lombard", "Bajaj Allianz", "New India"], phone: "011-30403040" },

  // Bangalore
  { name: "Manipal Hospital Whitefield", address: "ITPB Road, Whitefield", city: "Bangalore", lat: 12.9698, lng: 77.7499, specialties: ["Cardiac", "Ortho", "Neuro", "Oncology"], insurers: ["Star Health", "HDFC ERGO", "Bajaj Allianz", "ICICI Lombard", "Aditya Birla"], phone: "080-40920000" },
  { name: "Apollo Hospital Bannerghatta Road", address: "154/11, Bannerghatta Road", city: "Bangalore", lat: 12.8933, lng: 77.5999, specialties: ["Cardiac", "Ortho", "Neuro"], insurers: ["Star Health", "HDFC ERGO", "Bajaj Allianz", "ICICI Lombard", "Max Bupa"], phone: "080-26304050" },
  { name: "Fortis Hospital Cunningham Road", address: "14 Cunningham Road", city: "Bangalore", lat: 12.9829, lng: 77.5950, specialties: ["Cardiac", "Neuro", "Ortho", "Trauma"], insurers: ["Star Health", "HDFC ERGO", "ICICI Lombard", "Bajaj Allianz"], phone: "080-66214444" },
  { name: "Narayana Health City", address: "258/A, Bommasandra Industrial Area", city: "Bangalore", lat: 12.8177, lng: 77.6762, specialties: ["Cardiac", "Oncology", "Neuro", "Ortho"], insurers: ["Star Health", "HDFC ERGO", "Bajaj Allianz", "New India", "United India"], phone: "080-71222222" },

  // Hyderabad
  { name: "KIMS Hospital Secunderabad", address: "1-8-31/1, Minister Road, Secunderabad", city: "Hyderabad", lat: 17.4374, lng: 78.4982, specialties: ["Cardiac", "Neuro", "Ortho"], insurers: ["Star Health", "HDFC ERGO", "Bajaj Allianz", "United India", "New India"], phone: "040-44885000" },
  { name: "Apollo Hospital Jubilee Hills", address: "Film Nagar, Jubilee Hills", city: "Hyderabad", lat: 17.4227, lng: 78.4098, specialties: ["Cardiac", "Ortho", "Neuro", "Oncology"], insurers: ["Star Health", "HDFC ERGO", "ICICI Lombard", "Bajaj Allianz", "Max Bupa"], phone: "040-23607777" },
  { name: "Yashoda Hospital Somajiguda", address: "Raj Bhavan Road, Somajiguda", city: "Hyderabad", lat: 17.4239, lng: 78.4605, specialties: ["Cardiac", "Ortho", "Neuro", "Trauma"], insurers: ["Star Health", "HDFC ERGO", "Bajaj Allianz", "ICICI Lombard"], phone: "040-45677777" },

  // Chennai
  { name: "Apollo Hospital Greams Road", address: "21 Greams Lane, Thousand Lights", city: "Chennai", lat: 13.0614, lng: 80.2467, specialties: ["Cardiac", "Ortho", "Neuro", "Oncology"], insurers: ["Star Health", "HDFC ERGO", "Bajaj Allianz", "ICICI Lombard", "Max Bupa", "Religare"], phone: "044-28296000" },
  { name: "Fortis Malar Hospital", address: "52, 1st Main Road, Adyar", city: "Chennai", lat: 13.0102, lng: 80.2562, specialties: ["Cardiac", "Neuro", "Ortho"], insurers: ["Star Health", "HDFC ERGO", "ICICI Lombard", "Bajaj Allianz"], phone: "044-42890000" },

  // Pune
  { name: "Ruby Hall Clinic", address: "40 Sassoon Road", city: "Pune", lat: 18.5216, lng: 73.8771, specialties: ["Cardiac", "Ortho", "Neuro"], insurers: ["Star Health", "HDFC ERGO", "Bajaj Allianz", "ICICI Lombard", "United India"], phone: "020-66455000" },
  { name: "Jehangir Hospital", address: "32 Sassoon Road", city: "Pune", lat: 18.5213, lng: 73.8752, specialties: ["Cardiac", "Ortho", "Neuro", "Oncology"], insurers: ["Star Health", "HDFC ERGO", "New India", "Bajaj Allianz", "Max Bupa"], phone: "020-66814444" },

  // Kolkata
  { name: "Apollo Gleneagles Hospital", address: "58 Canal Circular Road, Kadapara", city: "Kolkata", lat: 22.5726, lng: 88.4000, specialties: ["Cardiac", "Neuro", "Ortho", "Oncology"], insurers: ["Star Health", "HDFC ERGO", "Bajaj Allianz", "ICICI Lombard"], phone: "033-23201200" },
  { name: "Fortis Hospital Anandapur", address: "730 Anandapur, EM Bypass", city: "Kolkata", lat: 22.5127, lng: 88.3914, specialties: ["Cardiac", "Neuro", "Ortho", "Trauma"], insurers: ["Star Health", "HDFC ERGO", "ICICI Lombard", "Bajaj Allianz"], phone: "033-66284444" },

  // Ahmedabad
  { name: "Apollo Hospital Ahmedabad", address: "Plot 1A, Bhat GIDC Estate, Gandhinagar", city: "Ahmedabad", lat: 23.1527, lng: 72.6369, specialties: ["Cardiac", "Ortho", "Neuro"], insurers: ["Star Health", "HDFC ERGO", "Bajaj Allianz", "ICICI Lombard"], phone: "079-66701800" },
  { name: "Sterling Hospital", address: "Gurukul Road, Memnagar", city: "Ahmedabad", lat: 23.0567, lng: 72.5498, specialties: ["Cardiac", "Ortho", "Neuro", "Oncology"], insurers: ["Star Health", "HDFC ERGO", "New India", "United India", "Bajaj Allianz"], phone: "079-40001000" },

  // NCR / Noida / Ghaziabad
  { name: "Max Super Specialty Vaishali", address: "W-3 Sector 1, Vaishali", city: "Ghaziabad", lat: 28.6441, lng: 77.3375, specialties: ["Cardiac", "Neuro", "Ortho", "Trauma"], insurers: ["Star Health", "HDFC ERGO", "ICICI Lombard", "Bajaj Allianz", "Max Bupa"], phone: "0120-4555000" },
  { name: "Fortis Hospital Noida", address: "B-22 Sector 62, Noida", city: "Ghaziabad", lat: 28.6260, lng: 77.3716, specialties: ["Cardiac", "Ortho", "Neuro"], insurers: ["Star Health", "HDFC ERGO", "Bajaj Allianz", "ICICI Lombard"], phone: "0120-2400444" },
  { name: "Apollo Hospital Noida", address: "E-2 Block, Sector 26, Noida", city: "Ghaziabad", lat: 28.5776, lng: 77.3290, specialties: ["Cardiac", "Ortho", "Multi-specialty"], insurers: ["Star Health", "HDFC ERGO", "Max Bupa", "Bajaj Allianz"], phone: "0120-2400400" },

  // Jaipur
  { name: "Fortis Escorts Hospital Jaipur", address: "Jawaharlal Nehru Marg, Malviya Nagar", city: "Jaipur", lat: 26.8617, lng: 75.8170, specialties: ["Cardiac", "Ortho", "Neuro"], insurers: ["Star Health", "HDFC ERGO", "ICICI Lombard", "Bajaj Allianz"], phone: "0141-2547000" },
  { name: "Narayana Multispeciality Hospital Jaipur", address: "Pratap Nagar, Tonk Road", city: "Jaipur", lat: 26.8131, lng: 75.8236, specialties: ["Cardiac", "Ortho", "Multi-specialty"], insurers: ["New India", "United India", "Star Health", "Bajaj Allianz"], phone: "0141-7116666" },

  // Lucknow
  { name: "Medanta Hospital Lucknow", address: "Sector A, Pocket 1, Amar Shaheed Path", city: "Lucknow", lat: 26.8073, lng: 80.9462, specialties: ["Cardiac", "Neuro", "Ortho", "Oncology"], insurers: ["Star Health", "HDFC ERGO", "ICICI Lombard", "Bajaj Allianz", "Max Bupa"], phone: "0522-4500000" },
  { name: "Sahara Hospital", address: "Viraj Khand, Gomti Nagar", city: "Lucknow", lat: 26.8565, lng: 81.0007, specialties: ["Cardiac", "Ortho", "Multi-specialty"], insurers: ["Star Health", "New India", "United India", "Bajaj Allianz"], phone: "0522-6780001" },
]

// ---------------------------------------------------------------------------
// Haversine distance in km
// ---------------------------------------------------------------------------
export function haversineKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371
  const dLat = (lat2 - lat1) * Math.PI / 180
  const dLon = (lon2 - lon1) * Math.PI / 180
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.sin(dLon / 2) ** 2
  return R * 2 * Math.asin(Math.sqrt(a))
}

// ---------------------------------------------------------------------------
// Find nearest hospitals, optionally filtered by insurer
// ---------------------------------------------------------------------------
export function findNearestHospitals(
  lat: number,
  lng: number,
  insurer: string,
  count = 3
): Array<Hospital & { distanceKm: number }> {
  const normalized = insurer.toLowerCase()

  return HOSPITALS
    .map((h) => ({
      ...h,
      distanceKm: haversineKm(lat, lng, h.lat, h.lng),
      inNetwork: h.insurers.some((i) => i.toLowerCase().includes(normalized) || normalized.includes(i.toLowerCase()))
    }))
    .filter((h) => h.inNetwork)
    .sort((a, b) => a.distanceKm - b.distanceKm)
    .slice(0, count)
}

// ---------------------------------------------------------------------------
// Find hospitals by city (fallback when no GPS)
// ---------------------------------------------------------------------------
export function findHospitalsByCity(
  city: string,
  insurer: string,
  count = 3
): Hospital[] {
  const cityLower = city.toLowerCase()
  const insurerLower = insurer.toLowerCase()

  return HOSPITALS
    .filter((h) =>
      h.city.toLowerCase().includes(cityLower) &&
      h.insurers.some((i) => i.toLowerCase().includes(insurerLower) || insurerLower.includes(i.toLowerCase()))
    )
    .slice(0, count)
}
