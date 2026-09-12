export interface PreAssessmentQuestion {
  skill: string;
  question: string;
  options: string[];
  correctIndex: number;
}

export const preAssessmentQuestions: PreAssessmentQuestion[] = [
  // Statistical Analysis — India's Official Statistical System
  {
    skill: 'Statistical Analysis',
    question:
      'Under the Collection of Statistics Act, 2008, which body is the nodal agency for coordinating statistical activities across India?',
    options: [
      'Reserve Bank of India',
      'Ministry of Statistics and Programme Implementation (MoSPI)',
      'NITI Aayog',
      'Central Statistics Office only',
    ],
    correctIndex: 1,
  },
  {
    skill: 'Statistical Analysis',
    question:
      'In the National Statistical System, what is the primary purpose of the National Accounts Statistics (NAS)?',
    options: [
      'To track stock market performance',
      'To estimate GDP and other macroeconomic aggregates',
      'To conduct the Population Census',
      'To manage government payroll data',
    ],
    correctIndex: 1,
  },
  {
    skill: 'Statistical Analysis',
    question:
      'Which index is published by the Labour Bureau under MoSPI to track inflation for industrial workers?',
    options: [
      'Wholesale Price Index (WPI)',
      'Consumer Price Index for Industrial Workers (CPI-IW)',
      'Sensex',
      'Index of Industrial Production (IIP)',
    ],
    correctIndex: 1,
  },
  {
    skill: 'Statistical Analysis',
    question:
      'What does the Index of Industrial Production (IIP) measure in the Indian context?',
    options: [
      'Agricultural output across states',
      'The volume of production in mining, manufacturing, and electricity sectors',
      'Employment levels in private industry',
      'Foreign direct investment inflows',
    ],
    correctIndex: 1,
  },

  // Data Visualization — Government statistics context
  {
    skill: 'Data Visualization',
    question:
      'When presenting district-level census data across India, which visualization is most appropriate for showing spatial distribution?',
    options: [
      'A pie chart of national totals',
      'A choropleth map shaded by variable intensity',
      'A 3D bar chart',
      'A simple table without graphics',
    ],
    correctIndex: 1,
  },
  {
    skill: 'Data Visualization',
    question:
      'In the Statistical Office, which chart type best displays the monthly trend of CPI over a 12-month period?',
    options: ['Pie chart', 'Line chart', 'Scatter plot', 'Treemap'],
    correctIndex: 1,
  },

  // Survey Methodology — NSSO & Census context
  {
    skill: 'Survey Methodology',
    question:
      'The National Sample Survey (NSS) uses which sampling design for its nationwide rounds?',
    options: [
      'Simple random sampling without stratification',
      'Stratified multi-stage sampling with villages/urban blocks as first-stage units',
      'Convenience sampling from urban areas only',
      'Census enumeration of all households',
    ],
    correctIndex: 1,
  },
  {
    skill: 'Survey Methodology',
    question:
      'What is the primary purpose of the House Listing and Housing Census phase conducted before the Population Enumeration in the Census of India?',
    options: [
      'To collect income tax data',
      'To create a complete frame of houses and households for population enumeration',
      'To distribute voter ID cards',
      'To conduct the agricultural census',
    ],
    correctIndex: 1,
  },
  {
    skill: 'Survey Methodology',
    question:
      'In NSSO surveys, what does the term "first-stage units" (FSUs) typically refer to in rural areas?',
    options: [
      'Individual households',
      'Villages (Panchayat areas)',
      'Individual persons',
      'Agricultural plots',
    ],
    correctIndex: 1,
  },

  // Machine Learning — Official statistics applications
  {
    skill: 'Machine Learning',
    question:
      'How can machine learning be applied to improve official statistics production in India?',
    options: [
      'By replacing all human statisticians with AI',
      'By using NLP to automate coding of survey responses and imputing missing data',
      'By eliminating the need for surveys entirely',
      'By generating fake census data',
    ],
    correctIndex: 1,
  },
  {
    skill: 'Machine Learning',
    question:
      'Which ML approach is most suitable for predicting crop yield estimates from satellite imagery and agricultural survey data?',
    options: [
      'Unsupervised clustering only',
      'Supervised regression models using historical yield as labels',
      'Reinforcement learning with no data',
      'Association rule mining',
    ],
    correctIndex: 1,
  },

  // Python Programming — Data analysis in government context
  {
    skill: 'Python Programming',
    question:
      'Which Python library would you use to efficiently process and clean large-scale NSSO household survey data stored in CSV files?',
    options: ['Matplotlib', 'Pandas', 'Flask', 'TensorFlow'],
    correctIndex: 1,
  },
  {
    skill: 'Python Programming',
    question:
      'When working with Census 2011 data containing millions of records, which Python approach handles memory efficiently?',
    options: [
      'Loading all data into a Python list',
      'Using Pandas with chunked reading or Dask for out-of-core computation',
      'Using a for loop with open()',
      'Storing everything in Python dictionaries',
    ],
    correctIndex: 1,
  },
];
