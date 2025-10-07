import { cn } from "@/lib/utils";
import React from "react";

interface FeatureCardProps {
  title: string;
  description: string;
  icon: React.ReactNode;
  className?: string;
  variant?: "default" | "highlighted";
}

const FeatureCard = ({ 
  title, 
  description, 
  icon, 
  className,
  variant = "default" 
}: FeatureCardProps) => {
  return (
    <div className={cn(
      "group relative rounded-xl border p-6 transition-all hover:shadow-md",
      variant === "highlighted" 
        ? "bg-gradient-to-br from-green-50 to-card border-primary/20 shadow-sm" 
        : "bg-card border-border hover:border-primary/30",
      className
    )}>
      <div className="space-y-4">
        <div className={cn(
          "flex h-12 w-12 items-center justify-center rounded-lg transition-colors",
          variant === "highlighted"
            ? "bg-primary text-primary-foreground"
            : "bg-primary/10 text-primary group-hover:bg-primary group-hover:text-primary-foreground"
        )}>
          {icon}
        </div>
        
        <div className="space-y-2">
          <h3 className="text-lg font-semibold text-foreground">{title}</h3>
          <p className="text-sm text-muted-foreground leading-relaxed">{description}</p>
        </div>
      </div>
      
      {variant === "highlighted" && (
        <div className="absolute -top-2 -right-2 flex h-6 w-6 items-center justify-center rounded-full bg-green-500 text-white text-xs font-bold">
          ★
        </div>
      )}
    </div>
  );
};

export default FeatureCard;