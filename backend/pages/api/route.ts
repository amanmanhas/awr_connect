import { NextApiRequest, NextApiResponse } from 'next';

// Environment variables should be in .env.local
const GOOGLE_MAPS_API_KEY = process.env.GOOGLE_MAPS_API_KEY;


async function fetchDirections(start: { lat: number; lng: number }, end: { lat: number; lng: number }) {
  // Validate coordinates
  if (!start.lat || !start.lng || !end.lat || !end.lng) {
    throw new Error('Invalid coordinates provided');
  }
  // Format coordinates to 6 decimal places for consistency
  const origin = `${start.lat.toFixed(6)},${start.lng.toFixed(6)}`;
  const destination = `${end.lat.toFixed(6)},${end.lng.toFixed(6)}`;
  
  if (!GOOGLE_MAPS_API_KEY) {
    throw new Error('Google Maps API key is not configured');
  }

  const url = `https://maps.googleapis.com/maps/api/directions/json?origin=${origin}&destination=${destination}&mode=driving&key=${GOOGLE_MAPS_API_KEY}`;

  const response = await fetch(url);
  const data = await response.json();
  if (data.error_message) {
    console.error('Directions API error message:', data.error_message);
  }
  
  if (!response.ok) {
    throw new Error(`Directions API HTTP error: ${response.status} ${response.statusText}`);
  }

  if (data.status !== 'OK') {
    if (data.status === 'REQUEST_DENIED') {
      console.error('API key issue. Please check:');
    }
    throw new Error(`Directions API error: ${data.status} - ${data.error_message || 'No error message provided'}`);
  }
  
  return data;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { start, end } = req.body;

    if (!start?.lat || !start?.lng || !end?.lat || !end?.lng) {
      return res.status(400).json({ error: 'Invalid start/end coordinates' });
    }
    // 1. Get route from Directions API
    const directionsData = await fetchDirections(start, end);
    
   return res.status(200).json(directionsData);



  } catch (error: any) {
    return res.status(500).json({ 
      error: 'Failed to fetch route',
      details: error.message 
    });
  }
}