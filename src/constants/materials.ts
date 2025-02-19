// export const MATERIALS = ['Gold', 'Silver'] as const;

// export const PURITY_OPTIONS = {
//   'Gold': ['18 Karat', '20 Karat', '22 Karat', '24 Karat'],
//   'Silver': ['Silver 999', 'Silver 925']
// } as const;

// export const DEFAULT_PURITY = {
//   'Gold': '22 Karat',
//   'Silver': 'Silver 925'
// } as const;

// export const PRICE_FIELDS = {
//   'Gold': {
//     '24 Karat': 'price24Karat',
//     '22 Karat': 'price22Karat',
//     '20 Karat': 'price20Karat',
//     '18 Karat': 'price18Karat',
//   },
//   'Silver': {
//     'Silver 999': 'priceSilver999',
//     'Silver 925': 'priceSilver925'
//   }
// } as const;

// export const WASTAGE_FIELDS = {
//   'Gold': 'goldWastageCharges',
//   'Silver': 'silverWastageCharges'
// } as const;

// export const MAKING_CHARGES_FIELDS = {
//   'Gold': 'goldMakingCharges',
//   'Silver': 'silverMakingCharges'
// } as const;

// export const PURITY_MULTIPLIERS = {
//   'Gold': {
//     '24 Karat': 1,
//     '22 Karat': 22/24,
//     '20 Karat': 20/24,
//     '18 Karat': 18/24,
//   },
//   'Silver': {
//     'Silver 999': 0.999,
//     'Silver 925': 0.925
//   }
// } as const;

// // For backward compatibility
// export const LEGACY_PRICE_MAPPING = {
//   'priceSilver999': 'priceSilver1',
//   'priceSilver925': 'priceSilver2'
// } as const; 

export const MATERIALS = ['Gold', 'Silver'] as const;

export const PURITY_OPTIONS = {
  'Gold': ['18 Karat', '20 Karat', '22 Karat', '24 Karat'],
  'Silver': ['Silver 999', 'Silver 925']
} as const;

export const PRICE_FIELDS = {
  'Gold': {
    '24 Karat': 'price24Karat',
    '22 Karat': 'price22Karat',
    '20 Karat': 'price20Karat',
    '18 Karat': 'price18Karat',
  },
  'Silver': {
    'Silver 999': 'priceSilver999',
    'Silver 925': 'priceSilver925'
  }
} as const;

export const WASTAGE_FIELDS = {
  'Gold': 'goldwastageCharges',
  'Silver': 'wastageChargesSilver'
} as const;

export const MAKING_CHARGES_FIELDS = {
  'Gold': 'goldmakingCharges',
  'Silver': 'makingChargesSilver'
} as const;

// For backward compatibility
export const LEGACY_PRICE_MAPPING = {
  'priceSilver999': 'priceSilver1',
  'priceSilver925': 'priceSilver2'
} as const; 