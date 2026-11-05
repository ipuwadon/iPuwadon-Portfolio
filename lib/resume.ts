export const profile = {
  name: 'Puwadon Hamvivil',
  title: 'Software Developer | Data Engineer',
  tagline: 'Oracle & PL/SQL · Enterprise Delivery · AI-Assisted Engineering',
  yearsOfExperience: 15,
  summary:
    'Software developer and data engineer with 15+ years of experience delivering Oracle-based enterprise applications and database solutions across financial services, insurance, telecommunications, and retail. Experienced in PL/SQL development, data migration, system integration, production support, CI/CD automation, and cross-functional delivery. Recent work includes Sybase-to-Oracle migration, GitHub Actions database deployment automation, and AI-assisted development and testing.',
  contact: {
    email: 'puwadon20@hotmail.com',
    phone: '+66 81-452-9174',
    linkedin: 'https://www.linkedin.com/in/puwadon-hamvivil-a68b1497/',
    github: 'https://github.com/ipuwadon',
  },
};

export const skillGroups: { title: string; style: 'blue' | 'purple' | 'green'; skills: string[] }[] = [
  {
    title: 'Database & Development',
    style: 'blue',
    skills: [
      'Oracle Database',
      'PL/SQL',
      'SQL',
      'Oracle Forms & Reports',
      'Oracle ADF',
      'Java',
      'Spring Boot',
      'Python',
      'Angular',
    ],
  },
  {
    title: 'Integration & Automation',
    style: 'purple',
    skills: [
      'REST / SOAP APIs',
      'Git',
      'GitHub Actions',
      'Bash',
      'SFTP',
      'Database CI/CD',
      'Data Migration',
    ],
  },
  {
    title: 'Delivery & Leadership',
    style: 'green',
    skills: [
      'SDLC',
      'Requirements Analysis',
      'Database Design',
      'UAT',
      'Root-Cause Analysis',
      'L3 Production Support',
      'Agile',
      'Stakeholder Collaboration',
      'Team Leadership',
    ],
  },
];

export type Job = {
  role: string;
  company: string;
  period: string;
  highlights: string[];
};

export const experience: Job[] = [
  {
    role: 'Senior Software Developer',
    company: 'LSEG (London Stock Exchange Group)',
    period: 'May 2023 – May 2026',
    highlights: [
      'Led migration of critical US Profile data services from Sybase to Oracle Database, including Fund Manager, Lipper Indices, Lipper Leaders, and Fund Award datasets.',
      'Designed Oracle Database CI/CD automation with GitHub Actions and migrated legacy FTP integrations to secure SFTP.',
      'Used GitHub Copilot and AI-assisted tools for technical analysis, implementation, troubleshooting, and delivery.',
      'Provided L3 production support, root-cause analysis, and incident resolution for business-critical applications.',
      'Coordinated BAU delivery with Business Analysts, QA Engineers, and Operations teams in a global financial services environment.',
    ],
  },
  {
    role: 'Assistant Manager',
    company: 'Allianz Ayudhya Insurance',
    period: 'Jan 2015 – Apr 2023',
    highlights: [
      'Delivered a Unit Linked platform in collaboration with business stakeholders for insurance and investment products.',
      'Led implementation of an E-Policy solution, digitizing policy management and improving customer access.',
      'Managed outsourced policy printing, coordinating vendors and internal teams to support accurate, timely document delivery.',
      'Implemented Laser ID registration to support SEC compliance and customer identity verification.',
      'Provided Level 3 support and enhancements for core insurance applications.',
    ],
  },
  {
    role: 'Contractor PL/SQL Developer',
    company: 'Advance Info Service PCL. (AIS)',
    period: 'Dec 2012 – Dec 2014',
    highlights: [
      'Designed and implemented data migration processes to load and transform CSV-based data into Oracle Database, improving integration efficiency and data quality.',
    ],
  },
  {
    role: 'Oracle Developer',
    company: 'Prima Gold International',
    period: 'Apr 2007 – Nov 2012',
    highlights: [
      'Developed and maintained Oracle Forms & Reports applications supporting POS, CRM, HR, product, and marketing functions.',
      'Maintained Oracle Database components, reconciled data issues, and built CSV-to-Oracle data migration processes.',
      'Developed custom Oracle reports and provided branch-office application support and end-user training.',
    ],
  },
];

export const aiProjects = [
  {
    title: 'SDAT — Software Development Agent Team',
    description:
      'A team of AI agents (BA, Developer, Reviewer, Tester) that turns requirements into working, tested code through structured artifact handoffs and review gates.',
    tags: ['AI Agents', 'Python', 'LLM Orchestration'],
  },
  {
    title: 'Database CI/CD Automation',
    description:
      'GitHub Actions-based Oracle database deployment automation, improving delivery speed, consistency, and operational reliability.',
    tags: ['GitHub Actions', 'Oracle', 'DevOps'],
  },
  {
    title: 'AI-Assisted Code Quality',
    description:
      'Leveraged AI models for code analysis and unit test generation, accelerating reviews and improving test coverage.',
    tags: ['AI Coding Assistants', 'Testing', 'Code Review'],
  },
  {
    title: 'Document Intelligence & Summarization',
    description:
      'AI-assisted solutions for document analysis, knowledge discovery, and email summarization to streamline knowledge work.',
    tags: ['NLP', 'Knowledge Discovery', 'Automation'],
  },
  {
    title: 'Local LLM Deployment',
    description:
      'Deployed and evaluated Large Language Models including Ollama and Qwen to explore business-specific AI use cases and intelligent automation.',
    tags: ['Ollama', 'Qwen', 'LLMOps'],
  },
];

export const education = {
  degree: 'Bachelor of Science, Information Science',
  school: 'Suan Dusit Rajabhat University',
  period: '2001 – 2004',
};

export const certifications = [
  'Microsoft Azure Fundamentals (AZ-900)',
  'Databricks Fundamentals (Udemy)',
  'Basic Python Language (Udemy)',
];

export const languages = [
  { name: 'Thai', level: 'Fluent' },
  { name: 'English', level: 'Intermediate' },
];
