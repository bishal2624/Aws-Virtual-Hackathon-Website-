// Central Configuration for AWS Virtual Hackathon 2026
// Strictly follows Section 1 and Section 10 of Master Implementation Prompt

import { RUBRIC_CRITERIA, RUBRIC_TOTAL_POINTS, JUDGE_GUIDELINES } from './rubric';

// The single collaboration banner constant as required by Section 1
export const COLLABORATION_BANNER = 'AWS SBG IITJ × AWS SBG GSMCOE';

// Plain-language organizer line
export const ORGANIZER_LINE = 'Organized by AWS Student Builder Groups, IIT Jodhpur, and GSMCOE.';

export const EVENT_SCHEDULE = [
  {
    phase: 1,
    name: 'Technical setup and approval preparation',
    dateLabel: 'Through October 10, 2026',
    startDateIso: '2026-09-01T00:00:00+05:30',
    endDateIso: '2026-10-10T23:59:59+05:30',
    description: 'Infrastructure provisioning, platform setup, and community readiness.'
  },
  {
    phase: 2,
    name: 'Promotion and community outreach',
    dateLabel: 'October 11 to October 30, 2026',
    startDateIso: '2026-10-11T00:00:00+05:30',
    endDateIso: '2026-10-30T23:59:59+05:30',
    description: 'Participant registration, track orientations, and architecture guidelines.'
  },
  {
    phase: 3,
    name: 'Official inauguration and kickoff',
    dateLabel: 'October 31, 2026',
    startDateIso: '2026-10-31T00:00:00+05:30',
    endDateIso: '2026-10-31T23:59:59+05:30',
    description: 'Virtual opening ceremony, challenge track briefings, and mentor synchronization.'
  },
  {
    phase: 4,
    name: 'Active building and final submissions',
    dateLabel: 'October 31 to November 5, 2026',
    startDateIso: '2026-10-31T00:00:00+05:30',
    endDateIso: '2026-11-05T23:59:59+05:30',
    description: 'Intensive 6-day cloud sprint. Final submission deadline: November 5, 2026 at 23:59 IST.'
  },
  {
    phase: 5,
    name: 'Evaluation and project review',
    dateLabel: 'November 6 to November 19, 2026',
    startDateIso: '2026-11-06T00:00:00+05:30',
    endDateIso: '2026-11-19T23:59:59+05:30',
    description: 'Rigorous 60-point rubric assessment by authorized technical review panels.'
  },
  {
    phase: 6,
    name: 'Results declaration',
    dateLabel: 'November 20 to November 25, 2026',
    startDateIso: '2026-11-20T00:00:00+05:30',
    endDateIso: '2026-11-25T23:59:59+05:30',
    description: 'Official public results publication and project showcase.'
  }
];

/**
 * Pure function to compute a phase's status relative to a given timestamp.
 * Status values: 'COMPLETED' | 'ACTIVE' | 'UPCOMING'
 * Special rule from prompt: Phases 3 and 4 overlap on October 31, so both are Active that day.
 */
export function getPhaseStatus(phaseItem, currentTime = new Date()) {
  const nowMs = typeof currentTime === 'number' ? currentTime : new Date(currentTime).getTime();
  const startMs = new Date(phaseItem.startDateIso).getTime();
  const endMs = new Date(phaseItem.endDateIso).getTime();

  if (nowMs < startMs) {
    return 'UPCOMING';
  } else if (nowMs > endMs) {
    return 'COMPLETED';
  } else {
    return 'ACTIVE';
  }
}

