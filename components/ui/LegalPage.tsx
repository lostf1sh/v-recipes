interface LegalPageProps {
  title: string;
  children: React.ReactNode;
}

export function LegalPage({ title, children }: LegalPageProps) {
  return (
    <div className="mx-auto max-w-[1200px] px-6 py-20">
      <header className="mb-10 animate-fade-up">
        <h1 className="text-3xl font-semibold tracking-tight text-text-primary">{title}</h1>
      </header>
      <div
        className="animate-fade-up text-[13px] leading-relaxed text-text-secondary
          [&_h2]:mb-3 [&_h2]:mt-10 [&_h2]:text-sm [&_h2]:font-medium [&_h2]:text-text-primary
          [&_p]:mb-4 [&_p]:leading-relaxed
          [&_ul]:mb-4 [&_ul]:list-disc [&_ul]:pl-5 [&_ul]:space-y-1 [&_ul]:marker:text-accent
          [&_a]:text-accent [&_a]:transition-colors [&_a]:hover:text-accent-hover"
        style={{ animationDelay: "50ms" }}
      >
        {children}
      </div>
    </div>
  );
}
