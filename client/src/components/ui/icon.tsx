import { iconTheme } from "@/assets/theme";
import { cn } from "@/lib/utils";

interface IconProps extends React.SVGProps<SVGSVGElement> {
  name: keyof typeof iconTheme.activity | keyof typeof iconTheme.status;
  size?: keyof typeof iconTheme.primary.size;
  className?: string;
}

export const Icon = ({ name, size = "md", className, ...props }: IconProps) => {
  // Determina se l'icona è di tipo activity o status
  const isActivity = name in iconTheme.activity;
  const color = isActivity 
    ? iconTheme.activity[name as keyof typeof iconTheme.activity]
    : iconTheme.status[name as keyof typeof iconTheme.status];
  
  const dimensions = iconTheme.primary.size[size];

  return (
    <svg
      width={dimensions}
      height={dimensions}
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      className={cn("", className)}
      {...props}
    />
  );
};