import * as React from "react";
import { Check, User, Church, Layers, Network, UserPlus, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

interface OnboardingStepperProps {
  currentStep: number;
  totalSteps: number;
}

const steps = [
  { id: 1, title: "Responsable", icon: User },
  { id: 2, title: "L'Église", icon: Church },
  { id: 3, title: "Typologie", icon: Layers },
  { id: 4, title: "Départements", icon: Network },
  { id: 5, title: "Équipe", icon: UserPlus },
  { id: 6, title: "Finalisation", icon: Sparkles },
];

export function OnboardingStepper({ currentStep }: OnboardingStepperProps) {
  return (
    <div className="w-full">
      {/* Desktop Stepper */}
      <div className="hidden sm:flex items-center justify-between relative">
        <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-border/60 -translate-y-1/2 z-0" />
        <div
          className="absolute top-1/2 left-0 h-0.5 bg-primary -translate-y-1/2 z-0 transition-all duration-300"
          style={{
            width: `${((currentStep - 1) / (steps.length - 1)) * 100}%`,
          }}
        />

        {steps.map((step) => {
          const isCompleted = step.id < currentStep;
          const isCurrent = step.id === currentStep;
          const Icon = step.icon;

          return (
            <div
              key={step.id}
              className="relative z-10 flex flex-col items-center group"
            >
              <div
                className={cn(
                  "flex h-10 w-10 items-center justify-center rounded-full border-2 text-xs font-semibold transition-all duration-200 bg-background",
                  isCompleted && "border-primary bg-primary text-primary-foreground",
                  isCurrent &&
                    "border-primary text-primary ring-4 ring-primary/15 scale-105 font-bold shadow-md",
                  !isCompleted && !isCurrent && "border-border text-muted-foreground"
                )}
              >
                {isCompleted ? (
                  <Check className="h-4 w-4 stroke-[3]" />
                ) : (
                  <Icon className="h-4 w-4" />
                )}
              </div>
              <span
                className={cn(
                  "mt-2 text-[11px] font-medium tracking-tight whitespace-nowrap transition-colors",
                  isCurrent ? "text-primary font-bold" : "text-muted-foreground"
                )}
              >
                {step.title}
              </span>
            </div>
          );
        })}
      </div>

      {/* Mobile Stepper Header */}
      <div className="sm:hidden flex flex-col gap-2">
        <div className="flex items-center justify-between text-xs font-medium text-muted-foreground">
          <span>
            Étape {currentStep} sur {steps.length} :{" "}
            <strong className="text-foreground">{steps[currentStep - 1]?.title}</strong>
          </span>
          <span className="font-semibold text-primary">
            {Math.round((currentStep / steps.length) * 100)}%
          </span>
        </div>
        <div className="h-1.5 w-full rounded-full bg-muted overflow-hidden">
          <div
            className="h-full bg-primary rounded-full transition-all duration-300"
            style={{ width: `${(currentStep / steps.length) * 100}%` }}
          />
        </div>
      </div>
    </div>
  );
}
