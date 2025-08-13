import React, { createContext, useContext, useState, ReactNode } from 'react';

export interface Product {
  id: string;
  sku: string;
  name: string;
  description: string;
  category: string;
  supplier: string;
  unit: string;
  location: string;
  currentStock: number;
  minStock: number;
  maxStock: number;
  unitCost: number;
  totalValue: number;
  barcode: string;
  image?: string;
  expirationDate?: string;
  serialNumbers?: string[];
  status: 'active' | 'inactive';
  createdAt: string;
  updatedAt: string;
}

export interface Movement {
  id: string;
  productId: string;
  type: 'entry' | 'exit';
  reason: 'purchase' | 'sale' | 'transfer' | 'adjustment' | 'return' | 'waste';
  quantity: number;
  unitCost: number;
  totalCost: number;
  reference: string;
  notes?: string;
  userId: string;
  userName: string;
  timestamp: string;
  location: string;
}

interface DataContextType {
  products: Product[];
  movements: Movement[];
  addProduct: (product: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateProduct: (id: string, product: Partial<Product>) => void;
  deleteProduct: (id: string) => void;
  addMovement: (movement: Omit<Movement, 'id' | 'timestamp'>) => void;
  getProductById: (id: string) => Product | undefined;
  getMovementsByProduct: (productId: string) => Movement[];
  getLowStockProducts: () => Product[];
  getTopProducts: () => Product[];
}

const DataContext = createContext<DataContextType | undefined>(undefined);

// Mock data
const mockProducts: Product[] = [
  {
    id: '1',
    sku: 'SKU-001',
    name: 'Laptop Dell Inspiron 15',
    description: 'Laptop para oficina con procesador Intel i5',
    category: 'Electrónicos',
    supplier: 'Dell Inc.',
    unit: 'Unidad',
    location: 'A-01-001',
    currentStock: 25,
    minStock: 5,
    maxStock: 50,
    unitCost: 650.00,
    totalValue: 16250.00,
    barcode: '123456789012',
    status: 'active',
    createdAt: '2024-01-15T10:00:00Z',
    updatedAt: '2024-01-15T10:00:00Z'
  },
  {
    id: '2',
    sku: 'SKU-002',
    name: 'Silla Ejecutiva Premium',
    description: 'Silla ergonómica para oficina',
    category: 'Muebles',
    supplier: 'Muebles SA',
    unit: 'Unidad',
    location: 'B-02-003',
    currentStock: 15,
    minStock: 10,
    maxStock: 30,
    unitCost: 180.00,
    totalValue: 2700.00,
    barcode: '123456789013',
    status: 'active',
    createdAt: '2024-01-10T14:30:00Z',
    updatedAt: '2024-01-10T14:30:00Z'
  },
  {
    id: '3',
    sku: 'SKU-003',
    name: 'Papel Bond A4',
    description: 'Resma de papel blanco 75g',
    category: 'Suministros',
    supplier: 'Papelería Central',
    unit: 'Resma',
    location: 'C-01-005',
    currentStock: 3,
    minStock: 20,
    maxStock: 100,
    unitCost: 4.50,
    totalValue: 13.50,
    barcode: '123456789014',
    status: 'active',
    createdAt: '2024-01-08T09:15:00Z',
    updatedAt: '2024-01-20T16:45:00Z'
  }
];

const mockMovements: Movement[] = [
  {
    id: '1',
    productId: '1',
    type: 'entry',
    reason: 'purchase',
    quantity: 10,
    unitCost: 650.00,
    totalCost: 6500.00,
    reference: 'PO-001',
    notes: 'Compra inicial de inventario',
    userId: '1',
    userName: 'Admin Usuario',
    timestamp: '2024-01-15T10:00:00Z',
    location: 'A-01-001'
  },
  {
    id: '2',
    productId: '1',
    type: 'exit',
    reason: 'sale',
    quantity: 2,
    unitCost: 650.00,
    totalCost: 1300.00,
    reference: 'SO-001',
    notes: 'Venta a cliente corporativo',
    userId: '3',
    userName: 'Operador María',
    timestamp: '2024-01-18T14:30:00Z',
    location: 'A-01-001'
  },
  {
    id: '3',
    productId: '3',
    type: 'exit',
    reason: 'sale',
    quantity: 15,
    unitCost: 4.50,
    totalCost: 67.50,
    reference: 'SO-002',
    notes: 'Venta regular',
    userId: '3',
    userName: 'Operador María',
    timestamp: '2024-01-20T16:45:00Z',
    location: 'C-01-005'
  }
];

export function DataProvider({ children }: { children: ReactNode }) {
  const [products, setProducts] = useState<Product[]>(mockProducts);
  const [movements, setMovements] = useState<Movement[]>(mockMovements);

  const addProduct = (productData: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>) => {
    const newProduct: Product = {
      ...productData,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    setProducts(prev => [...prev, newProduct]);
  };

  const updateProduct = (id: string, updates: Partial<Product>) => {
    setProducts(prev => prev.map(product => 
      product.id === id 
        ? { ...product, ...updates, updatedAt: new Date().toISOString() }
        : product
    ));
  };

  const deleteProduct = (id: string) => {
    setProducts(prev => prev.filter(product => product.id !== id));
  };

  const addMovement = (movementData: Omit<Movement, 'id' | 'timestamp'>) => {
    const newMovement: Movement = {
      ...movementData,
      id: Date.now().toString(),
      timestamp: new Date().toISOString()
    };
    
    setMovements(prev => [...prev, newMovement]);
    
    // Update product stock
    setProducts(prev => prev.map(product => {
      if (product.id === movementData.productId) {
        const stockChange = movementData.type === 'entry' 
          ? movementData.quantity 
          : -movementData.quantity;
        
        const newStock = product.currentStock + stockChange;
        return {
          ...product,
          currentStock: newStock,
          totalValue: newStock * product.unitCost,
          updatedAt: new Date().toISOString()
        };
      }
      return product;
    }));
  };

  const getProductById = (id: string) => products.find(p => p.id === id);
  
  const getMovementsByProduct = (productId: string) => 
    movements.filter(m => m.productId === productId);
  
  const getLowStockProducts = () => 
    products.filter(p => p.currentStock <= p.minStock);
  
  const getTopProducts = () => {
    const productMovements = products.map(product => ({
      ...product,
      totalMovements: movements
        .filter(m => m.productId === product.id)
        .reduce((sum, m) => sum + m.quantity, 0)
    }));
    
    return productMovements
      .sort((a, b) => b.totalMovements - a.totalMovements)
      .slice(0, 5);
  };

  return (
    <DataContext.Provider value={{
      products,
      movements,
      addProduct,
      updateProduct,
      deleteProduct,
      addMovement,
      getProductById,
      getMovementsByProduct,
      getLowStockProducts,
      getTopProducts
    }}>
      {children}
    </DataContext.Provider>
  );
}

export function useData() {
  const context = useContext(DataContext);
  if (context === undefined) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
}