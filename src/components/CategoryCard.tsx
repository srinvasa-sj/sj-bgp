import { ArrowRight } from "lucide-react";

interface CategoryCardProps {
  title: string;
  image: string;
  itemCount: number;
}

const CategoryCard = ({ title, image, itemCount }: CategoryCardProps) => {
  return (
    <a
      href={`/categories/${title.toLowerCase()}`}
      className="group relative overflow-hidden rounded-lg transition-transform hover:-translate-y-1 duration-300"
    >
      <div className="aspect-[4/3] overflow-hidden">
        <img
          src={image}
          alt={title}
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
      </div>
      <div className="absolute bottom-0 left-0 right-0 p-4">
        <h3 className="text-xl font-semibold text-white">{title}</h3>
        <p className="mt-1 text-sm text-white/80">{itemCount} items</p>
        <div className="mt-2 flex items-center text-white group-hover:text-primary-foreground">
          <span className="text-sm font-medium">Shop now</span>
          <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
        </div>
      </div>
    </a>
  );
};

export default CategoryCard;