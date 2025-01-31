import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { AlertCircle } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

const InventoryManagement = () => {
  const { toast } = useToast();

  const { data: inventory, isLoading } = useQuery({
    queryKey: ["inventory"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("inventory")
        .select(`
          *,
          product:products(
            name,
            images:product_images(url, is_primary)
          ),
          variation:product_variations(name, value)
        `);

      if (error) throw error;
      return data;
    },
  });

  const handleQuantityChange = async (id: string, newQuantity: number) => {
    const { error } = await supabase
      .from("inventory")
      .update({ quantity: newQuantity })
      .eq("id", id);

    if (error) {
      toast({
        title: "Error",
        description: "Failed to update inventory",
        variant: "destructive",
      });
    } else {
      toast({
        title: "Success",
        description: "Inventory updated successfully",
      });
    }
  };

  return (
    <div className="container py-8">
      <h1 className="text-3xl font-bold mb-6">Inventory Management</h1>

      {isLoading ? (
        <div className="text-center py-8">Loading...</div>
      ) : (
        <div className="border rounded-lg">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Product</TableHead>
                <TableHead>Variation</TableHead>
                <TableHead>Current Stock</TableHead>
                <TableHead>Low Stock Alert</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {inventory?.map((item) => (
                <TableRow
                  key={item.id}
                  className={
                    item.quantity <= (item.low_stock_threshold || 0)
                      ? "bg-red-50"
                      : ""
                  }
                >
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-lg overflow-hidden bg-muted">
                        {item.product?.images?.[0]?.url ? (
                          <img
                            src={item.product.images[0].url}
                            alt={item.product.name}
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <div className="h-full w-full flex items-center justify-center">
                            <AlertCircle className="h-4 w-4 text-muted-foreground" />
                          </div>
                        )}
                      </div>
                      <span>{item.product?.name}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    {item.variation
                      ? `${item.variation.name}: ${item.variation.value}`
                      : "Default"}
                  </TableCell>
                  <TableCell>
                    <Input
                      type="number"
                      value={item.quantity}
                      onChange={(e) =>
                        handleQuantityChange(item.id, parseInt(e.target.value))
                      }
                      className="w-24"
                    />
                  </TableCell>
                  <TableCell>
                    {item.quantity <= (item.low_stock_threshold || 0) && (
                      <div className="flex items-center text-red-600">
                        <AlertCircle className="h-4 w-4 mr-1" />
                        Low Stock
                      </div>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    <Button variant="outline" size="sm">
                      Update Stock
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
};

export default InventoryManagement;