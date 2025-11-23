import { Label } from "@/components/ui/label";
import {
  MultiSelect,
  MultiSelectContent,
  MultiSelectEmpty,
  MultiSelectGroup,
  MultiSelectInput,
  MultiSelectItem,
  MultiSelectTrigger,
  type Option,
} from "@/components/ui/multiselect";

const frameworks: Option[] = [
  {
    value: "next.js",
    label: "Next.js",
  },
  {
    value: "sveltekit",
    label: "SvelteKit",
  },
  {
    value: "nuxt.js",
    label: "Nuxt.js",
    disable: true,
  },
  {
    value: "remix",
    label: "Remix",
  },
  {
    value: "astro",
    label: "Astro",
  },
  {
    value: "angular",
    label: "Angular",
  },
  {
    value: "vue",
    label: "Vue.js",
  },
  {
    value: "react",
    label: "React",
  },
  {
    value: "ember",
    label: "Ember.js",
  },
  {
    value: "gatsby",
    label: "Gatsby",
  },
  {
    value: "eleventy",
    label: "Eleventy",
    disable: true,
  },
  {
    value: "solid",
    label: "SolidJS",
  },
  {
    value: "preact",
    label: "Preact",
  },
  {
    value: "qwik",
    label: "Qwik",
  },
  {
    value: "alpine",
    label: "Alpine.js",
  },
  {
    value: "lit",
    label: "Lit",
  },
];

export function Component234() {
  return (
    <div className="*:not-first:mt-2">
      <Label>Multiselect</Label>
      <MultiSelect
        onValueChange={(value) => console.log(value)}
        defaultValue={["next.js", "sveltekit"]}
        variant="default"
        maxCount={3}
      >
        <MultiSelectTrigger placeholder="Select frameworks" />
        <MultiSelectContent>
          <MultiSelectInput placeholder="Search frameworks..." />
          <MultiSelectEmpty>No frameworks found.</MultiSelectEmpty>
          <MultiSelectGroup>
            {frameworks.map((framework) => (
              <MultiSelectItem key={framework.value} value={framework.value}>
                {framework.label}
              </MultiSelectItem>
            ))}
          </MultiSelectGroup>
        </MultiSelectContent>
      </MultiSelect>
      <div className="mt-2 text-xs text-muted-foreground">
        Inspired by{" "}
        <a
          className="underline hover:text-foreground"
          href="https://shadcnui-expansions.typeart.cc/docs/multiple-selector"
          target="_blank"
          rel="noreferrer noopener nofollow"
        >
          shadcn/ui expansions
        </a>
      </div>
    </div>
  );
}
