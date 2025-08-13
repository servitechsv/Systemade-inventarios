import React, { useState } from 'react';
import { 
  BarChart3, 
  Download, 
  Calendar, 
  TrendingUp,
  Package,
  DollarSign,
  AlertTriangle,
  FileText
} from 'lucide-react';
import { useData } from '../contexts/DataContext';

export function Reports() {
  const { products, movements, getLowStockProducts } = useData();
  const [selectedReport, setSelectedReport] = useState('inventory-summary');

  const generateInventoryReport = () => {
    const totalProducts = products.length;
    const totalValue = products.reduce((sum, p) => sum + p.totalValue, 0);
    const lowStockProducts = getLowStockProducts();
    const activeProducts = products.filter(p => p.status === 'active');

    return {
      totalProducts,
      totalValue,
      lowStockCount: lowStockProducts.length,
      activeProducts: activeProducts.length,
      categories: [...new Set(products.map(p => p.category))].length,
      avgValue: totalValue / totalProducts || 0
    };
  };

  const generateMovementReport = () => {
    const totalMovements = movements.length;
    const entries = movements.filter(m => m.type === 'entry');
    const exits = movements.filter(m => m.type === 'exit');
    const totalEntryValue = entries.reduce((sum, m) => sum + m.totalCost, 0);
    const totalExitValue = exits.reduce((sum, m) => sum + m.totalCost, 0);

    return {
      totalMovements,
      totalEntries: entries.length,
      totalExits: exits.length,
      totalEntryValue,
      totalExitValue,
      netValue: totalEntryValue - totalExitValue
    };
  };

  const getTopMovedProducts = () => {
    const productMovements = products.map(product => {
      const productMovementsCount = movements
        .filter(m => m.productId === product.id)
        .reduce((sum, m) => sum + m.quantity, 0);
      
      return {
        ...product,
        totalMovements: productMovementsCount
      };
    });

    return productMovements
      .filter(p => p.totalMovements > 0)
      .sort((a, b) => b.totalMovements - a.totalMovements)
      .slice(0, 10);
  };

  const getKardexData = (productId: string) => {
    const product = products.find(p => p.id === productId);
    if (!product) return [];

    const productMovements = movements
      .filter(m => m.productId === productId)
      .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());

    let runningBalance = 0;
    return productMovements.map(movement => {
      if (movement.type === 'entry') {
        runningBalance += movement.quantity;
      } else {
        runningBalance -= movement.quantity;
      }

      return {
        ...movement,
        balance: runningBalance,
        product: product
      };
    });
  };

  const inventoryReport = generateInventoryReport();
  const movementReport = generateMovementReport();
  const topProducts = getTopMovedProducts();

  const exportToCSV = (data: any[], filename: string) => {
    const csvContent = "data:text/csv;charset=utf-8," 
      + Object.keys(data[0]).join(",") + "\n"
      + data.map(row => Object.values(row).join(",")).join("\n");
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const renderInventorySummary = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 text-white p-6 rounded-xl">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-100">Total Productos</p>
              <p className="text-3xl font-bold">{inventoryReport.totalProducts}</p>
            </div>
            <Package className="w-12 h-12 text-blue-200" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-green-500 to-green-600 text-white p-6 rounded-xl">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-100">Valor Total</p>
              <p className="text-3xl font-bold">${inventoryReport.totalValue.toFixed(2)}</p>
            </div>
            <DollarSign className="w-12 h-12 text-green-200" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-red-500 to-red-600 text-white p-6 rounded-xl">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-red-100">Bajo Stock</p>
              <p className="text-3xl font-bold">{inventoryReport.lowStockCount}</p>
            </div>
            <AlertTriangle className="w-12 h-12 text-red-200" />
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Productos por Categoría</h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                <th className="pb-3">Categoría</th>
                <th className="pb-3">Productos</th>
                <th className="pb-3">Stock Total</th>
                <th className="pb-3">Valor</th>
              </tr>
            </thead>
            <tbody className="space-y-2">
              {[...new Set(products.map(p => p.category))].map(category => {
                const categoryProducts = products.filter(p => p.category === category);
                const totalStock = categoryProducts.reduce((sum, p) => sum + p.currentStock, 0);
                const totalValue = categoryProducts.reduce((sum, p) => sum + p.totalValue, 0);
                
                return (
                  <tr key={category} className="border-t border-gray-100">
                    <td className="py-3 font-medium text-gray-900">{category}</td>
                    <td className="py-3 text-gray-600">{categoryProducts.length}</td>
                    <td className="py-3 text-gray-600">{totalStock}</td>
                    <td className="py-3 text-green-600 font-medium">${totalValue.toFixed(2)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  const renderMovementReport = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Entradas</h3>
            <TrendingUp className="w-6 h-6 text-green-500" />
          </div>
          <div className="space-y-2">
            <p className="text-3xl font-bold text-green-600">{movementReport.totalEntries}</p>
            <p className="text-gray-600">Movimientos</p>
            <p className="text-lg font-semibold text-green-600">${movementReport.totalEntryValue.toFixed(2)}</p>
            <p className="text-gray-600">Valor total</p>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Salidas</h3>
            <TrendingUp className="w-6 h-6 text-red-500 transform rotate-180" />
          </div>
          <div className="space-y-2">
            <p className="text-3xl font-bold text-red-600">{movementReport.totalExits}</p>
            <p className="text-gray-600">Movimientos</p>
            <p className="text-lg font-semibold text-red-600">${movementReport.totalExitValue.toFixed(2)}</p>
            <p className="text-gray-600">Valor total</p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Productos Más Movidos</h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                <th className="pb-3">Ranking</th>
                <th className="pb-3">Producto</th>
                <th className="pb-3">SKU</th>
                <th className="pb-3">Movimientos</th>
                <th className="pb-3">Stock Actual</th>
              </tr>
            </thead>
            <tbody>
              {topProducts.map((product, index) => (
                <tr key={product.id} className="border-t border-gray-100">
                  <td className="py-3">
                    <span className="w-6 h-6 bg-blue-100 text-blue-600 text-sm font-medium rounded-full flex items-center justify-center">
                      {index + 1}
                    </span>
                  </td>
                  <td className="py-3 font-medium text-gray-900">{product.name}</td>
                  <td className="py-3 text-gray-600">{product.sku}</td>
                  <td className="py-3 text-blue-600 font-medium">{(product as any).totalMovements}</td>
                  <td className="py-3 text-gray-600">{product.currentStock}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  const renderKardex = () => (
    <div className="space-y-6">
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Kardex por Producto</h3>
          <select
            className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            onChange={(e) => {
              // Implementation for product selection
            }}
          >
            <option value="">Seleccionar producto</option>
            {products.map(product => (
              <option key={product.id} value={product.id}>
                {product.name} - {product.sku}
              </option>
            ))}
          </select>
        </div>
        
        {products.length > 0 && (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  <th className="pb-3">Fecha</th>
                  <th className="pb-3">Referencia</th>
                  <th className="pb-3">Entrada</th>
                  <th className="pb-3">Salida</th>
                  <th className="pb-3">Saldo</th>
                  <th className="pb-3">Costo Unit.</th>
                  <th className="pb-3">Usuario</th>
                </tr>
              </thead>
              <tbody>
                {getKardexData(products[0].id).map((item, index) => (
                  <tr key={index} className="border-t border-gray-100">
                    <td className="py-3 text-gray-600">
                      {new Date(item.timestamp).toLocaleDateString('es-ES')}
                    </td>
                    <td className="py-3 text-gray-600">{item.reference}</td>
                    <td className="py-3 text-green-600">
                      {item.type === 'entry' ? item.quantity : ''}
                    </td>
                    <td className="py-3 text-red-600">
                      {item.type === 'exit' ? item.quantity : ''}
                    </td>
                    <td className="py-3 font-medium text-gray-900">{item.balance}</td>
                    <td className="py-3 text-gray-600">${item.unitCost.toFixed(2)}</td>
                    <td className="py-3 text-gray-600">{item.userName}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Reportes</h1>
          <p className="text-gray-600 mt-2">Análisis y estadísticas del inventario</p>
        </div>
        <button
          onClick={() => exportToCSV(products, `inventario_${new Date().toISOString().split('T')[0]}.csv`)}
          className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center"
        >
          <Download className="w-4 h-4 mr-2" />
          Exportar
        </button>
      </div>

      {/* Report Navigation */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100">
        <div className="flex border-b border-gray-200">
          <button
            onClick={() => setSelectedReport('inventory-summary')}
            className={`px-6 py-4 text-sm font-medium ${
              selectedReport === 'inventory-summary'
                ? 'text-blue-600 border-b-2 border-blue-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <BarChart3 className="w-4 h-4 inline mr-2" />
            Resumen de Inventario
          </button>
          <button
            onClick={() => setSelectedReport('movements')}
            className={`px-6 py-4 text-sm font-medium ${
              selectedReport === 'movements'
                ? 'text-blue-600 border-b-2 border-blue-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <TrendingUp className="w-4 h-4 inline mr-2" />
            Movimientos
          </button>
          <button
            onClick={() => setSelectedReport('kardex')}
            className={`px-6 py-4 text-sm font-medium ${
              selectedReport === 'kardex'
                ? 'text-blue-600 border-b-2 border-blue-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <FileText className="w-4 h-4 inline mr-2" />
            Kardex
          </button>
        </div>

        <div className="p-6">
          {selectedReport === 'inventory-summary' && renderInventorySummary()}
          {selectedReport === 'movements' && renderMovementReport()}
          {selectedReport === 'kardex' && renderKardex()}
        </div>
      </div>
    </div>
  );
}