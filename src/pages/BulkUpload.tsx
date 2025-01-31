import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { Upload, FileText, AlertCircle, CheckCircle } from "lucide-react";
import { generateSlug } from "@/lib/utils";

const BulkUpload = () => {
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFile(e.target.files[0]);
    }
  };

  const handleUpload = async () => {
    if (!file) return;

    setUploading(true);
    const reader = new FileReader();

    reader.onload = async (e) => {
      try {
        const csv = e.target?.result as string;
        const lines = csv.split("\n");
        const headers = lines[0].split(",");

        const products = lines.slice(1).map((line) => {
          const values = line.split(",");
          const product: any = {};
          headers.forEach((header, index) => {
            product[header.trim()] = values[index]?.trim();
          });
          return product;
        });

        for (const product of products) {
          const { error } = await supabase.from("products").insert({
            name: product.name,
            description: product.description,
            price: parseFloat(product.price),
            status: "active",
            slug: generateSlug(product.name),
          });

          if (error) throw error;
        }

        toast({
          title: "Success",
          description: "Products uploaded successfully",
        });
        navigate("/products");
      } catch (error: any) {
        toast({
          title: "Error",
          description: error.message,
          variant: "destructive",
        });
      } finally {
        setUploading(false);
      }
    };

    reader.readAsText(file);
  };

  return (
    <div className="container py-8">
      <h1 className="text-3xl font-bold mb-6">Bulk Upload Products</h1>

      <div className="max-w-xl">
        <div className="mb-6">
          <h2 className="text-lg font-semibold mb-2">Instructions</h2>
          <p className="text-muted-foreground">
            Upload a CSV file with the following columns:
          </p>
          <ul className="list-disc list-inside mt-2 text-muted-foreground">
            <li>name (required)</li>
            <li>description</li>
            <li>price (required)</li>
            <li>category_id</li>
          </ul>
        </div>

        <div className="border-2 border-dashed rounded-lg p-8 text-center">
          <input
            type="file"
            accept=".csv"
            onChange={handleFileChange}
            className="hidden"
            id="csv-upload"
          />
          <label
            htmlFor="csv-upload"
            className="cursor-pointer flex flex-col items-center"
          >
            {file ? (
              <>
                <FileText className="h-12 w-12 text-primary mb-4" />
                <p className="text-lg font-medium">{file.name}</p>
                <p className="text-sm text-muted-foreground">
                  Click to choose a different file
                </p>
              </>
            ) : (
              <>
                <Upload className="h-12 w-12 text-muted-foreground mb-4" />
                <p className="text-lg font-medium">Choose a CSV file</p>
                <p className="text-sm text-muted-foreground">
                  or drag and drop it here
                </p>
              </>
            )}
          </label>
        </div>

        <div className="mt-6 flex gap-2">
          <Button
            onClick={handleUpload}
            disabled={!file || uploading}
            className="flex-1"
          >
            {uploading ? "Uploading..." : "Upload Products"}
          </Button>
          <Button
            variant="outline"
            onClick={() => navigate("/products")}
            disabled={uploading}
          >
            Cancel
          </Button>
        </div>
      </div>
    </div>
  );
};

export default BulkUpload;