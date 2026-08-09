/**
 * Data behind the Ready-Made Projects page (`/projects/`).
 *
 * Adding a device is a matter of appending an entry to the relevant project
 * type's `devices` array; adding a whole new project type means appending to
 * `PROJECT_TYPES`. The markup lives in `@components/ReadyMadeProjects.astro`
 * and should not need to change for either.
 */

export interface DeviceLink {
  label: string;
  url: string;
}

export interface DeviceVariant {
  /** Manifest path segment used in place of the device id when selected. */
  value: string;
  name: string;
}

export interface Device {
  /**
   * Radio value. Doubles as the manifest path segment and as the `data-device`
   * key that ties this device's blocks to its radio button.
   */
  id: string;
  /** Absolute URL path, e.g. `/projects/serial-proxy/board.png` for `public/projects/serial-proxy/board.png`. */
  image: string;
  imageAlt: string;
  /** Overrides the project type's `manifestRoot` for this device. */
  manifestRoot?: string;
  /**
   * Overrides the project type's `advanced.githubUrl` when this device's YAML
   * lives in a repository of its own.
   */
  githubUrl?: string;
  /** Needs extra work to flash; hidden unless the URL carries `?diy`. */
  diy?: boolean;
  /** Sub-selector rendered above the install button. */
  variants?: DeviceVariant[];
  /** Heading of the info block. Omit for a block that is only an install step. */
  title?: string;
  /** Paragraphs of the info block. Inline HTML is allowed. */
  body?: string[];
  /** Label above `links`. */
  linksLabel?: string;
  links?: DeviceLink[];
  /**
   * Install button rendered inside this device's info block rather than once
   * for the whole project type. Only used when the type sets
   * `installPlacement: "device"`.
   */
  manifest?: string;
  /** Manual instructions shown in place of an install button. Inline HTML is allowed. */
  steps?: string[];
  /** Prompt above `steps`. */
  stepsPrompt?: string;
}

export interface ProjectType {
  /** Radio value, and the `type-<id>` class the script toggles. */
  id: string;
  name: string;
  /** Shown under the name in the type picker. Inline HTML is allowed. */
  description: string;
  /** Prompt above the device picker. */
  devicePrompt: string;
  /** Manifests are built as `<manifestRoot>/<device or variant>/manifest.json`. */
  manifestRoot?: string;
  /** One install button per type (default), or one inside each device's info block. */
  installPlacement?: "type" | "device";
  devices: Device[];
  advanced?: {
    /** Name of the component this project is built on; linked to `/components/<component>/`. */
    component?: string;
    /** Repository holding the YAML, for devices that do not name their own. */
    githubUrl?: string;
    /** Offer the "Show DIY devices" link. */
    diyToggle?: boolean;
  };
}

/** Adopting any of these projects goes through the same add-on redirect. */
export const DASHBOARD_ADOPT_URL =
  "https://my.home-assistant.io/redirect/supervisor_addon/?addon=5c53de3b_esphome&repository_url=https%3A%2F%2Fgithub.com%2Fesphome%2Fhome-assistant-addon";

const HOME_ASSISTANT_VOICE_MANIFEST_ROOT = "https://firmware.esphome.io/home-assistant-voice-pe";

