/**
 * JsonLd — injects a <script type="application/ld+json"> tag into the page.
 * Use in Server Components only (no "use client" needed).
 */
type Props = {
  schema: object;
};

export function JsonLd({ schema }: Props) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}
