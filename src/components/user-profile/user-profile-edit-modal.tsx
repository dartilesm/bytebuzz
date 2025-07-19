"use client";

import {
  useUpdateProfileMutation,
  type UpdateProfileWithFilesData,
} from "@/hooks/mutation/use-update-profile-mutation";
import {
  Alert,
  Button,
  Card,
  Image,
  Input,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  Textarea,
} from "@heroui/react";
import { CameraIcon, GlobeIcon, ImageIcon, UserIcon } from "lucide-react";
import { ImageUploader } from "@/components/ui/image-uploader";
import type { Tables } from "database.types";
import Link from "next/link";
import { useState } from "react";
import { Controller, useForm } from "react-hook-form";

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
      console.error("Failed to update profile:", error);
    },
  });

  /**
   * Handle image upload by creating blob URL for immediate preview
   */
  function handleImageUpload(
    file: File,
    onChange: (value: string) => void,
    type: "avatar" | "cover",
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
      username: data.username,
      display_name: data.display_name,
      bio: data.bio || undefined,
      location: data.location || undefined,
      website: data.website || undefined,
      image_url: data.image_url || undefined,
      cover_image_url: data.cover_image_url || undefined,
      imageFile,
      coverImageFile,
      currentImageUrl: profile.image_url || undefined,
      currentCoverImageUrl: profile.cover_image_url || undefined,
    };

    updateProfileMutation.mutate(mutationData);
  };

  return (
    <Modal onClose={onClose} size="xl" scrollBehavior="inside" defaultOpen backdrop="blur">
      <form onSubmit={handleSubmit(onSubmit)}>
        <ModalContent>
          {(onModalClose) => (
            <>
              <ModalHeader className="flex flex-col gap-1">Edit Profile</ModalHeader>
              <ModalBody>
                <div className="space-y-6">
                  <Alert
                    color="primary"
                    description={
                      <span>
                        To edit avatar and username, go to{" "}
                        <Link
                          href="/account-settings"
                          className="[font-size:inherit] text-inherit underline"
                        >
                          Account Settings
                        </Link>
                      </span>
                    }
                  />
                  <Card isDisabled className="rounded-none space-y-6 shadow-none">
                    {/* Avatar */}
                    <div className="space-y-2">
                      <p className="text-small font-medium">Profile Picture</p>
                      <div className="flex items-center space-x-4">
                        <div className="w-20 h-20 rounded-full overflow-hidden">
                          <Controller
                            name="image_url"
                            control={control}
                            render={({ field }) => (
                              <>
                                {field.value ? (
                                  <ImageUploader
                                    onImageChange={(file) =>
                                      handleImageUpload(file, field.onChange, "avatar")
                                    }
                                    aspectRatio="1:1"
                                    className="relative w-full h-full group"
                                    hoverOverlayContent={{
                                      icon: CameraIcon,
                                      iconSize: 16,
                                      text: "Change",
                                    }}
                                    disabled
                                  >
                                    <Image
                                      src={field.value}
                                      alt="Avatar"
                                      className="w-full h-full object-cover"
                                      removeWrapper
                                    />
                                  </ImageUploader>
                                ) : (
                                  <ImageUploader
                                    onImageChange={(file) =>
                                      handleImageUpload(file, field.onChange, "avatar")
                                    }
                                    aspectRatio="1:1"
                                    className="w-full h-full"
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
                        <div className="flex-1">
                          <p className="text-tiny text-default-500">
                            Upload a profile picture to make your profile more personalized.
                          </p>
                          <p className="text-tiny text-default-500 mt-1">
                            Recommended size: 400x400 pixels.
                          </p>
                        </div>
                      </div>
                    </div>
                    {/* Display Name */}
                    <Controller
                      name="display_name"
                      control={control}
                      disabled
                      rules={{
                        required: "Display name is required",
                        maxLength: {
                          value: 50,
                          message: "Display name cannot exceed 50 characters",
                        },
                      }}
                      render={({ field }) => (
                        <Input
                          label="Display Name"
                          placeholder="Enter your name"
                          isRequired
                          isInvalid={!!errors.display_name}
                          errorMessage={errors.display_name?.message}
                          description="This is how your name will appear across the platform"
                          isDisabled
                          classNames={{
                            label: "top-0 pt-[inherit]",
                          }}
                          {...field}
                          value={field.value || ""}
                        />
                      )}
                    />
                  </Card>
                  {/* Cover Image */}
                  <div className="space-y-2">
                    <p className="text-small font-medium">Cover Image</p>
                    <div className="space-y-4">
                      <div className="w-full rounded-lg overflow-hidden">
                        <Controller
                          name="cover_image_url"
                          control={control}
                          render={({ field }) => (
                            <>
                              {field.value ? (
                                <ImageUploader
                                  onImageChange={(file) =>
                                    handleImageUpload(file, field.onChange, "cover")
                                  }
                                  aspectRatio="11:4"
                                  className="relative w-full h-full group"
                                  showHoverOverlay={true}
                                  hoverOverlayContent={{
                                    icon: CameraIcon,
                                    iconSize: 24,
                                    text: "Click to change",
                                  }}
                                >
                                  <Image
                                    src={field.value}
                                    alt="Cover"
                                    className="w-full h-full object-cover"
                                    removeWrapper
                                  />
                                </ImageUploader>
                              ) : (
                                <ImageUploader
                                  onImageChange={(file) =>
                                    handleImageUpload(file, field.onChange, "cover")
                                  }
                                  aspectRatio="11:4"
                                  className="w-full h-full"
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
                        <p className="text-tiny text-default-500">
                          Upload a cover image to personalize your profile header.
                        </p>
                      </div>
                    </div>
                  </div>
                  {/* Bio */}
                  <Controller
                    name="bio"
                    control={control}
                    rules={{
                      maxLength: {
                        value: 500,
                        message: "Bio cannot exceed 500 characters",
                      },
                    }}
                    render={({ field }) => (
                      <Textarea
                        label="Biography"
                        placeholder="Tell us about yourself..."
                        maxRows={5}
                        isInvalid={!!errors.bio}
                        errorMessage={errors.bio?.message}
                        description={`${bioCharCount} characters remaining`}
                        {...field}
                        value={field.value || ""}
                      />
                    )}
                  />
                  {/* Location */}
                  <Controller
                    name="location"
                    control={control}
                    render={({ field }) => (
                      <Input
                        label="Location"
                        placeholder="e.g., San Francisco, CA"
                        {...field}
                        value={field.value || ""}
                        classNames={{
                          label: "top-0 pt-[inherit]",
                        }}
                      />
                    )}
                  />
                  {/* Website */}
                  <Controller
                    name="website"
                    control={control}
                    rules={{
                      pattern: {
                        value:
                          /^(https?:\/\/)?(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)$/,
                        message: "Please enter a valid URL",
                      },
                    }}
                    render={({ field }) => (
                      <Input
                        label="Website"
                        placeholder="https://yourwebsite.com"
                        isInvalid={!!errors.website}
                        errorMessage={errors.website?.message}
                        startContent={<GlobeIcon className="text-default-400" size={16} />}
                        classNames={{
                          label: "top-0 pt-[inherit]",
                        }}
                        {...field}
                        value={field.value || ""}
                      />
                    )}
                  />
                </div>
              </ModalBody>
              <ModalFooter>
                <Button color="default" variant="flat" onPress={onModalClose}>
                  Cancel
                </Button>
                <Button
                  type="submit"
                  color="primary"
                  isLoading={updateProfileMutation.isPending}
                  isDisabled={updateProfileMutation.isPending}
                >
                  {updateProfileMutation.isPending ? "Saving..." : "Save Changes"}
                </Button>
              </ModalFooter>
              {/* <UserProfile
              appearance={{
                elements: {
                  rootBox: "max-w-full",
                  cardBox: "max-w-full",
                  },
                  }}
                  /> */}
            </>
          )}
        </ModalContent>
      </form>
    </Modal>
  );
}
