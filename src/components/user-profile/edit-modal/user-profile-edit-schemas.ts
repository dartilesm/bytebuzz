import * as z from "zod";

export type ProfileEditModalFormData = z.infer<typeof profileEditModalSchema>;

/**
 * Zod schema for profile form validation
 */
export const profileEditModalSchema = z.object({
  display_name: z
    .string()
    .min(1, "Display name is required")
    .max(50, "Display name cannot exceed 50 characters"),
  bio: z.string().max(500, "Bio cannot exceed 500 characters").optional(),
  location: z.string().optional(),
  website: z
    .string()
    .regex(
      /^(https?:\/\/)?(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)$/,
      "Please enter a valid URL",
    )
    .optional()
    .or(z.literal("")),
  github_url: z
    .string()
    .regex(
      /^(https?:\/\/)?(www\.)?github\.com\/[a-zA-Z0-9-]+\/?$/,
      "Please enter a valid GitHub profile URL",
    )
    .optional()
    .or(z.literal("")),
  linkedin_url: z
    .string()
    .regex(
      /^(https?:\/\/)?(www\.)?linkedin\.com\/(in\/[a-zA-Z0-9-]+\/?|company\/[a-zA-Z0-9-]+\/?)$/,
      "Please enter a valid LinkedIn profile URL",
    )
    .optional()
    .or(z.literal("")),
  image_url: z.string().optional(),
  cover_image_url: z.string().optional(),
  top_technologies: z.array(z.string()).optional(),
});
