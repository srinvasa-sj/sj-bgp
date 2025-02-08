// import { useState } from "react";
// import { addDoc, collection } from "firebase/firestore";
// import { db } from "@/lib/firebase";
// import { toast } from "sonner";
// import { Button } from "@/components/ui/button";
// import { Input } from "@/components/ui/input";
// import { Label } from "@/components/ui/label";

// const Contact = () => {
//   const [formData, setFormData] = useState({
//     firstName: "",
//     lastName: "",
//     email: "",
//     phone: "",
//   });

//   const handleSubmit = async (e: React.FormEvent) => {
//     e.preventDefault();
    
//     try {
//       await addDoc(collection(db, "customerData"), formData);
//       toast.success("Information submitted successfully!");
//       setFormData({ firstName: "", lastName: "", email: "", phone: "" });
//     } catch (error) {
//       console.error("Error submitting form:", error);
//       toast.error("Error submitting information");
//     }
//   };

//   const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
//     setFormData({
//       ...formData,
//       [e.target.id]: e.target.value,
//     });
//   };

//   return (
//     <div className="max-w-md mx-auto space-y-6">
//       <h1 className="text-4xl font-bold">Leave your information here</h1>
//       <p className="text-lg text-gray-600">
//         Your time matters to us - our representative will reach out promptly to assist you!
//       </p>
      
//       <form onSubmit={handleSubmit} className="space-y-4">
//         <div className="space-y-2">
//           <Label htmlFor="firstName">First Name</Label>
//           <Input
//             type="text"
//             id="firstName"
//             value={formData.firstName}
//             onChange={handleChange}
//             required
//           />
//         </div>

//         <div className="space-y-2">
//           <Label htmlFor="lastName">Last Name</Label>
//           <Input
//             type="text"
//             id="lastName"
//             value={formData.lastName}
//             onChange={handleChange}
//             required
//           />
//         </div>

//         <div className="space-y-2">
//           <Label htmlFor="email">Email</Label>
//           <Input
//             type="email"
//             id="email"
//             value={formData.email}
//             onChange={handleChange}
//             required
//           />
//         </div>

//         <div className="space-y-2">
//           <Label htmlFor="phone">Phone</Label>
//           <Input
//             type="tel"
//             id="phone"
//             value={formData.phone}
//             onChange={handleChange}
//             required
//           />
//         </div>

//         <Button type="submit" className="w-full">
//           Submit
//         </Button>
//       </form>
//     </div>
//   );
// };

// export default Contact;
import { useState } from "react";
import { addDoc, collection } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const Contact = () => {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      await addDoc(collection(db, "customerData"), formData);
      toast.success("Information submitted successfully!");
      setFormData({ firstName: "", lastName: "", email: "", phone: "" });
    } catch (error) {
      console.error("Error submitting form:", error);
      toast.error("Error submitting information");
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.id]: e.target.value,
    });
  };

  return (
    <div className="max-w-lg mx-auto p-8 space-y-6 bg-white rounded-xl shadow-lg border border-gray-200">
      <h1 className="text-3xl font-bold text-center text-[#2A3E5C]">Leave your information here</h1>
      <p className="text-lg text-center text-gray-600">
        Your time matters to us - our representative will reach out promptly to assist you!
      </p>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="firstName" className="text-[#2A3E5C] font-medium">First Name</Label>
          <Input
            type="text"
            id="firstName"
            value={formData.firstName}
            onChange={handleChange}
            required
            className="p-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="lastName" className="text-[#2A3E5C] font-medium">Last Name</Label>
          <Input
            type="text"
            id="lastName"
            value={formData.lastName}
            onChange={handleChange}
            required
            className="p-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="email" className="text-[#2A3E5C] font-medium">Email</Label>
          <Input
            type="email"
            id="email"
            value={formData.email}
            onChange={handleChange}
            required
            className="p-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="phone" className="text-[#2A3E5C] font-medium">Phone</Label>
          <Input
            type="tel"
            id="phone"
            value={formData.phone}
            onChange={handleChange}
            required
            className="p-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200"
          />
        </div>

        <Button
          type="submit"
          className="w-full py-3 px-4 bg-[#2A3E5C] text-white rounded-lg shadow-md hover:bg-[#1f2b3b] transition-colors duration-300 focus:outline-none"
        >
          Submit
        </Button>
      </form>
    </div>
  );
};

export default Contact;
