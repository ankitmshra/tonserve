import { RouteConfig } from "@medusajs/admin"
import React, { useEffect, useState } from 'react';
import axios, { AxiosRequestConfig } from 'axios';
import { useAdminCreateCollection, useAdminCreateProduct , useAdminCreateProductCategory, useAdminProductCategories} from "medusa-react";
import { AdminPostProductCategoriesReq, AdminPostProductsReq, ProductCategory, ProductStatus } from "@medusajs/medusa";
import './style.css'
import { Button, Container, Heading, Input, Select, Toaster, useToast } from "@medusajs/ui";
import CircularProgress from '@mui/material/CircularProgress';
import { ALPB_BASE_URL, GET_ALL_CATEGORIES, GET_ALL_PRODUCTS, GET_PRODUCTS_BY_CATEGORIES, GET_PRODUCT_DETAILS } from "./constants";

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

const CreateProduct = () => {
  const { toast } = useToast()
  const createProduct = useAdminCreateProduct();
  const createCategory = useAdminCreateProductCategory();
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>();
  const [allCategories, setAllCategories] = useState<Product[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [count, setCount] = useState(0);
  const [nextPage, setNextPage] = useState(null);
  const [prevPage, setPrevPage] = useState(null);
  const pageCount = Math.ceil(count / 25); // Assuming 5 items per page
  const imageUrlPrefix ="https://www.alphabroder.com/media/hires";
  const { product_categories, isLoading } = useAdminProductCategories();
  const [inputSearchValue, setInputSearchValue] = useState('');

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

  const setVarients = (varients: any[], product): any[] => {
    let newVarientObjs = [];
    varients.forEach(element => {
      newVarientObjs.push({
        ...(product.short_description && { title: product.short_description }),
        ...(element.item_number && { sku: `ALPB-${element.item_number}` }),
        ...(element.gtin && { barcode: element.gtin }),
        ...(element.quantity  && { "inventory_quantity": element.quantity }),
        ...(element.weight  && { weight: parseInt(element.weight), }),
        "origin_country": "US",
        prices: [{
          currency_code:"usd",
          ...(element.retail_price  && { amount: parseInt(element.retail_price) * 100 }),
        }],
        options: [
          {
            ...(element.size && { value: element.size }),
            
          },
        {
          ...(element.color_name && { value: element.color_name }),
          
        }
      ],
      })
    });
    return newVarientObjs;
  }

  const getAllImages = (varients: any[]): any[] => {
    let images = [];
    varients.forEach(varient => {
      images.push(`${imageUrlPrefix}/${varient?.front_image}`);
    });
    return images;
  }

  
  const findCollectionId = (selectedProduct: ProductS, product_categoriesT: ProductCategory[], product) => {
    console.log(product_categoriesT);
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
    const varientsData = setVarients(productDetails.variations, productDetails);
    const images = getAllImages(productDetails.variations);
    const createProductReq: AdminPostProductsReq = {
      title: productDetails.short_description,
    description: productDetails.
    full_feature_description,
    is_giftcard: false,
    discountable: false,
    images: [`${imageUrlPrefix}/${clickedProductDetails.front_image}`,
  ...images],
    // status: ProductStatus.DRAFT,
    options: [
      {
      title: "Size"
    },
    {
      title: "Color"
    }
  ],
    variants: varientsData,
    categories: [{
      id: categoryId
    }]
      }
    createProduct.mutate(createProductReq, {
      onSuccess: ({ product }) => {
        toast({ 
          title: "Export Product",
          description: "Product Successfully Exported.",
          variant: "success"
        })
      },
      onError: ({ message }) => {
        toast({ 
          title: "Unable to export product",
          description: "Unable to export product at the moment, please check after sometime.",
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
          description: "Unable to create categories at the moment, please check after sometime.",
          variant: "error"
        })
      },
    });
  };

  const handleExportClick = async (product) => {
    try {
      const selectedProductDetailsResponse = await axios.get(
        `${GET_PRODUCT_DETAILS}${product.product_number}`,
        {
          headers: {
            accept: "application/json",
          },
        }
      );
      const product_categoriesT: ProductCategory[] = product_categories;
      const selectedProduct: ProductS = selectedProductDetailsResponse.data;
      
      
      findCollectionId(selectedProduct, product_categoriesT, product);
      
      // setSingleProductData(response.data);
    } catch (error) {
      toast({ 
        title: "Error",
        description: "An error occurred while fetching product details, please check after sometime.",
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
        description: "An error occurred while fetching product details, please check after sometime.",
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
    console.log(selectedOption);
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
    label: "Alphabroder",
  },
}
export default CreateProduct;

