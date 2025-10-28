interface StatsCardProps {
  title: string;
  value: string | number;
  unit?: string;
  icon?: string;
  trend?: "up" | "down" | "neutral";
  description?: string;
}

export function StatsCard({ title, value, unit, icon, trend, description }: StatsCardProps) {
  const getTrendColor = () => {
    if (!trend) return "";
    switch (trend) {
      case "up":
        return "text-green-600 dark:text-green-400";
      case "down":
        return "text-red-600 dark:text-red-400";
      default:
        return "text-gray-600 dark:text-gray-400";
    }
  };

  return (
    <div className="stats-card">
      {icon && <div className="text-4xl mb-2">{icon}</div>}
      
      <div className="stats-label">{title}</div>
      
      <div className="flex items-baseline justify-center gap-1">
        <div className={`stats-value ${getTrendColor()}`}>
          {typeof value === "number" ? value.toFixed(1) : value}
        </div>
        {unit && <span className="stats-unit">{unit}</span>}
      </div>

      {description && (
        <div className="text-xs text-gray-500 dark:text-gray-500 mt-2">
          {description}
        </div>
      )}
    </div>
  );
}





