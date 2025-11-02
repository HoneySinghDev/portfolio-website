# Site Configuration

This file (`lib/config.ts`) contains all editable content for the portfolio website. Edit values here instead of searching through React components.

## How to Use

1. **Personal Information**: Update `siteConfig.personal` with your details
2. **Navigation**: Modify `siteConfig.navigation.sections` to add/remove sections
3. **About Section**: Edit `siteConfig.about` for all about section content
4. **Skills**: Update `siteConfig.skills.list` and `siteConfig.skills.keyHighlights`
5. **Projects**: Modify `siteConfig.projects.featured` array
6. **GitHub**: Update `siteConfig.github` settings

## Icon Names

When specifying icons in the config, use these icon names:

- `CodeIcon` - Code/Programming
- `TerminalIcon` - Terminal/CLI
- `ServerIcon` - Server/Backend
- `GitBranchIcon` - Git/Version Control
- `LayoutIcon` - UI/Design
- `HeartIcon` - Passion/Love
- `BrainCircuitIcon` - Learning/Intelligence
- `RocketIcon` - Innovation/Speed
- `GlobeIcon` - Web/Global
- `DatabaseIcon` - Database

## Color Names

Use these color names for neon effects:

- `yellow` - Neon yellow
- `pink` - Neon pink
- `blue` - Neon blue
- `green` - Neon green

## Example: Adding a New Skill

```typescript
skills: {
  list: [
    // ... existing skills
    {
      name: "Your New Skill",
      value: 85,
      icon: "CodeIcon",
      details: "Your skill description",
      projects: ["Project 1", "Project 2"],
      years: 2,
      color: "blue",
    },
  ],
}
```

## Example: Adding a New Project

```typescript
projects: {
  featured: [
    // ... existing projects
    {
      id: "my-project",
      title: "My Project",
      description: "Project description here",
      image: "/path/to/image.jpg",
      tags: ["React", "TypeScript"],
      githubUrl: "https://github.com/user/repo",
      color: "yellow",
    },
  ],
}
```

## Notes

- After editing this file, the changes will automatically reflect in the components
- Some components may need to be updated to use this config (work in progress)
- Environment variables still take precedence for sensitive data (GitHub tokens, etc.)
