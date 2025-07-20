import type * as ReactIcons from "@icons-pack/react-simple-icons";

const TECHNOLOGY_IDS = [
  "javascript",
  "typescript",
  "python",
  "java",
  "csharp",
  "cpp",
  "go",
  "rust",
  "php",
  "ruby",
  "swift",
  "kotlin",
  "scala",
  "dart",
  "elixir",
  "react",
  "vue",
  "angular",
  "svelte",
  "nextjs",
  "nuxt",
  "astro",
  "remix",
  "gatsby",
  "nodejs",
  "express",
  "nestjs",
  "django",
  "flask",
  "fastapi",
  "spring",
  "laravel",
  "rails",
  "dotnet",
  "postgresql",
  "mysql",
  "mongodb",
  "redis",
  "sqlite",
  "supabase",
  "firebase",
  "dynamodb",
  "aws",
  "azure",
  "gcp",
  "vercel",
  "netlify",
  "heroku",
  "digitalocean",
  "docker",
  "kubernetes",
  "git",
  "github",
  "gitlab",
  "jenkins",
  "terraform",
  "ansible",
  "webpack",
  "vite",
  "eslint",
  "prettier",
  "tailwindcss",
  "bootstrap",
  "figma",
  "postman",
] as const;

export const TECHNOLOGY_CATEGORIES = [
  "Languages",
  "Frameworks",
  "Databases",
  "Tools",
  "Platforms",
] as const;

export type TechnologyId = (typeof TECHNOLOGY_IDS)[number];
export type TechnologyCategory = (typeof TECHNOLOGY_CATEGORIES)[number];

