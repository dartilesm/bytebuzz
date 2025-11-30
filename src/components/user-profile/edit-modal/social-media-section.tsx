"use client";

import { Controller, useFormContext } from "react-hook-form";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { useProfileSectionContext } from "@/components/user-profile/edit-modal/profile-section-context";
import { SOCIAL_MEDIA_INPUTS } from "@/components/user-profile/edit-modal/user-profile-edit-inputs";
import type { ProfileEditModalFormData } from "@/components/user-profile/edit-modal/user-profile-edit-schemas";

interface SocialMediaSectionProps {
  id: string;
}

/**
 * Social media profiles section component for the profile edit modal
 */
export function SocialMediaSection({ id }: SocialMediaSectionProps) {
  const { profile } = useProfileSectionContext();
  const { control, formState } = useFormContext<ProfileEditModalFormData>();
  const { errors } = formState;

  return (
    <div id={id} className="space-y-4">
      <Separator />
      <div className="space-y-4">
        <h3 className="text-sm text-muted-foreground/80">Social Profiles</h3>
        <div className="space-y-4">
          {SOCIAL_MEDIA_INPUTS.map((fieldConfig) => {
            const placeholder =
              typeof fieldConfig.placeholder === "function"
                ? fieldConfig.placeholder(profile.username)
                : fieldConfig.placeholder;
            const hasIcon = "icon" in fieldConfig && fieldConfig.icon !== undefined;
            const IconComponent = hasIcon ? fieldConfig.icon : null;

            return (
              <Controller
                key={fieldConfig.name}
                name={fieldConfig.name}
                control={control}
                render={({ field }) => (
                  <div className="space-y-2">
                    <Label htmlFor={fieldConfig.name}>{fieldConfig.label}</Label>
                    <div className={hasIcon ? "relative" : undefined}>
                      {hasIcon && IconComponent && (
                        <div className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground">
                          <IconComponent />
                        </div>
                      )}
                      <Input
                        id={fieldConfig.name}
                        placeholder={placeholder}
                        className={hasIcon ? "pl-9" : undefined}
                        variant="flat"
                        type={fieldConfig.type}
                        {...field}
                        value={field.value || ""}
                      />
                    </div>
                    {errors[fieldConfig.name] && (
                      <p className="text-xs text-destructive">
                        {errors[fieldConfig.name]?.message}
                      </p>
                    )}
                  </div>
                )}
              />
            );
          })}
        </div>
      </div>
    </div>
  );
}
