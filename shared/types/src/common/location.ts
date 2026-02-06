export interface Country {
  code: string; // ISO 3166-1 alpha-2
  name: string;
  continent: string;
  region?: string;
  flag?: string;
  currency?: string;
  timezone?: string[];
  dialCode?: string;
}

export interface City {
  id: string;
  name: string;
  countryCode: string;
  stateCode?: string;
  latitude: number;
  longitude: number;
  population?: number;
  timezone?: string;
}

export interface State {
  code: string;
  name: string;
  countryCode: string;
}

export interface Coordinates {
  latitude: number;
  longitude: number;
  accuracy?: number; // in meters
}

export interface LocationFilter {
  countries?: string[];
  cities?: string[];
  states?: string[];
  regions?: string[];
  continents?: string[];
  isRemote?: boolean;
  radius?: {
    center: Coordinates;
    distance: number; // in kilometers
  };
}

export interface LocationStats {
  country: string;
  startupCount: number;
  jobCount: number;
  totalFunding: number;
  averageFunding: number;
  topIndustries: {
    industry: string;
    count: number;
  }[];
}

// Common countries for startup ecosystem
export const STARTUP_COUNTRIES = [
  { code: 'US', name: 'United States' },
  { code: 'IN', name: 'India' },
  { code: 'GB', name: 'United Kingdom' },
  { code: 'CA', name: 'Canada' },
  { code: 'DE', name: 'Germany' },
  { code: 'FR', name: 'France' },
  { code: 'SG', name: 'Singapore' },
  { code: 'AU', name: 'Australia' },
  { code: 'IL', name: 'Israel' },
  { code: 'NL', name: 'Netherlands' },
  { code: 'SE', name: 'Sweden' },
  { code: 'CH', name: 'Switzerland' },
  { code: 'JP', name: 'Japan' },
  { code: 'CN', name: 'China' },
  { code: 'BR', name: 'Brazil' },
  { code: 'MX', name: 'Mexico' },
  { code: 'AR', name: 'Argentina' },
  { code: 'ZA', name: 'South Africa' },
  { code: 'NG', name: 'Nigeria' },
  { code: 'KE', name: 'Kenya' },
] as const;

// Major startup hubs
export const STARTUP_HUBS = [
  { city: 'San Francisco', country: 'US', region: 'Silicon Valley' },
  { city: 'New York', country: 'US', region: 'East Coast' },
  { city: 'London', country: 'GB', region: 'Europe' },
  { city: 'Bangalore', country: 'IN', region: 'India' },
  { city: 'Berlin', country: 'DE', region: 'Europe' },
  { city: 'Tel Aviv', country: 'IL', region: 'Middle East' },
  { city: 'Singapore', country: 'SG', region: 'Southeast Asia' },
  { city: 'Toronto', country: 'CA', region: 'North America' },
  { city: 'Sydney', country: 'AU', region: 'Oceania' },
  { city: 'Amsterdam', country: 'NL', region: 'Europe' },
  { city: 'Stockholm', country: 'SE', region: 'Nordic' },
  { city: 'Mumbai', country: 'IN', region: 'India' },
  { city: 'Delhi', country: 'IN', region: 'India' },
  { city: 'Hyderabad', country: 'IN', region: 'India' },
  { city: 'Pune', country: 'IN', region: 'India' },
  { city: 'Paris', country: 'FR', region: 'Europe' },
  { city: 'Zurich', country: 'CH', region: 'Europe' },
  { city: 'Tokyo', country: 'JP', region: 'Asia' },
  { city: 'Shanghai', country: 'CN', region: 'Asia' },
  { city: 'Beijing', country: 'CN', region: 'Asia' },
] as const;
