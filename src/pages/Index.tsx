import Navbar from "@/components/Navbar";
import ProductCard from "@/components/ProductCard";
import CategoryCard from "@/components/CategoryCard";
import Newsletter from "@/components/Newsletter";
import Footer from "@/components/Footer";

const featuredProducts = [
  {
    id: 1,
    title: "Premium Wireless Headphones",
    price: 24999,
    image: "/placeholder.svg",
    category: "Electronics",
  },
  {
    id: 2,
    title: "Leather Crossbody Bag",
    price: 4999,
    image: "/placeholder.svg",
    category: "Fashion",
  },
  {
    id: 3,
    title: "Smart Fitness Watch",
    price: 19999,
    image: "/placeholder.svg",
    category: "Electronics",
  },
  {
    id: 4,
    title: "Organic Cotton T-Shirt",
    price: 1499,
    image: "/placeholder.svg",
    category: "Fashion",
  },
];

const categories = [
  {
    title: "Electronics",
    image: "/placeholder.svg",
    itemCount: 156,
  },
  {
    title: "Fashion",
    image: "/placeholder.svg",
    itemCount: 237,
  },
  {
    title: "Home & Living",
    image: "/placeholder.svg",
    itemCount: 184,
  },
  {
    title: "Beauty",
    image: "/placeholder.svg",
    itemCount: 143,
  },
];

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      {/* Hero Section */}
      <section className="relative h-[80vh] overflow-hidden">
        <img
          src="/placeholder.svg"
          alt="Hero"
          className="h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-black/40" />
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center text-white">
            <h1 className="text-4xl font-bold tracking-tight sm:text-6xl">
              Welcome to Store
            </h1>
            <p className="mt-6 text-lg">
              Discover our curated collection of premium products
            </p>
            <a
              href="/products"
              className="mt-8 inline-block rounded-lg bg-white px-8 py-3 text-lg font-semibold text-gray-900 hover:bg-gray-100"
            >
              Shop Now
            </a>
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section className="py-16">
        <div className="container px-4">
          <h2 className="mb-8 text-3xl font-bold tracking-tight">
            Shop by Category
          </h2>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {categories.map((category) => (
              <CategoryCard key={category.title} {...category} />
            ))}
          </div>
        </div>
      </section>

      {/* Featured Products Section */}
      <section className="py-16 bg-muted/50">
        <div className="container px-4">
          <h2 className="mb-8 text-3xl font-bold tracking-tight">
            Featured Products
          </h2>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {featuredProducts.map((product) => (
              <ProductCard key={product.id} {...product} />
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