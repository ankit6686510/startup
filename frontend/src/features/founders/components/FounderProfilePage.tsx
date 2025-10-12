'use client';

import { useState, useEffect } from 'react';
import { 
  ArrowLeftIcon,
  ExternalLinkIcon,
  ShareIcon,
  HeartIcon,
  StarIcon,
  MapPinIcon,
  CalendarIcon,
  BriefcaseIcon,
  GraduationCapIcon,
  TwitterIcon,
  LinkedinIcon,
  GithubIcon,
  MailIcon,
  PhoneIcon,
  BuildingIcon,
  TrendingUpIcon,
  UsersIcon,
  AwardIcon,
  DollarSignIcon
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { LoadingPage } from '@/components/ui/loading';
import { useFavorites } from '@/stores/application';
import { cn } from '@/lib/utils';

interface FounderProfilePageProps {
  founderId: string;
}

interface Education {
  id: string;
  institution: string;
  degree: string;
  field: string;
  startYear: number;
  endYear?: number;
  description?: string;
}

interface Experience {
  id: string;
  company: string;
  title: string;
  startDate: string;
  endDate?: string;
  current: boolean;
  description: string;
  achievements: string[];
  companyLogo?: string;
  companyUrl?: string;
}

interface Startup {
  id: string;
  name: string;
  slug: string;
  role: string;
  description: string;
  logo: string;
  founded: number;
  status: 'active' | 'acquired' | 'closed';
  funding?: string;
  stage?: string;
  industry: string;
  current: boolean;
  achievements: string[];
}

interface FounderProfile {
  id: string;
  name: string;
  title: string;
  bio: string;
  longBio: string;
  imageUrl: string;
  coverImageUrl?: string;
  location: string;
  yearsExperience: number;
  verified: boolean;
  trending: boolean;
  
  // Contact Information
  contact: {
    email?: string;
    phone?: string;
    website?: string;
    calendly?: string;
  };
  
  // Social Links
  socialLinks: {
    twitter?: string;
    linkedin?: string;
    github?: string;
    medium?: string;
    personal?: string;
  };
  
  // Professional Background
  education: Education[];
  experience: Experience[];
  startups: Startup[];
  
  // Achievements & Recognition
  achievements: Array<{
    id: string;
    title: string;
    description: string;
    year: number;
    organization?: string;
  }>;
  
  // Skills & Expertise
  skills: string[];
  interests: string[];
  
  // Statistics
  stats: {
    startupsFounded: number;
    totalFundingRaised: string;
    teamsLed: number;
    yearsExperience: number;
  };
}

export function FounderProfilePage({ founderId }: FounderProfilePageProps) {
  const [founder, setFounder] = useState<FounderProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('overview');
  const favorites = useFavorites();

  // Mock founder data
  const mockFounder: FounderProfile = {
    id: '1',
    name: 'Sarah Chen',
    title: 'CEO & Co-founder at NeuralFlow AI',
    bio: 'Former VP of AI at Google, Stanford PhD in Computer Science. Building the future of enterprise AI.',
    longBio: 'Sarah Chen is a visionary technology leader with over 10 years of experience in artificial intelligence and machine learning. She holds a PhD in Computer Science from Stanford University and has previously served as VP of AI at Google, where she led teams responsible for developing next-generation machine learning platforms. Sarah is passionate about democratizing AI technology and making it accessible to businesses of all sizes. Her expertise spans deep learning, natural language processing, and distributed systems.',
    imageUrl: 'https://images.unsplash.com/photo-1494790108755-2616b78b1aec?w=400&h=400&fit=crop&crop=face',
    coverImageUrl: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=1200&h=400&fit=crop',
    location: 'San Francisco, CA',
    yearsExperience: 12,
    verified: true,
    trending: true,
    
    contact: {
      email: 'sarah@neuralflow.ai',
      website: 'https://sarahchen.dev',
      calendly: 'https://calendly.com/sarahchen'
    },
    
    socialLinks: {
      twitter: 'https://twitter.com/sarahchen',
      linkedin: 'https://linkedin.com/in/sarahchen',
      github: 'https://github.com/sarahchen',
      medium: 'https://medium.com/@sarahchen'
    },
    
    education: [
      {
        id: '1',
        institution: 'Stanford University',
        degree: 'PhD',
        field: 'Computer Science',
        startYear: 2008,
        endYear: 2013,
        description: 'Specialized in Artificial Intelligence and Machine Learning. Dissertation on "Deep Learning for Natural Language Understanding".'
      },
      {
        id: '2',
        institution: 'MIT',
        degree: 'MS',
        field: 'Computer Science',
        startYear: 2006,
        endYear: 2008,
        description: 'Focus on algorithms and distributed systems.'
      },
      {
        id: '3',
        institution: 'UC Berkeley',
        degree: 'BS',
        field: 'Electrical Engineering & Computer Science',
        startYear: 2002,
        endYear: 2006,
        description: 'Magna Cum Laude, Phi Beta Kappa'
      }
    ],
    
    experience: [
      {
        id: '1',
        company: 'Google',
        title: 'VP of AI',
        startDate: '2018-01',
        endDate: '2023-02',
        current: false,
        description: 'Led AI product strategy and development for Google Cloud Platform. Managed a team of 200+ engineers and researchers working on machine learning infrastructure and AI services.',
        achievements: [
          'Launched Google Cloud AutoML, generating $500M+ in annual revenue',
          'Led the development of next-generation ML training infrastructure',
          'Grew team from 50 to 200+ engineers across 5 global offices',
          'Keynote speaker at Google I/O 2021 and 2022'
        ],
        companyLogo: 'https://ui-avatars.com/api/?name=Google&background=4285f4&color=fff&size=64',
        companyUrl: 'https://google.com'
      },
      {
        id: '2',
        company: 'Google',
        title: 'Director of Machine Learning',
        startDate: '2015-03',
        endDate: '2018-01',
        current: false,
        description: 'Oversaw machine learning initiatives across Google products. Built and scaled ML infrastructure serving billions of users daily.',
        achievements: [
          'Designed ML serving infrastructure handling 10B+ daily requests',
          'Led integration of ML capabilities into Google Search and Ads',
          'Established Google\'s first ML Center of Excellence'
        ],
        companyLogo: 'https://ui-avatars.com/api/?name=Google&background=4285f4&color=fff&size=64',
        companyUrl: 'https://google.com'
      },
      {
        id: '3',
        company: 'Facebook',
        title: 'Senior Research Scientist',
        startDate: '2013-06',
        endDate: '2015-03',
        current: false,
        description: 'Research and development of deep learning models for computer vision and natural language processing.',
        achievements: [
          'Published 15+ papers in top-tier conferences (NIPS, ICML, ICLR)',
          'Developed novel architectures for image recognition',
          'Patents in deep learning and neural network optimization'
        ],
        companyLogo: 'https://ui-avatars.com/api/?name=Meta&background=1877f2&color=fff&size=64',
        companyUrl: 'https://meta.com'
      }
    ],
    
    startups: [
      {
        id: '1',
        name: 'NeuralFlow AI',
        slug: 'neuralflow-ai',
        role: 'CEO & Co-founder',
        description: 'Enterprise AI platform that automates complex data analysis and provides real-time insights for business decision making.',
        logo: 'https://ui-avatars.com/api/?name=NeuralFlow+AI&background=6366f1&color=fff&size=128',
        founded: 2023,
        status: 'active',
        funding: '$15.2M',
        stage: 'Series A',
        industry: 'AI & Machine Learning',
        current: true,
        achievements: [
          'Raised $15.2M in Series A funding',
          'Grew to 45 employees in first year',
          'Acquired 250+ enterprise customers',
          'Featured in Forbes 30 Under 30'
        ]
      },
      {
        id: '2',
        name: 'DataMind Analytics',
        slug: 'datamind-analytics',
        role: 'Technical Advisor',
        description: 'AI-powered business intelligence platform for small and medium businesses.',
        logo: 'https://ui-avatars.com/api/?name=DataMind&background=10b981&color=fff&size=128',
        founded: 2021,
        status: 'acquired',
        funding: '$5.2M',
        stage: 'Seed',
        industry: 'Analytics',
        current: false,
        achievements: [
          'Acquired by Salesforce for $50M',
          'Grew from 0 to 10,000+ users in 18 months',
          'Achieved profitability in year 2'
        ]
      }
    ],
    
    achievements: [
      {
        id: '1',
        title: 'Forbes 30 Under 30',
        description: 'Recognized for contributions to artificial intelligence and entrepreneurship',
        year: 2024,
        organization: 'Forbes'
      },
      {
        id: '2',
        title: 'MIT Technology Review Innovator',
        description: 'Selected as one of 35 innovators under 35',
        year: 2022,
        organization: 'MIT Technology Review'
      },
      {
        id: '3',
        title: 'Women in AI Leadership Award',
        description: 'Outstanding leadership in advancing AI technology',
        year: 2021,
        organization: 'Women in AI'
      }
    ],
    
    skills: [
      'Artificial Intelligence', 'Machine Learning', 'Deep Learning', 'Natural Language Processing',
      'Computer Vision', 'Distributed Systems', 'Cloud Computing', 'Product Strategy',
      'Team Leadership', 'Venture Capital', 'Public Speaking', 'Technical Writing'
    ],
    
    interests: [
      'AI Ethics', 'Sustainable Technology', 'Education Technology', 'Diversity in Tech',
      'Mentoring', 'Angel Investing', 'Photography', 'Rock Climbing'
    ],
    
    stats: {
      startupsFounded: 2,
      totalFundingRaised: '$20.4M',
      teamsLed: 6,
      yearsExperience: 12
    }
  };

  useEffect(() => {
    // Simulate API call
    setLoading(true);
    setTimeout(() => {
      if (founderId === 'sarah-chen') {
        setFounder(mockFounder);
      } else {
        setError('Founder not found');
      }
      setLoading(false);
    }, 1000);
  }, [founderId]);

  if (loading) {
    return <LoadingPage />;
  }

  if (error || !founder) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            Founder Not Found
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mb-8">
            The founder profile you're looking for doesn't exist or has been removed.
          </p>
          <Button onClick={() => window.location.href = '/founders'}>
            <ArrowLeftIcon className="h-4 w-4 mr-2" />
            Back to Founders
          </Button>
        </div>
      </div>
    );
  }

  const isFavorited = favorites.founders.includes(founder.id);

  const tabs = [
    { id: 'overview', label: 'Overview' },
    { id: 'experience', label: 'Experience' },
    { id: 'startups', label: 'Startups' },
    { id: 'education', label: 'Education' },
    { id: 'contact', label: 'Contact' },
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="container mx-auto px-4 py-6">
          {/* Breadcrumb */}
          <div className="flex items-center text-sm text-gray-500 dark:text-gray-400 mb-6">
            <button 
              onClick={() => window.location.href = '/founders'}
              className="hover:text-gray-700 dark:hover:text-gray-200 flex items-center"
            >
              <ArrowLeftIcon className="h-4 w-4 mr-1" />
              All Founders
            </button>
            <span className="mx-2">/</span>
            <span className="text-gray-900 dark:text-white">{founder.name}</span>
          </div>

          {/* Cover Image */}
          {founder.coverImageUrl && (
            <div className="relative h-48 lg:h-64 rounded-xl overflow-hidden mb-8">
              <img
                src={founder.coverImageUrl}
                alt={`${founder.name} cover`}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
            </div>
          )}

          {/* Profile Header */}
          <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6">
            <div className="flex items-start space-x-6">
              <img
                src={founder.imageUrl}
                alt={`${founder.name} profile`}
                className="w-32 h-32 rounded-xl object-cover"
              />
              <div className="flex-1">
                <div className="flex items-center space-x-3 mb-3">
                  <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                    {founder.name}
                  </h1>
                  {founder.verified && (
                    <StarIcon className="h-6 w-6 text-blue-500 fill-current" />
                  )}
                  {founder.trending && (
                    <div className="flex items-center px-3 py-1 bg-gradient-to-r from-orange-100 to-red-100 dark:from-orange-900/30 dark:to-red-900/30 rounded-full">
                      <TrendingUpIcon className="h-4 w-4 text-orange-600 dark:text-orange-400 mr-1" />
                      <span className="text-sm font-medium text-orange-600 dark:text-orange-400">
                        Trending
                      </span>
                    </div>
                  )}
                </div>
                <p className="text-xl text-blue-600 dark:text-blue-400 font-medium mb-3">
                  {founder.title}
                </p>
                <p className="text-gray-600 dark:text-gray-300 text-lg mb-4">
                  {founder.bio}
                </p>
                <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
                  <div className="flex items-center">
                    <MapPinIcon className="h-4 w-4 mr-1" />
                    {founder.location}
                  </div>
                  <div className="flex items-center">
                    <BriefcaseIcon className="h-4 w-4 mr-1" />
                    {founder.yearsExperience} years experience
                  </div>
                  <div className="flex items-center">
                    <BuildingIcon className="h-4 w-4 mr-1" />
                    {founder.stats.startupsFounded} startups founded
                  </div>
                </div>
              </div>
            </div>

            {/* Actions */}
            <ProfileActions founder={founder} isFavorited={isFavorited} />
          </div>

          {/* Navigation Tabs */}
          <div className="mt-8 border-b border-gray-200 dark:border-gray-700">
            <nav className="flex space-x-8">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={cn(
                    'py-2 px-1 border-b-2 font-medium text-sm transition-colors',
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                      : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:border-gray-300 dark:hover:border-gray-600'
                  )}
                >
                  {tab.label}
                </button>
              ))}
            </nav>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {activeTab === 'overview' && <OverviewTab founder={founder} />}
            {activeTab === 'experience' && <ExperienceTab experience={founder.experience} />}
            {activeTab === 'startups' && <StartupsTab startups={founder.startups} />}
            {activeTab === 'education' && <EducationTab education={founder.education} />}
            {activeTab === 'contact' && <ContactTab founder={founder} />}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <ProfileStats stats={founder.stats} />
            <SkillsAndInterests skills={founder.skills} interests={founder.interests} />
            <Achievements achievements={founder.achievements} />
            <SocialLinks socialLinks={founder.socialLinks} />
          </div>
        </div>
      </div>
    </div>
  );
}

