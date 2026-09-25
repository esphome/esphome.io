export interface HeaderNavItem {
  label: string;
  href: string;
}

// Header navigation items rendered to the left of the social icons.
// Add or reorder entries here to change the header nav.
export const headerNavItems: HeaderNavItem[] = [
  { label: "Components", href: "/components/" },
  { label: "ESPHome Starter Kit", href: "/starter-kit/" },
  { label: "Blog", href: "/blog/" },
];
