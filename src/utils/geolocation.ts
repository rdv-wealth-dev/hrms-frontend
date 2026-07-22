export interface GeoCoordinates {
  lat: number;
  lng: number;
}

export interface GeocodingResult {
  lat: number;
  lng: number;
  displayName: string;
}

export const getCurrentPosition = (): Promise<GeoCoordinates> => {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error("Geolocation is not supported by your browser"));
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => resolve({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
      (err) => {
        const messages: Record<number, string> = {
          [err.PERMISSION_DENIED]: "Location permission denied. Please enable location access.",
          [err.POSITION_UNAVAILABLE]: "Location information is unavailable.",
          [err.TIMEOUT]: "Location request timed out.",
        };
        reject(new Error(messages[err.code] || "Unknown geolocation error"));
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 300000 }
    );
  });
};

export const geocodeAddress = async (address: string): Promise<GeocodingResult | null> => {
  if (!address.trim()) return null;
  const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(address)}&format=json&limit=1`;
  const response = await fetch(url, {
    headers: { "User-Agent": "HRMS-App/1.0" },
  });
  if (!response.ok) return null;
  const data = await response.json();
  if (!data.length) return null;
  return {
    lat: parseFloat(data[0].lat),
    lng: parseFloat(data[0].lon),
    displayName: data[0].display_name,
  };
};

export const reverseGeocode = async (lat: number, lng: number): Promise<string | null> => {
  const url = `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json`;
  const response = await fetch(url, {
    headers: { "User-Agent": "HRMS-App/1.0" },
  });
  if (!response.ok) return null;
  const data = await response.json();
  return data?.display_name || null;
};
