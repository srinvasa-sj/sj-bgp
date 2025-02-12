

//---------------------------------------------------------------------//
import { useEffect, useState } from "react";
import { doc, getDoc, updateDoc, arrayUnion, arrayRemove } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Trash2, Plus } from "lucide-react";

// Update the GalleryImage interface so that timestamp is stored as a formatted string.
interface GalleryImage {
  imageUrl: string;
  timestamp: string;
}

const AddImage = () => {
  const [newImageUrl, setNewImageUrl] = useState("");
  const [images, setImages] = useState<GalleryImage[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Firestore document reference (all images are stored in the "images" field)
  const docRef = doc(db, "imageData", "HmmGvqB8GP1SMta5mRT2");

  // Fetch images from the document
  const fetchImages = async () => {
    setIsLoading(true);
    try {
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        const data = docSnap.data();
        if (data.images) {
          // Sort images by timestamp descending (newest first)
          const sortedImages = [...data.images].sort(
            (a: GalleryImage, b: GalleryImage) => {
              // To sort by date, convert the formatted timestamp back to a Date object.
              return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime();
            }
          );
          setImages(sortedImages);
        } else {
          setImages([]);
        }
      } else {
        toast.error("Image data document does not exist.");
      }
    } catch (error) {
      console.error("Error fetching images:", error);
      toast.error("Error loading gallery images");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchImages();
  }, []);

  // Function to format the timestamp as "January 9, 2025 at 11:32:34 PM UTC+5:30"
  const getFormattedTimestamp = (): string => {
    const ts = new Date().toLocaleString("en-US", {
      timeZone: "Asia/Kolkata", // adjust timeZone as needed
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "numeric",
      minute: "numeric",
      second: "numeric",
      hour12: true,
      timeZoneName: "short"
    });
    // Replace "GMT" with "UTC" if necessary (depends on locale output)
    return ts.replace("GMT", "UTC");
  };

  // Add a new image to Firestore
  const handleAddImage = async () => {
    if (!newImageUrl.trim()) {
      toast.error("Please enter a valid image URL.");
      return;
    }

    const newImage: GalleryImage = {
      imageUrl: newImageUrl.trim(),
      timestamp: getFormattedTimestamp(),
    };

    try {
      await updateDoc(docRef, {
        images: arrayUnion(newImage),
      });
      setNewImageUrl("");
      toast.success("Image added successfully!");
      fetchImages();
    } catch (error) {
      console.error("Error adding image:", error);
      toast.error("Error adding image");
    }
  };

  // Delete an image from Firestore (requires an exact match for the object)
  const handleDeleteImage = async (imageToDelete: GalleryImage) => {
    try {
      await updateDoc(docRef, {
        images: arrayRemove(imageToDelete),
      });
      toast.success("Image deleted successfully!");
      setImages((prev) =>
        prev.filter(
          (img) =>
            img.imageUrl !== imageToDelete.imageUrl ||
            img.timestamp !== imageToDelete.timestamp
        )
      );
    } catch (error) {
      console.error("Error deleting image:", error);
      toast.error("Error deleting image");
    }
  };

  return (
    <div className="bg-card p-6 rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-4">Manage Gallery Images</h2>
      
      {/* Add Image Section */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <Input
          type="url"
          placeholder="Enter image URL..."
          value={newImageUrl}
          onChange={(e) => setNewImageUrl(e.target.value)}
          className="flex-1"
        />
        <Button onClick={handleAddImage} className="flex items-center gap-2">
          <Plus className="w-5 h-5" />
          Add Image
        </Button>
      </div>

      {/* Loading State */}
      {isLoading ? (
        <div className="grid grid-cols-3 gap-4">
          <Skeleton className="w-full h-48 rounded-lg" />
          <Skeleton className="w-full h-48 rounded-lg" />
          <Skeleton className="w-full h-48 rounded-lg" />
        </div>
      ) : images.length === 0 ? (
        <p className="text-center text-gray-500">No images available in the gallery.</p>
      ) : (
        <div className="grid grid-cols-3 gap-4">
          {images.map((img, index) => (
            <div key={index} className="relative group">
              <img
                src={img.imageUrl}
                alt={`Gallery image ${index + 1}`}
                className="w-full h-48 object-cover rounded-lg shadow-md transition-transform duration-300 hover:scale-105"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.src = "/placeholder.svg";
                  toast.error("Error loading image");
                }}
              />
              <button
                className="absolute top-2 right-2 bg-red-600 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                onClick={() => handleDeleteImage(img)}
              >
                <Trash2 className="w-5 h-5" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AddImage;
