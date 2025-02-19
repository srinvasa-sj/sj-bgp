// import { NewCategory } from '@/types/category';

// export const defaultCategory: NewCategory = {
//   name: "",
//   slug: "",
//   parentId: null,
//   level: 1,
//   isActive: true,
//   sortOrder: 0,
//   showInHeader: false,
//   path: "",
//   hasChildren: false,
//   attributes: [
//     {
//       id: `attr-${Date.now()}`,
//       name: "Weight",
//       type: "weight",
//       required: true,
//       options: [],
//       unit: "g",
//       validation: {
//         min: 0,
//         max: 9999.999,
//         pattern: null
//       }
//     }
//   ],
//   materialOptions: [
//     {
//       type: "Gold",
//       purity: ["18 Karat", "20 Karat", "22 Karat", "24 Karat"],
//       designOptions: [
//         "Antique",
//         "Kundan",
//         "Meenakari",
//         "Jadau",
//         "Temple",
//         "Modern",
//         "Gemstone",
//         "Traditional",
//         "Fancy"
//       ],
//       defaultPurity: "22 Karat",
//       defaultDesign: "Traditional",
//       priceMultiplier: 1
//     },
//     {
//       type: "Silver",
//       purity: ["Silver 999", "Silver 925"],
//       designOptions: [
//         "Antique",
//         "Kundan",
//         "Meenakari",
//         "Jadau",
//         "Temple",
//         "Modern",
//         "Gemstone",
//         "Traditional",
//         "Fancy"
//       ],
//       defaultPurity: "Silver 925",
//       defaultDesign: "Traditional",
//       priceMultiplier: 1
//     }
//   ]
// };

// export const defaultCategories: NewCategory[] = [
//   {
//     name: "Earrings",
//     slug: "earrings",
//     level: 1,
//     isActive: true,
//     sortOrder: 0,
//     parentId: null,
//     path: "",
//     hasChildren: false,
//     attributes: [
//       {
//         id: "1",
//         name: "Weight",
//         type: "weight",
//         required: true,
//         options: []
//       },
//       {
//         id: "2",
//         name: "Purity",
//         type: "select",
//         required: true,
//         options: ["18 Karat", "20 Karat", "22 Karat", "24 Karat"]
//       }
//     ],
//     materialOptions: [
//       {
//         type: "Gold",
//         purity: ["18 Karat", "20 Karat", "22 Karat", "24 Karat"],
//         designOptions: ["Antique", "Kundan", "Meenakari", "Jadau", "Temple", "Modern", "Gemstone", "Traditional", "Fancy"],
//         defaultPurity: "22 Karat",
//         defaultDesign: "Traditional"
//       },
//       {
//         type: "Silver",
//         purity: ["Silver 999", "Silver 925"],
//         designOptions: ["Antique", "Kundan", "Meenakari", "Jadau", "Temple", "Modern", "Gemstone", "Traditional", "Fancy"],
//         defaultPurity: "Silver 925",
//         defaultDesign: "Traditional"
//       }
//     ]
//   }
// ]; 

import { NewCategory } from '@/types/category';

export const defaultCategory: NewCategory = {
  name: "",
  slug: "",
  parentId: null,
  level: 1,
  isActive: true,
  sortOrder: 0,
  showInHeader: false,
  path: "",
  hasChildren: false,
  attributes: [
    {
      id: `attr-${Date.now()}`,
      name: "Weight",
      type: "weight",
      required: true,
      options: [],
      unit: "g",
      validation: {
        min: 0,
        max: 9999.999,
        pattern: null
      }
    }
  ],
  materialOptions: [
    {
      type: "Gold",
      purity: ["18 Karat", "20 Karat", "22 Karat", "24 Karat"],
      designOptions: [
        "Antique",
        "Kundan",
        "Meenakari",
        "Jadau",
        "Temple",
        "Modern",
        "Gemstone",
        "Traditional",
        "Fancy"
      ],
      defaultPurity: "22 Karat",
      defaultDesign: "Traditional",
      priceMultiplier: 1
    },
    {
      type: "Silver",
      purity: ["Silver 999", "Silver 925"],
      designOptions: [
        "Antique",
        "Kundan",
        "Meenakari",
        "Jadau",
        "Temple",
        "Modern",
        "Gemstone",
        "Traditional",
        "Fancy"
      ],
      defaultPurity: "Silver 925",
      defaultDesign: "Traditional",
      priceMultiplier: 1
    }
  ]
};

export const defaultCategories: NewCategory[] = [
  {
    name: "Earrings",
    slug: "earrings",
    level: 1,
    isActive: true,
    sortOrder: 0,
    parentId: null,
    path: "",
    hasChildren: false,
    showInHeader: false,
    attributes: [
      {
        id: "1",
        name: "Weight",
        type: "weight",
        required: true,
        options: []
      },
      {
        id: "2",
        name: "Purity",
        type: "select",
        required: true,
        options: ["18 Karat", "20 Karat", "22 Karat", "24 Karat"]
      }
    ],
    materialOptions: [
      {
        type: "Gold",
        purity: ["18 Karat", "20 Karat", "22 Karat", "24 Karat"],
        designOptions: ["Antique", "Kundan", "Meenakari", "Jadau", "Temple", "Modern", "Gemstone", "Traditional", "Fancy"],
        defaultPurity: "22 Karat",
        defaultDesign: "Traditional"
      },
      {
        type: "Silver",
        purity: ["Silver 999", "Silver 925"],
        designOptions: ["Antique", "Kundan", "Meenakari", "Jadau", "Temple", "Modern", "Gemstone", "Traditional", "Fancy"],
        defaultPurity: "Silver 925",
        defaultDesign: "Traditional"
      }
    ]
  }
]; 