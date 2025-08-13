import React, { useState } from 'react';
import { X, Save, ArrowDown, ArrowUp } from 'lucide-react';
import { useData } from '../contexts/DataContext';
import { useAuth } from '../contexts/AuthContext';

interface MovementModalProps {
  onClose: () => void;
}

export function MovementModal({ onClose }: MovementModalProps) {
  const { products, addMovement } = useData();
  const { user } = useAuth();

  const [formData, setFormData] = useState({
    productId: '',
    type: 'entry' as 'entry' | 'exit',
    reason: 'purchase' as 'purchase' | 'sale' | 'transfer' | 'adjustment' | 'return' | 'waste',
    quantity: 1,
    unitCost: 0,
    reference: '',
    notes: '',
    location: ''
  });

  const selectedProduct = products.find(p => p.id === formData.productId);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedProduct || !user) return;

    const movementData = {
      ...formData,
      totalCost: formData.quantity * formData.unitCost,
      userId: user.id,
      userName: user.name
    };

    addMovement(movementData);
    onClose();
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'number' ? parseFloat(value) || 0 : value
    }));

    // Auto-fill unit cost when product is selected
    if (name === 'productId') {
      const product = products.find(p => p.id === value);
      if (product) {
        setFormData(prev => ({
          ...prev,
          unitCost: product.unitCost,
          location: product.location
        }));
      }
    }
  };

  const reasonOptions = {
    entry: [
      { value: 'purchase', label: 'Compra' },
      { value: 'return', label: 'Devolución' },
      { value: 'transfer', label: 'Transferencia' },
      { value: 'adjustment', label: 'Ajuste' }
    ],
    exit: [
      { value: 'sale', label: 'Venta' },
      { value: 'transfer', label: 'Transferencia' },
      { value: 'waste', label: 'Merma' },
      { value: 'adjustment', label: 'Ajuste' }
    ]
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center">
            {formData.type === 'entry' ? (
              <ArrowDown className="w-6 h-6 text-green-600 mr-3" />
            ) : (
              <ArrowUp className="w-6 h-6 text-red-600 mr-3" />
            )}
            <h2 className="text-xl font-bold text-gray-900">
              Nuevo Movimiento de Inventario
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Producto *
              </label>
              <select
                name="productId"
                required
                value={formData.productId}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Selecciona un producto</option>
                {products.map(product => (
                  <option key={product.id} value={product.id}>
                    {product.name} - {product.sku} (Stock: {product.currentStock})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tipo de Movimiento *
              </label>
              <select
                name="type"
                required
                value={formData.type}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="entry">Entrada</option>
                <option value="exit">Salida</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Motivo *
              </label>
              <select
                name="reason"
                required
                value={formData.reason}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                {reasonOptions[formData.type].map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Cantidad *
              </label>
              <input
                type="number"
                name="quantity"
                required
                min="1"
                value={formData.quantity}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              {selectedProduct && formData.type === 'exit' && formData.quantity > selectedProduct.currentStock && (
                <p className="text-red-600 text-sm mt-1">
                  ¡Advertencia! Stock insuficiente (disponible: {selectedProduct.currentStock})
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Costo Unitario
              </label>
              <input
                type="number"
                name="unitCost"
                min="0"
                step="0.01"
                value={formData.unitCost}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Referencia *
              </label>
              <input
                type="text"
                name="reference"
                required
                value={formData.reference}
                onChange={handleChange}
                placeholder="PO-001, SO-001, etc."
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Ubicación
              </label>
              <input
                type="text"
                name="location"
                value={formData.location}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Notas
              </label>
              <textarea
                name="notes"
                rows={3}
                value={formData.notes}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Información adicional sobre el movimiento"
              />
            </div>

            {formData.unitCost > 0 && formData.quantity > 0 && (
              <div className="md:col-span-2 bg-gray-50 p-4 rounded-lg">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-gray-700">Costo Total:</span>
                  <span className="text-lg font-bold text-gray-900">
                    ${(formData.quantity * formData.unitCost).toFixed(2)}
                  </span>
                </div>
              </div>
            )}
          </div>

          <div className="flex justify-end space-x-4 mt-8">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center"
            >
              <Save className="w-4 h-4 mr-2" />
              Guardar Movimiento
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}