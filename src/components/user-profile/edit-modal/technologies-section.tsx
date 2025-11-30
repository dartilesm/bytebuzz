"use client";

import { Controller, useFormContext } from "react-hook-form";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import type { ProfileEditModalFormData } from "@/components/user-profile/edit-modal/user-profile-edit-schemas";
import { TechnologySelector } from "@/components/user-profile/technology-selector";
import type { TechnologyId } from "@/lib/technologies";

interface TechnologiesSectionProps {
  id: string;
}

/**
 * Technologies section component for the profile edit modal
 */
export function TechnologiesSection({ id }: TechnologiesSectionProps) {
  const { control } = useFormContext<ProfileEditModalFormData>();

  return (
    <div id={id} className="space-y-4">
      <Separator />
      <div className="space-y-4">
        <h3 className="text-sm text-muted-foreground/80">Technologies</h3>
        <Controller
          name="top_technologies"
          control={control}
          render={({ field }) => (
            <div className="space-y-2">
              <Label htmlFor="top_technologies">Top Technologies</Label>
              <TechnologySelector
                initialTechnologies={(field.value || []) as TechnologyId[]}
                onTechnologiesChange={field.onChange}
              />
            </div>
          )}
        />
      </div>
    </div>
  );
}
