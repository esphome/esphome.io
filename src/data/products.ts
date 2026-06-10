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
        url: "https://apolloautomation.com/products/esphome-starter-kit",
        shipFrom: "US & Canada",
        shipTo: "North America",
      },
      {
        name: "Apollo Automation",
        url: "https://eu.apolloautomation.com/products/esphome-starter-kit",
        shipFrom: "Europe",
        shipTo: "Europe",
      },
      {
        name: "Apollo Automation",
        url: "https://apolloautomation.com/products/esphome-starter-kit",
        shipFrom: "US",
        shipTo: "Asia Pacific",
        note: "Ships internationally",
      },
    ],
  },
};
