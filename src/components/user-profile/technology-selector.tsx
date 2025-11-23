"use client";

import { Badge } from "@/components/ui/badge";
import {
  MultiSelect,
  MultiSelectContent,
  MultiSelectEmpty,
  MultiSelectGroup,
  MultiSelectInput,
  MultiSelectItem,
  MultiSelectList,
  MultiSelectTrigger,
} from "@/components/ui/multiselect";
import { TECHNOLOGIES, type TechnologyId } from "@/lib/technologies";
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

  return (
    <div className="space-y-3">
      <MultiSelect
        defaultValue={initialTechnologies}
        onValueChange={(values) => {
          const newValues = values as TechnologyId[];
          setSelectedTechnologies(newValues);
          onTechnologiesChange?.(newValues);
        }}
        maxSelectable={MAX_SELECTED_TECHNOLOGIES}
        variant="flat"
        modalPopover
      >
        <MultiSelectTrigger placeholder="Search and select technologies..." />
        <MultiSelectContent>
          <MultiSelectInput placeholder="Search technologies..." />
          <MultiSelectList>
            <MultiSelectEmpty>No technology found.</MultiSelectEmpty>
            <MultiSelectGroup>
              {TECHNOLOGIES.map((tech) => {
                const Icon = tech.icon ? getIconComponent(tech.icon) : null;
                return (
                  <MultiSelectItem key={tech.id} value={tech.id}>
                    <div className="flex items-center gap-2 flex-1">
                      {Icon ? (
                        <Icon size={16} color="currentColor" />
                      ) : (
                        <span className="size-4 block bg-muted rounded-sm" />
                      )}
                      <span>{tech.name}</span>
                    </div>
                    <Badge variant="outline" className="ml-auto text-xs capitalize">
                      {tech.category}
                    </Badge>
                  </MultiSelectItem>
                );
              })}
            </MultiSelectGroup>
          </MultiSelectList>
        </MultiSelectContent>
      </MultiSelect>

      <div className="flex items-center justify-between">
        <span className="text-xs text-muted-foreground/80">
          {selectedTechnologies.length} technologies selected out of {MAX_SELECTED_TECHNOLOGIES}
        </span>
      </div>
    </div>
  );
}
