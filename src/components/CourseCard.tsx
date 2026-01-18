import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Clock, Users } from "lucide-react";
import { Link } from "react-router-dom";
import courseJavaImg from "@/assets/course-java.jpg";
import coursePhotoshopImg from "@/assets/course-photoshop.jpg";
import courseWebImg from "@/assets/course-web.jpg";
import courseDsImg from "@/assets/course-ds.jpg";

const imageMap: Record<string, string> = {
  "/course-java.jpg": courseJavaImg,
  "/course-photoshop.jpg": coursePhotoshopImg,
  "/course-web.jpg": courseWebImg,
  "/course-ds.jpg": courseDsImg,
};

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
  image,
  level,
  students,
  bookingType
}: CourseCardProps & { bookingType?: 'standard' | 'slot_based' | string }) => {
  const imageSrc = imageMap[image] || courseJavaImg;

  return (
    <Card className="group hover:shadow-strong transition-all duration-500 hover:-translate-y-2 overflow-hidden border-2 hover:border-primary/20 animate-fade-in-up">
      <div className="relative h-48 overflow-hidden">
        <img
          src={imageSrc}
          alt={title}
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background/80 to-transparent" />
        <Badge className="absolute top-4 right-4 bg-accent text-accent-foreground shadow-medium animate-slide-in-right">
          {level}
        </Badge>
        {bookingType === 'slot_based' && (
          <Badge className="absolute top-4 left-4 bg-primary text-primary-foreground shadow-medium animate-slide-in-left">
            Slot Based
          </Badge>
        )}
      </div>

      <CardContent className="p-6">
        <h3 className="font-bold text-lg mb-2 group-hover:text-primary transition-colors duration-300">
          {title}
        </h3>
        <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
          {description}
        </p>

        <div className="flex items-center gap-4 text-sm text-muted-foreground mb-3">
          <div className="flex items-center gap-1 transition-transform duration-300 group-hover:scale-105">
            <Clock className="h-4 w-4 text-primary" />
            {duration}
          </div>
          <div className="flex items-center gap-1 transition-transform duration-300 group-hover:scale-105">
            <Users className="h-4 w-4 text-primary" />
            {students}
          </div>
        </div>

        <div className="flex items-center gap-2 text-sm">
          <div className="w-8 h-8 rounded-full bg-gradient-primary flex items-center justify-center shadow-soft">
            <span className="text-xs font-medium text-primary-foreground">
              {instructor.split(' ').map(n => n[0]).join('')}
            </span>
          </div>
          <span className="text-muted-foreground">{instructor}</span>
        </div>
      </CardContent>

      <CardFooter className="p-6 pt-0 flex items-center justify-between bg-gradient-card">
        <div>
          <div className="text-2xl font-bold bg-gradient-primary bg-clip-text text-transparent">{price}</div>
        </div>
        <Link to={`/course/${id}`}>
          <Button variant="gradient" size="sm" className="shadow-medium hover:shadow-strong transition-all duration-300">
            View Details
          </Button>
        </Link>
      </CardFooter>
    </Card>
  );
};

export default CourseCard;
