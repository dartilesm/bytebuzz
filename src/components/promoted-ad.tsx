"use client";

import { ExternalLinkIcon } from "lucide-react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

export function PromotedAd() {
  return (
    <Card className="bg-muted/30 overflow-hidden">
      <CardHeader className="flex flex-row items-center justify-between space-y-0">
        <div className="flex items-center gap-2 text-sm font-semibold text-primary">
          <span>Promoted</span>
        </div>
        <Badge
          variant="secondary"
          className="text-[10px] h-5 px-1.5 font-normal text-muted-foreground"
        >
          Ad
        </Badge>
      </CardHeader>
      <CardContent className=" space-y-4">
        <Link
          href="https://www.midu.dev/"
          target="_blank"
          rel="noopener noreferrer"
          className="block group"
        >
          <div className="relative w-full aspect-video rounded-md overflow-hidden bg-muted mb-3">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="https://midu.dev/og.jpg"
              alt="Midu.dev academy"
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            />
          </div>
          <div className="space-y-1.5">
            <h3 className="font-semibold text-base leading-tight group-hover:text-primary transition-colors">
              Become a better developer with Midu.dev
            </h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Academy with Programming and Web Development Courses | midudev
            </p>
          </div>
        </Link>
        <Button asChild variant="outline" className="w-full cursor-pointer" size="sm">
          <Link href="https://www.midu.dev/" target="_blank" rel="noopener noreferrer">
            Join now
            <ExternalLinkIcon className="ml-1 size-3" />
          </Link>
        </Button>
      </CardContent>
    </Card>
  );
}
