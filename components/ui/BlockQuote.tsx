const BlockQuote = ({ children }: { children: React.ReactNode }) => {
  return (
    <blockquote className="border-l-4 border-gray-300 pl-6 italic text-xl md:text-2xl leading-relaxed text-gray-800">
      {children}
    </blockquote>
  );
};
export default BlockQuote;
