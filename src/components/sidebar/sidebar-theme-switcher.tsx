"use client";

import { Button, ButtonGroup } from "@heroui/react";
import { LaptopIcon, MoonIcon, SunIcon } from "lucide-react";
import { useTheme } from "next-themes";

export function SidebarThemeSwitcher() {
  const { theme, setTheme } = useTheme();

  return (
    <ButtonGroup variant="flat" size="sm">
      <Button
        isIconOnly
        color={theme === "light" ? "primary" : "default"}
        onPress={() => setTheme("light")}
      >
        <SunIcon size={16} />
      </Button>
      <Button
        isIconOnly
        color={theme === "system" ? "primary" : "default"}
        onPress={() => setTheme("system")}
      >
        <LaptopIcon size={16} />
      </Button>
      <Button
        isIconOnly
        color={theme === "dark" ? "primary" : "default"}
        onPress={() => setTheme("dark")}
      >
        <MoonIcon size={16} />
      </Button>
    </ButtonGroup>
  );
}
