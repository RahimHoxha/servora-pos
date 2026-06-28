export const PLATFORM = {
  name: "Servora",
  logo: "/brand/servora-logo.svg",
  website: "https://servora.app",
} as const;

export const VENUE_BRANDING_KEYS = {
  name: "venue_name",
  logo: "venue_logo",
} as const;

export function cacheVenueBranding(name?: string, logo?: string) {
  if (name) {
    localStorage.setItem(VENUE_BRANDING_KEYS.name, name);
  }
  if (logo) {
    localStorage.setItem(VENUE_BRANDING_KEYS.logo, logo);
  } else {
    localStorage.removeItem(VENUE_BRANDING_KEYS.logo);
  }
}

export function readCachedVenueBranding(): {
  name: string | null;
  logo: string | null;
} {
  return {
    name: localStorage.getItem(VENUE_BRANDING_KEYS.name),
    logo: localStorage.getItem(VENUE_BRANDING_KEYS.logo),
  };
}