// Profile Actions Component
function ProfileActions({ 
  founder, 
  isFavorited 
}: { 
  founder: FounderProfile; 
  isFavorited: boolean; 
}) {
  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: `${founder.name} - ${founder.title}`,
        text: founder.bio,
        url: window.location.href,
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
    }
  };

  return (
    <div className="flex items-center space-x-3">
      {founder.contact.email && (
        <Button
          variant="outline"
          onClick={() => window.location.href = `mailto:${founder.contact.email}`}
          className="flex items-center"
        >
          <MailIcon className="h-4 w-4 mr-2" />
          Contact
        </Button>
      )}
      
      <Button
        variant={isFavorited ? "default" : "outline"}
        className={cn(
          'flex items-center',
          isFavorited && 'bg-red-600 hover:bg-red-700 text-white'
        )}
      >
        <HeartIcon className={cn('h-4 w-4 mr-2', isFavorited && 'fill-current')} />
        {isFavorited ? 'Following' : 'Follow'}
      </Button>

      <Button
        variant="outline"
        onClick={handleShare}
        className="flex items-center"
      >
        <ShareIcon className="h-4 w-4 mr-2" />
        Share
      </Button>
    </div>
  );
}

// Overview Tab Component
function OverviewTab({ founder }: { founder: FounderProfile }) {
  return (
    <div className="space-y-8">
      {/* About */}
      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
          About {founder.name}
        </h2>
        <p className="text-gray-600 dark:text-gray-300 text-lg leading-relaxed">
          {founder.longBio}
        </p>
      </div>

      {/* Current Startup */}
      {founder.startups.some(s => s.current) && (
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
            Current Venture
          </h3>
          {founder.startups
            .filter(startup => startup.current)
            .map(startup => (
              <StartupCard key={startup.id} startup={startup} />
            ))}
        </div>
      )}

      {/* Recent Experience */}
      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
          Recent Experience
        </h3>
        <div className="space-y-4">
          {founder.experience.slice(0, 2).map(exp => (
            <ExperienceCard key={exp.id} experience={exp} />
          ))}
        </div>
      </div>
    </div>
  );
}

