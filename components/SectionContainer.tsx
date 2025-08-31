export default function SectionContainer({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <section className="flex flex-col md:flex-row w-full ">{children}</section>
  );
}
