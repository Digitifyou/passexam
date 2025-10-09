import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const faqItems = [
  {
    question: "How realistic are your mock tests?",
    answer: "Our mock tests are designed to replicate the actual NISM exam experience, including question formats, timing, and difficulty levels. We use the same 50-question, 30-minute format as the real exam."
  },
  {
    question: "Can I practice without time pressure?",
    answer: "Absolutely! We offer both practice tests (no timer) for learning and final mock tests (timed) for exam simulation. This allows you to learn concepts thoroughly before testing under pressure."
  },
  {
    question: "Do you provide explanations for answers?",
    answer: "Yes! Every question comes with detailed explanations to help you understand the correct answer and learn from your mistakes. This is key to improving your performance."
  },
  {
    question: "How often is the content updated?",
    answer: "We update our question bank quarterly to reflect any changes in the NISM syllabus and regulations. All content is reviewed by NISM-certified professionals."
  }
];

export default function FAQPage() {
  return (
    <div className="bg-background">
      <div className="container py-12 md:py-20">
        <div className="mx-auto max-w-3xl text-center">
          <h1 className="text-4xl font-bold tracking-tight text-foreground sm:text-5xl">
            Frequently Asked Questions
          </h1>
          <p className="mt-6 text-lg text-muted-foreground">
            Have questions? We've got answers. If you can't find what you're looking for, feel free to contact us.
          </p>
        </div>

        <div className="mx-auto mt-16 max-w-4xl">
          <Accordion type="single" collapsible className="w-full">
            {faqItems.map((item, index) => (
              <AccordionItem key={index} value={`item-${index + 1}`}>
                <AccordionTrigger className="text-left">{item.question}</AccordionTrigger>
                <AccordionContent className="text-muted-foreground">
                  {item.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </div>
    </div>
  );
}