"use client";

import { Alert, AlertDescription } from "@/components/ui/alert";
import { ImageUploader } from "@/components/ui/image-uploader";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { CameraIcon, ImageIcon, UserIcon } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { Controller, useFormContext } from "react-hook-form";
import type { ProfileEditModalFormData } from "./user-profile-edit-schemas";
import { PERSONAL_INFO_INPUTS } from "./user-profile-edit-inputs";
import { useProfileSectionContext } from "./profile-section-context";

interface PersonalInfoSectionProps {
  handleImageUpload: (
    file: File,
    onChange: (value: string) => void,
    type: "avatar" | "cover"
  ) => void;
}

/**
 * Personal information section component for the profile edit modal
 */
export function PersonalInfoSection({ handleImageUpload }: PersonalInfoSectionProps) {
  const { profile } = useProfileSectionContext();
  const { control, watch, formState } = useFormContext<ProfileEditModalFormData>();
  const { errors } = formState;

  // Watch bio for derived state
  const bio = watch("bio") || "";
  const bioCharCount = 500 - bio.length;

  return (
    <div className='space-y-4'>
      <h3 className='text-sm text-muted-foreground/80'>Personal Information</h3>
      <div className='space-y-6 dark:bg-accent/50 bg-border/70 rounded-lg p-4'>
        <Alert color='info' variant='flat'>
          <AlertDescription className='inline-flex'>
            To edit avatar and username, go to{" "}
            <Link href='/account-settings' className='font-medium underline underline-offset-4'>
              Account Settings
            </Link>
          </AlertDescription>
        </Alert>
        <div className='rounded-none space-y-6 shadow-none border-0 text-muted-foreground/60'>
          <div className='p-0 space-y-6'>
            {/* Avatar */}
            <div className='space-y-2'>
              <Label htmlFor='image_url' className='text-muted-foreground/70'>
                Avatar
              </Label>
              <div className='flex items-center space-x-4'>
                <div className='w-20 h-20 rounded-full overflow-hidden'>
                  <Controller
                    name='image_url'
                    control={control}
                    render={({ field }) => (
                      <>
                        {field.value && (
                          <ImageUploader
                            onImageChange={(file) =>
                              handleImageUpload(file, field.onChange, "avatar")
                            }
                            aspectRatio='1:1'
                            className='relative w-full h-full group'
                            hoverOverlayContent={{
                              icon: CameraIcon,
                              iconSize: 16,
                              text: "Change",
                            }}
                            disabled
                          >
                            <Image
                              src={field.value}
                              alt='Avatar'
                              width={200}
                              height={200}
                              className='w-full h-full object-cover'
                            />
                          </ImageUploader>
                        )}
                        {!field.value && (
                          <ImageUploader
                            onImageChange={(file) =>
                              handleImageUpload(file, field.onChange, "avatar")
                            }
                            aspectRatio='1:1'
                            className='w-full h-full'
                            uploadContent={{
                              icon: UserIcon,
                              iconSize: 16,
                              title: undefined,
                              description: undefined,
                            }}
                          />
                        )}
                      </>
                    )}
                  />
                </div>
                <div className='flex-1'>
                  <p className='text-tiny'>
                    Upload a profile picture to make your profile more personalized.
                  </p>
                  <p className='text-tiny mt-1'>Recommended size: 400x400 pixels.</p>
                </div>
              </div>
            </div>
            {/* Display Name */}
            <Controller
              name='display_name'
              control={control}
              render={({ field }) => (
                <div className='space-y-2'>
                  <Label htmlFor='display_name' className='text-muted-foreground/70'>
                    Display Name
                  </Label>
                  <Input
                    id='display_name'
                    placeholder='Enter your name'
                    disabled
                    variant='flat'
                    {...field}
                    value={field.value || ""}
                  />
                  <p className='text-xs'>This is how your name will appear across the platform</p>
                  {errors.display_name && (
                    <p className='text-xs text-destructive'>{errors.display_name.message}</p>
                  )}
                </div>
              )}
            />
          </div>
        </div>
      </div>
      {/* Cover Image */}
      <div className='space-y-2'>
        <Label htmlFor='cover_image_url'>Cover Image</Label>
        <div className='space-y-4'>
          <div className='w-full rounded-lg overflow-hidden'>
            <Controller
              name='cover_image_url'
              control={control}
              render={({ field }) => (
                <>
                  {field.value ? (
                    <ImageUploader
                      onImageChange={(file) => handleImageUpload(file, field.onChange, "cover")}
                      aspectRatio='11:4'
                      className='relative w-full h-full group'
                      showHoverOverlay={true}
                      hoverOverlayContent={{
                        icon: CameraIcon,
                        iconSize: 24,
                        text: "Click to change",
                      }}
                    >
                      <Image
                        src={field.value}
                        alt='Cover'
                        fill
                        className='w-full h-full object-cover'
                      />
                    </ImageUploader>
                  ) : (
                    <ImageUploader
                      onImageChange={(file) => handleImageUpload(file, field.onChange, "cover")}
                      aspectRatio='11:4'
                      className='w-full h-full'
                      uploadContent={{
                        icon: ImageIcon,
                        iconSize: 24,
                        title: "Click to upload cover image",
                        description: "Recommended size: 1200x400 pixels",
                      }}
                    />
                  )}
                </>
              )}
            />
          </div>
          <div>
            <p className='text-xs text-muted-foreground/80'>
              Upload a cover image to personalize your profile header.
            </p>
          </div>
        </div>
      </div>
      {/* Bio */}
      <Controller
        name='bio'
        control={control}
        render={({ field }) => (
          <div className='space-y-2'>
            <Label htmlFor='bio'>Biography</Label>
            <Textarea
              id='bio'
              placeholder='Tell us about yourself...'
              rows={5}
              variant='flat'
              {...field}
              value={field.value || ""}
            />
            <div className='flex justify-between'>
              <p className='text-xs text-muted-foreground'>{bioCharCount} characters remaining</p>
              {errors.bio && <p className='text-xs text-destructive'>{errors.bio.message}</p>}
            </div>
          </div>
        )}
      />
      {/* Personal Info Fields */}
      {PERSONAL_INFO_INPUTS.map((fieldConfig) => {
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
              <div className='space-y-2'>
                <Label htmlFor={fieldConfig.name}>{fieldConfig.label}</Label>
                <div className={hasIcon ? "relative" : undefined}>
                  {hasIcon && IconComponent && (
                    <div className='absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground'>
                      <IconComponent />
                    </div>
                  )}
                  <Input
                    id={fieldConfig.name}
                    placeholder={placeholder}
                    className={hasIcon ? "pl-9" : undefined}
                    variant='flat'
                    type={fieldConfig.type}
                    {...field}
                    value={field.value || ""}
                  />
                </div>
                {errors[fieldConfig.name] && (
                  <p className='text-xs text-destructive'>{errors[fieldConfig.name]?.message}</p>
                )}
              </div>
            )}
          />
        );
      })}
    </div>
  );
}
