'use client';

import {
  Button,
  Container,
  Flex,
  Grid,
  ScrollArea,
  Select,
  Table,
  Text,
  TextField,
  Popover,
  IconButton,
  Separator,
  Card,
  Badge,
  Heading,
  Box,
  DataList,
} from '@radix-ui/themes';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import React, { useState } from 'react';
import { useForm, useFieldArray, Controller } from 'react-hook-form';
import {
  Plus,
  Trash2,
  X,
  Package,
  Tag,
  DollarSign,
  Hash,
  FileText,
  Settings,
  Save,
  Info,
  Eye,
  EyeOff,
  PlusIcon,
} from 'lucide-react';

const formSchema = z.object({
  name: z.string().min(1, 'Product name is required'),
  description: z.string().optional(),
  category: z.string().min(1, 'Category is required'),
  subcategory: z.string().optional(),
  variants: z
    .array(
      z.object({
        sku: z.string().min(1, 'SKU is required'),
        costPrice: z.number().min(0, 'Cost price must be positive'),
        sellingPrice: z.number().min(0, 'Selling price must be positive'),
        totalQuantity: z.number().min(0, 'Quantity must be positive'),
        attributes: z.record(z.string(), z.string()),
      })
    )
    .min(1, 'At least one variant is required'),
  specifications: z.record(z.string(), z.string()).optional(),
});

type FormTypes = z.infer<typeof formSchema>;

