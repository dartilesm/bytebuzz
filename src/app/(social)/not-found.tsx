"use client";

import { PageHeader } from "@/components/ui/page-header";
import { Button } from "@heroui/react";
import { HomeIcon } from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";

/**
 * NotFoundPage displays a context-aware not-found message for authenticated routes, styled like the thread page.
 * Shows a specific message for profile or thread not found, based on route params.
 */
export default function NotFoundPage() {
  const params = useParams();
  const username = decodeURIComponent((params?.username as string) || "");
  const postId = params?.postId;

  function getNotFoundData() {
    if (username && postId) {
      return {
        heading: "Thread Not Found",
        message: "Sorry, the thread you are looking for does not exist or has been moved.",
        title: "Thread",
        subtitle: "",
      };
    }

    if (username.includes("@")) {
      return {
        heading: "Profile Not Found",
        message: "Sorry, the profile you are looking for does not exist or has been moved.",
        title: "Profile",
        subtitle: username,
      };
    }

    return {
      heading: "404 – Page Not Found",
      message: "Sorry, the page you are looking for does not exist or has been moved.",
      title: username.charAt(0).toUpperCase() + username.slice(1),
      subtitle: "",
    };
  }

  const { heading, message, title, subtitle } = getNotFoundData();

  return (
    <>
      <PageHeader title={title} subtitle={subtitle} />
      <div className="flex flex-col items-center w-full px-4 min-h-[60vh]">
        <h1 className="text-xl font-bold text-foreground mb-2 mt-16" aria-label={heading}>
          {heading}
        </h1>
        <p className="text-default-500 mb-8">{message}</p>
        <Button
          as={Link}
          href="/root"
          color="primary"
          aria-label="Go to root"
          tabIndex={0}
          startContent={<HomeIcon size={16} />}
        >
          Go to Root
        </Button>
      </div>
    </>
  );
}
