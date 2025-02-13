import { useEffect, useState } from "react";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Pie } from "react-chartjs-2";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import type { Product } from "@/types/product";

// Register ChartJS components
ChartJS.register(ArcElement, Tooltip, Legend);

type ChartableKeys = 'productCategory' | 'material' | 'purity' | 'name';

const Reports = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const docRef = doc(db, "productData", "zzeEfRyePYTdWemfHHWH");
        const docSnap = await getDoc(docRef);
        
        if (docSnap.exists()) {
          const data = docSnap.data();
          const productsData = (data.products || []).map((product: any) => ({
            id: product.id || '',
            productCategory: product.productCategory || 'Uncategorized',
            material: product.material || 'Unknown',
            purity: product.purity || 'Unknown',
            name: product.name || '',
            price: product.price,
            description: product.description,
            imageUrl: product.imageUrl,
            createdAt: product.createdAt?.toDate?.(),
            updatedAt: product.updatedAt?.toDate?.(),
          }));
          setProducts(productsData);
          console.log("Fetched products:", productsData);
        } else {
          console.log("No products document found!");
          setProducts([]);
        }
      } catch (error) {
        console.error("Error fetching products:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  const getChartData = (key: ChartableKeys) => {
    const counts = products.reduce((acc, product) => {
      const value = product[key] || 'Unknown';
      acc[value] = (acc[value] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const backgroundColor = [
      '#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF',
      '#FF9F40', '#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0'
    ];

    return {
      labels: Object.keys(counts),
      datasets: [{
        data: Object.values(counts),
        backgroundColor,
        borderColor: backgroundColor,
        borderWidth: 1,
      }]
    };
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'bottom' as const,
      },
    },
  };

  if (loading) {
    return (
      <div className="p-6 space-y-6">
        <h1 className="text-3xl font-bold mb-6">Product Analytics</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <Card key={i}>
              <CardHeader>
                <CardTitle><Skeleton className="h-6 w-3/4" /></CardTitle>
              </CardHeader>
              <CardContent>
                <Skeleton className="h-[300px] w-full rounded-lg" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#9aadeb] mt-16 lg:mt-0">
      <div className="container mx-auto px-4 py-6">
        <div className="bg-white rounded-lg shadow-md p-6">
          <h1 className="text-3xl font-bold mb-6">Product Analytics</h1>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Product Category Distribution */}
            <Card>
              <CardHeader>
                <CardTitle>Products by Category</CardTitle>
                <p className="text-sm text-muted-foreground">
                  Total Products: {products.length}
                </p>
              </CardHeader>
              <CardContent>
                <div className="h-[300px] flex items-center justify-center">
                  <Pie data={getChartData('productCategory')} options={chartOptions} />
                </div>
              </CardContent>
            </Card>

            {/* Material Distribution */}
            <Card>
              <CardHeader>
                <CardTitle>Products by Material</CardTitle>
                <p className="text-sm text-muted-foreground">
                  Distribution across materials
                </p>
              </CardHeader>
              <CardContent>
                <div className="h-[300px] flex items-center justify-center">
                  <Pie data={getChartData('material')} options={chartOptions} />
                </div>
              </CardContent>
            </Card>

            {/* Purity Distribution */}
            <Card>
              <CardHeader>
                <CardTitle>Products by Purity</CardTitle>
                <p className="text-sm text-muted-foreground">
                  Distribution across purity levels
                </p>
              </CardHeader>
              <CardContent>
                <div className="h-[300px] flex items-center justify-center">
                  <Pie data={getChartData('purity')} options={chartOptions} />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Total Categories</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-4xl font-bold">
                  {new Set(products.map(p => p.productCategory)).size}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Total Materials</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-4xl font-bold">
                  {new Set(products.map(p => p.material)).size}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Total Products</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-4xl font-bold">{products.length}</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Reports; 