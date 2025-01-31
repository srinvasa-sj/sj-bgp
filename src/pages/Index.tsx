import Navbar from "@/components/Navbar";
import ProductCard from "@/components/ProductCard";
import CategoryCard from "@/components/CategoryCard";
import Newsletter from "@/components/Newsletter";
import Footer from "@/components/Footer";
import { Search, SlidersHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const featuredProducts = [
  {
    id: 1,
    title: "Premium Wireless Headphones",
    price: 24999,
    image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&q=80",
    category: "Electronics",
  },
  {
    id: 2,
    title: "Leather Crossbody Bag",
    price: 4999,
    image: "https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=800&q=80",
    category: "Fashion",
  },
  {
    id: 3,
    title: "Smart Fitness Watch",
    price: 19999,
    image: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&q=80",
    category: "Electronics",
  },
  {
    id: 4,
    title: "Organic Cotton T-Shirt",
    price: 1499,
    image: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=800&q=80",
    category: "Fashion",
  },
];

const categories = [
  {
    title: "Electronics",
    image: "https://images.unsplash.com/photo-1498049794561-7780e7231661?w=800&q=80",
    itemCount: 156,
  },
  {
    title: "Fashion",
    image: "https://images.unsplash.com/photo-1445205170230-053b83016050?w=800&q=80",
    itemCount: 237,
  },
  {
    title: "Home & Living",
    image: "https://images.unsplash.com/photo-1484101403633-562f891dc89a?w=800&q=80",
    itemCount: 184,
  },
  {
    title: "Beauty",
    image: "https://images.unsplash.com/photo-1522338242992-e1a54906a8da?w=800&q=80",
    itemCount: 143,
  },
];

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      {/* Hero Section with Search */}
      <section className="relative h-[80vh] overflow-hidden">
        <img
          src="https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=1600&q=80"
          alt="Hero"
          className="h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 to-black/20" />
        <div className="absolute inset-0 flex flex-col items-center justify-center px-4">
          <div className="text-center text-white max-w-3xl mx-auto">
            <h1 className="text-4xl font-bold tracking-tight sm:text-6xl mb-6 animate-fadeIn">
              Discover Amazing Products
            </h1>
            <p className="mt-6 text-lg text-white/90 animate-fadeIn animation-delay-200">
              Shop the latest trends with confidence. Quality products, competitive prices.
            </p>
            
            {/* Search Bar */}
            <div className="mt-8 flex gap-2 max-w-xl mx-auto animate-fadeIn animation-delay-300">
              <div className="relative flex-1">
                <Input
                  type="search"
                  placeholder="Search for products..."
                  className="w-full h-12 pl-12 bg-white/95 border-0"
                />
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              </div>
              <Button variant="outline" size="icon" className="h-12 w-12 bg-white/95 border-0">
                <SlidersHorizontal className="h-5 w-5" />
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section className="py-16 bg-background">
        <div className="container px-4">
          <h2 className="text-3xl font-bold tracking-tight mb-8 animate-fadeIn">
            Shop by Category
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {categories.map((category, index) => (
              <div key={category.title} className="animate-fadeIn" style={{ animationDelay: `${index * 100}ms` }}>
                <CategoryCard {...category} />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Products Section */}
      <section className="py-16 bg-muted/50">
        <div className="container px-4">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-3xl font-bold tracking-tight animate-fadeIn">
              Featured Products
            </h2>
            <Button variant="outline" className="animate-fadeIn">
              View All
            </Button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {featuredProducts.map((product, index) => (
              <div key={product.id} className="animate-fadeIn" style={{ animationDelay: `${index * 100}ms` }}>
                <ProductCard {...product} />
              </div>
            ))}
          </div>
        </div>
      </section>

      <Newsletter />
      <Footer />
    </div>
  );
};

export default Index;