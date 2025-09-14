import { SectionContainer } from "@/components/ui";

const faqs = [
  {
    question: "What dance styles do you teach?",
    answer:
      "We offer Hip Hop, Contemporary, Jazz Funk, and other modern dance styles.",
  },
  {
    question: "Are the classes suitable for beginners?",
    answer:
      "Yes! We have beginner-friendly classes where we gradually introduce basic steps and technique.",
  },
  {
    question: "What should I bring to class?",
    answer: "Comfortable clothing, clean shoes, and a bottle of water.",
  },
  {
    question: "Can I try a free trial class?",
    answer:
      "Yes, the first trial class is available at a special price or free during promotions.",
  },
  {
    question: "How long is each class?",
    answer: "Classes typically last between 60 and 90 minutes.",
  },
  {
    question: "Do I need a partner?",
    answer:
      "No, most classes do not require a partner. If a partner is needed, we will let you know in advance.",
  },
  {
    question: "How can I sign up for a class?",
    answer:
      "You can sign up online through our website or contact us directly.",
  },
  {
    question: "Are there any age restrictions?",
    answer:
      "We welcome students from 6 years old and up. There are no upper age limits for adults.",
  },
];

export default function Faq() {
  return (
    <SectionContainer>
      <div className="p-5 bg-black h-full w-full">
        <div className="flex flex-col items-center">
          <h2 className="mb-10 text-4xl">Frequently Asked Questions</h2>
          <ul>
            {faqs.map((ell, i) => (
              <li key={i} className="mb-10">
                <h3 className="text-2xl text-bold mb-2">{ell.question}</h3>
                <p>{ell.answer}</p>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </SectionContainer>
  );
}
