import React, { createContext, useContext, useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface CartItem {
  id: string;
  product_id: string;
  quantity: number;
  price_at_time: number;
  product: {
    name: string;
    image?: string;
  };
}

interface CartContextType {
  items: CartItem[];
  addItem: (productId: string, quantity: number, price: number) => Promise<void>;
  removeItem: (itemId: string) => Promise<void>;
  updateQuantity: (itemId: string, quantity: number) => Promise<void>;
  clearCart: () => Promise<void>;
  isLoading: boolean;
  total: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider = ({ children }: { children: React.ReactNode }) => {
  const [items, setItems] = useState<CartItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  const fetchCart = async () => {
    try {
      const { data: cart, error } = await supabase
        .from("carts")
        .select("id")
        .eq("status", "active")
        .maybeSingle();

      if (error) throw error;

      if (!cart) {
        const { data: newCart, error: createError } = await supabase
          .from("carts")
          .insert({ 
            status: "active",
            user_id: (await supabase.auth.getUser()).data.user?.id 
          })
          .select()
          .single();

        if (createError) throw createError;
        return newCart.id;
      }

      return cart.id;
    } catch (error) {
      console.error("Error fetching cart:", error);
      return null;
    }
  };

  const fetchCartItems = async (cartId: string) => {
    try {
      const { data, error } = await supabase
        .from("cart_items")
        .select(`
          id,
          product_id,
          quantity,
          price_at_time,
          products (
            name,
            product_images (url)
          )
        `)
        .eq("cart_id", cartId);

      if (error) throw error;

      setItems(
        data.map((item) => ({
          ...item,
          product: {
            name: item.products.name,
            image: item.products.product_images?.[0]?.url,
          },
        }))
      );
    } catch (error) {
      console.error("Error fetching cart items:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to fetch cart items. Please try again.",
      });
    }
  };

  useEffect(() => {
    const initializeCart = async () => {
      const cartId = await fetchCart();
      if (cartId) {
        await fetchCartItems(cartId);
      }
      setIsLoading(false);
    };

    initializeCart();

    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event) => {
      if (event === 'SIGNED_IN') {
        initializeCart();
      } else if (event === 'SIGNED_OUT') {
        setItems([]);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const addItem = async (productId: string, quantity: number, price: number) => {
    try {
      const cartId = await fetchCart();
      if (!cartId) return;

      const { error } = await supabase.from("cart_items").insert({
        cart_id: cartId,
        product_id: productId,
        quantity,
        price_at_time: price,
      });

      if (error) throw error;

      await fetchCartItems(cartId);
      toast({
        title: "Item added to cart",
        description: "Your item has been added to the cart successfully.",
      });
    } catch (error) {
      console.error("Error adding item to cart:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to add item to cart. Please try again.",
      });
    }
  };

  const removeItem = async (itemId: string) => {
    try {
      const { error } = await supabase
        .from("cart_items")
        .delete()
        .eq("id", itemId);

      if (error) throw error;

      setItems((prev) => prev.filter((item) => item.id !== itemId));
      toast({
        title: "Item removed",
        description: "Item has been removed from your cart.",
      });
    } catch (error) {
      console.error("Error removing item:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to remove item. Please try again.",
      });
    }
  };

  const updateQuantity = async (itemId: string, quantity: number) => {
    try {
      const { error } = await supabase
        .from("cart_items")
        .update({ quantity })
        .eq("id", itemId);

      if (error) throw error;

      setItems((prev) =>
        prev.map((item) =>
          item.id === itemId ? { ...item, quantity } : item
        )
      );
    } catch (error) {
      console.error("Error updating quantity:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to update quantity. Please try again.",
      });
    }
  };

  const clearCart = async () => {
    try {
      const cartId = await fetchCart();
      if (!cartId) return;

      const { error } = await supabase
        .from("cart_items")
        .delete()
        .eq("cart_id", cartId);

      if (error) throw error;

      setItems([]);
      toast({
        title: "Cart cleared",
        description: "All items have been removed from your cart.",
      });
    } catch (error) {
      console.error("Error clearing cart:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to clear cart. Please try again.",
      });
    }
  };

  const total = items.reduce(
    (sum, item) => sum + item.price_at_time * item.quantity,
    0
  );

  return (
    <CartContext.Provider
      value={{
        items,
        addItem,
        removeItem,
        updateQuantity,
        clearCart,
        isLoading,
        total,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
};