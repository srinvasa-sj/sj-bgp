import { Button } from "./ui/button";
import { Input } from "./ui/input";

const Newsletter = () => {
  return (
    <section className="bg-muted py-16">
      <div className="container px-4">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-bold tracking-tight">
            Subscribe to our newsletter
          </h2>
          <p className="mt-4 text-muted-foreground">
            Get the latest updates about new products and special offers.
          </p>
          <form className="mt-6 flex gap-2">
            <Input
              type="email"
              placeholder="Enter your email"
              className="flex-1"
            />
            <Button type="submit">Subscribe</Button>
          </form>
        </div>
      </div>
    </section>
  );
};

export default Newsletter;