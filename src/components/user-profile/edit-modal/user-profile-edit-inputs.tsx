import { SiGithub } from "@icons-pack/react-simple-icons";
import { GlobeIcon } from "lucide-react";
import type { ReactNode, SVGProps } from "react";
import { LinkedInIcon } from "@/components/ui/icons/LinkedInIcon";
import type { ProfileEditModalFormData } from "@/components/user-profile/edit-modal/user-profile-edit-schemas";

type UserProfileEditInput = {
  name: keyof ProfileEditModalFormData;
  label: string;
  placeholder: string | ((username: string) => string);
  type: "text" | "url";
  icon?: (props: SVGProps<SVGSVGElement>) => ReactNode;
};

/**
 * Personal information inputs (Location, Website)
 */
export const PERSONAL_INFO_INPUTS: UserProfileEditInput[] = [
  {
    name: "location",
    label: "Location",
    placeholder: "e.g., San Francisco, CA",
    type: "text",
  },
  {
    name: "website",
    label: "Website",
    placeholder: "https://yourwebsite.com",
    type: "url",
    icon: () => <GlobeIcon size={16} />,
  },
];

/**
 * Social media profile inputs (GitHub, LinkedIn)
 */
export const SOCIAL_MEDIA_INPUTS: UserProfileEditInput[] = [
  {
    name: "github_url",
    label: "GitHub Profile",
    placeholder: (username: string) => `https://github.com/${username}`,
    type: "url",
    icon: () => <SiGithub size={16} />,
  },
  {
    name: "linkedin_url",
    label: "LinkedIn Profile",
    placeholder: (username: string) => `https://linkedin.com/in/${username}`,
    type: "url",
    icon: () => <LinkedInIcon size={16} fill="currentColor" />,
  },
];

/**
 * All inputs combined (for backward compatibility if needed)
 */
export const USER_PROFILE_EDIT_INPUTS: UserProfileEditInput[] = [
  ...PERSONAL_INFO_INPUTS,
  ...SOCIAL_MEDIA_INPUTS,
];
