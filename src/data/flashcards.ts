export interface Flashcard {
  id: string;
  topic: string;
  front: string;
  back: string;
}

export const flashcardTopics = [
  'National Statistical System',
  'Census Operations',
  'Survey Methodology',
  'Price Indices & Inflation',
  'National Accounts',
  'Data Quality & Standards',
];

export const flashcards: Flashcard[] = [
  // National Statistical System
  {
    id: 'nss-1',
    topic: 'National Statistical System',
    front: 'What is the role of MoSPI in India?',
    back: 'The Ministry of Statistics and Programme Implementation (MoSPI) is the nodal agency for the Indian statistical system. It coordinates statistical activities, publishes national accounts, and oversees the CSO and NSSO.',
  },
  {
    id: 'nss-2',
    topic: 'National Statistical System',
    front: 'What is the National Statistical Commission (NSC)?',
    back: 'The NSC is a statutory body established under the Collection of Statistics Act, 2008. It oversees the statistical system, ensures data quality, and advises the government on statistical policy.',
  },
  {
    id: 'nss-3',
    topic: 'National Statistical System',
    front: 'What are the two main wings of MoSPI?',
    back: 'The Central Statistics Office (CSO) — responsible for national accounts, IIP, and economic censuses — and the National Sample Survey Office (NSSO) — responsible for large-scale sample surveys on socio-economic topics.',
  },
  {
    id: 'nss-4',
    topic: 'National Statistical System',
    front: 'What is the purpose of the Statistical Master Plan?',
    back: 'The Statistical Master Plan (SMP) is a strategic framework to strengthen India\'s statistical system by modernizing data collection, improving quality, and building capacity across states and central ministries.',
  },

  // Census Operations
  {
    id: 'census-1',
    topic: 'Census Operations',
    front: 'How often is the Census of India conducted?',
    back: 'The Census of India is conducted every 10 years (decennial). The first systematic census was in 1881. Census 2011 was the 15th census, and Census 2021 was delayed due to the pandemic.',
  },
  {
    id: 'census-2',
    topic: 'Census Operations',
    front: 'What are the two phases of the Census of India?',
    back: 'Phase 1: House Listing and Housing Census — creates a complete frame of houses and collects housing data. Phase 2: Population Enumeration — records individual demographic and socio-economic details for each person.',
  },
  {
    id: 'census-3',
    topic: 'Census Operations',
    front: 'What is the role of the Registrar General of India?',
    back: 'The Registrar General and Census Commissioner of India, under the Ministry of Home Affairs, conducts the Census and maintains the Civil Registration System (CRS) for births and deaths.',
  },
  {
    id: 'census-4',
    topic: 'Census Operations',
    front: 'What is the difference between de facto and de jure census enumeration?',
    back: 'De facto: persons are counted where they are found on census night (place of enumeration). De jure: persons are counted at their usual place of residence. India uses a de jure approach with a de facto element for transient populations.',
  },

  // Survey Methodology
  {
    id: 'survey-1',
    topic: 'Survey Methodology',
    front: 'What sampling design does the NSS use?',
    back: 'The NSS uses stratified multi-stage sampling. In rural areas, villages are first-stage units (FSUs) and households are ultimate-stage units (USUs). In urban areas, Urban Frame Survey (UFS) blocks serve as FSUs.',
  },
  {
    id: 'survey-2',
    topic: 'Survey Methodology',
    front: 'What is the NSSO round system?',
    back: 'NSSO conducts surveys in "rounds," each lasting 6-12 months and focusing on specific themes (e.g., consumption expenditure, employment, health). As of 2024, over 80 rounds have been completed since 1950.',
  },
  {
    id: 'survey-3',
    topic: 'Survey Methodology',
    front: 'What is the Periodic Labour Force Survey (PLFS)?',
    back: 'PLFS is an annual NSSO survey launched in 2017 that provides quarterly estimates of key employment and unemployment indicators in urban areas and annual estimates for rural and urban India.',
  },
  {
    id: 'survey-4',
    topic: 'Survey Methodology',
    front: 'What is non-sampling error in surveys?',
    back: 'Non-sampling errors arise from coverage, sampling frame, response, non-response, processing, and measurement issues. Unlike sampling error, they cannot be reduced by increasing sample size — they require better survey design and quality control.',
  },

  // Price Indices & Inflation
  {
    id: 'price-1',
    topic: 'Price Indices & Inflation',
    front: 'What is the difference between CPI and WPI?',
    back: 'CPI (Consumer Price Index) measures changes in retail prices of goods and services consumed by households. WPI (Wholesale Price Index) measures price changes at the wholesale/trade level. RBI uses CPI as its key inflation target indicator.',
  },
  {
    id: 'price-2',
    topic: 'Price Indices & Inflation',
    front: 'What are the different CPI series published in India?',
    back: 'CPI-IW (Industrial Workers), CPI-AL (Agricultural Labourers), CPI-UNME (Urban Non-Manual Employees, discontinued), and CPI (Combined) — the headline CPI used for monetary policy targeting.',
  },
  {
    id: 'price-3',
    topic: 'Price Indices & Inflation',
    front: 'What is the base year for the current CPI series?',
    back: 'The current CPI (Combined) series uses 2012 as the base year (=100). The WPI series also uses 2011-12 as the base year. Base years are revised periodically to reflect current consumption/production patterns.',
  },

  // National Accounts
  {
    id: 'na-1',
    topic: 'National Accounts',
    front: 'What is GDP at market prices vs factor cost?',
    back: 'GDP at market prices includes indirect taxes net of subsidies. GDP at factor cost (now GDP at basic prices) excludes these. India now reports GDP at market prices and Gross Value Added (GVA) at basic prices.',
  },
  {
    id: 'na-2',
    topic: 'National Accounts',
    front: 'What is the difference between GDP and GVA?',
    back: 'GDP = GVA + Product taxes - Product subsidies. GVA measures the value of output minus intermediate consumption at the sectoral level (agriculture, industry, services). GDP adds taxes and subtracts subsidies to get the final market value.',
  },
  {
    id: 'na-3',
    topic: 'National Accounts',
    front: 'What base year does India\'s GDP series currently use?',
    back: 'India\'s current GDP series uses 2011-12 as the base year. The CSO (now NSO) periodically revises the base year to reflect updated structure of the economy, new data sources, and improved methodology.',
  },

  // Data Quality & Standards
  {
    id: 'dq-1',
    topic: 'Data Quality & Standards',
    front: 'What are the dimensions of statistical data quality per the UN Fundamental Principles?',
    back: 'Relevance, accuracy, timeliness, accessibility, interpretability, coherence, and methodological soundness. India\'s statistical system follows these principles aligned with the UN National Quality Assurance Framework (NQAF).',
  },
  {
    id: 'dq-2',
    topic: 'Data Quality & Standards',
    front: 'What is the purpose of metadata in official statistics?',
    back: 'Metadata provides context about the data — definitions, methodology, sampling design, collection period, quality notes, and limitations. It enables users to correctly interpret and compare statistics across sources and time.',
  },
  {
    id: 'dq-3',
    topic: 'Data Quality & Standards',
    front: 'What is imputation in the context of survey data?',
    back: 'Imputation is the process of replacing missing or invalid values with estimated values using methods like mean imputation, regression imputation, or hot-deck imputation. It reduces non-response bias but must be documented in metadata.',
  },
];
