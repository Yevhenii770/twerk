type SectionTitleProps = {
  children: React.ReactNode;
  className?: string;
};
export default function SectionText({
  children,
  className = "",
}: SectionTitleProps) {
  return <p className={`text-black ${className}`}>{children}</p>;
}
