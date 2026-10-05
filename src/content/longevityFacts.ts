export interface LongevityFact {
  id: string;
  headline: string;
  body: string;
  sourceLabel: string;
  url: string;
  evidenceType: 'Meta-Analysis' | 'Cohort Study' | 'Systematic Review' | 'Epidemiological Analysis';
}

export interface LongevitySource {
  title: string;
  publication: string;
  year: string;
  url: string;
  keyFinding: string;
}

export const LONGEVITY_SECTION_HEADER = {
  badge: 'Evidence-Based Longevity',
  headline: 'Two habits. One longer life.',
  subline: 'Move often. Eat well. The research points the same way.',
  disclaimer:
    'Based on observational research: associations, not guarantees, and results vary by person. Not medical advice.',
};

export const LONGEVITY_FACTS: LongevityFact[] = [
  {
    id: 'move',
    headline: 'Move',
    body: 'Regular exercise is linked to up to 40% lower risk of early death in a review of 85 studies.',
    sourceLabel: 'British Journal of Sports Medicine 2023',
    url: 'https://rdm.ox.ac.uk/publications/1402858',
    evidenceType: 'Meta-Analysis',
  },
  {
    id: 'start-small',
    headline: 'Start small',
    body: 'The biggest gains show up between doing nothing and about 150 minutes a week.',
    sourceLabel: 'Int J Epidemiol 2011',
    url: 'https://pubmed.ncbi.nlm.nih.gov/22039197/',
    evidenceType: 'Meta-Analysis',
  },
  {
    id: 'lift',
    headline: 'Lift',
    body: 'Just 30-60 minutes a week of muscle-strengthening is linked to 10-20% lower mortality; with cardio, about 40%.',
    sourceLabel: 'US National Cohort / WEF Summary',
    url: 'https://www.ncbi.nlm.nih.gov/pmc/articles/PMC7417019/',
    evidenceType: 'Cohort Study',
  },
  {
    id: 'eat-well',
    headline: 'Eat well',
    body: 'Top-scoring healthy eating patterns are linked to roughly 1.5-3 more years of life at age 45.',
    sourceLabel: 'UK Biobank / Science Advances',
    url: 'https://doi.org/10.1126/sciadv.ads7559',
    evidenceType: 'Epidemiological Analysis',
  },
  {
    id: 'never-too-late',
    headline: 'Never too late',
    body: 'Benefits are seen when people start at any age in adulthood.',
    sourceLabel: 'Physical Activity Across Adulthood Meta-Analysis',
    url: 'https://www.weforum.org/stories/health-and-healthcare-systems/muscle-strengthening-live-longer/',
    evidenceType: 'Systematic Review',
  },
];

export const LONGEVITY_SOURCES: LongevitySource[] = [
  {
    title: 'Dose-response meta-analysis of physical activity and mortality',
    publication: 'British Journal of Sports Medicine',
    year: '2023',
    url: 'https://rdm.ox.ac.uk/publications/1402858',
    keyFinding: 'Meta-analysis across 85 prospective cohorts demonstrating strong inverse association between regular activity volume and all-cause mortality.',
  },
  {
    title: 'Physical activity and all-cause mortality: dose-response relationship in meta-analysis',
    publication: 'International Journal of Epidemiology',
    year: '2011',
    url: 'https://pubmed.ncbi.nlm.nih.gov/22039197/',
    keyFinding: 'Steepest reduction in relative mortality risk occurs moving from sedentary baseline to 150 min/week of moderate activity.',
  },
  {
    title: 'Muscle-strengthening activity and mortality in a prospective US cohort',
    publication: 'American Journal of Preventive Medicine / PMC',
    year: '2020',
    url: 'https://www.ncbi.nlm.nih.gov/pmc/articles/PMC7417019/',
    keyFinding: '30-60 min/week of muscle-strengthening independently associated with lower all-cause mortality, with maximized synergy alongside aerobic training.',
  },
  {
    title: 'Healthy dietary patterns and life expectancy in the UK Biobank',
    publication: 'Science Advances',
    year: '2023',
    url: 'https://doi.org/10.1126/sciadv.ads7559',
    keyFinding: 'Sustained shifts toward evidence-based dietary patterns associate with 1.5 to 3 additional years of life expectancy at age 45.',
  },
  {
    title: 'Muscle-strengthening activities and long-term health outcomes',
    publication: 'World Economic Forum / BJSM Synthesis',
    year: '2022',
    url: 'https://www.weforum.org/stories/health-and-healthcare-systems/muscle-strengthening-live-longer/',
    keyFinding: 'Cross-population syntheses demonstrate positive physiological adaptations occur irrespective of starting chronological age.',
  },
];
