import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Clock, Users, Star } from "lucide-react";
import { Link } from "react-router-dom";

interface CourseCardProps {
  id: string;
  title: string;
  description: string;
  duration: string;
  price: string;
  instructor: string;
  image: string;
  level: string;
  students: number;
}

const CourseCard = ({ 
  id, 
  title, 
  description, 
  duration, 
  price, 
  instructor, 
  level, 
  students 
}: CourseCardProps) => {
  return (
    <Card className="group hover:shadow-strong transition-all duration-300 hover:-translate-y-1 overflow-hidden">
      <div className="relative h-48 bg-gradient-primary overflow-hidden">
        <div className="absolute inset-0 bg-foreground/10 flex items-center justify-center">
          <div className="text-6xl opacity-20">📚</div>
        </div>
        <Badge className="absolute top-4 right-4 bg-accent text-accent-foreground">
          {level}
        </Badge>
      </div>
      
      <CardContent className="p-6">
        <h3 className="font-bold text-lg mb-2 group-hover:text-primary transition-colors">
          {title}
        </h3>
        <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
          {description}
        </p>
        
        <div className="flex items-center gap-4 text-sm text-muted-foreground mb-3">
          <div className="flex items-center gap-1">
            <Clock className="h-4 w-4" />
            {duration}
          </div>
          <div className="flex items-center gap-1">
            <Users className="h-4 w-4" />
            {students}
          </div>
        </div>
        
        <div className="flex items-center gap-2 text-sm">
          <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
            <span className="text-xs font-medium">
              {instructor.split(' ').map(n => n[0]).join('')}
            </span>
          </div>
          <span className="text-muted-foreground">{instructor}</span>
        </div>
      </CardContent>
      
      <CardFooter className="p-6 pt-0 flex items-center justify-between">
        <div>
          <div className="text-2xl font-bold text-primary">{price}</div>
        </div>
        <Link to={`/course/${id}`}>
          <Button variant="gradient" size="sm">
            View Details
          </Button>
        </Link>
      </CardFooter>
    </Card>
  );
};

export default CourseCard;
