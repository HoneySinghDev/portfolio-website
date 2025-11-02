/**
 * Centralized Configuration File
 * Edit all content here instead of searching through React components
 */

export const siteConfig = {
  // Personal Information
  personal: {
    name: 'Honey Singh',
    title: 'Developer & Tech Enthusiast',
    bio: 'Building digital experiences with JavaScript, Python, Golang, and Rust. Passionate about creating innovative solutions and learning new technologies.',
    age: 21,
    location: 'India',
    experience: '5+',
    avatarUrl: '', // Will be fetched from GitHub API dynamically
    githubUrl: 'https://github.com/HoneySinghDev',
    githubUsername: 'HoneySinghDev',
  },

  // Contact Information
  contact: {
    email: 'contact@honeysingh.dev', // Update with your email
    location: 'India',
    socialLinks: {
      github: 'https://github.com/HoneySinghDev',
      linkedin: 'https://linkedin.com', // Update with your LinkedIn URL
      twitter: 'https://twitter.com', // Update with your Twitter URL
    },
    availability:
      "I'm currently available for freelance work or full-time positions. Let's discuss how I can help with your project or join your team.",
  },

  // Navigation Sections
  navigation: {
    sections: ['home', 'about', 'skills', 'github'] as const,
    offset: 100, // Offset for fixed header
  },

  // About Section
  about: {
    description:
      "As a 21-year-old Full Stack Developer from India with over 5 years of experience, I've developed a deep passion for creating innovative digital solutions across various platforms.",
    whoIAm: {
      title: 'Who I Am',
      content:
        "I'm a 21-year-old full-stack developer from India with a passion for building cutting-edge digital solutions. With 5+ years of hands-on experience, I've developed expertise across multiple languages and platforms, creating everything from responsive web applications to blockchain solutions.",
    },
    journey: {
      title: 'My Journey',
      content:
        "My development journey began at 16, driven by curiosity and a desire to build impactful software. I've since mastered JavaScript/TypeScript, Python, Golang, and Rust, applying these skills to create innovative applications that solve real-world problems.",
    },
    experienceHighlights: [
      { value: '5+', label: 'Years Experience' },
      { value: '20+', label: 'Projects' },
      { value: '4', label: 'Languages' },
      { value: '10+', label: 'Technologies' },
    ],
    coreValues: [
      {
        icon: 'HeartIcon',
        title: 'Passionate Coder',
        description:
          'Dedicated to writing clean, efficient, and elegant code that solves real-world problems.',
      },
      {
        icon: 'LayoutIcon',
        title: 'UI/UX Enthusiast',
        description:
          'Creating interfaces that are not just beautiful, but intuitive and accessible for all users.',
      },
      {
        icon: 'BrainCircuitIcon',
        title: 'Continuous Learner',
        description:
          'Always exploring new technologies and methodologies to stay at the forefront of development.',
      },
      {
        icon: 'RocketIcon',
        title: 'Problem Solver',
        description:
          'Approaching challenges with analytical thinking and creative solutions.',
      },
    ],
  },

  // Skills Section
  skills: {
    list: [
      {
        name: 'JavaScript/TypeScript',
        value: 95,
        icon: 'CodeIcon',
        details:
          'Expert in modern JavaScript (ES6+) and TypeScript, with strong typing and advanced patterns.',
        projects: ['DeFi Exchange', 'E-Commerce Dashboard'],
        years: 5,
        color: 'yellow',
      },
      {
        name: 'Python',
        value: 90,
        icon: 'TerminalIcon',
        details:
          'Proficient in Python for data analysis, automation, and backend development.',
        projects: ['Telegram Trading Bot', 'Web Scraping Automation'],
        years: 4,
        color: 'green',
      },
      {
        name: 'Golang',
        value: 85,
        icon: 'ServerIcon',
        details:
          'Experienced in building high-performance microservices and CLI tools with Go.',
        projects: ['API Gateway', 'Data Processing Service'],
        years: 3,
        color: 'blue',
      },
      {
        name: 'Rust',
        value: 80,
        icon: 'GitBranchIcon',
        details:
          "Building memory-safe, concurrent systems with Rust's powerful type system.",
        projects: ['WebAssembly Modules', 'System Utilities'],
        years: 2,
        color: 'pink',
      },
      {
        name: 'React & Next.js',
        value: 95,
        icon: 'LayoutIcon',
        details:
          'Expert in React ecosystem, including Next.js, Redux, and modern React patterns.',
        projects: ['NFT Marketplace', 'Portfolio Website'],
        years: 5,
        color: 'blue',
      },
      {
        name: 'Node.js',
        value: 90,
        icon: 'ServerIcon',
        details:
          'Building scalable backend services with Express, NestJS, and various databases.',
        projects: ['E-Commerce API', 'Real-time Chat Server'],
        years: 4,
        color: 'green',
      },
    ],
    keyHighlights: [
      '5+ years of hands-on development experience across multiple domains',
      'Proficient in JavaScript/TypeScript, Python, Golang, and Rust',
      'Expert in React ecosystem, including Next.js and modern React patterns',
      'Experience building scalable backend services and microservices',
      'Strong foundation in UI/UX design principles and accessibility',
    ],
  },

  // GitHub Section
  github: {
    username: 'HoneySinghDev',
    featuredRepos: [
      {
        id: 'GoChatMirror', // Required: GitHub repository name/ID
        // description: "Optional custom description", // Optional: If not provided, will fetch from GitHub
        // image: "/path/to/image.png", // Optional: Custom image URL
        icon: 'pixel:robot', // Optional: Iconify icon ID/name (e.g., "lucide:github", "mdi:react") or image URL (e.g., "/icon.svg")
      },
    ] as Array<{
      id: string; // GitHub repository name/ID
      description?: string; // Optional custom description
      image?: string; // Optional custom image URL
      icon?: string; // Optional: Iconify icon ID/name (e.g., "lucide:github", "mdi:react") or image URL (e.g., "/icon.svg")
    }>,
    description:
      'Check out my open-source contributions and coding activity on GitHub',
  },

  // UI Configuration
  ui: {
    maxTagsDisplay: 10,
    imagePlaceholder: '/placeholder.svg',
    mobileBreakpoint: 768,
  },
};

export type SiteConfig = typeof siteConfig;
