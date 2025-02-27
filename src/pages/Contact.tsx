import { useState } from "react";
import { Timestamp } from "firebase/firestore";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { contactService } from "@/services/contactService";
import { Loader2 } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Switch } from "@/components/ui/switch";
import { Helmet } from "react-helmet";
import { ContactFormData } from "@/types/contact";

// Form validation schema
const contactFormSchema = z.object({
  firstName: z.string().min(2, "First name must be at least 2 characters"),
  lastName: z.string().min(2, "Last name must be at least 2 characters"),
  email: z.string().email("Please enter a valid email address"),
  phone: z.string().min(10, "Please enter a valid Mobile Number"),
  inquiryType: z.enum(['general', 'custom_design', 'appointment', 'bulk_order']),
  message: z.string().min(10, "Message must be at least 10 characters"),
  imageUrl: z.string().optional(),
  preferredContactMethod: z.enum(['email', 'phone', 'whatsapp']),
  preferredMetal: z.string().optional(),
  budgetRange: z.string().optional(),
  appointmentDate: z.string().optional(),
});

type ContactFormValues = z.infer<typeof contactFormSchema>;

const Contact = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const form = useForm<ContactFormValues>({
    resolver: zodResolver(contactFormSchema),
    defaultValues: {
      inquiryType: 'general',
      preferredContactMethod: 'email',
    },
  });

  const handleSubmit = async (values: ContactFormValues) => {
    try {
      setIsSubmitting(true);
      
      const formData: ContactFormData = {
        firstName: values.firstName,
        lastName: values.lastName,
        email: values.email,
        phone: values.phone || '',
        inquiryType: values.inquiryType,
        message: values.message,
        preferredContactMethod: values.preferredContactMethod,
        preferredMetal: values.preferredMetal || null,
        budgetRange: values.budgetRange || null,
        appointmentDate: values.appointmentDate ? new Date(values.appointmentDate) : null,
        imageUrl: values.imageUrl || null,
      };

      await contactService.submitInquiry({
        ...formData,
        appointmentDate: formData.appointmentDate ? Timestamp.fromDate(formData.appointmentDate) : null,
        priority: 'medium'
      });

      toast.success("Thank you for your inquiry! We'll get back to you soon.");
      form.reset();
    } catch (error) {
      console.error("Error submitting form:", error);
      toast.error("Error submitting your inquiry. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <Helmet>
        <title>Contact Us - Srinivasa Jewellers</title>
        <meta name="description" content="Contact Srinivasa Jewellers for custom jewelry design, repairs, or general inquiries. We're here to help with all your jewelry needs." />
        <meta name="keywords" content="jewelry contact, custom jewelry, jewelry repair, jewelry consultation, Srinivasa Jewellers" />
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "JewelryStore",
            "name": "Srinivasa Jewellers",
            "url": window.location.href,
            "contactPoint": {
              "@type": "ContactPoint",
              "telephone": "+91-953-853-8568",
              "contactType": "customer service"
            }
          })}
        </script>
      </Helmet>

    <div className="min-h-screen bg-background mt-16 sm:mt-0">
      <div className="container mx-auto px-2 sm:px-4 py-4 sm:py-8 max-w-7xl">
        <section className="page-header-margin">
            <h1 className="text-2xl text-center sm:text-4xl md:text-5xl font-bold text-black mb-3 sm:mb-4 leading-tight">
              Get in Touch
          </h1>
            <p className="text-lg text-center text-gray-600 max-w-2xl mx-auto">
              Whether you're looking for a custom design, or have any questions, 
              we're here to help create your perfect jewelry experience.
      </p>
        </section>
      
          <div className="max-w-2xl mx-auto mt-8 p-6 sm:p-8 bg-white rounded-xl shadow-lg border border-gray-200">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="firstName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>First Name</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="lastName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Last Name</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
          />
        </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email</FormLabel>
                        <FormControl>
                          <Input type="email" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="phone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Phone </FormLabel>
                        <FormControl>
                          <Input type="tel" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
          />
        </div>

                <FormField
                  control={form.control}
                  name="inquiryType"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Inquiry Type</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select inquiry type" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="general">General Inquiry</SelectItem>
                          <SelectItem value="custom_design">Custom Design</SelectItem>
                          <SelectItem value="appointment">Book Appointment</SelectItem>
                          <SelectItem value="bulk_order">Bulk Order</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {form.watch("inquiryType") === "custom_design" && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="preferredMetal"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Preferred Metal</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select metal" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="gold_18k">18K Gold</SelectItem>
                              <SelectItem value="gold_20k">20K Gold</SelectItem>
                              <SelectItem value="gold_22k">22K Gold</SelectItem>
                              <SelectItem value="gold_24k">24K Gold</SelectItem>
                              <SelectItem value="Silver 999">Silver 999</SelectItem>
                              <SelectItem value="Silver 925">Silver 925</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="budgetRange"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Budget Range</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select budget range" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="under_50k">Under ₹50,000</SelectItem>
                              <SelectItem value="50k_100k">₹50,000 - ₹1,00,000</SelectItem>
                              <SelectItem value="100k_200k">₹1,00,000 - ₹2,00,000</SelectItem>
                              <SelectItem value="above_200k">Above ₹2,00,000</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
          />
        </div>
                )}

                {form.watch("inquiryType") === "appointment" && (
                  <FormField
                    control={form.control}
                    name="appointmentDate"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Preferred Appointment Date</FormLabel>
                        <FormControl>
          <Input
                            type="datetime-local" 
                            value={field.value || ''}
                            onChange={(e) => {
                              const date = e.target.value;
                              field.onChange(date);
                            }}
                            min={new Date().toISOString().slice(0, 16)}
                            className="px-3 py-2"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}

                <FormField
                  control={form.control}
                  name="message"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Message</FormLabel>
                      <FormControl>
                        <Textarea 
                          {...field}
                          placeholder="Please describe your requirements or questions..."
                          className="min-h-[120px]"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {form.watch("inquiryType") === "custom_design" && (
                  <FormField
                    control={form.control}
                    name="imageUrl"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Design Reference Image URL (Optional)</FormLabel>
                        <FormControl>
                          <Input 
                            type="url" 
                            placeholder="Enter image URL of your design reference"
                            {...field} 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}

                <FormField
                  control={form.control}
                  name="preferredContactMethod"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Preferred Contact Method</FormLabel>
                      <FormControl>
                        <RadioGroup
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                          className="flex space-x-4"
                        >
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="email" id="email" />
                            <Label htmlFor="email">Email</Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="phone" id="phone" />
                            <Label htmlFor="phone">Phone</Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="whatsapp" id="whatsapp" />
                            <Label htmlFor="whatsapp">WhatsApp</Label>
        </div>
                        </RadioGroup>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

        <Button
          type="submit"
                  className="w-full"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Submitting...
                    </>
                  ) : (
                    "Submit Inquiry"
                  )}
        </Button>
      </form>
            </Form>
          </div>
        </div>
      </div>
    </>
  );
};

export default Contact;
