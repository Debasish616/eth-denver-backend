import { ChevronRight } from "lucide-react";

interface FAQItemProps {
  question: string;
  answer: string;
}

export default function FAQItem({ question, answer }: FAQItemProps) {
  return (
    <div className="space-y-2">
      <h3 className="font-medium flex items-center">
        <ChevronRight className="h-4 w-4 mr-1 text-primary" />
        {question}
      </h3>
      <p className="text-sm text-muted-foreground pl-5">
        {answer}
      </p>
    </div>
  );
}