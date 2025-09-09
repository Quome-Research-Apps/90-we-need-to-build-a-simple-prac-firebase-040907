'use client';

import { useState } from 'react';
import { useForm, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Book,
  GraduationCap,
  PenSquare,
  X,
  Loader2,
  Lightbulb,
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import {
  getGradeBoostSuggestions,
  type GradeBoostSuggestionsInput,
} from '@/ai/flows/grade-boost-suggestions';

const formSchema = z.object({
  homeworkWeight: z.coerce
    .number({ invalid_type_error: 'Must be a number' })
    .min(0)
    .max(100)
    .optional(),
  homeworkScore: z.coerce
    .number({ invalid_type_error: 'Must be a number' })
    .min(0)
    .max(100)
    .optional(),
  midtermWeight: z.coerce
    .number({ invalid_type_error: 'Must be a number' })
    .min(0)
    .max(100)
    .optional(),
  midtermScore: z.coerce
    .number({ invalid_type_error: 'Must be a number' })
    .min(0)
    .max(100)
    .optional(),
  finalExamWeight: z.coerce
    .number({ invalid_type_error: 'Must be a number' })
    .min(0)
    .max(100)
    .optional(),
  finalExamScore: z.coerce
    .number({ invalid_type_error: 'Must be a number' })
    .min(0)
    .max(100)
    .optional(),
});

type FormValues = z.infer<typeof formSchema>;

const gradeComponents = [
  { name: 'homework', label: 'Homework', icon: Book },
  { name: 'midterm', label: 'Midterm', icon: PenSquare },
  { name: 'finalExam', label: 'Final Exam', icon: GraduationCap },
] as const;

type ComponentName = (typeof gradeComponents)[number]['name'];

export function GradeCalculator() {
  const [finalGrade, setFinalGrade] = useState<number | null>(null);
  const [suggestions, setSuggestions] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    mode: 'onChange',
  });

  const weights = useWatch({
    control: form.control,
    name: ['homeworkWeight', 'midtermWeight', 'finalExamWeight'],
  });
  const totalWeight = weights.reduce((acc, w) => acc + (w || 0), 0);

  const getGradeDisplay = (grade: number) => {
    if (grade >= 90)
      return { className: 'bg-accent text-accent-foreground', label: 'Excellent' };
    if (grade >= 80)
      return {
        className: 'bg-primary text-primary-foreground',
        label: 'Great Job',
      };
    if (grade >= 70)
      return {
        className: 'bg-secondary text-secondary-foreground',
        label: 'Good',
      };
    return {
      className: 'bg-destructive text-destructive-foreground',
      label: 'Needs Improvement',
    };
  };

  const onSubmit = async (data: FormValues) => {
    if (totalWeight !== 100) {
      toast({
        title: 'Check your weights',
        description: `The total weight must be exactly 100%. Current total: ${totalWeight}%.`,
        variant: 'destructive',
      });
      return;
    }

    setIsLoading(true);
    setFinalGrade(null);
    setSuggestions('');

    try {
      const sanitizedData = {
        homeworkWeight: data.homeworkWeight || 0,
        homeworkScore: data.homeworkScore || 0,
        midtermWeight: data.midtermWeight || 0,
        midtermScore: data.midtermScore || 0,
        finalExamWeight: data.finalExamWeight || 0,
        finalExamScore: data.finalExamScore || 0,
      };

      const calculatedGrade =
        sanitizedData.homeworkScore * (sanitizedData.homeworkWeight / 100) +
        sanitizedData.midtermScore * (sanitizedData.midtermWeight / 100) +
        sanitizedData.finalExamScore * (sanitizedData.finalExamWeight / 100);

      setFinalGrade(calculatedGrade);

      const aiInput: GradeBoostSuggestionsInput = {
        finalGrade: calculatedGrade,
        ...sanitizedData,
      };

      const aiResult = await getGradeBoostSuggestions(aiInput);
      setSuggestions(aiResult.suggestions);
    } catch (error) {
      console.error('An error occurred:', error);
      toast({
        title: 'Something went wrong',
        description:
          'Could not calculate grade or fetch suggestions. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const clearAll = () => {
    form.reset();
    setFinalGrade(null);
    setSuggestions('');
  };

  const clearComponent = (name: ComponentName) => {
    form.setValue(`${name}Weight`, undefined, { shouldValidate: true });
    form.setValue(`${name}Score`, undefined, { shouldValidate: true });
  };

  const gradeDisplay = finalGrade !== null ? getGradeDisplay(finalGrade) : null;

  return (
    <div className="space-y-8">
      <Card>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <CardHeader>
              <CardTitle>Grade Components</CardTitle>
              <CardDescription>
                Enter the weights and your scores for each component of your
                grade.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {gradeComponents.map((comp) => (
                <div
                  key={comp.name}
                  className="relative space-y-4 rounded-lg border bg-background p-4 shadow-sm"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <comp.icon className="h-6 w-6 text-primary" />
                      <h3 className="text-lg font-semibold">{comp.label}</h3>
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7"
                      onClick={() => clearComponent(comp.name)}
                    >
                      <X className="h-4 w-4" />
                      <span className="sr-only">Clear {comp.label} fields</span>
                    </Button>
                  </div>
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <FormField
                      control={form.control}
                      name={`${comp.name}Weight`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Weight (%)</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              placeholder="e.g. 30"
                              {...field}
                              value={field.value ?? ''}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name={`${comp.name}Score`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Score (/100)</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              placeholder="e.g. 85"
                              {...field}
                              value={field.value ?? ''}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>
              ))}
            </CardContent>
            <CardFooter className="flex-col items-start gap-4 rounded-b-lg border-t bg-card p-4 sm:flex-row sm:items-center sm:justify-between md:p-6">
              <div>
                <div
                  className={`font-semibold transition-colors ${
                    totalWeight === 100
                      ? 'text-green-600 dark:text-green-400'
                      : 'text-destructive'
                  }`}
                >
                  Total Weight: {totalWeight}%
                </div>
                {totalWeight !== 100 && (
                  <p className="text-xs text-muted-foreground">
                    Total must be 100% to calculate.
                  </p>
                )}
              </div>
              <div className="flex w-full justify-end gap-2 sm:w-auto">
                <Button type="button" variant="outline" onClick={clearAll}>
                  Clear All
                </Button>
                <Button type="submit" disabled={isLoading || totalWeight !== 100}>
                  {isLoading ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : null}
                  Calculate Grade
                </Button>
              </div>
            </CardFooter>
          </form>
        </Form>
      </Card>

      {(isLoading || finalGrade !== null) && (
        <div className="animate-in fade-in zoom-in-95 duration-500">
          <Card className="overflow-hidden">
            <CardHeader>
              <CardTitle>Your Result</CardTitle>
              <CardDescription>
                Here&apos;s your calculated final grade and AI-powered advice.
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col items-center gap-8 md:flex-row">
              <div className="flex-shrink-0">
                {isLoading && finalGrade === null ? (
                  <Skeleton className="h-40 w-40 rounded-full" />
                ) : finalGrade !== null && gradeDisplay ? (
                  <div
                    className={`relative flex h-40 w-40 flex-col items-center justify-center rounded-full transition-colors ${gradeDisplay.className}`}
                  >
                    <div className="flex items-baseline justify-center">
                      <span className="font-headline text-5xl font-bold">
                        {finalGrade.toFixed(1)}
                      </span>
                      <span className="text-2xl font-bold text-current/70">
                        %
                      </span>
                    </div>
                    <p className="mt-1 font-semibold">{gradeDisplay.label}</p>
                  </div>
                ) : null}
              </div>
              <div className="w-full flex-1 space-y-4">
                <div className="flex items-center gap-3">
                  <Lightbulb className="h-6 w-6 text-yellow-400" />
                  <h3 className="text-lg font-semibold">
                    AI Grade-Boost Suggestions
                  </h3>
                </div>
                {isLoading && !suggestions ? (
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-[80%]" />
                  </div>
                ) : (
                  <p className="whitespace-pre-wrap text-sm text-muted-foreground">
                    {suggestions}
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
