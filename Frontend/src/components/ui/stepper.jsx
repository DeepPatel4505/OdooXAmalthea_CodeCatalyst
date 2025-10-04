import { cn } from '@/lib/utils'
import { Check } from 'lucide-react'

export function Stepper({ steps, currentStep, className }) {
  return (
    <div className={cn("flex items-center justify-between", className)}>
      {steps.map((step, index) => {
        const isCompleted = index < currentStep
        const isCurrent = index === currentStep
        const isUpcoming = index > currentStep

        return (
          <div key={step.id} className="flex items-center">
            <div className="flex flex-col items-center">
              <div
                className={cn(
                  "flex h-8 w-8 items-center justify-center rounded-full border-2 text-sm font-medium",
                  isCompleted && "bg-primary border-primary text-primary-foreground",
                  isCurrent && "border-primary text-primary",
                  isUpcoming && "border-muted-foreground text-muted-foreground"
                )}
              >
                {isCompleted ? (
                  <Check className="h-4 w-4" />
                ) : (
                  index + 1
                )}
              </div>
              <div className="mt-2 text-center">
                <div className={cn(
                  "text-sm font-medium",
                  isCurrent && "text-primary",
                  isUpcoming && "text-muted-foreground"
                )}>
                  {step.title}
                </div>
                {step.description && (
                  <div className="text-xs text-muted-foreground mt-1">
                    {step.description}
                  </div>
                )}
              </div>
            </div>
            {index < steps.length - 1 && (
              <div
                className={cn(
                  "h-0.5 w-16 mx-4",
                  isCompleted ? "bg-primary" : "bg-muted-foreground"
                )}
              />
            )}
          </div>
        )
      })}
    </div>
  )
}
