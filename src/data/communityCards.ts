export interface CommunityCard {
  href: string;
  text: string;
  author: string;
  authorImage?: string;
  authorImageAlt?: string;
  linkIcon?: string;
  quote?: boolean;
  backgroundImage?: string;
  backgroundImageAlt?: string;
  video?: string;
  videoPoster?: string;
}

export const starterKitCommunityCards: CommunityCard[] = [
  {
    href: "https://www.howmation.com/en_US/blog/article/esphome-starter-kit-first-official-kit-to-get-started-40-dollars",
    text: "“The best entry point the ecosystem has ever offered.”",
    author: "Valentin Goudet, Howmation",
    authorImage: "/images/community-cards/howmation.webp",
    authorImageAlt: "Howmation logo",
    quote: true,
    linkIcon: "/images/community-cards/document-icon.png",
  },
  {
    href: "https://youtu.be/ffafRPl47n8",
    text: "“This was really fun to try out! I can’t wait to build more with ESPHome.”",
    author: "Reed, SmartHomeSolver",
    videoPoster: "/images/community-cards/smart-home-solver-thumb.webp",
    video: "/videos/community-cards/smart-home-solver-thumb.webm",
  },
  {
    href: "https://smarthomescene.com/blog/learning-esphome-with-apollo-automations-starter-kit/",
    text: "“If you want to actually learn ESPHome instead of just using devices that run it, this is about as approachable as it gets.”",
    author: "SmartHomeScene",
    authorImage: "/images/community-cards/smart-home-scene.webp",
    authorImageAlt: "SmartHomeScene logo",
    quote: true,
    linkIcon: "/images/community-cards/document-icon.png",
  },
  {
    href: "https://youtu.be/eVlGn-xsrYY",
    text: "“If you’re curious about building your own smart home tech and soldering was the wall, this is the easiest entry.”",
    author: "Vaclav Chaloupka",
    videoPoster: "/images/community-cards/vaclav-chaloupka-thumb.webp",
    video: "/videos/community-cards/vaclav-chaloupka-thumb.webm",
  },
  {
    href: "https://youtu.be/bxuXUZ_5c9Q",
    text: "“It’s been absolutely fantastic playing with this new ESPHome device, it makes it just so simple.”",
    author: "Simon Says Home Assistant",
    videoPoster: "/images/community-cards/simon-says-home-assistant-thumb.webp",
    video: "/videos/community-cards/simon-says-home-assistant-thumb.webm",
  },
  {
    href: "https://www.matteralpha.com/news/esphome-starter-kit-apollo-hands-on",
    text: "“The kit removes much of the hardware guesswork...”",
    author: "Ward Zhou, Matter Alpha",
    authorImage: "/images/community-cards/matter-alpha.webp",
    authorImageAlt: "Matter Alpha logo",
    quote: true,
    linkIcon: "/images/community-cards/document-icon.png",
  },
  {
    href: "https://youtu.be/jidUThxw4WE",
    text: "“There are so many things you can do with this kit, and I’m just scratching the surface.”",
    author: "mostlychris",
    videoPoster: "/images/community-cards/mostlychris-thumb.webp",
    video: "/videos/community-cards/mostlychris-thumb.webm",
  },
  {
    href: "https://www.hackster.io/news/the-first-official-esphome-starter-kit-launches-today-413ae98b86e1",
    text: "“Giving beginners a way to build useful smart home hardware without soldering or writing a single line of code.”",
    author: "Nick Bild, Hackster.io",
    authorImage: "/images/community-cards/hackster.webp",
    authorImageAlt: "Hackster.io logo",
    quote: true,
    linkIcon: "/images/community-cards/document-icon.png",
  },
  {
    href: "https://www.notebookcheck.net/Apollo-Automation-s-ESPHome-starter-kit-offers-flexible-local-smart-home-control.1367383.0.html",
    text: "“Thanks to a visual editor, no actual programming or manual coding is required.”",
    author: "Notebookcheck",
    authorImage: "/images/community-cards/notebookcheck.webp",
    authorImageAlt: "Notebookcheck logo",
    quote: true,
    linkIcon: "/images/community-cards/document-icon.png",
  },
  {
    href: "https://youtu.be/jnymd-vTQIE",
    text: "“Definitely if you haven’t messed with ESPHome this is a good place for you to start.”",
    author: "digiblur DIY",
    videoPoster: "/images/community-cards/digiblur-thumb.webp",
    video: "/videos/community-cards/digiblur-thumb.webm",
  },
];
