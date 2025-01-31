import { Facebook, Instagram, Twitter } from "lucide-react";

const Footer = () => {
  return (
    <footer className="border-t bg-background">
      <div className="container px-4 py-12">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-4">
          <div>
            <h3 className="text-lg font-semibold">About Us</h3>
            <p className="mt-4 text-sm text-muted-foreground">
              We're dedicated to providing the best shopping experience with
              carefully curated products and exceptional customer service.
            </p>
          </div>
          <div>
            <h3 className="text-lg font-semibold">Quick Links</h3>
            <ul className="mt-4 space-y-2 text-sm">
              <li>
                <a href="/products" className="text-muted-foreground hover:text-foreground">
                  Products
                </a>
              </li>
              <li>
                <a href="/categories" className="text-muted-foreground hover:text-foreground">
                  Categories
                </a>
              </li>
              <li>
                <a href="/about" className="text-muted-foreground hover:text-foreground">
                  About
                </a>
              </li>
              <li>
                <a href="/contact" className="text-muted-foreground hover:text-foreground">
                  Contact
                </a>
              </li>
            </ul>
          </div>
          <div>
            <h3 className="text-lg font-semibold">Customer Service</h3>
            <ul className="mt-4 space-y-2 text-sm">
              <li>
                <a href="/shipping" className="text-muted-foreground hover:text-foreground">
                  Shipping Information
                </a>
              </li>
              <li>
                <a href="/returns" className="text-muted-foreground hover:text-foreground">
                  Returns & Exchanges
                </a>
              </li>
              <li>
                <a href="/faq" className="text-muted-foreground hover:text-foreground">
                  FAQ
                </a>
              </li>
              <li>
                <a href="/size-guide" className="text-muted-foreground hover:text-foreground">
                  Size Guide
                </a>
              </li>
            </ul>
          </div>
          <div>
            <h3 className="text-lg font-semibold">Follow Us</h3>
            <div className="mt-4 flex space-x-4">
              <a
                href="#"
                className="text-muted-foreground hover:text-foreground"
              >
                <Facebook className="h-5 w-5" />
              </a>
              <a
                href="#"
                className="text-muted-foreground hover:text-foreground"
              >
                <Instagram className="h-5 w-5" />
              </a>
              <a
                href="#"
                className="text-muted-foreground hover:text-foreground"
              >
                <Twitter className="h-5 w-5" />
              </a>
            </div>
          </div>
        </div>
        <div className="mt-12 border-t pt-8 text-center">
          <p className="text-sm text-muted-foreground">
            © {new Date().getFullYear()} Store. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;