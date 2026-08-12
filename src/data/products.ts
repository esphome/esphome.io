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
        name: "Apollo Automation",
        url: "https://apolloautomation.com/products/esk-1-esphome-starter-kit",
        shipFrom: "USA and Canada",
        shipTo: "North America",
        logo: "/images/distributors/apollo.webp",
      },
      {
        name: "Ameridroid",
        url: "https://ameridroid.com/products/esphome-starter-kit",
        shipFrom: "USA Only",
        shipTo: "North America",
        logo: "/images/distributors/ameridroid-logo.webp",
      },
      {
        name: "Apollo Automation",
        url: "https://apolloautomation.com/products/esk-1-esphome-starter-kit",
        shipFrom: "Europe",
        shipTo: "Europe",
        logo: "/images/distributors/apollo.webp",
      },
      {
        name: "Domadoo",
        url: "https://apolloautomation.com/products/esk-1-esphome-starter-kit",
        shipFrom: "Europe",
        shipTo: "Europe",
        logo: "/images/distributors/domadoo-logo.webp",
      },
      {
        name: "Slim Huisje",
        url: "https://apolloautomation.com/products/esk-1-esphome-starter-kit",
        shipFrom: "Europe",
        shipTo: "Europe",
        logo: "/images/distributors/slim-husije-logo.webp",
      },
      {
        name: "Domo-supply",
        url: "https://www.swiss-domotique.ch/de/hausautomationspakete/apollo-esphome-starter-kit-diy-einsteigerset-esp32-c6-wi-fi-thread",
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
      {
        name: "Apollo Automation",
        url: "https://apolloautomation.com/products/esk-1-esphome-starter-kit",
        shipTo: "Australia",
        logo: "/images/distributors/apollo.webp",
      },
      {
        name: "Apollo Automation",
        url: "https://apolloautomation.com/products/esk-1-esphome-starter-kit",
        shipTo: "Global",
        logo: "/images/distributors/apollo.webp",
      },
    ],
  },
};
