import { Button } from "@/components/ui/Button";

export default function NotFound() {
  return (
    <div className="mx-auto flex max-w-[1200px] flex-col items-center justify-center px-6 py-32 text-center">
      <h1
        className="animate-fade-up text-[8rem] font-bold leading-none tracking-tighter text-error"
      >
        404
      </h1>
      <p
        className="animate-fade-up mt-4 text-2xl font-semibold text-text-secondary"
        style={{ animationDelay: "50ms" }}
      >
        Page Not Found
      </p>
      <p
        className="animate-fade-up mt-3 max-w-md text-sm text-text-muted"
        style={{ animationDelay: "100ms" }}
      >
        The page you are looking for might have been removed, had its name
        changed, or is temporarily unavailable.
      </p>
      <div
        className="animate-fade-up mt-8"
        style={{ animationDelay: "150ms" }}
      >
        <Button href="/" variant="secondary" size="lg">
          Back to Home
        </Button>
      </div>
    </div>
  );
}