export const EVENT_CONFIG = {
  name: 'AWS Virtual Hackathon 2026',
  theme: 'Haunted Cloud Citadel x Systems Architecture',
  format: 'Fully online',
  headline: 'BUILD BEYOND THE ORDINARY.',
  concreteLine: 'Fully online. Build and deploy a cloud project between October 31 and November 5, 2026. Judged on a published 60-point rubric.',
  collaborationBanner: COLLABORATION_BANNER,
  organizerLine: ORGANIZER_LINE,
  dates: {
    headlineDate: 'OCTOBER 31 TO NOVEMBER 5, 2026',
    kickoff: 'October 31, 2026',
    buildingAndSubmissions: 'October 31 to November 5, 2026',
    finalDeadline: 'November 5, 2026',
    evaluation: 'November 6 to November 19, 2026',
    resultsWindow: 'November 20 to November 25, 2026',
    kickoffIso: '2026-10-31T00:00:00+05:30',
    submissionDeadlineIso: '2026-11-05T23:59:59+05:30',
    timezone: 'Asia/Kolkata (IST)'
  },
  registration: {
    status: 'OPEN', // OPEN, NOT_OPEN, CLOSED
    externalUrl: null, // null = internal modal/route
    deadlineText: 'Registration closes October 30, 2026 at 23:59 IST',
    eligibilityText: 'Eligibility criteria will be published here before registration closes.',
    teamSizeMin: 1,
    teamSizeMax: 4
  },
  organizers: [
    {
      id: 'aws-sbg-iitj',
      badge: 'IIT JODHPUR',
      name: 'AWS SBG IITJ',
      fullName: 'AWS Student Builder Group, IIT Jodhpur',
      role: 'Host Academic Chapter',
      description: 'The student-led cloud architecture and distributed systems community at the Indian Institute of Technology Jodhpur. Leading technical rubric development, challenge track formulation, and architectural review standards.'
    },
    {
      id: 'aws-sbg-gsmcoe',
      badge: 'GSMCOE',
      name: 'AWS SBG GSMCOE',
      fullName: 'AWS Student Builder Chapter, GSMCOE',
      role: 'Collaborating Community',
      description: 'The cloud computing and developer operations student community at Genba Sopanrao Moze College of Engineering. Driving participant onboarding, community coordination, and builder outreach.'
    }
  ],
  tracks: [
    {
      id: 'track-1',
      chamberNumber: '01',
      name: 'Generative AI & Intelligent Applications',
      isProposed: true,
      color: '#8B5CF6',
      accentName: 'Electric Purple',
      description: 'Build autonomous agents, multi-modal applications, and reasoning workflows utilizing foundational models and serverless AI infrastructure.',
      exampleProblems: [
        'Domain-specific retrieval augmented generation (RAG) pipelines',
        'Autonomous code review and security vulnerability scanner agent',
        'Context-aware synthetic data generator for edge devices'
      ],
      awsTechnologies: ['Amazon Bedrock', 'Amazon SageMaker AI', 'AWS Lambda'],
      techNotice: 'suggested technologies, not provided by the organizers'
    },
    {
      id: 'track-2',
      chamberNumber: '02',
      name: 'Cloud-Native Development & Serverless Systems',
      isProposed: true,
      color: '#A3FF12',
      accentName: 'Acid Green',
      description: 'Engineer resilient, event-driven architectures with high availability, low latency, and automated scalability.',
      exampleProblems: [
        'Distributed event broker with idempotency and replay guarantees',
        'Zero-cold-start microservices architecture',
        'Multi-region data synchronization mesh with conflict resolution'
      ],
      awsTechnologies: ['AWS Lambda', 'Amazon API Gateway', 'Amazon DynamoDB', 'AWS Fargate'],
      techNotice: 'suggested technologies, not provided by the organizers'
    },
    {
      id: 'track-3',
      chamberNumber: '03',
      name: 'Automation, DevOps & Developer Productivity',
      isProposed: true,
      color: '#FFB000',
      accentName: 'Amber',
      description: 'Streamline the software delivery lifecycle with infrastructure as code, automated testing pipelines, and observability monitoring.',
      exampleProblems: [
        'Automated pull request sandbox deployment and teardown',
        'Real-time cloud resource cost anomaly detection',
        'Continuous compliance and security posture scanning'
      ],
      awsTechnologies: ['AWS CodePipeline', 'Amazon CloudWatch', 'AWS CloudFormation', 'AWS CDK'],
      techNotice: 'suggested technologies, not provided by the organizers'
    },
    {
      id: 'track-4',
      chamberNumber: '04',
      name: 'Open Innovation & Real-World Solutions',
      isProposed: true,
      color: '#FF7518',
      accentName: 'Pumpkin and Moonlight',
      description: 'Address impactful challenges across community infrastructure, disaster coordination, logistics, or civic systems using cloud technologies.',
      exampleProblems: [
        'Real-time environmental sensor telemetry and anomaly network',
        'Disaster coordination and logistics routing portal',
        'Privacy-preserving verified credential system'
      ],
      awsTechnologies: ['AWS IoT Core', 'Amazon DynamoDB', 'Amazon API Gateway', 'AWS AppSync'],
      techNotice: 'suggested technologies, not provided by the organizers'
    }
  ],
  timeline: EVENT_SCHEDULE,
  rubric: RUBRIC_CRITERIA,
  rubricTotalPoints: RUBRIC_TOTAL_POINTS,
  judgeGuidelines: JUDGE_GUIDELINES,
  prizes: [
    {
      title: 'Overall Winner',
      category: 'First Place',
      badge: 'Top Honor',
      statusText: 'Prize details have not been announced yet.'
    },
    {
      title: 'Runner-Up',
      category: 'Second Place',
      badge: 'Finalist',
      statusText: 'Prize details have not been announced yet.'
    },
    {
      title: 'Special Recognition',
      category: 'Technical Category Award',
      badge: 'Excellence',
      statusText: 'Prize details have not been announced yet.'
    },
    {
      title: 'Participation Benefits',
      category: 'All Verified Submissions',
      badge: 'Perks',
      statusText: 'Prize details have not been announced yet.'
    }
  ],
  faqs: [
    {
      question: 'Who can participate?',
      answer: 'These rules have not been finalized. Official eligibility criteria will be published on this page before registrations close.'
    },
    {
      question: 'Is this a virtual event?',
      answer: 'Yes, the AWS Virtual Hackathon 2026 is fully online. Teams collaborate remotely and submit their working cloud builds through this portal.'
    },
    {
      question: 'Can participants form teams and what are the team-size limits?',
      answer: 'Participants may register individually or in teams of up to 4 members. Each team must nominate a team leader who acts as the primary contact.'
    },
    {
      question: 'Which AWS services can be used?',
      answer: 'Any AWS service relevant to your architecture is permitted. Note that no AWS service or paid resource is provided automatically by the organizers.'
    },
    {
      question: 'How are projects evaluated?',
      answer: 'Projects are evaluated on the official 60-point rubric covering Event Theme (10), AWS Implementation (10), Idea and Problem (15), UI/UX (5), Business Model/Scale (10), and Codebases/README (10).'
    },
    {
      question: 'What should a GitHub repository contain?',
      answer: 'The repository must contain complete source code with original commit history, setup and deployment instructions, architecture documentation, and a direct link to the live deployment.'
    },
    {
      question: 'How should a live demo be submitted?',
      answer: 'A publicly accessible HTTPS URL demonstrating the running application is required. A video walkthrough URL is optional unless specified otherwise by organizers.'
    },
    {
      question: 'What is the final submission deadline?',
      answer: 'The final submission deadline is November 5, 2026 at 23:59 IST. Late submissions will be rejected by the server clock.'
    },
    {
      question: 'When will results be announced?',
      answer: 'Evaluation takes place from November 6 to November 19, 2026. Official results will be declared in the window of November 20 to November 25, 2026.'
    }
  ]
};