export default function AddInventoryItemPage() {
  const {
    register,
    handleSubmit,
    control,
    watch,
    setValue,
    getValues,
    formState: { errors },
  } = useForm<FormTypes>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      description: '',
      category: '',
      subcategory: '',
      variants: [],
      specifications: {},
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'variants',
  });

  const [attributePopoverIndex, setAttributePopoverIndex] = useState<
    number | null
  >(null);
  const [showSpecifications, setShowSpecifications] = useState(true);
  const [newAttributeKey, setNewAttributeKey] = useState('');
  const [newAttributeValue, setNewAttributeValue] = useState('');
  const [newSpecKey, setNewSpecKey] = useState('');
  const [newSpecValue, setNewSpecValue] = useState('');
  const [globalAttributes, setGlobalAttributes] = useState(['Color', 'Size']);

  const handleAddVariant = () => {
    const initialAttributes: Record<string, string> = {};
    globalAttributes.forEach((attr) => {
      initialAttributes[attr] = '';
    });

    append({
      sku: '',
      costPrice: 0,
      sellingPrice: 0,
      totalQuantity: 0,
      attributes: initialAttributes,
    });
  };

  const handleAddAttribute = (index: number, key: string, value: string) => {
    const current = getValues(`variants.${index}.attributes`) || {};
    if (key.trim() && value.trim()) {
      setValue(`variants.${index}.attributes`, {
        ...current,
        [key.trim()]: value.trim(),
      });
      setNewAttributeKey('');
      setNewAttributeValue('');
    }
  };

  const handleUpdateAttributeValue = (
    index: number,
    key: string,
    value: string
  ) => {
    const current = getValues(`variants.${index}.attributes`) || {};
    setValue(`variants.${index}.attributes`, { ...current, [key]: value });
  };

  const handleAddGlobalAttribute = (newAttribute: string) => {
    if (
      newAttribute.trim() &&
      !globalAttributes.includes(newAttribute.trim())
    ) {
      const updatedAttributes = [...globalAttributes, newAttribute.trim()];
      setGlobalAttributes(updatedAttributes);

      // Add this attribute to all existing variants with empty value
      fields.forEach((_, index) => {
        const currentAttributes =
          getValues(`variants.${index}.attributes`) || {};
        setValue(`variants.${index}.attributes`, {
          ...currentAttributes,
          [newAttribute.trim()]: '',
        });
      });
    }
  };

  const handleRemoveGlobalAttribute = (attributeToRemove: string) => {
    const updatedAttributes = globalAttributes.filter(
      (attr) => attr !== attributeToRemove
    );
    setGlobalAttributes(updatedAttributes);

    // Remove this attribute from all variants
    fields.forEach((_, index) => {
      const currentAttributes = {
        ...getValues(`variants.${index}.attributes`),
      };
      delete currentAttributes[attributeToRemove];
      setValue(`variants.${index}.attributes`, currentAttributes);
    });
  };

  const handleRemoveAttribute = (index: number, key: string) => {
    const current = { ...getValues(`variants.${index}.attributes`) };
    delete current[key];
    setValue(`variants.${index}.attributes`, current);
  };

  const handleAddSpecification = () => {
    if (newSpecKey.trim() && newSpecValue.trim()) {
      setValue('specifications', {
        ...getValues('specifications'),
        [newSpecKey.trim()]: newSpecValue.trim(),
      });
      setNewSpecKey('');
      setNewSpecValue('');
    }
  };

  const handleRemoveSpecification = (key: string) => {
    const updated = { ...getValues('specifications') };
    delete updated[key];
    setValue('specifications', updated);
  };

  const categories = [
    'Electronics',
    'Clothing',
    'Furniture',
    'Books',
    'Sports',
    'Home & Garden',
    'Other',
  ];
  const subcategories = [
    'Smartphones',
    'Laptops',
    'Shirts',
    'Pants',
    'Sofas',
    'Tables',
    'Fiction',
    'Equipment',
    'Other',
  ];

  const onSubmit = (data: FormTypes) => {
    console.log('Form submitted:', data);
    // Handle form submission
  };

  const specEntries = Object.entries(watch('specifications') || {});

  return (
    // <ScrollArea type="scroll" scrollbars="vertical" style={{ height: '100vh' }}>
    <Container size="4" p={{ initial: '3', sm: '4', md: '6' }}>
      {/* Header */}
      <Card mb="6">
        <Flex
          p="4"
          justify="between"
          align={{ initial: 'start', sm: 'center' }}
          direction={{ initial: 'column', sm: 'row' }}
          gap="4"
        >
          <Flex direction="column" gap="1">
            <Flex align="center" gap="2">
              <Package size={24} />
              <Heading size="6">Add Inventory Item</Heading>
            </Flex>
            <Text size="3" color="gray">
              Create a new product with variants and specifications
            </Text>
          </Flex>
        </Flex>

        <Box p="4" py={'6'}>
          <Flex align="center" gap="2" mb="4">
            <Info size={18} />
            <Heading size="4">Basic Information</Heading>
          </Flex>

          <Grid columns={{ initial: '1', sm: '2' }} gap="4">
            <Flex direction="column" gap="2">
              <Text size="2" weight="medium">
                Product Name *
              </Text>
              <TextField.Root
                {...register('name')}
                placeholder="e.g., iPhone 15 Pro, Cotton T-Shirt"
                color={errors.name ? 'red' : undefined}
              />
              {errors.name && (
                <Text size="1" color="red">
                  {errors.name.message}
                </Text>
              )}
            </Flex>

            <Flex direction="column" gap="2">
              <Text size="2" weight="medium">
                Category *
              </Text>
              <Controller
                name="category"
                control={control}
                render={({ field }) => (
                  <Select.Root
                    value={field.value}
                    onValueChange={field.onChange}
                  >
                    <Select.Trigger
                      color={errors.category ? 'red' : undefined}
                    />
                    <Select.Content>
                      {categories.map((cat) => (
                        <Select.Item key={cat} value={cat}>
                          {cat}
                        </Select.Item>
                      ))}
                    </Select.Content>
                  </Select.Root>
                )}
              />
              {errors.category && (
                <Text size="1" color="red">
                  {errors.category.message}
                </Text>
              )}
            </Flex>

            <Flex direction="column" gap="2">
              <Text size="2" weight="medium">
                Description
              </Text>
              <TextField.Root
                {...register('description')}
                placeholder="Brief product description (optional)"
              />
            </Flex>

            <Flex direction="column" gap="2">
              <Text size="2" weight="medium">
                Subcategory
              </Text>
              <Controller
                name="subcategory"
                control={control}
                render={({ field }) => (
                  <Select.Root
                    value={field.value || ''}
                    onValueChange={field.onChange}
                  >
                    <Select.Trigger />
                    <Select.Content>
                      {subcategories.map((subcat) => (
                        <Select.Item key={subcat} value={subcat}>
                          {subcat}
                        </Select.Item>
                      ))}
                    </Select.Content>
                  </Select.Root>
                )}
              />
            </Flex>
          </Grid>
        </Box>

        <Box p="4" py={'6'}>
          <Flex justify="between" align="center" mb="4">
            <Flex align="center" gap="2">
              <Tag size={18} />
              <Heading size="4">Product Variants</Heading>
              {fields.length > 0 && (
                <Badge color="blue" variant="soft">
                  {fields.length} variant{fields.length !== 1 ? 's' : ''}
                </Badge>
              )}
            </Flex>
            <Button size="2" onClick={handleAddVariant}>
              <Plus size={16} />
              Add Variant
            </Button>
          </Flex>

          {errors.variants && (
            <Text size="2" color="red" mb="4">
              {errors.variants.message}
            </Text>
          )}

          {fields.length === 0 ? (
            <Card variant="surface">
              <Flex
                direction="column"
                align="center"
                justify="center"
                p="6"
                gap="3"
              >
                <Package size={48} color="var(--gray-8)" />
                <Text size="3" color="gray" align="center">
                  No variants added yet. Click &quot;Add Variant&quot; to create
                  your first product variant.
                </Text>
              </Flex>
            </Card>
          ) : (
            <Box style={{ overflowX: 'auto' }}>
              <Table.Root variant="surface">
                <Table.Header>
                  <Table.Row>
                    <Table.ColumnHeaderCell>
                      <Flex align="center" gap="1">
                        <Hash size={14} />
                        SKU
                      </Flex>
                    </Table.ColumnHeaderCell>
                    <Table.ColumnHeaderCell>
                      <Flex align="center" gap="1">
                        <DollarSign size={14} />
                        Cost
                      </Flex>
                    </Table.ColumnHeaderCell>
                    <Table.ColumnHeaderCell>
                      <Flex align="center" gap="1">
                        <DollarSign size={14} />
                        Price
                      </Flex>
                    </Table.ColumnHeaderCell>
                    <Table.ColumnHeaderCell>
                      <Flex align="center" gap="1">
                        <Package size={14} />
                        Qty
                      </Flex>
                    </Table.ColumnHeaderCell>
                    {globalAttributes.map((attr) => (
                      <Table.ColumnHeaderCell key={attr}>
                        <Text size="1" weight="medium">
                          {attr}
                        </Text>
                      </Table.ColumnHeaderCell>
                    ))}
                    <Table.ColumnHeaderCell>Actions</Table.ColumnHeaderCell>
                    <Table.ColumnHeaderCell width="40px"></Table.ColumnHeaderCell>
                  </Table.Row>
                </Table.Header>
                <Table.Body>
                  {fields.map((field, index) => (
                    <Table.Row key={field.id}>
                      <Table.Cell>
                        <TextField.Root
                          {...register(`variants.${index}.sku`)}
                          placeholder="SKU123"
                          size="2"
                        />
                      </Table.Cell>
                      <Table.Cell>
                        <TextField.Root
                          type="number"
                          step="0.01"
                          {...register(`variants.${index}.costPrice`, {
                            valueAsNumber: true,
                          })}
                          placeholder="0.00"
                          size="2"
                        />
                      </Table.Cell>
                      <Table.Cell>
                        <TextField.Root
                          type="number"
                          step="0.01"
                          {...register(`variants.${index}.sellingPrice`, {
                            valueAsNumber: true,
                          })}
                          placeholder="0.00"
                          size="2"
                        />
                      </Table.Cell>
                      <Table.Cell>
                        <TextField.Root
                          type="number"
                          {...register(`variants.${index}.totalQuantity`, {
                            valueAsNumber: true,
                          })}
                          placeholder="0"
                          size="2"
                        />
                      </Table.Cell>
                      {globalAttributes.map((attr) => (
                        <Table.Cell key={attr}>
                          <TextField.Root
                            placeholder={`Enter ${attr.toLowerCase()}`}
                            value={
                              watch(`variants.${index}.attributes.${attr}`) ||
                              ''
                            }
                            onChange={(e) =>
                              handleUpdateAttributeValue(
                                index,
                                attr,
                                e.target.value
                              )
                            }
                            size="2"
                          />
                        </Table.Cell>
                      ))}
                      <Table.Cell>
                        <Popover.Root
                          open={attributePopoverIndex === index}
                          onOpenChange={(open) =>
                            setAttributePopoverIndex(open ? index : null)
                          }
                        >
                          <Popover.Trigger>
                            <Button variant="soft" size="2">
                              <Settings size={14} />
                              More
                            </Button>
                          </Popover.Trigger>
                          <Popover.Content
                            size="3"
                            style={{ width: 320, maxWidth: '90vw' }}
                          >
                            <Flex direction="column" gap="3">
                              <Text size="3" weight="bold">
                                Additional Attributes - Variant #{index + 1}
                              </Text>

                              <Flex direction="column" gap="2">
                                {Object.entries(
                                  watch(`variants.${index}.attributes`) || {}
                                )
                                  .filter(
                                    ([key]) => !globalAttributes.includes(key)
                                  )
                                  .map(([key, val]) => (
                                    <Card key={key} variant="surface">
                                      <Flex
                                        p="2"
                                        justify="between"
                                        align="center"
                                      >
                                        <Text size="2">
                                          <Text weight="medium">{key}:</Text>{' '}
                                          {val}
                                        </Text>
                                        <IconButton
                                          color="red"
                                          variant="ghost"
                                          size="2"
                                          onClick={() =>
                                            handleRemoveAttribute(index, key)
                                          }
                                        >
                                          <X size={12} />
                                        </IconButton>
                                      </Flex>
                                    </Card>
                                  ))}
                              </Flex>

                              <Separator />

                              <Flex direction="column" gap="2">
                                <Text size="2" weight="medium">
                                  Add Custom Attribute
                                </Text>
                                <Flex gap="2">
                                  <TextField.Root
                                    placeholder="Key (e.g., Weight)"
                                    value={newAttributeKey}
                                    onChange={(e) =>
                                      setNewAttributeKey(e.target.value)
                                    }
                                    size="2"
                                  />
                                  <TextField.Root
                                    placeholder="Value (e.g., 500g)"
                                    value={newAttributeValue}
                                    onChange={(e) =>
                                      setNewAttributeValue(e.target.value)
                                    }
                                    size="2"
                                  />
                                </Flex>
                                <Button
                                  size="2"
                                  onClick={() =>
                                    handleAddAttribute(
                                      index,
                                      newAttributeKey,
                                      newAttributeValue
                                    )
                                  }
                                  disabled={
                                    !newAttributeKey.trim() ||
                                    !newAttributeValue.trim() ||
                                    globalAttributes.includes(
                                      newAttributeKey.trim()
                                    )
                                  }
                                >
                                  <Plus size={12} />
                                  Add
                                </Button>
                                {globalAttributes.includes(
                                  newAttributeKey.trim()
                                ) &&
                                  newAttributeKey.trim() && (
                                    <Text size="1" color="amber">
                                      This attribute already exists as a global
                                      attribute
                                    </Text>
                                  )}
                              </Flex>
                            </Flex>
                          </Popover.Content>
                        </Popover.Root>
                      </Table.Cell>
                      <Table.Cell>
                        <IconButton
                          color="red"
                          variant="ghost"
                          size="4"
                          onClick={() => remove(index)}
                        >
                          <Trash2 size={14} />
                        </IconButton>
                      </Table.Cell>
                    </Table.Row>
                  ))}
                </Table.Body>
              </Table.Root>
            </Box>
          )}
        </Box>

        <Box p="3">
          <Flex justify="between" align="center" mb="3">
            <Flex align="center" gap="2">
              <FileText size={18} />
              <Heading size="4">Specifications</Heading>
              {specEntries.length > 0 && (
                <Badge color="blue" variant="soft" radius="full">
                  {specEntries.length}
                </Badge>
              )}
            </Flex>
            <IconButton
              variant="ghost"
              size="2"
              onClick={() => setShowSpecifications(!showSpecifications)}
            >
              {showSpecifications ? <EyeOff size={16} /> : <Eye size={16} />}
            </IconButton>
          </Flex>

          {showSpecifications && (
            <Box>
              {specEntries.length === 0 ? (
                <Box py="4" style={{ textAlign: 'center' }}>
                  <Text size="2" color="gray">
                    No specifications added yet
                  </Text>
                  <Text size="1" color="gray" mt="1">
                    Add technical details, dimensions, or other product specs
                  </Text>
                </Box>
              ) : (
                <Grid
                  columns={{ initial: '1', md: '2', lg: '3' }}
                  mb="3"
                  gap="3"
                >
                  {specEntries.map(([key, value], index) => (
                    <Flex
                      key={`${key}-${index}`}
                      justify="between"
                      align="center"
                      py="2"
                      px="3"
                      style={{
                        borderRadius: 'var(--radius-2)',
                        backgroundColor: 'var(--color-surface)',
                      }}
                    >
                      <Flex direction="column" gap="1" style={{ flex: 1 }}>
                        <Text size="2" weight="medium" color="gray">
                          {key}
                        </Text>
                        <Text size="3" weight="regular">
                          {value}
                        </Text>
                      </Flex>
                      <IconButton
                        variant="ghost"
                        color="red"
                        size="2"
                        onClick={() => handleRemoveSpecification(key)}
                        style={{
                          opacity: 0.6,
                          marginLeft: 'var(--space-2)',
                        }}
                      >
                        <X size={14} />
                      </IconButton>
                    </Flex>
                  ))}
                </Grid>
              )}

              <Separator mb="3" />

              <Box>
                <Text size="2" weight="medium" mb="2" as="div">
                  Add Specification
                </Text>
                <Flex gap="2" mb="2">
                  <TextField.Root
                    placeholder="Name (e.g., Weight)"
                    value={newSpecKey}
                    onChange={(e) => setNewSpecKey(e.target.value)}
                    onKeyPress={(e) =>
                      e.key === 'Enter' &&
                      newSpecKey.trim() &&
                      newSpecValue.trim() &&
                      handleAddSpecification()
                    }
                    size="2"
                    style={{ flex: '1 1 40%' }}
                  />
                  <TextField.Root
                    placeholder="Value (e.g., 150g)"
                    value={newSpecValue}
                    onChange={(e) => setNewSpecValue(e.target.value)}
                    onKeyPress={(e) =>
                      e.key === 'Enter' &&
                      newSpecKey.trim() &&
                      newSpecValue.trim() &&
                      handleAddSpecification()
                    }
                    size="2"
                    style={{ flex: '1 1 40%' }}
                  />
                  <Button
                    onClick={handleAddSpecification}
                    disabled={!newSpecKey.trim() || !newSpecValue.trim()}
                    size="2"
                  >
                    <Plus size={14} />
                    Add
                  </Button>
                </Flex>
                <Text size="1" color="gray">
                  Press Enter to add • Use specific units for measurements
                </Text>
              </Box>
            </Box>
          )}
        </Box>

        <Flex gap="6" p="3" justify={"end"}>
          <Button  size={'4'}  variant={'soft'}>
            <X />
            Cancel
          </Button>
          <Button
            size={'4'}
            onClick={handleSubmit(onSubmit)}
          >
            <PlusIcon />
            Add item to the inventory
          </Button>
        </Flex>
      </Card>
    </Container>
    // </ScrollArea>
  );
}
