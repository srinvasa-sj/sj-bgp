import { useState, useEffect, useMemo, useCallback, memo } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useVirtualizer } from '@tanstack/react-virtual';
import debounce from 'lodash/debounce';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Category, NewCategory, CategoryAttribute, MaterialOption } from '@/types/category';
import { CategoryFormProps, CategoryFormData } from '@/types/categoryForm';
import { Loader2, Plus, Trash2, GripVertical } from 'lucide-react';
import { Badge } from "@/components/ui/badge";
import { defaultCategory } from "@/constants/categoryDefaults";
import { toast } from "@/components/ui/use-toast";
import { slugify } from "@/lib/utils";

const attributeTypes = [
  { value: "text", label: "Text" },
  { value: "number", label: "Number" },
  { value: "select", label: "Single Select" },
  { value: "multiselect", label: "Multi Select" },
  { value: "boolean", label: "Boolean" },
  { value: "date", label: "Date" },
  { value: "weight", label: "Weight" },
  { value: "dimensions", label: "Dimensions" }
];

const defaultAttribute: CategoryAttribute = {
  id: `attr-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
  name: "",
  type: "text",
  required: false,
  options: [],
  unit: "",
  validation: {
    min: 0,
    max: undefined,
    pattern: undefined
  }
};

const defaultMaterialOption: MaterialOption = {
  type: "",
  purity: [],
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
  defaultPurity: "",
  defaultDesign: "Traditional"
};

const materialPurities = {
  gold: ["18 Karat", "20 Karat", "22 Karat", "24 Karat"],
  silver: ["Silver 999", "Silver 925"]
};

const CategoryForm = memo(({ 
  category, 
  categories, 
  onSave, 
  onCancel, 
  isSubmitting,
  showInHeader,
  suggestedCategories,
  onSuggestedCategoryClick 
}: CategoryFormProps) => {
  const [formData, setFormData] = useState<CategoryFormData>(() => ({
    ...category,
    showInHeader: showInHeader,
    materialOptions: category.materialOptions.length > 0 
      ? [category.materialOptions[0]] 
      : [defaultMaterialOption]
  }));
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [newAttributeOption, setNewAttributeOption] = useState("");
  const [newPurity, setNewPurity] = useState("");
  const [newFinish, setNewFinish] = useState("");

  const debouncedValidation = useCallback(
    debounce((value: string) => {
      // Validation logic here if needed
    }, 300),
    []
  );

  useEffect(() => {
    setFormData(category);
  }, [category]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    }

    if (formData.parentId) {
      const parent = categories.find(c => c.id === formData.parentId);
      if (!parent) {
        newErrors.parentId = 'Invalid parent category';
      }
    }

    // Validate attributes
    formData.attributes.forEach((attr, index) => {
      if (!attr.name.trim()) {
        newErrors[`attribute-${index}-name`] = 'Attribute name is required';
      }
      if (["select", "multiselect"].includes(attr.type) && attr.options.length === 0) {
        newErrors[`attribute-${index}-options`] = 'At least one option is required';
      }
    });

    // Validate material options
    formData.materialOptions.forEach((material, index) => {
      if (!material.type.trim()) {
        newErrors[`material-${index}-type`] = 'Material type is required';
      }
      if (material.purity.length === 0) {
        newErrors[`material-${index}-purity`] = 'At least one purity option is required';
      }
      if (material.designOptions.length === 0) {
        newErrors[`material-${index}-design`] = 'At least one design option is required';
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    try {
      await onSave(formData);
    } catch (error) {
      console.error('Error saving category:', error);
    }
  };

  const handleChange = useCallback((field: keyof CategoryFormData, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
      ...(field === 'name' ? { slug: slugify(value) } : {})
    }));

    // Clear error when field is changed
    if (errors[field]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  }, []);

  const handleNameChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setFormData(prev => ({
      ...prev,
      name: value,
      slug: slugify(value)
    }));
    debouncedValidation(value);
  }, [debouncedValidation]);

  const handleAttributeChange = (index: number, field: keyof CategoryAttribute, value: any) => {
    setFormData(prev => ({
      ...prev,
      attributes: prev.attributes.map((attr, i) => {
        if (i !== index) return attr;
        
        if (field === 'type') {
          // Reset options when type changes
          const updatedAttr = {
            ...attr,
            [field]: value,
            options: [],
            validation: {
              min: 0,
              max: undefined,
              pattern: undefined
            }
          };
          
          // Add unit for weight/dimensions
          if (['weight', 'dimensions'].includes(value)) {
            updatedAttr.unit = value === 'weight' ? 'g' : 'cm';
          } else {
            delete updatedAttr.unit;
          }
          
          return updatedAttr;
        }
        
        // Handle validation object updates
        if (field === 'validation') {
          return {
            ...attr,
            validation: {
              ...attr.validation,
              ...value
            }
          };
        }
        
        return { ...attr, [field]: value };
      })
    }));
  };

  const addAttribute = () => {
    const newAttribute: CategoryAttribute = {
      id: `attr-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      name: "",
      type: "text",
      required: false,
      options: [],
      unit: "",
      validation: {
        min: 0,
        max: undefined,
        pattern: undefined
      }
    };

    setFormData(prev => ({
      ...prev,
      attributes: [...prev.attributes, newAttribute]
    }));
  };

  const removeAttribute = (index: number) => {
    setFormData(prev => ({
      ...prev,
      attributes: prev.attributes.filter((_, i) => i !== index)
    }));
  };

  const addAttributeOption = (attributeIndex: number) => {
    if (!newAttributeOption.trim()) return;
    
    setFormData(prev => ({
      ...prev,
      attributes: prev.attributes.map((attr, i) => 
        i === attributeIndex 
          ? { ...attr, options: [...attr.options, newAttributeOption.trim()] }
          : attr
      )
    }));
    setNewAttributeOption("");
  };

  const removeAttributeOption = (attributeIndex: number, optionIndex: number) => {
    setFormData(prev => ({
      ...prev,
      attributes: prev.attributes.map((attr, i) => 
        i === attributeIndex 
          ? { ...attr, options: attr.options.filter((_, oi) => oi !== optionIndex) }
          : attr
      )
    }));
  };

  const handleMaterialChange = (index: number, field: keyof MaterialOption, value: any) => {
    setFormData(prev => ({
      ...prev,
      materialOptions: prev.materialOptions.map((mat, i) => 
        i === index ? { ...mat, [field]: value } : mat
      )
    }));
  };

  const addMaterialOption = () => {
    // Check if we already have both Gold and Silver
    if (formData.materialOptions.length >= 1) {
      toast({
        title: "Only one material type can be added at a time. Please remove the existing material type first if you want to change it.",
        variant: "destructive"
      });
      return;
    }
    
    setFormData(prev => ({
      ...prev,
      materialOptions: [
        ...prev.materialOptions,
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
        }
      ]
    }));
  };

  const removeMaterialOption = (index: number) => {
    setFormData(prev => ({
      ...prev,
      materialOptions: prev.materialOptions.filter((_, i) => i !== index)
    }));
  };

  const addPurity = (materialIndex: number) => {
    if (!newPurity.trim()) return;
    
    setFormData(prev => ({
      ...prev,
      materialOptions: prev.materialOptions.map((mat, i) => 
        i === materialIndex 
          ? { ...mat, purity: [...mat.purity, newPurity.trim()] }
          : mat
      )
    }));
    setNewPurity("");
  };

  const addFinish = (materialIndex: number) => {
    if (!newFinish.trim()) return;
    
    setFormData(prev => ({
      ...prev,
      materialOptions: prev.materialOptions.map((mat, i) => 
        i === materialIndex 
          ? { ...mat, designOptions: [...mat.designOptions, newFinish.trim()] }
          : mat
      )
    }));
    setNewFinish("");
  };

  const availableParentCategories = categories.filter(c => 
    !c.parentId &&
    c.id !== category.id &&
    (!c.parentId || c.parentId !== category.id)
  );

  const handleMaterialTypeChange = (index: number, type: string) => {
    setFormData(prev => ({
      ...prev,
      materialOptions: prev.materialOptions.map((mat, i) => 
        i === index 
          ? {
              ...mat,
              type,
              purity: type.toLowerCase() === 'gold' 
                ? materialPurities.gold
                : type.toLowerCase() === 'silver'
                  ? materialPurities.silver
                  : [],
              defaultPurity: type.toLowerCase() === 'gold' 
                ? "22 Karat"
                : type.toLowerCase() === 'silver'
                  ? "Silver 925"
                  : "",
              designOptions: defaultMaterialOption.designOptions
            }
          : mat
      )
    }));
  };

  return (
    <div className="space-y-8">
      {category.id === 'new' && suggestedCategories && (
        <div className="mb-6 border rounded-lg p-4 space-y-4">
          <h3 className="text-lg font-medium">Suggested Categories</h3>
          <p className="text-sm text-gray-500">
            Quick start with pre-configured categories for jewelry
          </p>
          <div className="grid grid-cols-3 gap-4">
            {suggestedCategories.map((suggestedCategory) => (
              <Button
                key={suggestedCategory.name}
                type="button"
                variant="outline"
                className="p-4 h-auto flex flex-col items-start space-y-2 text-left"
                onClick={() => onSuggestedCategoryClick?.(suggestedCategory)}
              >
                <span className="font-medium">{suggestedCategory.name}</span>
                <span className="text-sm text-gray-500">
                  {suggestedCategory.attributes.length} pre-configured attributes
                </span>
              </Button>
            ))}
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700">
              Name *
            </label>
            <Input
              id="name"
              value={formData.name}
              onChange={handleNameChange}
              className={errors.name ? 'border-red-500' : ''}
              placeholder="Enter category name"
              required
            />
            {errors.name && <p className="mt-1 text-sm text-red-500">{errors.name}</p>}
          </div>

          <div>
            <label htmlFor="parentId" className="block text-sm font-medium text-gray-700">
              Parent Category
            </label>
            <Select
              value={formData.parentId || 'none'}
              onValueChange={(value) => handleChange('parentId', value === 'none' ? null : value)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">None (Top Level)</SelectItem>
                {categories.map((cat) => (
                  <SelectItem key={cat.id} value={cat.id}>
                    {cat.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.parentId && <p className="mt-1 text-sm text-red-500">{errors.parentId}</p>}
          </div>
        </div>

        <div className="border rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <label className="text-base font-medium text-gray-900">
                Category Status
              </label>
              <p className="text-sm text-gray-500">
                Active categories will be visible to customers and available for product assignment
              </p>
            </div>
            <Switch
              checked={formData.isActive}
              onCheckedChange={(checked) => handleChange('isActive', checked)}
              className="ml-4"
            />
          </div>
        </div>

        <div className="space-y-4">
          {/* Product Attributes */}
          <div className="border rounded-lg p-4 space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-medium">Product Attributes</h3>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={addAttribute}
                className="gap-2"
              >
                <Plus className="h-4 w-4" />
                Add Attribute
              </Button>
            </div>

            <div className="space-y-4">
              {formData.attributes.map((attribute, index) => (
                <div key={attribute.id} className="border rounded-lg p-4 space-y-4">
                  <div className="flex items-center gap-2">
                    <GripVertical className="h-5 w-5 text-gray-400" />
                    <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700">
                          Name *
                        </label>
                        <Input
                          value={attribute.name}
                          onChange={(e) => handleAttributeChange(index, 'name', e.target.value)}
                          placeholder="e.g., Weight, Size"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">
                          Type
                        </label>
                        <Select
                          value={attribute.type}
                          onValueChange={(value) => handleAttributeChange(index, 'type', value)}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {attributeTypes.map((type) => (
                              <SelectItem key={type.value} value={type.value}>
                                {type.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="flex items-center space-x-4">
                        <div className="flex items-center space-x-2">
                          <Switch
                            checked={attribute.required}
                            onCheckedChange={(checked) => 
                              handleAttributeChange(index, 'required', checked)
                            }
                          />
                          <label className="text-sm font-medium text-gray-700">
                            Required
                          </label>
                        </div>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => removeAttribute(index)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>

                  {/* Options for select/multiselect types */}
                  {["select", "multiselect"].includes(attribute.type) && (
                    <div className="mt-4 space-y-4">
                      <div className="flex gap-2">
                        <Input
                          value={newAttributeOption}
                          onChange={(e) => setNewAttributeOption(e.target.value)}
                          placeholder="Add new option"
                        />
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => addAttributeOption(index)}
                        >
                          Add
                        </Button>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {attribute.options.map((option, optionIndex) => (
                          <Badge
                            key={optionIndex}
                            variant="secondary"
                            className="flex items-center gap-1"
                          >
                            {option}
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              className="h-4 w-4 p-0 hover:bg-transparent"
                              onClick={() => removeAttributeOption(index, optionIndex)}
                            >
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Unit for weight/dimensions types */}
                  {["weight", "dimensions"].includes(attribute.type) && (
                    <div className="mt-4">
                      <label className="block text-sm font-medium text-gray-700">
                        Unit
                      </label>
                      <Input
                        value={attribute.unit || ''}
                        onChange={(e) => handleAttributeChange(index, 'unit', e.target.value)}
                        placeholder="e.g., g, cm"
                      />
                    </div>
                  )}

                  {/* Validation for number type */}
                  {attribute.type === "number" && (
                    <div className="mt-4 grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700">
                          Minimum
                        </label>
                        <Input
                          type="number"
                          value={attribute.validation?.min || ''}
                          onChange={(e) => handleAttributeChange(index, 'validation', {
                            ...attribute.validation,
                            min: e.target.value ? Number(e.target.value) : undefined
                          })}
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">
                          Maximum
                        </label>
                        <Input
                          type="number"
                          value={attribute.validation?.max || ''}
                          onChange={(e) => handleAttributeChange(index, 'validation', {
                            ...attribute.validation,
                            max: e.target.value ? Number(e.target.value) : undefined
                          })}
                        />
                      </div>
                    </div>
                  )}

                  {attribute.type === "weight" && (
                    <div className="mt-4">
                      <label className="block text-sm font-medium text-gray-700">
                        Minimum Weight (in grams)
                      </label>
                      <Input
                        type="number"
                        step="0.001"
                        min="0"
                        value={attribute.validation?.min || 0}
                        onChange={(e) => handleAttributeChange(index, 'validation', {
                          ...attribute.validation,
                          min: Math.max(0, Number(e.target.value))
                        })}
                      />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Material Options */}
          <div className="border rounded-lg p-4 space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-medium">Material Options</h3>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={addMaterialOption}
                className="gap-2"
              >
                <Plus className="h-4 w-4" />
                Add Material
              </Button>
            </div>

            <div className="space-y-4">
              {formData.materialOptions.map((material, index) => (
                <div key={index} className="border rounded-lg p-4 space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Material Type *
                    </label>
                    <Select
                      value={material.type}
                      onValueChange={(value) => handleMaterialTypeChange(index, value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select material type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Gold">Gold</SelectItem>
                        <SelectItem value="Silver">Silver</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Purity Options Display */}
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">
                      Purity Options
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {material.purity.map((purity, purityIndex) => (
                        <Badge
                          key={purityIndex}
                          variant="secondary"
                          className="flex items-center gap-1"
                        >
                          {purity}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  {/* Design Options */}
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">
                      Design Options
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {material.designOptions.map((design, designIndex) => (
                        <Badge
                          key={designIndex}
                          variant="secondary"
                          className="flex items-center gap-1"
                        >
                          {design}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  <div className="flex justify-end">
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => removeMaterialOption(index)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Remove Material
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium">Show in Header</label>
              <Switch
                checked={formData.showInHeader}
                onCheckedChange={(checked) => handleChange('showInHeader', checked)}
              />
            </div>
          </div>
        </div>

        <div className="flex justify-end space-x-4">
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              'Save'
            )}
          </Button>
        </div>
      </form>
    </div>
  );
});

CategoryForm.displayName = 'CategoryForm';

export default CategoryForm; 