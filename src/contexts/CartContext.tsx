import React, { createContext, useContext, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { cartService } from "@/services/cartService";
import { useCartState } from "@/hooks/useCartState";
import type { CartContextType } from "@/types/cart";

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider = ({ children }: { children: React.ReactNode }) => {
  const { items, setItems, isLoading, setIsLoading, total } = useCartState();
  const { toast } = useToast();

  const initializeCart = async () => {
    try {
      const cartId = await cartService.fetchCart();
      if (cartId) {
        const cartItems = await cartService.fetchCartItems(cartId);
        setItems(cartItems);
      }
    } catch (error) {
      console.error("Error initializing cart:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to initialize cart. Please try again.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event) => {
      if (event === 'SIGNED_IN') {
        setIsLoading(true);
        await initializeCart();
      } else if (event === 'SIGNED_OUT') {
        setItems([]);
        setIsLoading(false);
      }
    });

    initializeCart();

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const addItem = async (productId: string, quantity: number, price: number) => {
    try {
      const cartId = await cartService.fetchCart();
      if (!cartId) return;

      await cartService.addItem(cartId, productId, quantity, price);
      const cartItems = await cartService.fetchCartItems(cartId);
      setItems(cartItems);

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
      await cartService.removeItem(itemId);
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
      await cartService.updateQuantity(itemId, quantity);
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
      const cartId = await cartService.fetchCart();
      if (!cartId) return;

      await cartService.clearCart(cartId);
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