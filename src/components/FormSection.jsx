// Shared section heading for admin/member forms (article, category, member
// management) — a title + short description above a group of fields, so
// every backend form reads as the same system instead of each page
// inventing its own grouping style.
function FormSection({ title, description, children }) {
  return (
    <section className="space-y-4">
      <div>
        <h2 className="text-sm font-semibold text-foreground">{title}</h2>
        {description && (
          <p className="mt-0.5 text-xs text-muted-foreground">{description}</p>
        )}
      </div>
      {children}
    </section>
  )
}

export default FormSection
