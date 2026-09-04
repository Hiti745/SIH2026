export interface PreAssessmentQuestion {
  skill: string;
  question: string;
  options: string[];
  correctIndex: number;
}

export const preAssessmentQuestions: PreAssessmentQuestion[] = [
  {
    skill: 'Statistical Analysis',
    question: 'What does a p-value of 0.03 indicate in hypothesis testing at a 0.05 significance level?',
    options: [
      'Fail to reject the null hypothesis',
      'Reject the null hypothesis',
      'The result is not statistically significant',
      'The sample size is too small',
    ],
    correctIndex: 1,
  },
  {
    skill: 'Statistical Analysis',
    question: 'Which measure of central tendency is most affected by extreme outliers?',
    options: ['Median', 'Mode', 'Mean', 'Range'],
    correctIndex: 2,
  },
  {
    skill: 'Data Visualization',
    question: 'Which chart type is best suited for showing the distribution of a continuous variable?',
    options: ['Pie chart', 'Histogram', 'Bar chart', 'Line chart'],
    correctIndex: 1,
  },
  {
    skill: 'Data Visualization',
    question: 'What is the primary purpose of a scatter plot?',
    options: [
      'To show proportions of a whole',
      'To show the relationship between two variables',
      'To display hierarchical data',
      'To show change over time',
    ],
    correctIndex: 1,
  },
  {
    skill: 'Survey Methodology',
    question: 'In stratified sampling, the population is divided into:',
    options: [
      'Random clusters',
      'Homogeneous groups called strata',
      'Convenience groups',
      'Quota groups',
    ],
    correctIndex: 1,
  },
  {
    skill: 'Survey Methodology',
    question: 'What is non-response bias in survey research?',
    options: [
      'When respondents give socially desirable answers',
      'When the questionnaire is too long',
      'When those who do not respond differ systematically from those who do',
      'When the sampling frame is outdated',
    ],
    correctIndex: 2,
  },
  {
    skill: 'Machine Learning',
    question: 'Which type of learning uses labeled training data?',
    options: ['Unsupervised learning', 'Reinforcement learning', 'Supervised learning', 'Transfer learning'],
    correctIndex: 2,
  },
  {
    skill: 'Machine Learning',
    question: 'What does overfitting mean in machine learning?',
    options: [
      'The model performs well on training data but poorly on new data',
      'The model is too simple to capture patterns',
      'The training data has too many features',
      'The learning rate is too high',
    ],
    correctIndex: 0,
  },
  {
    skill: 'Python Programming',
    question: 'Which Python library is primarily used for data manipulation and analysis?',
    options: ['Matplotlib', 'Pandas', 'Scikit-learn', 'TensorFlow'],
    correctIndex: 1,
  },
  {
    skill: 'Python Programming',
    question: 'What does the NumPy library provide for Python?',
    options: [
      'Web development tools',
      'Multi-dimensional array objects and mathematical functions',
      'Database connectivity',
      'GUI components',
    ],
    correctIndex: 1,
  },
];
