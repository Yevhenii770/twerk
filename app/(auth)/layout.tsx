import type { Metadata } from 'next'

// Login page: keep it out of search results.
export const metadata: Metadata = { robots: { index: false, follow: false } }

export default function MarketingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <div>{children}</div>
    </>
  );
}
