import type { QuizQuestion } from '@/types';

interface GeneratedQuestion {
  question_text: string;
  option_a: string;
  option_b: string;
  option_c: string;
  option_d: string;
  correct_answer: string;
  explanation: string;
}

const statisticalConcepts = [
  'mean', 'median', 'mode', 'standard deviation', 'variance', 'correlation',
  'regression', 'hypothesis testing', 'p-value', 'confidence interval',
  'sampling', 'probability', 'distribution', 'normal distribution',
  'bias', 'variance', 'outlier', 'percentile', 'quartile', 'skewness',
  'kurtosis', 'significance level', 'null hypothesis', 'alternative hypothesis',
  'type I error', 'type II error', 'power', 'sample size', 'census', 'survey',
  'data collection', 'questionnaire', 'sampling frame', 'stratified sampling',
  'cluster sampling', 'systematic sampling', 'random sampling', 'weighting',
  'estimation', 'imputation', 'data quality', 'metadata', 'classification',
  'index number', 'time series', 'seasonal adjustment', 'trend', 'cyclical',
  'descriptive statistics', 'inferential statistics', 'bayesian',
];

function extractSentences(text: string): string[] {
  return text
    .replace(/\n+/g, ' ')
    .split(/(?<=[.!?])\s+/)
    .map((s) => s.trim())
    .filter((s) => s.length > 30 && s.length < 300);
}

function pickRandom<T>(arr: T[], n: number): T[] {
  const shuffled = [...arr].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, n);
}

function findConceptInSentence(sentence: string): string | null {
  const lower = sentence.toLowerCase();
  for (const concept of statisticalConcepts) {
    if (lower.includes(concept)) return concept;
  }
  return null;
}

function generateDefinitionQuestion(concept: string, sentence: string): GeneratedQuestion {
  const wrongDefs = [
    'A method used exclusively for data visualization',
    'A type of non-probability sampling technique',
    'A software tool for statistical computing',
    'A measure of central tendency only',
    'A process of data entry and validation',
    'A graphical representation of data points',
    'A type of categorical variable',
  ];

  const distractors = pickRandom(wrongDefs, 3);
  const options = pickRandom(
    [
      { text: sentence, isCorrect: true },
      { text: distractors[0], isCorrect: false },
      { text: distractors[1], isCorrect: false },
      { text: distractors[2], isCorrect: false },
    ],
    4
  );

  const letters = ['a', 'b', 'c', 'd'];
  const correctIdx = options.findIndex((o) => o.isCorrect);
  const correctLetter = letters[correctIdx];

  return {
    question_text: `Which of the following best describes the concept of "${concept}" as mentioned in the learning material?`,
    option_a: options[0].text,
    option_b: options[1].text,
    option_c: options[2].text,
    option_d: options[3].text,
    correct_answer: correctLetter,
    explanation: `The correct answer is based on the learning material provided. "${concept}" is described in the context of the passage.`,
  };
}

function generateFillInBlankQuestion(sentence: string, concept: string): GeneratedQuestion {
  const censored = sentence.replace(
    new RegExp(concept, 'gi'),
    '_____'
  );

  const wrongOptions = statisticalConcepts
    .filter((c) => c !== concept)
    .sort(() => Math.random() - 0.5)
    .slice(0, 3);

  const allOptions = pickRandom(
    [
      { text: concept, isCorrect: true },
      { text: wrongOptions[0], isCorrect: false },
      { text: wrongOptions[1], isCorrect: false },
      { text: wrongOptions[2], isCorrect: false },
    ],
    4
  );

  const letters = ['a', 'b', 'c', 'd'];
  const correctIdx = allOptions.findIndex((o) => o.isCorrect);
  const correctLetter = letters[correctIdx];

  return {
    question_text: `Fill in the blank: ${censored}`,
    option_a: allOptions[0].text,
    option_b: allOptions[1].text,
    option_c: allOptions[2].text,
    option_d: allOptions[3].text,
    correct_answer: correctLetter,
    explanation: `The blank should be filled with "${concept}" based on the context of the learning material.`,
  };
}

function generateTrueFalseQuestion(sentence: string): GeneratedQuestion {
  const isTrue = Math.random() > 0.5;
  const modified = isTrue
    ? sentence
    : sentence.replace(/\b(is|are|was|were|can|will|has|have)\b/i, (m) => {
        const opposites: Record<string, string> = {
          is: 'is not', are: 'are not', was: 'was not', were: 'were not',
          can: 'cannot', will: 'will not', has: 'has not', have: 'have not',
        };
        return opposites[m.toLowerCase()] ?? `not ${m}`;
      });

  const options = pickRandom(
    [
      { text: 'True', isCorrect: isTrue },
      { text: 'False', isCorrect: !isTrue },
      { text: 'Cannot be determined from the text', isCorrect: false },
      { text: 'Partially true', isCorrect: false },
    ],
    4
  );

  const letters = ['a', 'b', 'c', 'd'];
  const correctIdx = options.findIndex((o) => o.isCorrect);
  const correctLetter = letters[correctIdx];

  return {
    question_text: `Based on the learning material, determine if the following statement is correct: "${modified}"`,
    option_a: options[0].text,
    option_b: options[1].text,
    option_c: options[2].text,
    option_d: options[3].text,
    correct_answer: correctLetter,
    explanation: isTrue
      ? 'The statement is directly supported by the learning material.'
      : 'The statement has been modified and does not match the original learning material.',
  };
}

export function generateQuizFromText(text: string, numQuestions = 5): GeneratedQuestion[] {
  const sentences = extractSentences(text);

  if (sentences.length === 0) {
    return [];
  }

  const questions: GeneratedQuestion[] = [];
  const usedSentences = new Set<number>();

  const sentencesWithConcepts = sentences
    .map((s, idx) => ({ sentence: s, idx, concept: findConceptInSentence(s) }))
    .filter((s) => s.concept !== null);

  const conceptSentences = sentencesWithConcepts.length > 0
    ? sentencesWithConcepts
    : sentences.map((s, idx) => ({ sentence: s, idx, concept: 'statistics' as string | null }));

  const selected = pickRandom(conceptSentences, Math.min(numQuestions, conceptSentences.length));

  const generators = [generateDefinitionQuestion, generateFillInBlankQuestion, generateTrueFalseQuestion];

  for (const item of selected) {
    if (usedSentences.has(item.idx)) continue;
    usedSentences.add(item.idx);

    const generator = generators[Math.floor(Math.random() * generators.length)];

    if (generator === generateFillInBlankQuestion && item.concept) {
      questions.push(generateFillInBlankQuestion(item.sentence, item.concept));
    } else if (generator === generateDefinitionQuestion && item.concept) {
      questions.push(generateDefinitionQuestion(item.concept, item.sentence));
    } else {
      questions.push(generateTrueFalseQuestion(item.sentence));
    }

    if (questions.length >= numQuestions) break;
  }

  return questions;
}

export type { GeneratedQuestion };
