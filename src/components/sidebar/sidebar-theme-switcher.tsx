"use client";

import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { LaptopIcon, MoonIcon, SunIcon } from "lucide-react";
import { useTheme } from "next-themes";

export function SidebarThemeSwitcher() {
  const { theme, setTheme } = useTheme();

  return (

    <ToggleGroup type="single" value={theme} variant="outline" onValueChange={(value) => value && setTheme(value)} size="sm">
      <ToggleGroupItem value="light" aria-label="Light mode">
        <SunIcon className="h-4 w-4" />
      </ToggleGroupItem>
      <ToggleGroupItem value="system" aria-label="System mode">
        <LaptopIcon className="h-4 w-4" />
      </ToggleGroupItem>
      <ToggleGroupItem value="dark" aria-label="Dark mode">
        <MoonIcon className="h-4 w-4" />
      </ToggleGroupItem>
    </ToggleGroup>
  );
}
