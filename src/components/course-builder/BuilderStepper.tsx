import { cn } from "../../utils/cn";

interface BuilderStepperProps {
  currentStep: number;
  onStepChange?: (step: number) => void;
}

const steps = [
  { id: 1, title: "بيانات الكورس" },
  { id: 2, title: "الأبواب والدروس" },
  { id: 3, title: "الامتحانات" },
  { id: 4, title: "الواجبات" },
  { id: 5, title: "المراجعة" },
  { id: 6, title: "النشر" },
];

export function BuilderStepper({
  currentStep,
  onStepChange,
}: BuilderStepperProps) {
  return (
    <div className="grid grid-cols-4 gap-4">

      {steps.map((step) => {

        const active = currentStep === step.id;

        return (
          <button
            key={step.id}
            onClick={() => onStepChange?.(step.id)}
            className={cn(
              "rounded-3xl border transition-all duration-300 h-24",
              active
                ? "bg-gradient-to-r from-blue-600 to-violet-600 text-white shadow-xl"
                : "bg-white hover:border-blue-300"
            )}
          >

            <div className="text-sm opacity-80">
              {step.id}
            </div>

            <div className="font-black text-xl mt-1">
              {step.title}
            </div>

          </button>
        );

      })}
    </div>
  );
}