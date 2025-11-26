"use client";

import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import type { TechnologyId } from "@/lib/technologies";
import { Controller, useFormContext } from "react-hook-form";
import { TechnologySelector } from "../technology-selector";
import type { ProfileEditModalFormData } from "./user-profile-edit-schemas";

/**
 * Technologies section component for the profile edit modal
 */
export function TechnologiesSection() {
    const { control } = useFormContext<ProfileEditModalFormData>();

    return (
        <div className='space-y-4'>
            <Separator />
            <div className='space-y-4'>
                <h3 className='text-sm text-muted-foreground/80'>Technologies</h3>
                <Controller
                    name='top_technologies'
                    control={control}
                    render={({ field }) => (
                        <div className='space-y-2'>
                            <Label htmlFor='top_technologies'>Top Technologies</Label>
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

