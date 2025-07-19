"use client";

import { useUpdateProfileMutation } from "@/hooks/mutation/use-update-profile-mutation";
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
import { Icon } from "@iconify/react";
import { ImageUploader } from "@/components/ui/image-uploader";
import type { Tables } from "database.types";
import Link from "next/link";
import React from "react";
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

  const {
    control,
    handleSubmit,
    watch,
    setValue,
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

  // Handle image upload
  const handleImageUpload = (field: "image_url" | "cover_image_url", imageUrl: string) => {
    setValue(field, imageUrl, { shouldDirty: true });
  };

  // Handle save with react-hook-form's handleSubmit
  const onSubmit = (data: Tables<"users">) => {
    updateProfileMutation.mutate({
      username: data.username,
      display_name: data.display_name,
      bio: data.bio || null,
      location: data.location || null,
      website: data.website || null,
      image_url: data.image_url || null,
      cover_image_url: data.cover_image_url || null,
    });
  };

  return (
    <Modal onClose={onClose} size="xl" scrollBehavior="inside" defaultOpen backdrop="blur">
      <ModalContent>
        {(onModalClose) => (
          <div>
            <form onSubmit={handleSubmit(onSubmit)}>
              <ModalHeader className="flex flex-col gap-1">Edit Profile</ModalHeader>
              <ModalBody className="overflow-hidden">
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
                          {watch("image_url") ? (
                            <ImageUploader
                              onImageUpload={(url) => handleImageUpload("image_url", url)}
                              aspectRatio="1:1"
                              className="relative w-full h-full group"
                              showHoverOverlay={true}
                              hoverOverlayContent={{
                                icon: "lucide:camera",
                                iconSize: 16,
                                text: "Change",
                              }}
                            >
                              <Image
                                src={watch("image_url") || ""}
                                alt="Avatar"
                                className="w-full h-full object-cover"
                                removeWrapper
                              />
                              <Button
                                isIconOnly
                                size="sm"
                                color="danger"
                                variant="flat"
                                className="absolute top-0 right-0 z-10"
                                onPress={() => handleImageUpload("image_url", "")}
                              >
                                <Icon icon="lucide:x" width={16} />
                              </Button>
                            </ImageUploader>
                          ) : (
                            <ImageUploader
                              onImageUpload={(url) => handleImageUpload("image_url", url)}
                              aspectRatio="1:1"
                              className="w-full h-full"
                              uploadContent={{
                                icon: "lucide:user",
                                iconSize: 16,
                                title: undefined,
                                description: undefined,
                              }}
                            />
                          )}
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
                      <div className="w-full h-32 rounded-lg overflow-hidden">
                        {watch("cover_image_url") ? (
                          <ImageUploader
                            onImageUpload={(url) => handleImageUpload("cover_image_url", url)}
                            aspectRatio="3:1"
                            className="relative w-full h-full group"
                            showHoverOverlay={true}
                            hoverOverlayContent={{
                              icon: "lucide:camera",
                              iconSize: 24,
                              text: "Click to change",
                            }}
                          >
                            <Image
                              src={watch("cover_image_url") || ""}
                              alt="Cover"
                              className="w-full h-full object-cover"
                              removeWrapper
                            />
                            {/* Remove button */}
                            <Button
                              isIconOnly
                              size="sm"
                              color="danger"
                              variant="flat"
                              className="absolute top-2 right-2 z-10"
                              onPress={() => handleImageUpload("cover_image_url", "")}
                            >
                              <Icon icon="lucide:x" width={16} />
                            </Button>
                          </ImageUploader>
                        ) : (
                          <ImageUploader
                            onImageUpload={(url) => handleImageUpload("cover_image_url", url)}
                            aspectRatio="3:1"
                            className="w-full h-full"
                            uploadContent={{
                              icon: "lucide:image",
                              iconSize: 24,
                              title: "Click to upload cover image",
                              description: "Recommended size: 1200x400 pixels",
                            }}
                          />
                        )}
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
                        startContent={
                          <Icon icon="lucide:globe" className="text-default-400" width={16} />
                        }
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
            </form>
            {/* <UserProfile
              appearance={{
                elements: {
                  rootBox: "max-w-full",
                  cardBox: "max-w-full",
                },
              }}
            /> */}
          </div>
        )}
      </ModalContent>
    </Modal>
  );
}
