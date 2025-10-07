import { cn } from "@/lib/utils";

interface StatsCardProps {
  title: string;
  value: string;
  description?: string;
  icon?: React.ReactNode;
  className?: string;
  variant?: "default" | "success" | "warning" | "primary";
}

const StatsCard = ({ 
  title, 
  value, 
  description, 
  icon, 
  className,
  variant = "default" 
}: StatsCardProps) => {
  const variants = {
    default: "bg-card border-border",
    success: "bg-green-100/50 border-green-500/20",
    warning: "bg-yellow-100/50 border-yellow-500/20", 
    primary: "bg-blue-100/50 border-blue-500/20"
  };

  return (
    <div className={cn(
      "rounded-xl border p-6 shadow-sm transition-all hover:shadow-md",
      variants[variant],
      className
    )}>
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <p className="text-sm font-medium text-muted-foreground">{title}</p>
          <p className="text-3xl font-bold text-foreground">{value}</p>
          {description && (
            <p className="text-sm text-muted-foreground">{description}</p>
          )}
        </div>
        {icon && (
          <div className="text-muted-foreground opacity-70">
            {icon}
          </div>
        )}
      </div>
    </div>
  );
};

export default StatsCard;