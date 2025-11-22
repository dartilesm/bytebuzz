"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ExternalLinkIcon } from "lucide-react";
import Link from "next/link";

export function PromotedAd() {
  return (
    <Card className="bg-gradient-to-br from-primary/20 to-secondary/20 shadow-none border-0">
      <CardHeader className="flex flex-row items-start justify-between p-4 pb-2 space-y-0">
        <CardTitle className="font-medium text-lg">Promoted</CardTitle>
        <span className="text-xs text-muted-foreground">Fake Ad</span>
      </CardHeader>
      <CardContent className="p-4 pt-0 space-y-2">
        <div className="relative w-full h-32 rounded-lg overflow-hidden mb-2">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="https://midu.dev/og.jpg"
            alt="Midu.dev academy"
            className="w-full h-full object-cover"
          />
        </div>
        <h3 className="font-medium text-md">Become a better developer with Midu.dev</h3>
        <p className="text-sm text-muted-foreground">
          Academy with Programming and Web Development Courses | midudev
        </p>
        <Link
          href="https://www.midu.dev/"
          className="text-sm text-primary hover:underline flex items-center gap-1"
          target="_blank"
          rel="noopener noreferrer"
        >
          Join now
          <ExternalLinkIcon size={14} />
        </Link>
      </CardContent>
    </Card>
  );
}
