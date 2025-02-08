import { useEffect, useState } from "react";
import { getDoc, doc, collection, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import ProductCard from "@/components/products/ProductCard";
import { useSearchParams } from "react-router-dom";

interface Product {
  name: string;
  category: string;
  weight: number;
  imageUrl: string;
  timestamp?: {
    seconds: number;
    nanoseconds: number;
  };
}

const Products = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [wishlist, setWishlist] = useState<Product[]>([]);
  const [showWishlist, setShowWishlist] = useState(false);
  const [searchParams] = useSearchParams();

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const docRef = doc(db, "productData", "Ng4pODDHfqytrF2iqMtR");
        const docSnap = await getDoc(docRef);
        console.log("Fetching products...");

        if (docSnap.exists() && docSnap.data().products) {
          const productsData = docSnap.data().products;
          // Sort products by timestamp in descending order (most recent first)
          const sortedProducts = productsData.sort((a: Product, b: Product) => {
            const dateA = a.timestamp ? new Date(a.timestamp.seconds * 1000) : new Date(0);
            const dateB = b.timestamp ? new Date(b.timestamp.seconds * 1000) : new Date(0);
            return dateB.getTime() - dateA.getTime();
          });
          setProducts(sortedProducts);
          setFilteredProducts(sortedProducts);
          console.log("Products fetched and sorted:", sortedProducts);
        } else {
          console.log("No products found");
          toast.error("No products available");
        }
        setIsLoading(false);
      } catch (error) {
        console.error("Error fetching products:", error);
        toast.error("Error loading products");
        setIsLoading(false);
      }
    };

    // Load wishlist from localStorage
    const savedWishlist = localStorage.getItem('wishlist');
    if (savedWishlist) {
      setWishlist(JSON.parse(savedWishlist));
    }

    fetchProducts();
  }, []);

  useEffect(() => {
    const search = searchParams.get('search');
    if (search) {
      const filtered = products.filter(product => 
        product.name.toLowerCase().includes(search.toLowerCase())
      );
      setFilteredProducts(filtered);
    } else {
      setFilteredProducts(products);
    }
  }, [searchParams, products]);

  const handleAddToWishlist = (product: Product) => {
    setWishlist(prev => {
      const isInWishlist = prev.some(item => item.name === product.name);
      let newWishlist: any;
      
      if (isInWishlist) {
        newWishlist = prev.filter(item => item.name !== product.name);
        toast.success("Removed from wishlist");
      } else {
        newWishlist = [...prev, product];
        toast.success("Added to wishlist");
      }
      
      localStorage.setItem('wishlist', JSON.stringify(newWishlist));
      return newWishlist;
    });
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4">
        <h1 className="text-4xl font-bold mb-8">Our Products</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-[300px] w-full rounded-lg" />
          ))}
        </div>
      </div>
    );
  }

  const displayProducts = showWishlist ? wishlist : filteredProducts;

  return (
    <div className="container mx-auto px-4">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-4xl font-bold">
          {showWishlist ? "My Wishlist" : "Our Products"}
        </h1>
        <button
          onClick={() => setShowWishlist(!showWishlist)}
          className="text-primary hover:text-primary/80 font-semibold"
        >
          {showWishlist ? "Show All Products" : "Show Wishlist"}
        </button>
      </div>
      
      {showWishlist && wishlist.length === 0 ? (
        <p className="text-center text-gray-500 mt-8">Your wishlist is empty</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {displayProducts.map((product) => (
            <ProductCard
              key={product.name}
              product={product}
              onAddToWishlist={handleAddToWishlist}
              isInWishlist={wishlist.some(item => item.name === product.name)}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default Products;