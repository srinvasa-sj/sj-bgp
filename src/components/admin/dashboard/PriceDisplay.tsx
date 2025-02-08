interface PriceDisplayProps {
  priceData: any;
  priceUpdateTime: string;
}

const PriceDisplay = ({ priceData, priceUpdateTime }: PriceDisplayProps) => {
  if (!priceData) return null;

  const priceItems = [
    { label: "18K Gold", value: priceData.price18Karat },
    { label: "20K Gold", value: priceData.price20Karat },
    { label: "22K Gold", value: priceData.price22Karat },
    { label: "24K Gold", value: priceData.price24Karat },
    { label: "Gold Making", value: priceData.goldmakingCharges },
    { label: "Gold Wastage", value: priceData.goldwastageCharges + "%" },
    { label: "Silver 1", value: priceData.priceSilver1 },
    { label: "Silver 2", value: priceData.priceSilver2 },
    { label: "Silver Making", value: priceData.makingChargesSilver },
    { label: "Silver Wastage", value: priceData.wastageChargesSilver + "%" },
  ];

  return (
    <div className="mt-6">
      <h3 className="text-xl font-semibold mb-4">Today's Price Details</h3>
      <p className="text-sm text-gray-600 mb-4">Last Updated: {priceUpdateTime}</p>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        {priceItems.map((item, index) => (
          <div
            key={index}
            className="bg-white p-4 rounded-lg shadow hover:shadow-md transition-all hover:scale-105 hover:bg-primary/5"
          >
            <h4 className="text-sm font-semibold text-gray-600">{item.label}</h4>
            <p className="text-lg font-bold text-primary">
              {typeof item.value === 'string' ? item.value : `₹${item.value?.toFixed(2)}`}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PriceDisplay;