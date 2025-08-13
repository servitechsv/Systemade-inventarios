import React from 'react';
import { 
  Package, 
  TrendingUp, 
  AlertTriangle, 
  DollarSign,
  ArrowUp,
  ArrowDown,
  Eye
} from 'lucide-react';
import { useData } from '../contexts/DataContext';

export function Dashboard() {
  const { products, movements, getLowStockProducts, getTopProducts } = useData();
  
  const totalProducts = products.length;
  const totalValue = products.reduce((sum, p) => sum + p.totalValue, 0);
  const lowStockProducts = getLowStockProducts();
  const topProducts = getTopProducts();
  
  const todayMovements = movements.filter(m => {
    const today = new Date().toDateString();
    return new Date(m.timestamp).toDateString() === today;
  });

  const stats = [
    {
      title: 'Total Productos',
      value: totalProducts.toString(),
      icon: Package,
      color: 'bg-blue-600',
      change: '+12%',
      changeType: 'positive'
    },
    {
      title: 'Valor Inventario',
      value: `$${totalValue.toLocaleString('es-ES', { minimumFractionDigits: 2 })}`,
      icon: DollarSign,
      color: 'bg-green-600',
      change: '+8.2%',
      changeType: 'positive'
    },
    {
      title: 'Productos Bajo Stock',
      value: lowStockProducts.length.toString(),
      icon: AlertTriangle,
      color: 'bg-red-600',
      change: '-5%',
      changeType: 'negative'
    },
    {
      title: 'Movimientos Hoy',
      value: todayMovements.length.toString(),
      icon: TrendingUp,
      color: 'bg-purple-600',
      change: '+15%',
      changeType: 'positive'
    }
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600 mt-2">Resumen general del inventario</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <div key={index} className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow">
            <div className="flex items-center">
              <div className={`${stat.color} p-3 rounded-lg`}>
                <stat.icon className="w-6 h-6 text-white" />
              </div>
              <div className="ml-4 flex-1">
                <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
              </div>
            </div>
            <div className="mt-4 flex items-center">
              {stat.changeType === 'positive' ? (
                <ArrowUp className="w-4 h-4 text-green-500" />
              ) : (
                <ArrowDown className="w-4 h-4 text-red-500" />
              )}
              <span className={`text-sm font-medium ml-1 ${
                stat.changeType === 'positive' ? 'text-green-600' : 'text-red-600'
              }`}>
                {stat.change}
              </span>
              <span className="text-gray-500 text-sm ml-1">vs mes anterior</span>
            </div>
          </div>
        ))}
      </div>

      {/* Charts and Tables Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Low Stock Alert */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Productos Bajo Stock</h3>
            <AlertTriangle className="w-5 h-5 text-red-500" />
          </div>
          <div className="space-y-3">
            {lowStockProducts.length > 0 ? (
              lowStockProducts.slice(0, 5).map((product) => (
                <div key={product.id} className="flex items-center justify-between p-3 bg-red-50 rounded-lg">
                  <div>
                    <p className="font-medium text-gray-900">{product.name}</p>
                    <p className="text-sm text-gray-500">SKU: {product.sku}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-red-600">
                      {product.currentStock} / {product.minStock}
                    </p>
                    <p className="text-xs text-gray-500">Stock / Mínimo</p>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-gray-500">
                <Package className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                <p>Todos los productos tienen stock suficiente</p>
              </div>
            )}
          </div>
        </div>

        {/* Top Products */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Productos Más Movidos</h3>
            <TrendingUp className="w-5 h-5 text-green-500" />
          </div>
          <div className="space-y-3">
            {topProducts.map((product, index) => (
              <div key={product.id} className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg">
                <div className="flex items-center">
                  <span className="w-6 h-6 bg-blue-100 text-blue-600 text-sm font-medium rounded-full flex items-center justify-center">
                    {index + 1}
                  </span>
                  <div className="ml-3">
                    <p className="font-medium text-gray-900">{product.name}</p>
                    <p className="text-sm text-gray-500">Stock: {product.currentStock}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium text-gray-900">
                    {(product as any).totalMovements} movimientos
                  </p>
                  <p className="text-xs text-gray-500">Total</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Movements */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100">
        <div className="p-6 border-b border-gray-100">
          <h3 className="text-lg font-semibold text-gray-900">Movimientos Recientes</h3>
        </div>
        <div className="p-6">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  <th className="pb-3">Producto</th>
                  <th className="pb-3">Tipo</th>
                  <th className="pb-3">Cantidad</th>
                  <th className="pb-3">Usuario</th>
                  <th className="pb-3">Fecha</th>
                  <th className="pb-3">Acciones</th>
                </tr>
              </thead>
              <tbody className="space-y-2">
                {movements.slice(-5).reverse().map((movement) => {
                  const product = products.find(p => p.id === movement.productId);
                  return (
                    <tr key={movement.id} className="border-t border-gray-100">
                      <td className="py-3">
                        <div>
                          <p className="font-medium text-gray-900">{product?.name}</p>
                          <p className="text-sm text-gray-500">{product?.sku}</p>
                        </div>
                      </td>
                      <td className="py-3">
                        <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                          movement.type === 'entry' 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {movement.type === 'entry' ? 'Entrada' : 'Salida'}
                        </span>
                      </td>
                      <td className="py-3 font-medium">
                        {movement.type === 'entry' ? '+' : '-'}{movement.quantity}
                      </td>
                      <td className="py-3 text-gray-600">{movement.userName}</td>
                      <td className="py-3 text-gray-600">
                        {new Date(movement.timestamp).toLocaleDateString('es-ES')}
                      </td>
                      <td className="py-3">
                        <button className="text-blue-600 hover:text-blue-800">
                          <Eye className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}