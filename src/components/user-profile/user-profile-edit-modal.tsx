"use client";

import {
  useUpdateProfileMutation,
  type UpdateProfileWithFilesData,
} from "@/hooks/mutation/use-update-profile-mutation";

import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ImageUploader } from "@/components/ui/image-uploader";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { profileEditModalSchema, type ProfileEditModalFormData } from "@/components/user-profile/edit-modal/user-profile-edit-schemas";
import { log } from "@/lib/logger/logger";
import type { TechnologyId } from "@/lib/technologies";
import { zodResolver } from "@hookform/resolvers/zod";
import type { Tables } from "database.types";
import { CameraIcon, ImageIcon, UserIcon } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useRef, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { TechnologySelector } from "./technology-selector";
import { PERSONAL_INFO_INPUTS, SOCIAL_MEDIA_INPUTS } from "@/components/user-profile/edit-modal/user-profile-edit-inputs";
import { Separator } from "@/components/ui/separator";

interface UserProfileEditModalProps {
  onClose: () => void;
  profile: Tables<"users">;
  onSave: (data: Tables<"users">) => void;
}

export function UserProfileEditModal({ onClose, profile, onSave }: UserProfileEditModalProps) {
  const form = useForm<ProfileEditModalFormData>({
    resolver: zodResolver(profileEditModalSchema),
    defaultValues: {
      display_name: profile.display_name || "",
      bio: profile.bio || "",
      location: profile.location || "",
      website: profile.website || "",
      image_url: profile.image_url || "",
      cover_image_url: profile.cover_image_url || "",
      top_technologies: (profile.top_technologies || []) as string[],
      github_url: profile.github_url || "",
      linkedin_url: profile.linkedin_url || "",
    },
    mode: "onChange",
  });

  // State to store file objects for upload
  const [imageFile, setImageFile] = useState<File | undefined>();
  const [coverImageFile, setCoverImageFile] = useState<File | undefined>();

  // Track pathname to detect route changes and close modal naturally
  const pathname = usePathname();
  const initialPathnameRef = useRef<string>(pathname);

  if (pathname !== initialPathnameRef.current) onClose();

  const {
    control,
    handleSubmit,
    watch,
    formState: { errors },
  } = form;

  // Watch bio for derived state
  const bio = watch("bio") || "";
  const bioCharCount = 500 - bio.length;

  // Use the update profile mutation
  const updateProfileMutation = useUpdateProfileMutation({
    onSuccess: (response) => {
      if (response.data) {
        onSave(response.data);
        onClose();
      }
    },
    onError: (error) => {
      log.error("Failed to update profile", { error });
    },
  });

  /**
   * Handle image upload by creating blob URL for immediate preview
   */
  function handleImageUpload(
    file: File,
    onChange: (value: string) => void,
    type: "avatar" | "cover"
  ): void {
    // Create blob URL for immediate preview
    const blobUrl = URL.createObjectURL(file);
    onChange(blobUrl);

    if (type === "avatar") return setImageFile(file);
    return setCoverImageFile(file);
  }

  // Handle save with react-hook-form's handleSubmit
  const onSubmit = (data: ProfileEditModalFormData) => {
    const mutationData: UpdateProfileWithFilesData = {
      ...data,
      imageFile,
      coverImageFile,
      currentImageUrl: profile.image_url || undefined,
      currentCoverImageUrl: profile.cover_image_url || undefined,
    } as Tables<"users"> & UpdateProfileWithFilesData;

    updateProfileMutation.mutate(mutationData);
  };

  return (
    <Dialog open={true} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className='max-w-2xl max-h-[90vh] p-0 overflow-hidden'>
        <form
          onSubmit={handleSubmit(onSubmit)}
          className='flex flex-col justify-between max-h-[inherit]'
        >
          <DialogHeader className='p-6'>
            <DialogTitle>Edit Profile</DialogTitle>
          </DialogHeader>
          <div className='py-4 px-6 overflow-y-auto scrollbar-auto'>
            <div className='space-y-6'>
              <div className='space-y-6 dark:bg-accent/50 bg-border/70 rounded-lg p-4'>
                <Alert color='info' variant='flat'>
                  <AlertDescription className='inline-flex'>
                    To edit avatar and username, go to{" "}
                    <Link
                      href='/account-settings'
                      className='font-medium underline underline-offset-4'
                    >
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
                          <p className='text-xs'>
                            This is how your name will appear across the platform
                          </p>
                          {errors.display_name && (
                            <p className='text-xs text-destructive'>
                              {errors.display_name.message}
                            </p>
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
                              onImageChange={(file) =>
                                handleImageUpload(file, field.onChange, "cover")
                              }
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
                              onImageChange={(file) =>
                                handleImageUpload(file, field.onChange, "cover")
                              }
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
                      <p className='text-xs text-muted-foreground'>
                        {bioCharCount} characters remaining
                      </p>
                      {errors.bio && (
                        <p className='text-xs text-destructive'>{errors.bio.message}</p>
                      )}
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
                          <p className='text-xs text-destructive'>
                            {errors[fieldConfig.name]?.message}
                          </p>
                        )}
                      </div>
                    )}
                  />
                );
              })}
              {/* Social Media Section */}
              <div className='space-y-4'>
                <Separator />
                <div className='space-y-4'>
                  <h3 className='text-sm text-muted-foreground/80'>Social Profiles</h3>
                  <div className='space-y-4'>
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
                                <p className='text-xs text-destructive'>
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
              {/* Technologies Section */}
              <div className='space-y-4'>
                <Separator />
                <div className='space-y-4'>
                  <h3 className='text-sm font-semibold text-foreground'>Technologies</h3>
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
            </div>
          </div>
          <DialogFooter className='bg-background px-6 py-4'>
            <Button variant='ghost' onClick={onClose}>
              Cancel
            </Button>
            <Button
              type='submit'
              variant='default'
              disabled={updateProfileMutation.isPending || !form.formState.isValid}
            >
              {updateProfileMutation.isPending ? "Saving..." : "Save Changes"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
