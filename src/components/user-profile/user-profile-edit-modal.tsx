"use client";

import {
  useUpdateProfileMutation,
  type UpdateProfileWithFilesData,
} from "@/hooks/mutation/use-update-profile-mutation";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { profileEditModalSchema, type ProfileEditModalFormData } from "@/components/user-profile/edit-modal/user-profile-edit-schemas";
import { log } from "@/lib/logger/logger";
import { zodResolver } from "@hookform/resolvers/zod";
import type { Tables } from "database.types";
import { usePathname } from "next/navigation";
import { useRef, useState } from "react";
import { FormProvider, useForm } from "react-hook-form";
import { PersonalInfoSection } from "./edit-modal/personal-info-section";
import { ProfileSectionProvider } from "./edit-modal/profile-section-context";
import { SocialMediaSection } from "./edit-modal/social-media-section";
import { TechnologiesSection } from "./edit-modal/technologies-section";

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

  const { handleSubmit } = form;

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
        <FormProvider {...form}>
          <form
            onSubmit={handleSubmit(onSubmit)}
            className='flex flex-col justify-between max-h-[inherit]'
          >
            <DialogHeader className='p-6'>
              <DialogTitle>Edit Profile</DialogTitle>
            </DialogHeader>
            <div className='px-6 overflow-y-auto scrollbar-auto'>
              <ProfileSectionProvider profile={profile}>
                <div className='space-y-6'>
                  <PersonalInfoSection handleImageUpload={handleImageUpload} />
                  <SocialMediaSection />
                  <TechnologiesSection />
                </div>
              </ProfileSectionProvider>
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
        </FormProvider>
      </DialogContent>
    </Dialog>
  );
}