// Experience Tab Component
function ExperienceTab({ experience }: { experience: Experience[] }) {
  return (
    <div className="space-y-6">
      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">
          Professional Experience
        </h2>
        <div className="space-y-6">
          {experience.map(exp => (
            <ExperienceCard key={exp.id} experience={exp} detailed />
          ))}
        </div>
      </div>
    </div>
  );
}

// Startups Tab Component
function StartupsTab({ startups }: { startups: Startup[] }) {
  return (
    <div className="space-y-6">
      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">
          Startups & Ventures
        </h2>
        <div className="space-y-6">
          {startups.map(startup => (
            <StartupCard key={startup.id} startup={startup} detailed />
          ))}
        </div>
      </div>
    </div>
  );
}

// Education Tab Component
function EducationTab({ education }: { education: Education[] }) {
  return (
    <div className="space-y-6">
      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">
          Education
        </h2>
        <div className="space-y-6">
          {education.map(edu => (
            <div key={edu.id} className="flex items-start space-x-4 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <div className="p-3 bg-blue-100 dark:bg-blue-900/20 rounded-lg">
                <GraduationCapIcon className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-gray-900 dark:text-white">
                  {edu.degree} in {edu.field}
                </h3>
                <p className="text-blue-600 dark:text-blue-400 font-medium">
                  {edu.institution}
                </p>
                <p className="text-gray-500 dark:text-gray-400 text-sm">
                  {edu.startYear} - {edu.endYear || 'Present'}
                </p>
                {edu.description && (
                  <p className="text-gray-600 dark:text-gray-300 mt-2">
                    {edu.description}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// Contact Tab Component
function ContactTab({ founder }: { founder: FounderProfile }) {
  return (
    <div className="space-y-6">
      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">
          Contact Information
        </h2>
        <div className="space-y-4">
          {founder.contact.email && (
            <div className="flex items-center space-x-3 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <MailIcon className="h-5 w-5 text-gray-500 dark:text-gray-400" />
              <div>
                <p className="font-medium text-gray-900 dark:text-white">Email</p>
                <a 
                  href={`mailto:${founder.contact.email}`}
                  className="text-blue-600 dark:text-blue-400 hover:underline"
                >
                  {founder.contact.email}
                </a>
              </div>
            </div>
          )}
          
          {founder.contact.website && (
            <div className="flex items-center space-x-3 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <ExternalLinkIcon className="h-5 w-5 text-gray-500 dark:text-gray-400" />
              <div>
                <p className="font-medium text-gray-900 dark:text-white">Website</p>
                <a 
                  href={founder.contact.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 dark:text-blue-400 hover:underline"
                >
                  {founder.contact.website}
                </a>
              </div>
            </div>
          )}
          
          {founder.contact.calendly && (
            <div className="flex items-center space-x-3 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <CalendarIcon className="h-5 w-5 text-gray-500 dark:text-gray-400" />
              <div>
                <p className="font-medium text-gray-900 dark:text-white">Schedule a Meeting</p>
                <a 
                  href={founder.contact.calendly}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 dark:text-blue-400 hover:underline"
                >
                  Book a time slot
                </a>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// Reusable Components
function ExperienceCard({ experience, detailed = false }: { experience: Experience; detailed?: boolean }) {
  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short' 
    });
  };

  return (
    <div className="flex items-start space-x-4">
      {experience.companyLogo && (
        <img
          src={experience.companyLogo}
          alt={`${experience.company} logo`}
          className="w-12 h-12 rounded-lg object-cover flex-shrink-0"
        />
      )}
      <div className="flex-1">
        <h3 className="font-bold text-gray-900 dark:text-white">
          {experience.title}
        </h3>
        <p className="text-blue-600 dark:text-blue-400 font-medium">
          {experience.company}
        </p>
        <p className="text-gray-500 dark:text-gray-400 text-sm">
          {formatDate(experience.startDate)} - {experience.endDate ? formatDate(experience.endDate) : 'Present'}
        </p>
        <p className="text-gray-600 dark:text-gray-300 mt-2">
          {experience.description}
        </p>
        {detailed && experience.achievements.length > 0 && (
          <div className="mt-3">
            <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Key Achievements:
            </h4>
            <ul className="space-y-1">
              {experience.achievements.map((achievement, index) => (
                <li key={index} className="text-sm text-gray-600 dark:text-gray-300 flex items-start">
                  <span className="text-blue-500 mr-2">•</span>
                  {achievement}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}

function StartupCard({ startup, detailed = false }: { startup: Startup; detailed?: boolean }) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300';
      case 'acquired': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300';
      case 'closed': return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
    }
  };

  return (
    <div className="flex items-start space-x-4 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
      <img
        src={startup.logo}
        alt={`${startup.name} logo`}
        className="w-16 h-16 rounded-lg object-cover flex-shrink-0"
      />
      <div className="flex-1">
        <div className="flex items-center space-x-3 mb-2">
          <h3 className="font-bold text-gray-900 dark:text-white">
            {startup.name}
          </h3>
          <span className={cn('inline-flex items-center px-2 py-1 rounded-full text-xs font-medium', getStatusColor(startup.status))}>
            {startup.status.charAt(0).toUpperCase() + startup.status.slice(1)}
          </span>
          {startup.current && (
            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-300">
              Current
            </span>
          )}
        </div>
        <p className="text-blue-600 dark:text-blue-400 font-medium text-sm mb-1">
          {startup.role}
        </p>
        <p className="text-gray-600 dark:text-gray-300 text-sm mb-3">
          {startup.description}
        </p>
        <div className="flex flex-wrap items-center gap-4 text-xs text-gray-500 dark:text-gray-400 mb-3">
          <div className="flex items-center">
            <CalendarIcon className="h-3 w-3 mr-1" />
            Founded {startup.founded}
          </div>
          {startup.funding && (
            <div className="flex items-center">
              <DollarSignIcon className="h-3 w-3 mr-1" />
              {startup.funding} raised
            </div>
          )}
          {startup.stage && (
            <div className="flex items-center">
              <TrendingUpIcon className="h-3 w-3 mr-1" />
              {startup.stage}
            </div>
          )}
        </div>
        {detailed && startup.achievements.length > 0 && (
          <div>
            <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Key Achievements:
            </h4>
            <ul className="space-y-1">
              {startup.achievements.map((achievement, index) => (
                <li key={index} className="text-sm text-gray-600 dark:text-gray-300 flex items-start">
                  <span className="text-blue-500 mr-2">•</span>
                  {achievement}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}

function ProfileStats({ stats }: { stats: FounderProfile['stats'] }) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
      <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
        Career Stats
      </h3>
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <span className="text-gray-600 dark:text-gray-300">Startups Founded</span>
          <span className="font-bold text-gray-900 dark:text-white">{stats.startupsFounded}</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-gray-600 dark:text-gray-300">Total Funding Raised</span>
          <span className="font-bold text-gray-900 dark:text-white">{stats.totalFundingRaised}</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-gray-600 dark:text-gray-300">Teams Led</span>
          <span className="font-bold text-gray-900 dark:text-white">{stats.teamsLed}</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-gray-600 dark:text-gray-300">Years Experience</span>
          <span className="font-bold text-gray-900 dark:text-white">{stats.yearsExperience}+</span>
        </div>
      </div>
    </div>
  );
}

function SkillsAndInterests({ skills, interests }: { skills: string[]; interests: string[] }) {
  return (
    <div className="space-y-6">
      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
          Skills & Expertise
        </h3>
        <div className="flex flex-wrap gap-2">
          {skills.map((skill, index) => (
            <span
              key={index}
              className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300"
            >
              {skill}
            </span>
          ))}
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
          Interests
        </h3>
        <div className="flex flex-wrap gap-2">
          {interests.map((interest, index) => (
            <span
              key={index}
              className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200"
            >
              {interest}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}

function Achievements({ achievements }: { achievements: FounderProfile['achievements'] }) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
      <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
        Awards & Recognition
      </h3>
      <div className="space-y-4">
        {achievements.map((achievement) => (
          <div key={achievement.id} className="flex items-start space-x-3">
            <div className="p-2 bg-yellow-100 dark:bg-yellow-900/20 rounded-lg flex-shrink-0">
              <AwardIcon className="h-4 w-4 text-yellow-600 dark:text-yellow-400" />
            </div>
            <div className="flex-1">
              <h4 className="font-semibold text-gray-900 dark:text-white text-sm">
                {achievement.title}
              </h4>
              {achievement.organization && (
                <p className="text-blue-600 dark:text-blue-400 text-sm">
                  {achievement.organization}
                </p>
              )}
              <p className="text-gray-500 dark:text-gray-400 text-sm">
                {achievement.year}
              </p>
              <p className="text-gray-600 dark:text-gray-300 text-sm mt-1">
                {achievement.description}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function SocialLinks({ socialLinks }: { socialLinks: FounderProfile['socialLinks'] }) {
  const links = [
    { key: 'twitter', icon: TwitterIcon, label: 'Twitter', color: 'text-blue-400' },
    { key: 'linkedin', icon: LinkedinIcon, label: 'LinkedIn', color: 'text-blue-600' },
    { key: 'github', icon: GithubIcon, label: 'GitHub', color: 'text-gray-600 dark:text-gray-300' },
    { key: 'medium', icon: ExternalLinkIcon, label: 'Medium', color: 'text-gray-600 dark:text-gray-300' },
  ];

  const availableLinks = links.filter(link => socialLinks[link.key as keyof typeof socialLinks]);

  if (availableLinks.length === 0) return null;

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
      <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
        Social Links
      </h3>
      <div className="space-y-3">
        {availableLinks.map((link) => {
          const IconComponent = link.icon;
          const url = socialLinks[link.key as keyof typeof socialLinks];
          return (
            <a
              key={link.key}
              href={url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center space-x-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
            >
              <IconComponent className={cn('h-5 w-5', link.color)} />
              <span className="text-gray-900 dark:text-white font-medium">
                {link.label}
              </span>
            </a>
          );
        })}
      </div>
    </div>
  );
}
