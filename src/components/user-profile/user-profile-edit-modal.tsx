"use client";

import {
  useUpdateProfileMutation,
  type UpdateProfileWithFilesData,
} from "@/hooks/mutation/use-update-profile-mutation";

import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription } from "@/components/ui/alert";
import Image from "next/image";
import { CameraIcon, GlobeIcon, ImageIcon, UserIcon } from "lucide-react";
import { SiGithub } from "@icons-pack/react-simple-icons";
import { ImageUploader } from "@/components/ui/image-uploader";
import type { TechnologyId } from "@/lib/technologies";
import { TechnologySelector } from "./technology-selector";
import type { Tables } from "database.types";
import Link from "next/link";
import { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { LinkedInIcon } from "@/components/ui/icons/LinkedInIcon";
import { log } from "@/lib/logger/logger";

interface UserProfileEditModalProps {
  onClose: () => void;
  profile: Tables<"users">;
  onSave: (data: Tables<"users">) => void;
}

export function UserProfileEditModal({ onClose, profile, onSave }: UserProfileEditModalProps) {
  // Replace form state with react-hook-form
  const form = useForm<Tables<"users">>({
    defaultValues: {
      ...profile,
      bio: profile.bio || "",
      location: profile.location || "",
      website: profile.website || "",
      image_url: profile.image_url || "",
      cover_image_url: profile.cover_image_url || "",
      top_technologies: profile.top_technologies || [],
      github_url: profile.github_url || "",
      linkedin_url: profile.linkedin_url || "",
    },
    mode: "onChange",
  });

  // State to store file objects for upload
  const [imageFile, setImageFile] = useState<File | undefined>();
  const [coverImageFile, setCoverImageFile] = useState<File | undefined>();

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

    // Store file for later upload
    if (type === "avatar") {
      setImageFile(file);
    } else {
      setCoverImageFile(file);
    }
  }

  // Handle save with react-hook-form's handleSubmit
  const onSubmit = (data: Tables<"users">) => {
    const mutationData: UpdateProfileWithFilesData = {
      ...data,
      imageFile,
      coverImageFile,
      currentImageUrl: profile.image_url || undefined,
      currentCoverImageUrl: profile.cover_image_url || undefined,
    };

    updateProfileMutation.mutate(mutationData);
  };

  return (
    <Dialog open={true} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <form onSubmit={handleSubmit(onSubmit)}>
          <DialogHeader>
            <DialogTitle>Edit Profile</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <div className='space-y-6'>
                  <Alert variant="default" className="bg-primary/10 text-primary border-primary/20">
                    <AlertDescription>
                      To edit avatar and username, go to{" "}
                      <Link
                        href='/account-settings'
                        className='font-medium underline underline-offset-4'
                      >
                        Account Settings
                      </Link>
                    </AlertDescription>
                  </Alert>
                  <Card className='rounded-none space-y-6 shadow-none border-0'>
                    <CardContent className="p-0 space-y-6">
                    {/* Avatar */}
                    <div className='space-y-2'>
                      <p className='text-small font-medium'>Profile Picture</p>
                      <div className='flex items-center space-x-4'>
                        <div className='w-20 h-20 rounded-full overflow-hidden'>
                          <Controller
                            name='image_url'
                            control={control}
                            render={({ field }) => (
                              <>
                                {field.value ? (
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
                                      className='w-full h-full object-cover'
                                    />
                                  </ImageUploader>
                                ) : (
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
                          <p className='text-tiny text-default-500'>
                            Upload a profile picture to make your profile more personalized.
                          </p>
                          <p className='text-tiny text-default-500 mt-1'>
                            Recommended size: 400x400 pixels.
                          </p>
                        </div>
                      </div>
                    </div>
                    {/* Display Name */}
                    <Controller
                      name='display_name'
                      control={control}
                      rules={{
                        required: "Display name is required",
                        maxLength: {
                          value: 50,
                          message: "Display name cannot exceed 50 characters",
                        },
                      }}
                      render={({ field }) => (
                        <div className="space-y-2">
                          <Label htmlFor="display_name">Display Name</Label>
                          <Input
                            id="display_name"
                            placeholder='Enter your name'
                            disabled
                            {...field}
                            value={field.value || ""}
                          />
                          <p className="text-xs text-muted-foreground">This is how your name will appear across the platform</p>
                          {errors.display_name && <p className="text-xs text-destructive">{errors.display_name.message}</p>}
                        </div>
                      )}
                    />
                    </CardContent>
                  </Card>
                  {/* Cover Image */}
                  <div className='space-y-2'>
                    <p className='text-small font-medium'>Cover Image</p>
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
                        <p className='text-tiny text-default-500'>
                          Upload a cover image to personalize your profile header.
                        </p>
                      </div>
                    </div>
                  </div>
                  {/* Bio */}
                  <Controller
                    name='bio'
                    control={control}
                    rules={{
                      maxLength: {
                        value: 500,
                        message: "Bio cannot exceed 500 characters",
                      },
                    }}
                    render={({ field }) => (
                      <div className="space-y-2">
                        <Label htmlFor="bio">Biography</Label>
                        <Textarea
                          id="bio"
                          placeholder='Tell us about yourself...'
                          rows={5}
                          {...field}
                          value={field.value || ""}
                        />
                        <div className="flex justify-between">
                          <p className="text-xs text-muted-foreground">{bioCharCount} characters remaining</p>
                          {errors.bio && <p className="text-xs text-destructive">{errors.bio.message}</p>}
                        </div>
                      </div>
                    )}
                  />
                  {/* Location */}
                  <Controller
                    name='location'
                    control={control}
                    render={({ field }) => (
                      <div className="space-y-2">
                        <Label htmlFor="location">Location</Label>
                        <Input
                          id="location"
                          placeholder='e.g., San Francisco, CA'
                          {...field}
                          value={field.value || ""}
                        />
                      </div>
                    )}
                  />
                  {/* Website */}
                  <Controller
                    name='website'
                    control={control}
                    rules={{
                      pattern: {
                        value:
                          /^(https?:\/\/)?(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)$/,
                        message: "Please enter a valid URL",
                      },
                    }}
                    render={({ field }) => (
                      <div className="space-y-2">
                        <Label htmlFor="website">Website</Label>
                        <div className="relative">
                          <GlobeIcon className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                          <Input
                            id="website"
                            placeholder='https://yourwebsite.com'
                            className="pl-9"
                            {...field}
                            value={field.value || ""}
                          />
                        </div>
                        {errors.website && <p className="text-xs text-destructive">{errors.website.message}</p>}
                      </div>
                    )}
                  />
                  {/* Social Media Links */}
                  {/* GitHub */}
                  <Controller
                    name='github_url'
                    control={control}
                    rules={{
                      pattern: {
                        value: /^(https?:\/\/)?(www\.)?github\.com\/[a-zA-Z0-9-]+\/?$/,
                        message: "Please enter a valid GitHub profile URL",
                      },
                    }}
                    render={({ field }) => (
                      <div className="space-y-2">
                        <Label htmlFor="github_url">GitHub Profile</Label>
                        <div className="relative">
                          <div className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground">
                             <SiGithub size={16} />
                          </div>
                          <Input
                            id="github_url"
                            placeholder={`https://github.com/${profile.username}`}
                            className="pl-9"
                            {...field}
                            value={field.value || ""}
                          />
                        </div>
                        {errors.github_url && <p className="text-xs text-destructive">{errors.github_url.message}</p>}
                      </div>
                    )}
                  />
                  {/* LinkedIn */}
                  <Controller
                    name='linkedin_url'
                    control={control}
                    rules={{
                      pattern: {
                        value:
                          /^(https?:\/\/)?(www\.)?linkedin\.com\/(in\/[a-zA-Z0-9-]+\/?|company\/[a-zA-Z0-9-]+\/?)$/,
                        message: "Please enter a valid LinkedIn profile URL",
                      },
                    }}
                    render={({ field }) => (
                      <div className="space-y-2">
                        <Label htmlFor="linkedin_url">LinkedIn Profile</Label>
                        <div className="relative">
                          <div className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground">
                            <LinkedInIcon size={16} fill="currentColor" />
                          </div>
                          <Input
                            id="linkedin_url"
                            placeholder={`https://linkedin.com/in/${profile.username}`}
                            className="pl-9"
                            {...field}
                            value={field.value || ""}
                          />
                        </div>
                        {errors.linkedin_url && <p className="text-xs text-destructive">{errors.linkedin_url.message}</p>}
                      </div>
                    )}
                  />
                  {/* Top Technologies */}
                  <Controller
                    name='top_technologies'
                    control={control}
                    render={({ field }) => (
                      <TechnologySelector
                        initialTechnologies={field.value as TechnologyId[]}
                        onTechnologiesChange={field.onChange}
                      />
                    )}
                  />
                </div>
              </div>
              <DialogFooter>
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
