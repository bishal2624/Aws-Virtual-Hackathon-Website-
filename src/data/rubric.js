// Official 60-point judging rubric
// Defined once in this shared constants module. The 3D scene, DOM table,
// form validation, backend, and unit tests all import it.

export const RUBRIC_CRITERIA = [
  {
    id: 'theme',
    number: 1,
    criterion: 'Event Theme',
    maxPoints: 10,
    focus: 'Alignment with hackathon objectives, relevance, thematic focus'
  },
  {
    id: 'aws',
    number: 2,
    criterion: 'AWS Implementation / Deployment',
    maxPoints: 10,
    focus: 'AWS service integration, cloud architecture, serverless capabilities, live deployment'
  },
  {
    id: 'idea',
    number: 3,
    criterion: 'Idea and Problem Statement',
    maxPoints: 15,
    focus: 'Originality, impact, problem clarity, novelty, solution effectiveness'
  },
  {
    id: 'uiux',
    number: 4,
    criterion: 'UI / UX',
    maxPoints: 5,
    focus: 'Visual design, usability, accessibility, navigation, interface polish'
  },
  {
    id: 'business',
    number: 5,
    criterion: 'Business Model / Scale',
    maxPoints: 10,
    focus: 'Market opportunity, financial viability, scalability, practical application, growth potential'
  },
  {
    id: 'codebase',
    number: 6,
    criterion: 'Codebases and README',
    maxPoints: 10,
    focus: 'Code quality, structure, repository organization, documentation, setup instructions, README quality'
  }
];

export const RUBRIC_TOTAL_POINTS = 60;

export const JUDGE_GUIDELINES = [
  'Award points up to the maximum specified for each criterion.',
  'Prioritize functional live demos over theoretical concepts.',
  'Verify original commits and readable, documented code.'
];

export function calculateRubricSum() {
  return RUBRIC_CRITERIA.reduce((sum, item) => sum + item.maxPoints, 0);
}

export function validateRubric() {
  const total = calculateRubricSum();
  if (total !== RUBRIC_TOTAL_POINTS) {
    throw new Error(`Rubric points sum to ${total}, but must equal exactly ${RUBRIC_TOTAL_POINTS}`);
  }
  return true;
}
