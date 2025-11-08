import { Card, CardContent } from "@/components/ui/card";
import { LucideIcon } from "lucide-react";

interface FeatureCardProps {
  icon: LucideIcon;
  title: string;
  description: string;
}

const FeatureCard = ({ icon: Icon, title, description }: FeatureCardProps) => {
  return (
    <Card className="hover:shadow-medium transition-all duration-300 border-2 hover:border-primary/20">
      <CardContent className="p-6">
        <div className="w-12 h-12 bg-gradient-primary rounded-lg flex items-center justify-center mb-4">
          <Icon className="h-6 w-6 text-primary-foreground" />
        </div>
        <h3 className="font-bold text-lg mb-2">{title}</h3>
        <p className="text-muted-foreground text-sm leading-relaxed">
          {description}
        </p>
      </CardContent>
    </Card>
  );
};

export default FeatureCard;
