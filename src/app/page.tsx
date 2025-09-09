import { GradeCalculator } from '@/components/grade-calculator';

export default function Home() {
  return (
    <main className="container mx-auto px-4 py-8 md:py-12">
      <div className="mx-auto max-w-3xl">
        <header className="mb-8 text-center md:mb-12">
          <h1 className="font-headline text-4xl font-bold tracking-tight text-foreground md:text-5xl">
            GradeWise
          </h1>
          <p className="mt-3 text-lg text-muted-foreground">
            Instantly calculate your weighted grade and get AI-powered advice for
            improvement.
          </p>
        </header>
        <GradeCalculator />
      </div>
    </main>
  );
}
