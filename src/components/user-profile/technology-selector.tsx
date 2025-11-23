"use client";

import { type TechnologyId, getTechnologyById, TECHNOLOGIES } from "@/lib/technologies";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import * as ReactIcons from "@icons-pack/react-simple-icons";
import { Check, ChevronsUpDown, X } from "lucide-react";
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
  const [open, setOpen] = useState(false);

  function toggleSelection(techId: TechnologyId) {
    if (selectedTechnologies.includes(techId)) {
      handleChipClose(techId);
    } else {
      if (selectedTechnologies.length >= MAX_SELECTED_TECHNOLOGIES) return;
      const newSelected = [...selectedTechnologies, techId];
      setSelectedTechnologies(newSelected);
      onTechnologiesChange?.(newSelected);
    }
  }

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
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="flat"
            role="combobox"
            aria-expanded={open}
            className="w-full justify-between h-auto min-h-12 py-2"
          >
            {selectedTechnologies.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {selectedTechnologies.map((id) => {
                  const tech = getTechnologyById(id);
                  if (!tech) return null;
                  return (
                    <Badge key={id} variant="secondary" className="mr-1 mb-1">
                      {tech.name}
                      <div
                        className="ml-1 ring-offset-background rounded-full outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 cursor-pointer"
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            handleChipClose(id);
                          }
                        }}
                        onMouseDown={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                        }}
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          handleChipClose(id);
                        }}
                      >
                        <X className="h-3 w-3 text-muted-foreground hover:text-foreground" />
                      </div>
                    </Badge>
                  );
                })}
              </div>
            ) : (
              <span className="text-muted-foreground">Search and select technologies...</span>
            )}
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[400px] p-0">
          <Command>
            <CommandInput placeholder="Search technologies..." />
            <CommandList>
              <CommandEmpty>No technology found.</CommandEmpty>
              <CommandGroup>
                {TECHNOLOGIES.map((tech) => {
                  const isSelected = selectedTechnologies.includes(tech.id);
                  const Icon = tech.icon ? getIconComponent(tech.icon) : null;
                  return (
                    <CommandItem
                      key={tech.id}
                      value={tech.name}
                      onSelect={() => toggleSelection(tech.id)}
                      disabled={!isSelected && selectedTechnologies.length >= MAX_SELECTED_TECHNOLOGIES}
                    >
                      <Check
                        className={cn(
                          "mr-2 h-4 w-4",
                          isSelected ? "opacity-100" : "opacity-0"
                        )}
                      />
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
                    </CommandItem>
                  );
                })}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>

      <div className="flex items-center justify-between">
        <span className="text-xs text-muted-foreground/80">
          {selectedTechnologies.length} technologies selected out of {MAX_SELECTED_TECHNOLOGIES}
        </span>
      </div>
    </div>
  );
}
