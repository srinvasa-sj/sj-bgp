import { useState, useEffect } from "react";
import { getDoc, doc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { PromotionNews } from "@/components/promotions/PromotionNews";
import { Button } from "@/components/ui/button";

const Home = () => {
  const [priceData, setPriceData] = useState<any>(null);
  const [result, setResult] = useState<string>("");
  const [formData, setFormData] = useState({
    goldType: "",
    goldWeight: "",
    silverType: "",
    silverWeight: "",
  });

  useEffect(() => {
    const fetchPriceData = async () => {
      try {
        const docRef = doc(db, "priceData", "4OhZCKHQls64bokVqGN5");
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setPriceData(docSnap.data());
        }
      } catch (error) {
        console.error("Error fetching price data:", error);
      }
    };
    fetchPriceData();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.goldType && !formData.silverType) {
      setResult("Please select a gold or silver type");
      return;
    }

    try {
      const docRef = doc(db, "priceData", "4OhZCKHQls64bokVqGN5");
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        const priceData = docSnap.data();
        let resultText = "";
        let totalGoldPrice = 0;
        let totalSilverPrice = 0;

        // Calculate Gold Price if provided
        if (formData.goldType && formData.goldWeight) {
          const goldWeight = parseFloat(formData.goldWeight);
          let goldPricePerGram = 0;
          let applyWastageMakingCharges = true;

          switch (formData.goldType) {
            case "18-Karat":
              goldPricePerGram = priceData.price18Karat;
              break;
            case "20-Karat":
              goldPricePerGram = priceData.price20Karat;
              break;
            case "22-Karat":
              goldPricePerGram = priceData.price22Karat;
              break;
            case "24-Karat":
              goldPricePerGram = priceData.price24Karat;
              applyWastageMakingCharges = false;
              break;
          }

          const goldPriceForWeight = goldPricePerGram * goldWeight;
          const baseGoldPrice = goldPricePerGram * goldWeight; // Added base price for gold
          if (applyWastageMakingCharges) {
            const wastageChargesGold = goldPriceForWeight * (priceData.goldwastageCharges / 100);
            const makingChargesGold = priceData.goldmakingCharges * goldWeight;
            totalGoldPrice = goldPriceForWeight + wastageChargesGold + makingChargesGold;

            resultText += `
              <div class="overflow-x-auto">
                <table class="min-w-full border-collapse border border-gray-400 mb-4">
                  <thead class="bg-gray-200">
                    <tr>
                      <th colspan="2" class="px-4 py-2 border border-gray-400 text-sm uppercase tracking-wider">Gold Details</th>
                    </tr>
                  </thead>
                  <tbody class="bg-white">
                    <tr class="border border-gray-400">
                      <td class="px-4 py-2 text-sm">Purity</td>
                      <td class="px-4 py-2 text-sm">${formData.goldType}</td>
                    </tr>
                    <tr class="border border-gray-400">
                      <td class="px-4 py-2 text-sm">Weight</td>
                      <td class="px-4 py-2 text-sm">${goldWeight.toFixed(3)}g</td>
                    </tr>
                    <tr class="border border-gray-400">
                      <td class="px-4 py-2 text-sm">Price per gram</td>
                      <td class="px-4 py-2 text-sm">₹${goldPricePerGram.toFixed(2)}</td>
                    </tr>
                    <tr class="border border-gray-400">
                      <td class="px-4 py-2 text-sm">Base Price (Price per gram * Weight)</td>
                      <td class="px-4 py-2 text-sm">₹${baseGoldPrice.toFixed(2)}</td>
                    </tr>
                    <tr class="border border-gray-400">
                      <td class="px-4 py-2 text-sm">Wastage Charges (${priceData.goldwastageCharges}%)</td>
                      <td class="px-4 py-2 text-sm">₹${wastageChargesGold.toFixed(2)}</td>
                    </tr>
                    <tr class="border border-gray-400">
                      <td class="px-4 py-2 text-sm">Making Charges (₹${priceData.goldmakingCharges}/g)</td>
                      <td class="px-4 py-2 text-sm">₹${makingChargesGold.toFixed(2)}</td>
                    </tr>
                    <tr class="bg-gray-100 border border-gray-400">
                      <td class="px-4 py-2 text-sm font-bold">Total Gold Price</td>
                      <td class="px-4 py-2 text-sm font-bold">₹${totalGoldPrice.toFixed(2)}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            `;
          } else {
            totalGoldPrice = goldPriceForWeight;
            resultText += `
              <div class="overflow-x-auto">
                <table class="min-w-full border-collapse border border-gray-400 mb-4">
                  <thead class="bg-gray-200">
                    <tr>
                      <th colspan="2" class="px-4 py-2 border border-gray-400 text-sm uppercase tracking-wider">Gold Details</th>
                    </tr>
                  </thead>
                  <tbody class="bg-white">
                    <tr class="border border-gray-400">
                      <td class="px-4 py-2 text-sm">Purity</td>
                      <td class="px-4 py-2 text-sm">${formData.goldType}</td>
                    </tr>
                    <tr class="border border-gray-400">
                      <td class="px-4 py-2 text-sm">Weight</td>
                      <td class="px-4 py-2 text-sm">${goldWeight.toFixed(3)}g</td>
                    </tr>
                    <tr class="border border-gray-400">
                      <td class="px-4 py-2 text-sm">Price per gram</td>
                      <td class="px-4 py-2 text-sm">₹${goldPricePerGram.toFixed(2)}</td>
                    </tr>
                    <tr class="border border-gray-400">
                      <td class="px-4 py-2 text-sm">Base Price (Price per gram * Weight)</td>
                      <td class="px-4 py-2 text-sm">₹${baseGoldPrice.toFixed(2)}</td>
                    </tr>
                    <tr class="bg-gray-100 border border-gray-400">
                      <td class="px-4 py-2 text-sm font-bold">Total Gold Price</td>
                      <td class="px-4 py-2 text-sm font-bold">₹${totalGoldPrice.toFixed(2)}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            `;
          }
        }

        // Calculate Silver Price if provided
        if (formData.silverType && formData.silverWeight) {
          const silverWeight = parseFloat(formData.silverWeight);
          let silverPricePerGram = formData.silverType === "silver-1" 
            ? priceData.priceSilver1 
            : priceData.priceSilver2;

          const silverPriceForWeight = silverPricePerGram * silverWeight;
          const baseSilverPrice = silverPricePerGram * silverWeight; // Added base price for silver
          const wastageChargesSilver = silverPriceForWeight * (priceData.wastageChargesSilver / 100);
          const makingChargesSilver = priceData.makingChargesSilver * silverWeight;
          totalSilverPrice = silverPriceForWeight + wastageChargesSilver + makingChargesSilver;

          resultText += `
            <div class="overflow-x-auto">
              <table class="min-w-full border-collapse border border-gray-400 mb-4">
                <thead class="bg-gray-200">
                  <tr>
                    <th colspan="2" class="px-4 py-2 border border-gray-400 text-sm uppercase tracking-wider">Silver Details</th>
                  </tr>
                </thead>
                <tbody class="bg-white">
                  <tr class="border border-gray-400">
                    <td class="px-4 py-2 text-sm">Purity</td>
                    <td class="px-4 py-2 text-sm">${formData.silverType}</td>
                  </tr>
                  <tr class="border border-gray-400">
                    <td class="px-4 py-2 text-sm">Weight</td>
                    <td class="px-4 py-2 text-sm">${silverWeight.toFixed(3)}g</td>
                  </tr>
                  <tr class="border border-gray-400">
                    <td class="px-4 py-2 text-sm">Price per gram</td>
                    <td class="px-4 py-2 text-sm">₹${silverPricePerGram.toFixed(2)}</td>
                  </tr>
                  <tr class="border border-gray-400">
                    <td class="px-4 py-2 text-sm">Base Price (Price per gram * Weight)</td>
                    <td class="px-4 py-2 text-sm">₹${baseSilverPrice.toFixed(2)}</td>
                  </tr>
                  <tr class="border border-gray-400">
                    <td class="px-4 py-2 text-sm">Wastage Charges (${priceData.wastageChargesSilver}%)</td>
                    <td class="px-4 py-2 text-sm">₹${wastageChargesSilver.toFixed(2)}</td>
                  </tr>
                  <tr class="border border-gray-400">
                    <td class="px-4 py-2 text-sm">Making Charges (₹${priceData.makingChargesSilver}/g)</td>
                    <td class="px-4 py-2 text-sm">₹${makingChargesSilver.toFixed(2)}</td>
                  </tr>
                  <tr class="bg-gray-100 border border-gray-400">
                    <td class="px-4 py-2 text-sm font-bold">Total Silver Price</td>
                    <td class="px-4 py-2 text-sm font-bold">₹${totalSilverPrice.toFixed(2)}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          `;
        }

        const grossTotal = (totalGoldPrice || 0) + (totalSilverPrice || 0);
        resultText += `
          <div class="overflow-x-auto">
            <table class="min-w-full border-collapse border border-gray-400">
              <tbody>
                <tr class="bg-gray-100 border border-gray-400">
                  <td class="px-4 py-2 text-sm font-bold">Gross Total</td>
                  <td class="px-4 py-2 text-sm font-bold">₹${grossTotal.toFixed(2)}</td>
                </tr>
              </tbody>
            </table>
          </div>
        `;

        setResult(resultText);
        setFormData({
          goldType: "",
          goldWeight: "",
          silverType: "",
          silverWeight: "",
        });
      }
    } catch (error) {
      console.error("Error calculating price:", error);
      setResult("Error: Unable to calculate price");
    }
  };

  return (
    <div className="min-h-screen bg-background mt-16 sm:mt-0">
      <div className="container mx-auto px-2 sm:px-4 py-4 sm:py-8 max-w-7xl">
        <section className="page-header-margin">
          <h1 className="text-2xl text-left sm:text-left sm:text-4xl md:text-5xl lg:text-6xl font-bold text-black mb-3 sm:mb-4 leading-tight">
            Welcome to Srinivasa Jewellers
          </h1>
          <p className="text-sm sm:text-base md:text-lg text-muted-foreground max-w-3xl">
            Where elegance meets craftsmanship. Explore our exquisite collection of fine jewellery, 
            from timeless classics to unique statement pieces.
          </p>
        </section>

        {/* Promotions Section */}
        <section className="mb-8 sm:mb-12">
          <PromotionNews />
        </section>

        {/* Price Details Section */}
        {priceData && (
          <section className="mb-8 sm:mb-12">
            <h2 className="text-xl sm:text-2xl md:text-3xl font-bold mb-6">
              Today's Price Details /gram
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-6 gap-3">
              {[
                { label: "18K", value: priceData.price18Karat },
                { label: "20K", value: priceData.price20Karat },
                { label: "22K", value: priceData.price22Karat },
                { label: "24K", value: priceData.price24Karat },
                { label: "Silver 1", value: priceData.priceSilver1 },
                { label: "Silver 2", value: priceData.priceSilver2 }
              ].map((item, index) => (
                <div
                  key={index}
                  className="bg-card p-4 rounded-lg shadow-md hover:shadow-lg transition-shadow"
                >
                  <h3 className="text-sm sm:text-base font-semibold text-foreground mb-1">
                    {item.label}
                  </h3>
                  <p className="text-base sm:text-lg md:text-xl font-bold text-primary">
                    ₹{item.value?.toFixed(2)}
                  </p>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Calculator Section with reduced width on mobile */}
        <section className="mb-8 sm:mb-12">
          <div className="bg-card p-3 sm:p-6 md:p-8 rounded-xl shadow-lg w-[95%] sm:max-w-6xl mx-auto">
            <h2 className="text-xl sm:text-2xl md:text-3xl font-bold mb-6">
              Gold and Silver Price Calculator
            </h2>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Gold Section */}
              <div className="space-y-4">
                <Label className="text-base sm:text-lg block mb-2">Gold Purity</Label>
                <RadioGroup
                  value={formData.goldType}
                  onValueChange={(value) => setFormData({ ...formData, goldType: value })}
                  className="grid grid-cols-2 sm:flex sm:flex-wrap gap-4"
                >
                  {["18-Karat", "20-Karat", "22-Karat", "24-Karat"].map((type) => (
                    <div key={type} className="flex items-center space-x-2">
                      <RadioGroupItem value={type} id={type} />
                      <Label htmlFor={type} className="text-sm sm:text-base">
                        {type.replace("-", " ")}
                      </Label>
                    </div>
                  ))}
                </RadioGroup>
              </div>

              <div className="space-y-2">
                <Label htmlFor="goldWeight" className="text-base sm:text-lg block">
                  Gold Weight (grams)
                </Label>
                <Input
                  id="goldWeight"
                  type="number"
                  step="any"
                  value={formData.goldWeight}
                  onChange={(e) => setFormData({ ...formData, goldWeight: e.target.value })}
                  className="w-full"
                />
              </div>

              {/* Silver Section */}
              <div className="space-y-4">
                <Label className="text-base sm:text-lg block mb-2">Silver Purity</Label>
                <RadioGroup
                  value={formData.silverType}
                  onValueChange={(value) => setFormData({ ...formData, silverType: value })}
                  className="grid grid-cols-2 gap-4"
                >
                  {["Silver 999", "Silver 925"].map((type) => (
                    <div key={type} className="flex items-center space-x-2">
                      <RadioGroupItem value={type} id={type} />
                      <Label htmlFor={type} className="text-sm sm:text-base">
                        {type}
                      </Label>
                    </div>
                  ))}
                </RadioGroup>
              </div>

              <div className="space-y-2">
                <Label htmlFor="silverWeight" className="text-base sm:text-lg block">
                  Silver Weight (grams)
                </Label>
                <Input
                  id="silverWeight"
                  type="number"
                  step="any"
                  value={formData.silverWeight}
                  onChange={(e) => setFormData({ ...formData, silverWeight: e.target.value })}
                  className="w-full"
                />
              </div>

              <Button type="submit" className="w-full sm:w-auto">
                Calculate Price
              </Button>
            </form>
          </div>
        </section>

        {/* Results Section */}
        {result && (
          <section className="mb-12">
            <div className="max-w-4xl mx-auto">
              <h3 className="text-lg sm:text-xl md:text-2xl font-bold mb-4">
                Calculation Result
              </h3>
              <div 
                className="prose prose-sm sm:prose max-w-none overflow-x-auto"
                dangerouslySetInnerHTML={{ __html: result }}
              />
            </div>
          </section>
        )}
      </div>
    </div>
  );
};

export default Home;







