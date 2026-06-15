import { SiDiscord, SiGithub } from "react-icons/si";
import type { IconType } from "react-icons";

export interface Link {
  label: string;
  href: string;
  icon: IconType;
}

export const links: Link[] = [
  { label: "github", href: "https://github.com/accurs", icon: SiGithub },
  { label: "discord", href: "https://discord.com/users/604463848526708757", icon: SiDiscord },
];
