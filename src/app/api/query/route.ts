import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { table, filters = {}, limit = 10 } = body;
    
    let where: any = {};
    
    // Type conversion based on table & column
    for (const [key, value] of Object.entries(filters)) {
      if (!value) continue;
      
      const val = value as string;
      
      // Determine if the field is numeric
      const isNumeric = ['currentPrice', 'stockQty', 'quantity', 'purchasePrice'].includes(key);
      const isIntId = key === 'id' && table === 'OrderItem';
      
      if (isNumeric || isIntId) {
         if (!isNaN(Number(val))) {
           where[key] = Number(val);
         }
      } else if (key === 'orderDate') {
         // skip complex date parsing for now, or add exact match if needed
      } else {
         // String search
         where[key] = { contains: val, mode: 'insensitive' };
      }
    }

    let data = [];
    if (table === 'Customer') data = await prisma.customer.findMany({ where, take: limit });
    else if (table === 'Product') data = await prisma.product.findMany({ where, take: limit });
    else if (table === 'Order') data = await prisma.order.findMany({ where, take: limit });
    else if (table === 'OrderItem') data = await prisma.orderItem.findMany({ where, take: limit });
    else return NextResponse.json({ error: 'Invalid table' }, { status: 400 });

    return NextResponse.json({ data });
  } catch (error: any) {
    console.error(error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
