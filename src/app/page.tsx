import { PrismaClient } from '@prisma/client'
import DataViewer from './DataViewer'

const prisma = new PrismaClient()

export default async function Home() {
  const customerCount = await prisma.customer.count()
  const productCount = await prisma.product.count()
  const orderCount = await prisma.order.count()
  const orderItemCount = await prisma.orderItem.count()

  return (
    <main className="p-8 max-w-7xl mx-auto font-sans bg-gray-50 min-h-screen">
      <h1 className="text-3xl font-extrabold mb-8 text-gray-900 border-b pb-4">📊 Database Dashboard</h1>
      
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-10">
        <div className="p-6 bg-blue-100 border border-blue-300 rounded-lg shadow-md">
          <h2 className="text-lg font-bold text-blue-900 mb-2">Customers</h2>
          <p className="text-4xl font-extrabold text-blue-950">{customerCount.toLocaleString()}</p>
        </div>
        <div className="p-6 bg-green-100 border border-green-300 rounded-lg shadow-md">
          <h2 className="text-lg font-bold text-green-900 mb-2">Products</h2>
          <p className="text-4xl font-extrabold text-green-950">{productCount.toLocaleString()}</p>
        </div>
        <div className="p-6 bg-purple-100 border border-purple-300 rounded-lg shadow-md">
          <h2 className="text-lg font-bold text-purple-900 mb-2">Orders</h2>
          <p className="text-4xl font-extrabold text-purple-950">{orderCount.toLocaleString()}</p>
        </div>
        <div className="p-6 bg-yellow-100 border border-yellow-300 rounded-lg shadow-md">
          <h2 className="text-lg font-bold text-yellow-900 mb-2">Order Items</h2>
          <p className="text-4xl font-extrabold text-yellow-950">{orderItemCount.toLocaleString()}</p>
        </div>
      </div>

      <DataViewer />

    </main>
  )
}
