export function LabFrame({
  title,
  lead,
  children,
}: {
  title: string;
  lead: string;
  children: React.ReactNode;
}) {
  return (
    <section className="mt-12 rounded-2xl border bg-card px-4 py-5 sm:px-6 sm:py-6">
      <p className="text-xs tracking-[0.18em] text-primary">动手</p>
      <h2 className="mt-2 font-serif text-2xl text-foreground">{title}</h2>
      <p className="mt-2 max-w-2xl text-sm leading-7 text-muted-foreground">{lead}</p>
      <div className="mt-5">{children}</div>
    </section>
  );
}
