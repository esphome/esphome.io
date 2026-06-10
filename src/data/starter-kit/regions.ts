// Where to buy the ESPHome Starter Kit. Apollo sells through their own store
// in multiple regions and through regional distributors.
//
// NOTE: URLs are placeholders pending the launch list from Apollo. Replace
// each `https://example.com/...` with the real product link before launch.

export interface StoreLink {
  name: string;
  url: string;
  note?: string;
}

export interface Region {
  /** Display label for the region. */
  label: string;
  /** ISO 3166-1 alpha-2 codes that belong to this region (used for geo-detection). */
  countries: string[];
  /** Apollo's own store(s) shipping to this region. */
  direct: StoreLink[];
  /** Regional distributors / resellers. */
  distributors: StoreLink[];
}

export const regions: Region[] = [
  {
    label: "North America",
    countries: ["US", "CA", "MX"],
    direct: [
      {
        name: "Apollo Automation (US store)",
        url: "https://apolloautomation.com/products/esphome-starter-kit",
      },
    ],
    distributors: [],
  },
  {
    label: "Europe",
    countries: [
      "AT",
      "BE",
      "BG",
      "HR",
      "CY",
      "CZ",
      "DK",
      "EE",
      "FI",
      "FR",
      "DE",
      "GR",
      "HU",
      "IE",
      "IT",
      "LV",
      "LT",
      "LU",
      "MT",
      "NL",
      "PL",
      "PT",
      "RO",
      "SK",
      "SI",
      "ES",
      "SE",
      "GB",
      "CH",
      "NO",
      "IS",
    ],
    direct: [
      {
        name: "Apollo Automation (EU store)",
        url: "https://eu.apolloautomation.com/products/esphome-starter-kit",
      },
    ],
    distributors: [],
  },
  {
    label: "Asia Pacific",
    countries: ["AU", "NZ", "JP", "SG", "HK", "TW", "KR", "IN"],
    direct: [
      {
        name: "Apollo Automation (international)",
        url: "https://apolloautomation.com/products/esphome-starter-kit",
        note: "Ships internationally",
      },
    ],
    distributors: [],
  },
];
