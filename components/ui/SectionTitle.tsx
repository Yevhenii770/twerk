type SectionTitleProps = {
  children: React.ReactNode;
  className?: string;
};
export default function SectionTitle({
  children,
  className = "",
}: SectionTitleProps) {
  return (
    <h3 className={`text-black text-2xl font-bold ${className}`}>{children}</h3>
  );
}
