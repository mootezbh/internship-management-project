// Skills organized by categories
export const SKILLS_CATEGORIES = {
  'Programming Languages': [
    'JavaScript', 'TypeScript', 'Python', 'Java', 'C++', 'C#', 'Go', 'Rust',
    'PHP', 'Ruby', 'Swift', 'Kotlin', 'Dart', 'Scala', 'R'
  ],
  'Web Development': [
    'React', 'Vue.js', 'Angular', 'Next.js', 'Nuxt.js', 'HTML/CSS', 'SASS/SCSS',
    'Tailwind CSS', 'Bootstrap', 'jQuery', 'Webpack', 'Vite'
  ],
  'Backend Development': [
    'Node.js', 'Express.js', 'Django', 'Flask', 'Spring Boot', 'ASP.NET',
    'Ruby on Rails', 'Laravel', 'FastAPI', 'Nest.js'
  ],
  'Database & Storage': [
    'SQL', 'PostgreSQL', 'MySQL', 'MongoDB', 'Redis', 'Firebase',
    'Supabase', 'DynamoDB', 'Elasticsearch', 'GraphQL'
  ],
  'Cloud & DevOps': [
    'AWS', 'Google Cloud', 'Azure', 'Docker', 'Kubernetes', 'CI/CD',
    'Jenkins', 'GitHub Actions', 'Terraform', 'Ansible'
  ],
  'Mobile Development': [
    'React Native', 'Flutter', 'iOS Development', 'Android Development',
    'Ionic', 'Xamarin', 'Progressive Web Apps'
  ],
  'Data Science & Analytics': [
    'Machine Learning', 'Deep Learning', 'Data Analysis', 'Statistics',
    'Pandas', 'NumPy', 'TensorFlow', 'PyTorch', 'Scikit-learn', 'Tableau', 'Power BI'
  ],
  'Design & UX': [
    'UI/UX Design', 'Figma', 'Adobe XD', 'Sketch', 'Photoshop', 'Illustrator',
    'Prototyping', 'User Research', 'Wireframing', 'Design Systems'
  ],
  'Marketing & Content': [
    'Digital Marketing', 'SEO', 'SEM', 'Social Media Marketing', 'Content Marketing',
    'Email Marketing', 'Google Analytics', 'Content Writing', 'Copywriting'
  ],
  'Business & Management': [
    'Project Management', 'Agile/Scrum', 'Product Management', 'Business Analysis',
    'Strategic Planning', 'Team Leadership', 'Communication', 'Problem Solving'
  ]
}

// Career opportunities organized by looking for type
export const CAREER_OPPORTUNITIES = {
  internship: {
    fields: [
      'Software Development Internship', 'Web Development Internship', 'Mobile App Development Internship',
      'Data Science Internship', 'Machine Learning Internship', 'Cybersecurity Internship',
      'UI/UX Design Internship', 'Digital Marketing Internship', 'Content Marketing Internship',
      'Social Media Marketing Internship', 'Business Analysis Internship', 'Product Management Internship',
      'Quality Assurance Internship', 'DevOps Internship', 'Research Internship',
      'Finance Internship', 'Accounting Internship', 'Human Resources Internship',
      'Sales & Marketing Internship', 'Operations Internship'
    ],
    durations: ['1-2 months', '3-4 months', '5-6 months', '6+ months', 'Summer (3 months)', 'Academic Year'],
    availabilityTypes: ['full_time', 'part_time', 'flexible']
  },
  entry_level: {
    fields: [
      'Junior Software Developer', 'Frontend Developer', 'Backend Developer', 'Full Stack Developer',
      'Junior Data Scientist', 'Junior Data Analyst', 'Cybersecurity Analyst', 'Junior Designer',
      'Digital Marketing Specialist', 'Content Creator', 'Social Media Manager',
      'Business Analyst', 'Junior Product Manager', 'QA Engineer', 'DevOps Engineer',
      'Customer Success Representative', 'Sales Representative', 'Marketing Coordinator',
      'Operations Coordinator', 'HR Coordinator'
    ],
    durations: ['1 year', '2 years', '3+ years', 'Long-term career position'],
    availabilityTypes: ['full_time']
  },
  contract: {
    fields: [
      'Contract Software Developer', 'Contract Web Developer', 'Contract Mobile Developer',
      'Contract Data Analyst', 'Contract Designer', 'Contract Marketing Specialist',
      'Contract Content Writer', 'Contract Project Manager', 'Contract Consultant',
      'Contract QA Tester', 'Contract DevOps Engineer', 'Contract Researcher'
    ],
    durations: ['1-3 months', '3-6 months', '6-12 months', '1+ years', 'Project-based'],
    availabilityTypes: ['full_time', 'part_time']
  },
  freelance: {
    fields: [
      'Freelance Web Developer', 'Freelance Mobile App Developer', 'Freelance Designer',
      'Freelance Content Writer', 'Freelance Digital Marketer', 'Freelance Consultant',
      'Freelance Data Analyst', 'Freelance Photographer', 'Freelance Video Editor',
      'Freelance Translator', 'Freelance Tutor', 'Freelance Virtual Assistant'
    ],
    durations: ['Per project', 'Ongoing relationship', 'Short-term projects', 'Long-term projects'],
    availabilityTypes: ['flexible', 'part_time', 'full_time']
  }
}

// Remote work preferences
export const REMOTE_PREFERENCES = [
  { value: 'remote', label: 'Fully Remote', description: 'Work from anywhere' },
  { value: 'hybrid', label: 'Hybrid', description: 'Mix of remote and office work' },
  { value: 'onsite', label: 'On-site', description: 'Work from office/company location' },
  { value: 'no_preference', label: 'No Preference', description: 'Open to any arrangement' }
]
