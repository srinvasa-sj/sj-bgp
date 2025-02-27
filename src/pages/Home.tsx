import { useState, useEffect } from "react";
import { getDoc, doc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { PromotionNews } from "@/components/promotions/PromotionNews";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { InfoIcon } from "lucide-react";
import { PRICE_FIELDS, WASTAGE_FIELDS, MAKING_CHARGES_FIELDS, PURITY_OPTIONS } from '@/constants/materials';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const Home = () => {
  const [priceData, setPriceData] = useState<any>(null);
  const [result, setResult] = useState<string>("");
  const [formData, setFormData] = useState({
    goldType: "",
    goldWeight: "",
    silverType: "",
    silverWeight: "",
  });
  const [previewCalc, setPreviewCalc] = useState({
    goldTotal: 0,
    silverTotal: 0,
    goldBase: 0,
    silverBase: 0,
    goldMaking: 0,
    silverMaking: 0,
    goldWastage: 0,
    silverWastage: 0
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

  // Calculate preview amounts when weight or type changes
  useEffect(() => {
    if (priceData && (formData.goldWeight || formData.silverWeight)) {
      let goldTotal = 0, silverTotal = 0, goldBase = 0, silverBase = 0;
      let goldMaking = 0, silverMaking = 0, goldWastage = 0, silverWastage = 0;

      // Gold calculations
      if (formData.goldType && formData.goldWeight) {
        const goldWeight = parseFloat(formData.goldWeight) || 0;
        const priceField = PRICE_FIELDS['Gold'][formData.goldType as keyof (typeof PRICE_FIELDS)['Gold']];
        const goldPricePerGram = priceData[priceField];

        goldBase = goldPricePerGram * goldWeight;
        
        // Only apply wastage and making charges if not 24 Karat
        if (formData.goldType !== '24 Karat') {
          goldWastage = goldBase * (priceData.goldwastageCharges / 100);
          goldMaking = priceData.goldmakingCharges * goldWeight;
        }
        goldTotal = goldBase + goldWastage + goldMaking;
      }

      // Silver calculations
      if (formData.silverType && formData.silverWeight) {
        const silverWeight = parseFloat(formData.silverWeight) || 0;
        const priceField = PRICE_FIELDS['Silver'][formData.silverType as keyof (typeof PRICE_FIELDS)['Silver']];
        const silverPricePerGram = priceData[priceField];

        silverBase = silverPricePerGram * silverWeight;
        silverWastage = silverBase * (priceData.wastageChargesSilver / 100);
        silverMaking = priceData.makingChargesSilver * silverWeight;
        silverTotal = silverBase + silverWastage + silverMaking;
      }

      setPreviewCalc({
        goldTotal,
        silverTotal,
        goldBase,
        silverBase,
        goldMaking,
        silverMaking,
        goldWastage,
        silverWastage
      });
    }
  }, [formData, priceData]);

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
          const priceField = PRICE_FIELDS['Gold'][formData.goldType as keyof (typeof PRICE_FIELDS)['Gold']];
          const goldPricePerGram = priceData[priceField];
          const goldPriceForWeight = goldPricePerGram * goldWeight;
          const baseGoldPrice = goldPriceForWeight;

          if (formData.goldType !== '24 Karat') {
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
          const priceField = PRICE_FIELDS['Silver'][formData.silverType as keyof (typeof PRICE_FIELDS)['Silver']];
          const silverPricePerGram = priceData[priceField];
          const silverPriceForWeight = silverPricePerGram * silverWeight;
          const baseSilverPrice = silverPriceForWeight;
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
      <div className="container mx-auto px-2 sm:px-4 py-4 sm:py-8 max-w-7xl mobile-container">
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
          <section className="mb-8 sm:mb-12 rounded-xl p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl sm:text-2xl md:text-3xl font-bold">
                Today's Price Details
            </h2>
              <div className="text-sm text-muted-foreground">
                Last Updated: {new Date().toLocaleTimeString()}
              </div>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
              {[
                ...PURITY_OPTIONS['Gold'].map(purity => ({
                  label: purity,
                  value: priceData[PRICE_FIELDS['Gold'][purity as keyof (typeof PRICE_FIELDS)['Gold']]],
                  color: "amber",
                  info: {
                    '24 Karat': '99.9% pure gold, highest purity level. Best for investment but too soft for jewelry.',
                    '22 Karat': '91.6% pure gold, traditional choice for Indian jewelry. Ideal for special occasions.',
                    '20 Karat': '83.3% pure gold, offering higher purity while maintaining good durability.',
                    '18 Karat': '75% pure gold, suitable for daily wear jewelry. Good balance of durability and gold content.'
                  }[purity]
                })),
                ...PURITY_OPTIONS['Silver'].map(purity => ({
                  label: purity,
                  value: priceData[PRICE_FIELDS['Silver'][purity as keyof (typeof PRICE_FIELDS)['Silver']]],
                  color: "gray",
                  info: {
                    'Silver 999': '99.9% pure silver, highest quality. Used in industrial applications and premium jewelry.',
                    'Silver 925': '92.5% pure silver (Sterling Silver). Most common for jewelry due to durability and shine.'
                  }[purity]
                }))
              ].map((item, index) => (
                <div key={index} className={`mobile-card bg-white p-4 rounded-lg shadow-md`}>
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger className="w-full text-left">
                        <div>
                          <h3 className={`text-sm sm:text-base font-semibold ${
                            item.color === 'amber' ? 'text-amber-700' : 'text-gray-700'
                          }`}>
                    {item.label}
                  </h3>
                          <p className={`text-base sm:text-lg md:text-xl font-bold ${
                            item.color === 'amber' ? 'text-amber-600' : 'text-gray-600'
                          }`}>
                            ₹{item.value?.toFixed(2)}/g
                          </p>
                        </div>
                      </TooltipTrigger>
                      <TooltipContent side="bottom" className="max-w-[200px] text-sm p-2">
                        {item.info}
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Calculator Section */}
        <section className="mb-8 sm:mb-12">
          <div className="bg-card p-3 sm:p-6 md:p-8 rounded-xl shadow-lg w-[95%] sm:max-w-6xl mx-auto">
            <h2 className="text-xl sm:text-2xl md:text-3xl font-bold mb-6">
              Gold and Silver Price Calculator
            </h2>

            <form onSubmit={handleSubmit} className="space-y-8">
              {/* Gold Calculator Section */}
              <div className="bg-amber-50/50 p-4 rounded-lg border border-amber-100">
                <h3 className="text-lg font-semibold text-amber-700 mb-4">Gold Calculator</h3>
              <div className="space-y-4">
                  <div>
                <Label className="text-base sm:text-lg block mb-2">Gold Purity</Label>
                <RadioGroup
                  value={formData.goldType}
                      onValueChange={(value) => setFormData(prev => ({ ...prev, goldType: value }))}
                      className="grid grid-cols-2 sm:grid-cols-4 gap-4"
                >
                      {PURITY_OPTIONS['Gold'].map((purity) => (
                        <div key={purity} className="flex items-center space-x-2 bg-white p-2 rounded-md border border-amber-100">
                          <RadioGroupItem value={purity} id={`gold-${purity}`} />
                          <Label htmlFor={`gold-${purity}`} className="text-sm sm:text-base cursor-pointer">
                            {purity}
                      </Label>
                    </div>
                  ))}
                </RadioGroup>
              </div>

                  <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="goldWeight" className="text-base sm:text-lg block mb-2">
                  Gold Weight (grams)
                </Label>
                <Input
                  id="goldWeight"
                  type="number"
                        step="0.001"
                        min="0"
                        placeholder="Enter weight in grams"
                  value={formData.goldWeight}
                  onChange={(e) => setFormData({ ...formData, goldWeight: e.target.value })}
                  className="w-full"
                />
                      {formData.goldWeight && formData.goldType && (
                        <div className="mt-2 text-amber-700 font-medium">
                          Expected Total: ₹{previewCalc.goldTotal.toFixed(2)}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Silver Calculator Section */}
              <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                <h3 className="text-lg font-semibold text-gray-700 mb-4">Silver Calculator</h3>
              <div className="space-y-4">
                  <div>
                <Label className="text-base sm:text-lg block mb-2">Silver Purity</Label>
                <RadioGroup
                  value={formData.silverType}
                      onValueChange={(value) => setFormData(prev => ({ ...prev, silverType: value }))}
                  className="grid grid-cols-2 gap-4"
                >
                      {PURITY_OPTIONS['Silver'].map((purity) => (
                        <div key={purity} className="flex items-center space-x-2 bg-white p-2 rounded-md border border-gray-200">
                          <RadioGroupItem value={purity} id={`silver-${purity}`} />
                          <Label htmlFor={`silver-${purity}`} className="text-sm sm:text-base cursor-pointer">
                            {purity}
                      </Label>
                    </div>
                  ))}
                </RadioGroup>
              </div>

                  <div>
                    <Label htmlFor="silverWeight" className="text-base sm:text-lg block mb-2">
                  Silver Weight (grams)
                </Label>
                <Input
                  id="silverWeight"
                  type="number"
                      step="0.001"
                      min="0"
                      placeholder="Enter weight in grams"
                  value={formData.silverWeight}
                  onChange={(e) => setFormData({ ...formData, silverWeight: e.target.value })}
                  className="w-full"
                />
                    {formData.silverWeight && formData.silverType && (
                      <div className="mt-2 text-gray-700 font-medium">
                        Expected Total: ₹{previewCalc.silverTotal.toFixed(2)}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex justify-center">
                <Button 
                  type="submit" 
                  className="w-full sm:w-auto min-w-[200px] bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700"
                >
                Calculate Price
              </Button>
              </div>
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