export const PROJECT_TYPES: ProjectType[] = [
  {
    id: "voice",
    name: "Voice assistant",
    description: "Create a device to control Home Assistant with your voice.",
    devicePrompt: "Pick the device you want to turn into a voice assistant:",
    manifestRoot: "https://firmware.esphome.io/wake-word-voice-assistant",
    advanced: { githubUrl: "https://github.com/esphome/wake-word-voice-assistants" },
    devices: [
      {
        id: "m5stack-atom-echo",
        image: "/projects/media-player/atom_echo.png",
        imageAlt: "M5Stack Atom Echo Development Kit",
        title: "M5Stack Atom Echo Development Kit",
        body: ["Tiny ESP32 board with a built-in speaker."],
        links: [
          { label: "Amazon", url: "https://amzn.to/47wcAx2" },
          {
            label: "M5Stack Shop",
            url: "https://shop.m5stack.com/collections/m5-controllers/products/atom-echo-smart-speaker-dev-kit?ref=NabuCasa",
          },
          { label: "AliExpress", url: "https://www.aliexpress.com/item/1005003299332198.html" },
        ],
      },
      {
        id: "esp32-s3-box-3",
        image: "/projects/voice-assistant/esp32-s3-box-3.png",
        imageAlt: "ESP32-S3-BOX-3",
        variants: [
          { value: "esp32-s3-box-3", name: "ESP32-S3-BOX-3" },
          { value: "esp32-s3-box", name: "ESP32-S3-BOX" },
          { value: "esp32-s3-box-lite", name: "ESP32-S3-BOX-Lite" },
        ],
        title: "ESP32-S3-BOX-3",
        body: [
          "The open-source reference design for voice assistants by Espressif. The non-3 and lite variants are older versions that are no longer for sale.",
        ],
        linksLabel: "Buy ESP32-S3-BOX-3",
        links: [
          { label: "Amazon", url: "https://amzn.to/3u9HIUW" },
          {
            label: "AliExpress",
            url: "https://www.aliexpress.us/item/3256805733893224.html?gatewayAdapt=glo2usa4itemAdapt",
          },
        ],
      },
      {
        id: "home-assistant-voice",
        image: "/projects/voice-assistant/home-assistant-voice.png",
        imageAlt: "Home Assistant Voice: Preview Edition",
        manifestRoot: HOME_ASSISTANT_VOICE_MANIFEST_ROOT,
        githubUrl: "https://github.com/esphome/home-assistant-voice-pe",
        title: "Home Assistant Voice: Preview Edition",
        body: [
          "Our official voice assistant hardware created for ESPHome. Includes advanced voice processing and a beautiful design.",
        ],
        linksLabel: "Learn more &amp; buy",
        links: [{ label: "Home Assistant", url: "https://www.home-assistant.io/voice-pe/" }],
      },
    ],
  },
  {
    id: "bluetooth",
    name: "Bluetooth proxy",
    description: "Create a device to allow Home Assistant to control Bluetooth devices.",
    devicePrompt: "Pick the device you want to turn into a Bluetooth proxy:",
    manifestRoot: "https://firmware.esphome.io/bluetooth-proxy",
    advanced: {
      component: "bluetooth_proxy",
      githubUrl: "https://github.com/esphome/bluetooth-proxies",
      diyToggle: true,
    },
    devices: [
      {
        id: "esp32-generic",
        image: "/projects/bluetooth-proxy/esp32_generic.png",
        imageAlt: "ESP32 Generic",
        title: "Generic ESP32",
        body: [
          "Turn any ESP32 into a Bluetooth proxy for Home Assistant. This option only works for “plain” ESP32 and not for ESP32-C3 or other variants.",
        ],
        links: [
          {
            label: "Amazon",
            url: "https://www.amazon.com/ESP-WROOM-32-Development-Microcontroller-Integrated-Compatible/dp/B08D5ZD528/?&_encoding=UTF8&tag=homeassista0e-20&linkCode=ur2&linkId=f9087b654cd5735f0761ae5db99e1e1a&camp=1789&creative=9325",
          },
        ],
      },
      {
        id: "olimex-esp32-poe-iso",
        image: "/projects/bluetooth-proxy/olimex_esp32_poe_iso.png",
        imageAlt: "Olimex ESP32 Power-over-Ethernet ISO",
        title: "Olimex ESP32 Power-over-Ethernet ISO",
        body: [
          'ESP32 board with wired Ethernet connection that can also be powered using Power over Ethernet 802.3af. Note that when installed via this website, Wi-Fi is disabled and it needs to be connected via Ethernet. The <em>ESP32-POE-ISO-EA</em> variant may provide better Bluetooth range since it has an external antenna. <a href="https://www.thingiverse.com/thing:3857281">Case on Thingiverse.</a>',
        ],
        links: [
          {
            label: "Olimex",
            url: "https://www.olimex.com/Products/IoT/ESP32/ESP32-POE-ISO-EA/open-source-hardware",
          },
          {
            label: "Mouser",
            url: "https://www.mouser.com/ProductDetail/Olimex-Ltd/ESP32-POE-ISO?qs=sGAEpiMZZMuqBwn8WqcFUj2aNd7i9W7uc087HzBKguU1UBkflb3j3w%3D%3D",
          },
        ],
      },
      {
        id: "seeed-esp32-poe",
        image: "/projects/bluetooth-proxy/seeed-esp32-poe.png",
        imageAlt: "Seeed Studio XIAO W5500 Ethernet Adapter V1.2",
        title: "Seeed Studio XIAO W5500 Ethernet Adapter V1.2",
        body: [
          "The development board based on the ESP32-S3-Plus XIAO, equipped with the W5500 Ethernet chip, provides wired network connectivity and supports Power over Ethernet (PoE). Please note that after installation via this website, Wi-Fi will be disabled, and the device must be connected via Ethernet.",
          '<strong>Note:</strong> Only V1.2 boards (produced after November 1, 2025) are supported. Earlier versions were never originally intended for use as active Bluetooth proxies and are not compatible due to a missing interrupt pin connection for the W5500 Ethernet chip and Bluetooth RF performance issues. See the <a href="https://community.home-assistant.io/t/916767/22">forum post</a> for more details and support options for early-batch units.',
        ],
        links: [
          {
            label: "Seeed Studio",
            url: "https://www.seeedstudio.com/XIAO-W5500-Ethernet-Adapter-p-6472.html",
          },
        ],
      },
      {
        id: "lilygo-t-eth-poe",
        image: "/projects/bluetooth-proxy/lilygo-eth-poe.png",
        imageAlt: "LilyGO T-ETH-POE",
        diy: true,
        title: "LilyGO T-ETH-POE ESP32-WROOM",
        body: [
          'A compact board with an ESP32-WROOM module and wired Ethernet connection. Can be powered via Power over Ethernet 802.3af or via the built in USB-C port. Note that when installed via this website, Wi-Fi is disabled and it needs to be connected via Ethernet. <a href="https://www.thingiverse.com/search?q=LILYGO TTGO T-Internet-POE ESP32">Various enclosures on Thingiverse.</a>',
          "<strong>Warning: This board requires extra work.</strong> This device comes with a special “download tool” that needs to be used to install it as a Bluetooth proxy.",
        ],
        links: [
          {
            label: "LilyGO Store",
            url: "https://lilygo.cc/en-us/products/t-internet-poe?variant=52074812965045",
          },
          { label: "AliExpress", url: "https://www.aliexpress.com/item/2255800936677694.html" },
        ],
      },
      {
        id: "gl-s10",
        image: "/projects/bluetooth-proxy/gl-s10.png",
        imageAlt: "GL.iNet GL-S10",
        diy: true,
        title: "GL.iNet GL-S10",
        body: [
          "ESP32 in a case with external antenna and wired Ethernet connection that can also be powered using Power over Ethernet 802.3af. Note that when installed via this website, Wi-Fi is disabled and it needs to be connected via Ethernet.",
          '<strong>Warning: This board requires extra work.</strong> This device requires you to disassemble the device to be able to install it as a Bluetooth proxy. This installation method is for revision 2.X of their board. See instructions for the configuration of other revisions. <a href="https://blakadder.com/gl-s10/">Read DIY instructions.</a>',
        ],
        links: [
          {
            label: "GL.iNet Shop",
            url: "https://store.gl-inet.com/products/gl-s10-ble-iot-gateway?variant=39514685112414",
          },
          {
            label: "AliExpress - ESPHome pre-flashed",
            url: "https://www.aliexpress.us/item/3256803802198078.html",
          },
        ],
      },
      {
        id: "wt32-eth01",
        image: "/projects/bluetooth-proxy/wt32-eth01.png",
        imageAlt: "Wireless-Tag WT32-ETH01",
        diy: true,
        title: "Wireless-Tag WT32-ETH01",
        body: [
          'ESP32 board with wired Ethernet connection. Note that when installed via this website, Wi-Fi is disabled and it needs to be connected via Ethernet. <a href="https://www.thingiverse.com/search?q=WT32-ETH01">Various enclosures on Thingiverse.</a>',
          '<strong>Warning: This board requires extra work.</strong> This device requires you to create a special flash tool to be able to install it as a Bluetooth proxy. <a href="https://community.home-assistant.io/t/359027">Read DIY instructions.</a>',
        ],
        links: [
          { label: "AliExpress", url: "https://www.aliexpress.com/wholesale?SearchText=WT32-ETH01" },
          {
            label: "Mouser",
            url: "https://eu.mouser.com/ProductDetail/Seeed-Studio/102991455?qs=hd1VzrDQEGjybZ4QAH35DA%3D%3D",
          },
          { label: "TubesZB - Kit with enclosure and USB-C", url: "https://tubeszb.com/product/bt/" },
        ],
      },
    ],
  },
  {
    id: "media",
    name: "Media Player",
    description:
      'Create a multi-speaker music listening experience powered by <a href="https://www.sendspin-audio.com" target="_blank" rel="noopener noreferrer">Sendspin</a>.',
    devicePrompt: "Pick the device you want to turn into a media player:",
    manifestRoot: "https://firmware.esphome.io/media-player",
    advanced: { githubUrl: "https://github.com/esphome/media-players" },
    devices: [
      {
        id: "home-assistant-voice",
        image: "/projects/voice-assistant/home-assistant-voice.png",
        imageAlt: "Home Assistant Voice: Preview Edition",
        manifestRoot: HOME_ASSISTANT_VOICE_MANIFEST_ROOT,
        githubUrl: "https://github.com/esphome/home-assistant-voice-pe",
        title: "Home Assistant Voice: Preview Edition",
        body: [
          "Our official voice assistant hardware created for ESPHome includes an aux port and a beautiful encoder to control the volume in style.",
        ],
        linksLabel: "Learn more &amp; buy",
        links: [{ label: "Home Assistant", url: "https://www.home-assistant.io/voice-pe/" }],
      },
    ],
  },
  {
    id: "irrf",
    name: "Infrared &amp; radio frequency proxy",
    description: "Create a device to allow Home Assistant to control infrared and radio frequency devices.",
    devicePrompt: "Pick the device you want to turn into an infrared or radio frequency proxy:",
    advanced: { component: "ir_rf_proxy", githubUrl: "https://github.com/esphome/rf-proxies" },
    devices: [
      {
        id: "xiao-ir-mate",
        image: "/projects/irrf-proxy/xiao-ir-mate.png",
        imageAlt: "XIAO IR Mate",
        manifestRoot: "https://firmware.esphome.io/infrared-proxy",
        githubUrl: "https://github.com/esphome/infrared-proxies",
        title: "Xiao IR Mate",
        body: ["Small but powerful infrared emitter."],
        linksLabel: "Learn more &amp; buy",
        links: [
          {
            label: "Seeed Studio",
            url: "https://www.seeedstudio.com/XIAO-Smart-IR-Mate-p-6492.html",
          },
        ],
      },
      {
        id: "m5stack-atom-echo",
        image: "/projects/irrf-proxy/m5stack-atom-echo.png",
        imageAlt: "M5Stack Atom Lite with 433MHz RF Unit",
        manifestRoot: "https://firmware.esphome.io/rf-proxy",
        title: "Radio Frequency Proxy",
        body: [
          "Turn an M5Stack Atom Lite into a 433MHz radio frequency proxy for Home Assistant. Connect the RF Unit to the Atom Lite using the included Grove cable.",
        ],
        linksLabel: "This project requires two devices from M5Stack:",
        links: [
          {
            label: "M5Stack Atom Lite ESP32 Development Kit",
            url: "https://shop.m5stack.com/products/atom-lite-esp32-development-kit",
          },
          {
            label: "M5Stack RF Unit 433MHz Transmitter (SYN115)",
            url: "https://shop.m5stack.com/products/rf-unit-433mhz-transmitter-syn115",
          },
        ],
      },
    ],
  },
  {
    id: "serial",
    name: "Serial &amp; Modbus proxy",
    description: "Create a device to allow Home Assistant to talk to serial and Modbus devices.",
    devicePrompt: "Pick the device you want to turn into a serial proxy:",
    manifestRoot: "https://firmware.esphome.io/serial-proxy",
    advanced: { component: "serial_proxy", githubUrl: "https://github.com/esphome/serial-proxies" },
    devices: [
      {
        id: "atoms3-lite-rs485",
        image: "/projects/serial-proxy/atoms3-lite-rs485.png",
        imageAlt: "M5Stack ATOMIC RS485 Base",
        title: "M5Stack AtomS3 Lite with ATOMIC RS485 Base",
        body: [
          "Turn an M5Stack AtomS3 Lite into an RS-485 proxy for Home Assistant. This lets Home Assistant talk to Modbus and other RS-485 devices over the network. Mount the AtomS3 Lite on the ATOMIC RS485 Base to connect the two.",
        ],
        linksLabel: "This project requires two devices from M5Stack:",
        links: [
          {
            label: "M5Stack AtomS3 Lite ESP32-S3 Development Kit",
            url: "https://shop.m5stack.com/products/atoms3-lite-esp32s3-dev-kit",
          },
          {
            label: "M5Stack ATOMIC RS485 Base",
            url: "https://shop.m5stack.com/products/atomic-rs485-base",
          },
        ],
      },
    ],
  },
  {
    id: "empty",
    name: "Empty ESPHome device",
    description: "No special features built-in. Ready to make it your own.",
    devicePrompt: "Pick the manufacturer of the device you want to set up:",
    installPlacement: "device",
    devices: [
      {
        id: "espressif",
        image: "/projects/empty/espressif.png",
        imageAlt: "Espressif",
        manifest: "https://firmware.esphome.io/esphome-web/manifest.json",
      },
      {
        id: "raspberry",
        image: "/projects/empty/pico-w.png",
        imageAlt: "Raspberry Pi Pico W",
        stepsPrompt: "Installation instructions:",
        steps: [
          "Disconnect your Raspberry Pi Pico from your computer",
          "Hold the BOOTSEL button and connect the Pico to your computer. The Pico will show up as a USB drive named RPI-RP2",
          'Download <a href="https://firmware.esphome.io/esphome-web/pico-w/esphome-web-rp2040.uf2">ESPHome for Pico</a>',
          "Drag the downloaded file to the RPI-RP2 USB drive. The installation is complete when the drive disappears",
          'Connect your Pico to the Wi-Fi network. Once connected, it will automatically show up on your ESPHome dashboard.<br /><button type="button" id="improv-wifi-btn">Configure Wi-Fi</button>',
        ],
      },
    ],
  },
];
