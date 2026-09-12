export interface VideoAssessmentTopic {
  id: string;
  title: string;
  description: string;
  durationSeconds: number;
  prompts: string[];
}

export const videoAssessmentTopics: VideoAssessmentTopic[] = [
  {
    id: 'nss-methodology',
    title: 'Explain NSS Sampling Methodology',
    description:
      'Present the stratified multi-stage sampling design used by the National Sample Survey Office.',
    durationSeconds: 120,
    prompts: [
      'Describe the first-stage units (FSUs) in rural and urban areas',
      'Explain how stratification is done in NSS rounds',
      'Discuss the advantages of multi-stage sampling for a large country like India',
    ],
  },
  {
    id: 'census-phases',
    title: 'Describe the Two Phases of Census of India',
    description:
      'Explain the House Listing phase and Population Enumeration phase and their purposes.',
    durationSeconds: 120,
    prompts: [
      'What is the purpose of the House Listing and Housing Census?',
      'How does it create a frame for population enumeration?',
      'What key demographic data is collected during enumeration?',
    ],
  },
  {
    id: 'cpi-vs-wpi',
    title: 'Compare CPI and WPI',
    description:
      'Discuss the differences between Consumer Price Index and Wholesale Price Index and their uses in policy.',
    durationSeconds: 90,
    prompts: [
      'What do CPI and WPI each measure?',
      'Which index does the RBI use for inflation targeting and why?',
      'Name the different CPI series published in India',
    ],
  },
  {
    id: 'gdp-gva',
    title: 'Explain GDP and GVA Concepts',
    description:
      'Differentiate between GDP at market prices and GVA at basic prices in the Indian national accounts system.',
    durationSeconds: 120,
    prompts: [
      'What is the relationship between GDP and GVA?',
      'Why did India shift to reporting GVA at basic prices?',
      'What is the current base year for the GDP series?',
    ],
  },
  {
    id: 'data-quality',
    title: 'Discuss Data Quality in Official Statistics',
    description:
      'Explain the dimensions of statistical data quality and how India ensures quality in its statistical system.',
    durationSeconds: 120,
    prompts: [
      'What are the key dimensions of data quality per UN principles?',
      'How does metadata contribute to data quality?',
      'What is imputation and why is it important?',
    ],
  },
];
