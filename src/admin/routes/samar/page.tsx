import { RouteConfig } from "@medusajs/admin"
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useAdminCreateInventoryItem, useAdminCreateLocationLevel, useAdminCreateProduct , useAdminCreateProductCategory, useAdminInventoryItems, useAdminProductCategories, useAdminRegions, useAdminStockLocations, useAdminUpdateLocationLevel, useAdminUpdateVariant, useAdminVariantsInventory, useMedusa} from "medusa-react";
import { AdminPostProductCategoriesReq, AdminPostProductsReq, ProductCategory } from "@medusajs/medusa";
import './style.css'
import { Button, Container, Heading, Input, Select, Toaster, useToast } from "@medusajs/ui";
import CircularProgress from '@mui/material/CircularProgress';
import { GET_ALL_CATEGORIES, GET_ALL_PRODUCTS, GET_PRODUCTS_BY_CATEGORIES, GET_PRODUCT_DETAILS, GET_PRODUCT_DETAILS_BY_PRODUCT_NUMBER } from "./constants";
import InventoriesModal from "./inventoriesModal";
import { chunkArray, copyObjectExceptKey } from "../utils";

type Product = {
    product_number:string;
    short_description:string;
    category: string,
    full_feature_description:string;
    front_image:string;
    price_range:any;
  };
  
  interface ProductS {
    product_number: string;
    category: string;
  }

  const CreateSamarProduct = () => {
    const { toast } = useToast()
    const createProduct = useAdminCreateProduct();
    const createCategory = useAdminCreateProductCategory();
    const inventoryList = useAdminStockLocations();
    const [products, setProducts] = useState<Product[]>([]);
    const [allCategories, setAllCategories] = useState<Product[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [count, setCount] = useState(0);
    const [nextPage, setNextPage] = useState(null);
    const [prevPage, setPrevPage] = useState(null);
    const imageUrlPrefix ="https://www.alphabroder.com/media/hires";
    const { product_categories, isLoading } = useAdminProductCategories();
    const [inputSearchValue, setInputSearchValue] = useState('');
    const [openModal, setOpenModal] = useState(false);
    const [clickedProductData, setClickedProductData] = useState<Product>();
    let selectedInventory: any;
    const [inventoryItemId, setInventoryItemId] = useState("");
    const { 
      inventory_items,
    } = useAdminInventoryItems();
    const { regions } = useAdminRegions();
    const { client } = useMedusa()
    
  
    const truncateDescription = (text: string, maxLength: number) => {
      if (text.length > maxLength) {
        return text.substring(0, maxLength) + "...";
      }
      return text;
    };
  
    const fetchData = async () => {
      try {
        const response = await axios.get(
          `${GET_ALL_PRODUCTS}?page=1&page_size=32`,
          {
            headers: {
              accept: "application/json",
            },
          }
        );
        setProducts(response.data.results);
        setLoading(false);
        setCount(response.data.count);
        setNextPage(response.data.next);
        setPrevPage(response.data.previous);
      } catch (error) {
        toast({ 
          title: "Error",
          description: "An error occurred while fetching products",
          variant: "error"
        })
        setLoading(false);
      }
    };
  
    const fetchCategories = async () => {
      try {
        const response = await axios.get(
          GET_ALL_CATEGORIES,
          {
            headers: {
              accept: "application/json",
            },
          }
        );
        setAllCategories(response.data.results);
        setLoading(false);
      } catch (error) {
        toast({ 
          title: "Error",
          description: "An error occurred while fetching categories details",
          variant: "error"
        })
        setLoading(false);
      }
    };
  
    useEffect(() => {
      fetchData();
      fetchCategories();
    }, []);
  
    const fromatCreateProductData = (variants: any[], product): any => {  
      let newVariantObjs: any[] = [];
      let colorsAdded = [];
      let sizeAdded = [];
      let images: string[] = [];
      variants.forEach(variant => {
        if(!colorsAdded.includes(variant.color_name) && !sizeAdded.includes(variant.size)) {
          images.push(`${imageUrlPrefix}/${variant?.front_image}`);
          images.push(`${imageUrlPrefix}/${variant?.back_image}`);
          images.push(`${imageUrlPrefix}/${variant?.side_image}`);
        }
        // if(variant?.color_name && variant?.size) {
          colorsAdded.push(variant.color_name);
          sizeAdded.push(variant.size);
          newVariantObjs.push({
            manage_inventory: true,
            ...(product.short_description && { title: product.short_description }),
            ...(variant.item_number && { sku: `ALPB-${variant.item_number}` }),
            ...(variant.gtin && { barcode: variant.gtin }),
            ...(variant.quantity  && { "inventory_quantity": variant.quantity }),
            ...(variant.weight  && { weight: parseInt(variant.weight), }),
            "origin_country": "US",
            prices: regions.map((region) => {
              return {
                currency_code: region.currency_code,
                amount: parseInt(variant.retail_price)
              }
            }),
            options: [
              {
                ...(variant.size && { value: variant.size }),
                
              },
            {
              ...(variant.color_name && { value: variant.color_name }),
              
            }
          ],
          })
        // }
      });
      return { variants: newVariantObjs, images: images};
    }
  
    
    const findCollectionId = (selectedProduct: ProductS, product_categoriesT: ProductCategory[], product) => {
      if(product_categoriesT.length > 0) {
        const availableCategory = product_categoriesT.filter(category => {
          return category.name === selectedProduct.category;
        });
        if(availableCategory.length > 0) {
          handleCreateProduct(selectedProduct, availableCategory[0].id, product)
        } else {
          handleCreateCategory(product.category, true, selectedProduct, product)
        }
      } else {
        handleCreateCategory(product.category, true, selectedProduct, product)
      }
    }
  
    const handleCreateProduct = (productDetails, categoryId, clickedProductDetails) => {
      const variantsAndImagesData = fromatCreateProductData(productDetails.variations, productDetails);
      const createProductReq: AdminPostProductsReq = {
        title: productDetails.short_description,
      description: productDetails.
      full_feature_description,
      is_giftcard: false,
      discountable: false,
      images: [`${imageUrlPrefix}/${clickedProductDetails.front_image}`,
    ...variantsAndImagesData.images],
      options: [
        {
        title: "Size"
      },
      {
        title: "Color"
      }
    ],
      variants: variantsAndImagesData.variants,
      categories: [{
        id: categoryId
      }],
        }
      createProduct.mutate(createProductReq, {
        onSuccess: ({ product }) => {
              product.variants.forEach(variant => {
                client.admin.variants.getInventory
                (variant.id).then(response => {
                  client.admin.inventoryItems.createLocationLevel(
                    response.variant.inventory[0].id, 
                    {
                      location_id: inventoryList.stock_locations[0].id,
                      stocked_quantity: variant.inventory_quantity,
                    }
                  )
                  .then(({ inventory_item }) => {
                    console.log(inventory_item.id)
                  })
                });
            });
          toast({ 
            title: "Export Product",
            description: "Product Successfully Exported.",
            variant: "success"
          });
        },
        onError: ({ message }) => {
          if(message.split(" ").includes("413")) {
            client.admin.products.create(copyObjectExceptKey(createProductReq, 'variants'))
            .then(({ product }) => {
            const chunkedArray = chunkArray(createProductReq.variants, 100);
            chunkedArray.forEach((chunk: any[]) => {
              chunk.forEach(data => {
                client.admin.products.createVariant(product.id, data)
              .then(({ product }) => {
                product.variants.forEach(variant => {
                  client.admin.variants.getInventory
                  (variant.id).then(response => {
                    client.admin.inventoryItems.createLocationLevel(
                      response.variant.inventory[0].id, 
                      {
                        location_id: inventoryList.stock_locations[0].id,
                        stocked_quantity: variant.inventory_quantity,
                      }
                    )
                    .then(({ inventory_item }) => {
                      console.log(inventory_item.id)
                    })
                  });
              })
              })
              });
            })
          })
          }
          if(message.split(" ").includes("422")) {
            message = `Product with name ${createProductReq.title} already exists.`
          }
          toast({ 
            title: "Unable to export product",
            description: message,
            variant: "error"
          })
        },
      });
    };
  
    const handleCreateCategory = (categoryName, createProduct?, selectedProduct?, product?) => {
      const createCategoryReq: AdminPostProductCategoriesReq = {
        name: categoryName
      }
        createCategory.mutate(createCategoryReq, {
        onSuccess: ({ product_category }) => {
          if(createProduct) {
            handleCreateProduct(selectedProduct, product_category.id, product)
            toast({ 
              title: "Create Category",
              description: "Category Successfully Created.",
              variant: "success"
            })
          }
        },
        onError: ({ message }) => {
          toast({ 
            title: "Error",
            description: message,
            variant: "error"
          })
        },
      });
    };
  
    const handleExportClick = async (product) => {
      exportProduct(product);
    }
  
    const exportProduct = async (product) => {
      try {
        const selectedProductDetailsResponse = await axios.get(
          `${GET_PRODUCT_DETAILS_BY_PRODUCT_NUMBER}${product.product_number}/`,
          {
            headers: {
              accept: "application/json",
            },
          }
        );
        const product_categoriesT: ProductCategory[] = product_categories;
        const selectedProduct: ProductS = selectedProductDetailsResponse.data;
        
        findCollectionId(selectedProduct, product_categoriesT, product);
        
      } catch (error) {
        toast({ 
          title: "Error",
          description: error,
          variant: "error"
        })
      }
    };
    
    const handlePageChange = async (url: string) => {
      try {
        const response = await axios.get(url);
        setProducts(response.data.results);
        setCount(response.data.count);
        setNextPage(response.data.next);
        setPrevPage(response.data.previous);
      } catch (error) {
        toast({ 
          title: "Error",
          description: "Unable to proceed to next page, please check after sometime.",
          variant: "error"
        })
      }
    };
  
    const fetchProductsByCategories = async (category) => {
      setLoading(true);
      const categoryName = encodeURIComponent(category);
      try {
        const response = await axios.get(
          `${GET_PRODUCTS_BY_CATEGORIES}${categoryName}`,
          {
            headers: {
              accept: "application/json",
            },
          }
        );
        setProducts(response.data.results);
        setLoading(false);
        setCount(response.data.count);
          setNextPage(response.data.next);
          setPrevPage(response.data.previous);
      } catch (error) {
        toast({ 
          title: "Error",
          description: "An error occurred while fetching product details, please check after sometime.",
          variant: "error"
        })
        setLoading(false);
      }
    };
  
    const onCategorySelect = (selectedOption) => {
      if(selectedOption === 'All') {
        fetchData();
      } else {
        fetchProductsByCategories(selectedOption)
      }
    };
  
    const debounce = (func, delay) => {
      let timeoutId;
      return function(...args) {
        const context = this;
        clearTimeout(timeoutId);
        timeoutId = setTimeout(() => func.apply(context, args), delay);
      };
    };
  
    const fetchSearchedProduct = async (productNumber) => {
      setLoading(true);
      const product_id = productNumber.replace("ALPB", "");
      try {
        const response = await axios.get(
          `${GET_PRODUCT_DETAILS}${product_id}`,
          {
            headers: {
              accept: "application/json",
            },
          }
        );
        setProducts(response.data.results);
        setLoading(false);
      } catch (error) {
        toast({ 
          title: "Error",
          description: "An error occurred while fetching product details, please check after sometime.",
          variant: "error"
        })
        setLoading(false);
      }
    }
  
    const handleSearch = debounce((value) => {
      fetchSearchedProduct(value);
    }, 500); 
  
    const onSearchInputChange = (event) => {
      const { value } = event.target;
      setInputSearchValue(value);
      handleSearch(value);
    }
  
    return (
      <>
        <div className="container">
          <div className="content">
            <Toaster />
            <div>
              <div className="headerTab">
                <div className="header-text">
                  <Heading>Alphabroder</Heading>
                </div>
                {allCategories && (
                  <div className="category-filter-container">
                    <Select onValueChange={onCategorySelect}>
                      <Select.Trigger>
                        <Select.Value placeholder="Categories..." />
                      </Select.Trigger>
                      <Select.Content>
                        <Select.Item key={"All"} value={"All"}>
                          {"All"}
                        </Select.Item>
                        {allCategories.map((item) => (
                          <Select.Item key={item.category} value={item.category}>
                            {item.category}
                          </Select.Item>
                        ))}
                      </Select.Content>
                    </Select>
                  </div>
                )}
              </div>
              <div className="search-container">
                <Input
                  placeholder="Search Using Product No. or Description"
                  id="search-input-id"
                  type="search"
                  value={inputSearchValue}
                  onChange={onSearchInputChange}
                  onKeyDown={onSearchInputChange}
                />
              </div>
              <div className="product-content">
                {loading && (
                  <div className="loader-container">
                    <div className="loader-content">
                      <CircularProgress color="inherit" />
                    </div>
                  </div>
                )}
                {!loading && products && products.length === 0 && (
                  <div>
                    <Container>No Product(s) Available!</Container>
                  </div>
                    )}
                {products && products.length > 0 && (
                  <div className="product-grid">
                    {products.map((product, index) => (
                      <div key={index} className="product-card">
                        <img
                          src={`${imageUrlPrefix}/${product.front_image}`}
                          alt={product.short_description}
                        />
                        <h3>{product.short_description}</h3>
                        <p>
                          <b>Price Range:</b> ${product.price_range.min_price} - $
                          {product.price_range.max_price}
                        </p>
                        <p>
                          <b>Product Number:</b> ALPB{product.product_number}
                        </p>
                        <p>
                          <b>Category:</b> {product.category}
                        </p>
                        <p>
                          {truncateDescription(
                            product.full_feature_description,
                            80
                          )}
                        </p>
                        <Button onClick={() => handleExportClick(product)}>
                          Export
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
                {products && products.length > 1 && (
                  <div className="pagination">
                    {prevPage && (
                      <Button onClick={() => handlePageChange(prevPage)}>
                        Previous
                      </Button>
                    )}
                    {nextPage && (
                      <Button onClick={() => handlePageChange(nextPage)}>
                        Next
                      </Button>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </>
    );
  };


export const config: RouteConfig = {
  link: {
    label: "Samar",
  },
}
export default CreateSamarProduct;

