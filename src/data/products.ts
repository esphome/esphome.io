export interface Distributor {
  name: string;
  url: string;
  shipFrom?: string;
  shipTo: string;
  logo?: string;
  note?: string;
}

export interface Product {
  name: string;
  distributors: Distributor[];
}

export const products: Record<string, Product> = {
  "esphome-starter-kit": {
    name: "ESPHome Starter Kit",
    distributors: [
      {
        name: "Ameridroid",
        url: "https://ameridroid.com/products/esphome-starter-kit",
        shipFrom: "US & Canada",
        shipTo: "North America",
        logo: "/images/distributors/ameridroid-logo.webp",
      },
      {
        name: "Slim-husije",
        url: "https://eu.apolloautomation.com/products/esphome-starter-kit",
        shipFrom: "Europe",
        shipTo: "Europe",
        logo: "/images/distributors/slim-husije-logo.webp",
      },
      {
        name: "Domadoo",
        url: "https://eu.apolloautomation.com/products/esphome-starter-kit",
        shipFrom: "Europe",
        shipTo: "Europe",
        logo: "/images/distributors/domadoo-logo.webp",
      },
      {
        name: "Domo-supply",
        url: "https://eu.apolloautomation.com/products/esphome-starter-kit",
        shipFrom: "Europe",
        shipTo: "Europe",
        logo: "/images/distributors/domo-supply-logo.webp",
      },
      {
        name: "The Pi Hut",
        url: "https://thepihut.com/products/esphome-starter-kit",
        shipFrom: "UK",
        shipTo: "UK",
        logo: "/images/distributors/the-pi-hut-logo.webp",
      },
    ],
  },
};
