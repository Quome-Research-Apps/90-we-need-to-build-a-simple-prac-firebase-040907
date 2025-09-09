'use server';

/**
 * @fileOverview A Genkit flow for providing grade improvement suggestions.
 *
 * - getGradeBoostSuggestions - A function that generates personalized suggestions to improve a student's grade.
 * - GradeBoostSuggestionsInput - The input type for the getGradeBoostSuggestions function.
 * - GradeBoostSuggestionsOutput - The return type for the getGradeBoostSuggestions function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GradeBoostSuggestionsInputSchema = z.object({
  finalGrade: z.number().describe('The final calculated grade of the student.'),
  homeworkWeight: z.number().describe('The weight of the homework component.'),
  midtermWeight: z.number().describe('The weight of the midterm component.'),
  finalExamWeight: z.number().describe('The weight of the final exam component.'),
  homeworkScore: z.number().describe('The score of the homework component.'),
  midtermScore: z.number().describe('The score of the midterm component.'),
  finalExamScore: z.number().describe('The score of the final exam component.'),
});
export type GradeBoostSuggestionsInput = z.infer<typeof GradeBoostSuggestionsInputSchema>;

const GradeBoostSuggestionsOutputSchema = z.object({
  suggestions: z.string().describe('Personalized suggestions to improve the grade.'),
});
export type GradeBoostSuggestionsOutput = z.infer<typeof GradeBoostSuggestionsOutputSchema>;

export async function getGradeBoostSuggestions(input: GradeBoostSuggestionsInput): Promise<GradeBoostSuggestionsOutput> {
  return gradeBoostSuggestionsFlow(input);
}

const gradeBoostSuggestionsPrompt = ai.definePrompt({
  name: 'gradeBoostSuggestionsPrompt',
  input: {schema: GradeBoostSuggestionsInputSchema},
  output: {schema: GradeBoostSuggestionsOutputSchema},
  prompt: `You are an AI assistant that provides personalized suggestions to students on how to improve their grades based on their performance in different components of the course.

  Based on the final grade and the weights and scores of homework, midterms, and final exam, provide specific and actionable suggestions to the student.

  Final Grade: {{{finalGrade}}}
  Homework Weight: {{{homeworkWeight}}}
  Midterm Weight: {{{midtermWeight}}}
  Final Exam Weight: {{{finalExamWeight}}}
  Homework Score: {{{homeworkScore}}}
  Midterm Score: {{{midtermScore}}}
  Final Exam Score: {{{finalExamScore}}}

  Suggestions:
`,
});

const gradeBoostSuggestionsFlow = ai.defineFlow(
  {
    name: 'gradeBoostSuggestionsFlow',
    inputSchema: GradeBoostSuggestionsInputSchema,
    outputSchema: GradeBoostSuggestionsOutputSchema,
  },
  async input => {
    const {output} = await gradeBoostSuggestionsPrompt(input);
    return output!;
  }
);
