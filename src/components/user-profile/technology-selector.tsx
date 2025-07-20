"use client";

import { type TechnologyId, getTechnologyById, TECHNOLOGIES } from "@/lib/technologies";
import { Chip, Select, SelectItem } from "@heroui/react";
import * as ReactIcons from "@icons-pack/react-simple-icons";
import { type RefObject, useImperativeHandle, useState } from "react";

interface TechnologySelectorProps {
  initialTechnologies?: TechnologyId[];
  onTechnologiesChange?: (technologies: TechnologyId[]) => void;
  ref?: RefObject<{ getSelectedTechnologies: () => string[] }>;
}

const MAX_SELECTED_TECHNOLOGIES = 3;

export function TechnologySelector({
  initialTechnologies = [],
  onTechnologiesChange,
  ref,
}: TechnologySelectorProps) {
  const [selectedTechnologies, setSelectedTechnologies] =
    useState<TechnologyId[]>(initialTechnologies);

  // Expose getSelectedTechnologies method via ref
  useImperativeHandle(ref, () => ({
    getSelectedTechnologies: () => selectedTechnologies,
  }));

  /**
   * Get icon component by name
   */
  function getIconComponent(iconName: string): ReactIcons.IconType | null {
    const IconComponent = (ReactIcons as unknown as Record<string, ReactIcons.IconType>)[iconName];
    return IconComponent || null;
  }

  function handleSelectionChange(keys: unknown) {
    const selectedKeys = Array.from(keys as Iterable<string>) as TechnologyId[];
    if (selectedKeys.length > MAX_SELECTED_TECHNOLOGIES) {
      return;
    }
    setSelectedTechnologies(selectedKeys);
    if (onTechnologiesChange) {
      onTechnologiesChange(selectedKeys);
    }
  }

  function handleChipClose(techId: TechnologyId) {
    const newSelectedTechnologies = selectedTechnologies.filter((id) => id !== techId);
    setSelectedTechnologies(newSelectedTechnologies);
    if (onTechnologiesChange) {
      onTechnologiesChange(newSelectedTechnologies);
    }
  }

  return (
    <div className="space-y-3">
      {/* Technology Selector */}
      <Select
        classNames={{
          base: "w-full",
          trigger: "min-h-12 py-2",
        }}
        isMultiline
        items={TECHNOLOGIES}
        label="Top Technologies"
        placeholder="Search and select technologies..."
        renderValue={(items) => {
          return (
            <div className="flex flex-wrap gap-2">
              {items.map((item) => {
                const tech = getTechnologyById(item.data?.id || "");
                const Icon = getIconComponent(tech?.icon || "");
                return (
                  tech && (
                    <Chip
                      key={item.data?.id}
                      startContent={Icon && <Icon size={16} color="currentColor" />}
                      onClose={() => {
                        handleChipClose(tech.id);
                      }}
                    >
                      {tech?.name}
                    </Chip>
                  )
                );
              })}
            </div>
          );
        }}
        selectionMode="multiple"
        variant="flat"
        selectedKeys={new Set(selectedTechnologies)}
        onSelectionChange={handleSelectionChange}
      >
        {(tech) => {
          const Icon = tech.icon ? getIconComponent(tech.icon) : null;
          return (
            <SelectItem
              key={tech.id}
              textValue={tech.name}
              className="h-10"
              startContent={
                Icon ? (
                  <Icon size={16} color="currentColor" />
                ) : (
                  <span className="size-4 block bg-default-200 rounded-sm" />
                )
              }
              endContent={
                <Chip className="text-tiny text-default-400 capitalize" variant="solid" size="sm">
                  {tech.category}
                </Chip>
              }
            >
              {tech.name}
            </SelectItem>
          );
        }}
      </Select>

      <div className="flex items-center justify-between">
        <span className="text-tiny text-default-400">
          {selectedTechnologies.length} technologies selected out of {MAX_SELECTED_TECHNOLOGIES}
        </span>
      </div>
    </div>
  );
}
