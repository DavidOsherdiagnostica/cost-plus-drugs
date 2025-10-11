// TypeScript type definitions for Cost Plus Drugs GraphQL API

// ===== GRAPHQL QUERY VARIABLES =====

export interface SearchMedicinesVariables {
  medicationSearch: string;
  [key: string]: unknown;
}

export interface GetCollectionPathsVariables {
  search: string;
  [key: string]: unknown;
}

export interface GetAllProductsVariables {
  before?: string;
  after?: string;
  first?: number;
  last?: number;
  direction?: 'ASC' | 'DESC';
  productOrderField?: 'NAME' | 'PRICE' | 'DATE';
  collection?: string[];
  [key: string]: unknown;
}

// ===== GRAPHQL RESPONSE TYPES =====

export interface ProductNode {
  id: string;
  name: string;
  slug: string;
  collections: Array<{
    name: string;
    slug: string;
    __typename: string;
  }>;
  priceCalculation: number;
  retailPrice: number;
  media: Array<{
    id: string;
    alt: string;
    sortOrder: number;
    url: string;
    type: string;
    oembedData: string;
    isPharmacyPromotionImage: boolean;
    __typename: string;
  }>;
  variants: Array<{
    id: string;
    sku: string;
    metafields: Record<string, any>;
    images: Array<{
      url: string;
      __typename: string;
    }>;
    specialtyMedication: boolean;
    __typename: string;
  }>;
  isAvailable: boolean;
  metafields: {
    brandName?: string;
    brandGeneric?: string;
    external_promotion?: string;
    medication_full_display_name?: string;
  };
  category?: {
    name: string;
    __typename: string;
  };
  __typename: string;
}

export interface CollectionNode {
  id: string;
  name: string;
  slug: string;
  __typename: string;
}

// ===== API RESPONSE INTERFACES =====

export interface SearchMedicinesResponse {
  data: {
    products: {
      edges: Array<{
        node: ProductNode;
        __typename: string;
      }>;
      __typename: string;
    };
  };
  extensions: {
    cost: {
      requestedQueryCost: number;
      maximumAvailable: number;
    };
  };
}

export interface GetCollectionPathsResponse {
  data: {
    collections: {
      edges: Array<{
        node: CollectionNode;
        __typename: string;
      }>;
      __typename: string;
    };
  };
  extensions: {
    cost: {
      requestedQueryCost: number;
      maximumAvailable: number;
    };
  };
}

export interface GetAllProductsResponse {
  data: {
    products: {
      edges: Array<{
        node: ProductNode;
        __typename: string;
      }>;
      totalCount: number;
      pageInfo: {
        startCursor: string;
        endCursor: string;
        hasNextPage: boolean;
        hasPreviousPage: boolean;
        __typename: string;
      };
      __typename: string;
    };
  };
  extensions: {
    cost: {
      requestedQueryCost: number;
      maximumAvailable: number;
    };
  };
}

// ===== PROCESSED OUTPUT TYPES =====

export interface ProcessedMedication {
  id: string;
  name: string;
  slug: string;
  collections: string[];
  price: number;
  retailPrice: number;
  brandName?: string;
  genericBrand: string;
  forms: string[];
  strengths: string[];
  packageSizes: string[];
  isAvailable: boolean;
  isSpecialtyMedication: boolean;
  imageUrls: string[];
  externalPromotion?: string;
  fullDisplayName?: string;
}

export interface ProcessedCollection {
  id: string;
  name: string;
  slug: string;
  [key: string]: unknown;
}
