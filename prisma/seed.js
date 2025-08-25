const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Seeding sample internships...')

  // Create some learning paths first
  const webDevPath = await prisma.learningPath.create({
    data: {
      title: 'Full Stack Web Development',
      description: 'Complete web development journey from frontend to backend',
      tasks: {
        create: [
          {
            title: 'HTML & CSS Fundamentals',
            description: 'Build a responsive website using HTML5 and CSS3',
            content: 'Create a personal portfolio website with responsive design. Focus on semantic HTML, CSS Grid, and Flexbox.',
            contentType: 'TEXT',
            order: 1,
            deadlineOffset: 7
          },
          {
            title: 'JavaScript Basics',
            description: 'Learn JavaScript fundamentals and DOM manipulation',
            content: 'Add interactivity to your portfolio with JavaScript. Include form validation, animations, and dynamic content.',
            contentType: 'TEXT',
            order: 2,
            deadlineOffset: 14
          },
          {
            title: 'React Components',
            description: 'Build reusable React components',
            content: 'Convert your portfolio to React. Create reusable components and manage state effectively.',
            contentType: 'TEXT',
            order: 3,
            deadlineOffset: 21
          },
          {
            title: 'Backend API Development',
            description: 'Create a REST API with Node.js',
            content: 'Build a REST API for your portfolio using Node.js and Express. Include CRUD operations and authentication.',
            contentType: 'TEXT',
            order: 4,
            deadlineOffset: 35
          }
        ]
      }
    }
  })

  const dataAnalysisPath = await prisma.learningPath.create({
    data: {
      title: 'Data Analysis & Visualization',
      description: 'Learn data analysis techniques and create meaningful visualizations',
      tasks: {
        create: [
          {
            title: 'Data Collection & Cleaning',
            description: 'Gather and clean real-world data',
            content: 'Find a public dataset and clean it using Python pandas. Document your data cleaning process.',
            contentType: 'TEXT',
            order: 1,
            deadlineOffset: 7
          },
          {
            title: 'Statistical Analysis',
            description: 'Perform statistical analysis on your dataset',
            content: 'Use statistical methods to analyze your data. Calculate descriptive statistics and identify patterns.',
            contentType: 'TEXT',
            order: 2,
            deadlineOffset: 14
          },
          {
            title: 'Data Visualization',
            description: 'Create compelling visualizations',
            content: 'Create interactive visualizations using Python (matplotlib, seaborn) or tools like Tableau.',
            contentType: 'TEXT',
            order: 3,
            deadlineOffset: 21
          }
        ]
      }
    }
  })

  const marketingPath = await prisma.learningPath.create({
    data: {
      title: 'Digital Marketing Campaign',
      description: 'Plan and execute a complete digital marketing campaign',
      tasks: {
        create: [
          {
            title: 'Market Research',
            description: 'Conduct comprehensive market research',
            content: 'Research target audience, competitors, and market trends. Create buyer personas and competitive analysis.',
            contentType: 'TEXT',
            order: 1,
            deadlineOffset: 7
          },
          {
            title: 'Content Strategy',
            description: 'Develop a content marketing strategy',
            content: 'Create a content calendar and produce sample content for different platforms (blog, social media, email).',
            contentType: 'TEXT',
            order: 2,
            deadlineOffset: 14
          },
          {
            title: 'Campaign Execution',
            description: 'Launch and monitor your campaign',
            content: 'Execute your marketing campaign across chosen channels. Track metrics and optimize performance.',
            contentType: 'TEXT',
            order: 3,
            deadlineOffset: 21
          }
        ]
      }
    }
  })

  // Create sample internships
  const internships = [
    {
      title: 'Frontend Web Developer Intern',
      description: 'Join our frontend team and work on cutting-edge React applications. You\'ll collaborate with designers and backend developers to create amazing user experiences. Perfect for students passionate about UI/UX and modern JavaScript frameworks.',
      duration: 12,
      capacity: 5,
      location: 'Remote',
      field: 'Technology',
      startDate: new Date('2025-03-01'),
      endDate: new Date('2025-05-31'),
      learningPathId: webDevPath.id
    },
    {
      title: 'Full Stack Developer Intern',
      description: 'Work across the entire technology stack in this comprehensive internship. You\'ll build both frontend and backend applications, work with databases, and deploy to production. Ideal for computer science students looking for broad exposure.',
      duration: 16,
      capacity: 3,
      location: 'Hybrid',
      field: 'Technology',
      startDate: new Date('2025-02-15'),
      endDate: new Date('2025-06-15'),
      learningPathId: webDevPath.id
    },
    {
      title: 'Data Analytics Intern',
      description: 'Dive into the world of data science and analytics. You\'ll work with real business data, create insights through statistical analysis, and build dashboards for stakeholders. Great opportunity for students interested in data-driven decision making.',
      duration: 10,
      capacity: 4,
      location: 'On-site',
      field: 'Data Science',
      startDate: new Date('2025-03-15'),
      endDate: new Date('2025-05-24'),
      learningPathId: dataAnalysisPath.id
    },
    {
      title: 'Digital Marketing Intern',
      description: 'Learn modern digital marketing techniques including social media marketing, content creation, SEO, and paid advertising. You\'ll work on real campaigns and see direct impact on business metrics.',
      duration: 8,
      capacity: 6,
      location: 'Remote',
      field: 'Marketing',
      startDate: new Date('2025-04-01'),
      endDate: new Date('2025-05-26'),
      learningPathId: marketingPath.id
    },
    {
      title: 'UI/UX Design Intern',
      description: 'Focus on user experience and interface design. You\'ll conduct user research, create wireframes and prototypes, and work closely with development teams to implement designs.',
      duration: 12,
      capacity: 2,
      location: 'Hybrid',
      field: 'Design',
      startDate: new Date('2025-03-10'),
      endDate: new Date('2025-06-02'),
      learningPathId: null // No learning path for this one
    },
    {
      title: 'Machine Learning Research Intern',
      description: 'Cutting-edge research position working on machine learning algorithms and AI applications. You\'ll work with PhD researchers and contribute to academic publications.',
      duration: 20,
      capacity: 2,
      location: 'On-site',
      field: 'Research',
      startDate: new Date('2025-06-01'),
      endDate: new Date('2025-10-31'),
      learningPathId: dataAnalysisPath.id
    }
  ]

  for (const internshipData of internships) {
    const internship = await prisma.internship.create({
      data: internshipData
    })
    console.log(`✅ Created internship: ${internship.title}`)
  }

  console.log('🎉 Seeding completed successfully!')
}

main()
  .catch((e) => {
    console.error('❌ Error during seeding:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