export const TECHNOLOGIES: Technology[] = [
  // Programming Languages
  {
    id: "javascript",
    name: "JavaScript",
    icon: "SiJavascript",
    color: "#F7DF1E",
    category: "Languages",
  },
  {
    id: "typescript",
    name: "TypeScript",
    icon: "SiTypescript",
    color: "#3178C6",
    category: "Languages",
  },
  { id: "python", name: "Python", icon: "SiPython", color: "#3776AB", category: "Languages" },
  { id: "java", name: "Java", icon: null, color: "#ED8B00", category: "Languages" },
  { id: "csharp", name: "C#", icon: "SiSharp", color: "#239120", category: "Languages" },
  { id: "cpp", name: "C++", icon: "SiCplusplus", color: "#00599C", category: "Languages" },
  { id: "go", name: "Go", icon: "SiGo", color: "#00ADD8", category: "Languages" },
  { id: "rust", name: "Rust", icon: "SiRust", color: "#000000", category: "Languages" },
  { id: "php", name: "PHP", icon: "SiPhp", color: "#777BB4", category: "Languages" },
  { id: "ruby", name: "Ruby", icon: "SiRuby", color: "#CC342D", category: "Languages" },
  { id: "swift", name: "Swift", icon: "SiSwift", color: "#F05138", category: "Languages" },
  { id: "kotlin", name: "Kotlin", icon: "SiKotlin", color: "#7F52FF", category: "Languages" },
  { id: "scala", name: "Scala", icon: "SiScala", color: "#DC322F", category: "Languages" },
  { id: "dart", name: "Dart", icon: "SiDart", color: "#00B4AB", category: "Languages" },
  { id: "elixir", name: "Elixir", icon: "SiElixir", color: "#4B275F", category: "Languages" },

  // Frontend Frameworks
  { id: "react", name: "React", icon: "SiReact", color: "#61DAFB", category: "Frameworks" },
  { id: "vue", name: "Vue.js", icon: "SiVuedotjs", color: "#4FC08D", category: "Frameworks" },
  { id: "angular", name: "Angular", icon: "SiAngular", color: "#DD0031", category: "Frameworks" },
  { id: "svelte", name: "Svelte", icon: "SiSvelte", color: "#FF3E00", category: "Frameworks" },
  { id: "nextjs", name: "Next.js", icon: "SiNextdotjs", color: "#000000", category: "Frameworks" },
  { id: "nuxt", name: "Nuxt.js", icon: "SiNuxt", color: "#00DC82", category: "Frameworks" },
  { id: "astro", name: "Astro", icon: "SiAstro", color: "#FF5D01", category: "Frameworks" },
  { id: "remix", name: "Remix", icon: "SiRemix", color: "#000000", category: "Frameworks" },
  { id: "gatsby", name: "Gatsby", icon: "SiGatsby", color: "#663399", category: "Frameworks" },

  // Backend Frameworks
  { id: "nodejs", name: "Node.js", icon: "SiNodedotjs", color: "#339933", category: "Frameworks" },
  {
    id: "express",
    name: "Express.js",
    icon: "SiExpress",
    color: "#000000",
    category: "Frameworks",
  },
  { id: "nestjs", name: "NestJS", icon: "SiNestjs", color: "#E0234E", category: "Frameworks" },
  { id: "django", name: "Django", icon: "SiDjango", color: "#092E20", category: "Frameworks" },
  { id: "flask", name: "Flask", icon: "SiFlask", color: "#000000", category: "Frameworks" },
  { id: "fastapi", name: "FastAPI", icon: "SiFastapi", color: "#009688", category: "Frameworks" },
  { id: "spring", name: "Spring", icon: "SiSpring", color: "#6DB33F", category: "Frameworks" },
  { id: "laravel", name: "Laravel", icon: "SiLaravel", color: "#FF2D20", category: "Frameworks" },
  {
    id: "rails",
    name: "Ruby on Rails",
    icon: "SiRubyonrails",
    color: "#CC0000",
    category: "Frameworks",
  },
  { id: "dotnet", name: ".NET", icon: "SiDotnet", color: "#512BD4", category: "Frameworks" },

  // Databases
  {
    id: "postgresql",
    name: "PostgreSQL",
    icon: "SiPostgresql",
    color: "#4169E1",
    category: "Databases",
  },
  { id: "mysql", name: "MySQL", icon: "SiMysql", color: "#4479A1", category: "Databases" },
  { id: "mongodb", name: "MongoDB", icon: "SiMongodb", color: "#47A248", category: "Databases" },
  { id: "redis", name: "Redis", icon: "SiRedis", color: "#DC382D", category: "Databases" },
  { id: "sqlite", name: "SQLite", icon: "SiSqlite", color: "#003B57", category: "Databases" },
  { id: "supabase", name: "Supabase", icon: "SiSupabase", color: "#3ECF8E", category: "Databases" },
  { id: "firebase", name: "Firebase", icon: "SiFirebase", color: "#FFCA28", category: "Databases" },
  {
    id: "dynamodb",
    name: "DynamoDB",
    icon: "SiAmazondynamodb",
    color: "#4053D6",
    category: "Databases",
  },

  // Cloud Platforms
  { id: "aws", name: "AWS", icon: "SiAmazonwebservices", color: "#FF9900", category: "Platforms" },
  { id: "azure", name: "Azure", icon: null, color: "#0078D4", category: "Platforms" },
  {
    id: "gcp",
    name: "Google Cloud",
    icon: "SiGooglecloud",
    color: "#4285F4",
    category: "Platforms",
  },
  { id: "vercel", name: "Vercel", icon: "SiVercel", color: "#000000", category: "Platforms" },
  { id: "netlify", name: "Netlify", icon: "SiNetlify", color: "#00C7B7", category: "Platforms" },
  { id: "heroku", name: "Heroku", icon: "SiHeroku", color: "#430098", category: "Platforms" },
  {
    id: "digitalocean",
    name: "DigitalOcean",
    icon: "SiDigitalocean",
    color: "#0080FF",
    category: "Platforms",
  },

  // Tools & DevOps
  { id: "docker", name: "Docker", icon: "SiDocker", color: "#2496ED", category: "Tools" },
  {
    id: "kubernetes",
    name: "Kubernetes",
    icon: "SiKubernetes",
    color: "#326CE5",
    category: "Tools",
  },
  { id: "git", name: "Git", icon: "SiGit", color: "#F05032", category: "Tools" },
  { id: "github", name: "GitHub", icon: "SiGithub", color: "#181717", category: "Tools" },
  { id: "gitlab", name: "GitLab", icon: "SiGitlab", color: "#FCA326", category: "Tools" },
  { id: "jenkins", name: "Jenkins", icon: "SiJenkins", color: "#D24939", category: "Tools" },
  { id: "terraform", name: "Terraform", icon: "SiTerraform", color: "#7B42BC", category: "Tools" },
  { id: "ansible", name: "Ansible", icon: "SiAnsible", color: "#EE0000", category: "Tools" },
  { id: "webpack", name: "Webpack", icon: "SiWebpack", color: "#8DD6F9", category: "Tools" },
  { id: "vite", name: "Vite", icon: "SiVite", color: "#646CFF", category: "Tools" },
  { id: "eslint", name: "ESLint", icon: "SiEslint", color: "#4B32C3", category: "Tools" },
  { id: "prettier", name: "Prettier", icon: "SiPrettier", color: "#F7B93E", category: "Tools" },
  {
    id: "tailwindcss",
    name: "Tailwind CSS",
    icon: "SiTailwindcss",
    color: "#06B6D4",
    category: "Tools",
  },
  { id: "bootstrap", name: "Bootstrap", icon: "SiBootstrap", color: "#7952B3", category: "Tools" },
  { id: "figma", name: "Figma", icon: "SiFigma", color: "#F24E1E", category: "Tools" },
  { id: "postman", name: "Postman", icon: "SiPostman", color: "#FF6C37", category: "Tools" },
] as const;

export interface Technology {
  id: TechnologyId;
  name: string;
  icon: keyof typeof ReactIcons | null;
  color: string;
  category: TechnologyCategory;
}

/**
 * Get technology by ID
 */
export function getTechnologyById(id: string): Technology | undefined {
  return TECHNOLOGIES.find((tech) => tech.id === id);
}
