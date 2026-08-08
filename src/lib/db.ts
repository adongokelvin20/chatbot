import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
  dbInitialized: boolean
}

// Create Prisma client
const prismaClient = new PrismaClient({
  log: process.env.NODE_ENV === 'development' ? ['error'] : [],
})

export const db = globalForPrisma.prisma ?? prismaClient

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = db
}

/**
 * Ensures database tables exist on PostgreSQL.
 * On SQLite (local dev), this is a no-op because prisma db push creates tables.
 * On Vercel with PostgreSQL, tables are auto-created via raw SQL on first API call.
 */
let initPromise: Promise<void> | null = null;

async function autoInitDatabase() {
  if (globalForPrisma.dbInitialized) return;
  if (initPromise) return initPromise;

  initPromise = (async () => {
    try {
      // Only run for PostgreSQL (Vercel)
      const dbUrl = process.env.DATABASE_URL || '';
      if (!dbUrl.startsWith('postgresql') && !dbUrl.startsWith('postgres')) {
        globalForPrisma.dbInitialized = true;
        return;
      }

      // Check if tables exist
      const result = await db.$queryRawUnsafe(
        `SELECT COUNT(*) as count FROM information_schema.tables WHERE table_name = 'Business'`
      );

      const count = Number((result as any[])[0]?.count || 0);
      if (count > 0) {
        globalForPrisma.dbInitialized = true;
        return;
      }

      console.log('[DB] Tables not found. Auto-creating...');

      // Create all tables
      await db.$executeRawUnsafe(`
        CREATE TABLE IF NOT EXISTS "Business" (
          "id" TEXT NOT NULL PRIMARY KEY,
          "name" TEXT NOT NULL,
          "logo" TEXT,
          "email" TEXT NOT NULL,
          "phone" TEXT,
          "address" TEXT,
          "website" TEXT,
          "instagram" TEXT,
          "facebook" TEXT,
          "workingHours" TEXT,
          "timezone" TEXT NOT NULL DEFAULT 'UTC',
          "setupComplete" BOOLEAN NOT NULL DEFAULT false,
          "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
          "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
        );
        
        CREATE TABLE IF NOT EXISTS "Staff" (
          "id" TEXT NOT NULL PRIMARY KEY,
          "businessId" TEXT NOT NULL,
          "name" TEXT NOT NULL,
          "email" TEXT NOT NULL,
          "role" TEXT NOT NULL DEFAULT 'staff',
          "status" TEXT NOT NULL DEFAULT 'active',
          "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
          "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
          CONSTRAINT "Staff_businessId_fkey" FOREIGN KEY ("businessId") REFERENCES "Business"("id") ON DELETE CASCADE ON UPDATE CASCADE
        );
        
        CREATE TABLE IF NOT EXISTS "Customer" (
          "id" TEXT NOT NULL PRIMARY KEY,
          "businessId" TEXT NOT NULL,
          "name" TEXT NOT NULL,
          "phone" TEXT NOT NULL,
          "email" TEXT,
          "notes" TEXT,
          "lastInteraction" TIMESTAMP(3),
          "totalOrders" INTEGER NOT NULL DEFAULT 0,
          "totalSpent" DOUBLE PRECISION NOT NULL DEFAULT 0,
          "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
          "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
          CONSTRAINT "Customer_businessId_fkey" FOREIGN KEY ("businessId") REFERENCES "Business"("id") ON DELETE CASCADE ON UPDATE CASCADE
        );
        
        CREATE TABLE IF NOT EXISTS "CustomerMemory" (
          "id" TEXT NOT NULL PRIMARY KEY,
          "customerId" TEXT NOT NULL,
          "businessId" TEXT NOT NULL,
          "key" TEXT NOT NULL,
          "value" TEXT NOT NULL,
          "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
          CONSTRAINT "CustomerMemory_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "Customer"("id") ON DELETE CASCADE ON UPDATE CASCADE
        );
        
        CREATE TABLE IF NOT EXISTS "Category" (
          "id" TEXT NOT NULL PRIMARY KEY,
          "businessId" TEXT NOT NULL,
          "name" TEXT NOT NULL,
          "slug" TEXT NOT NULL,
          "description" TEXT,
          "image" TEXT,
          "active" BOOLEAN NOT NULL DEFAULT true,
          "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
          "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
          CONSTRAINT "Category_businessId_fkey" FOREIGN KEY ("businessId") REFERENCES "Business"("id") ON DELETE CASCADE ON UPDATE CASCADE
        );
        
        CREATE TABLE IF NOT EXISTS "Product" (
          "id" TEXT NOT NULL PRIMARY KEY,
          "businessId" TEXT NOT NULL,
          "name" TEXT NOT NULL,
          "description" TEXT,
          "categoryId" TEXT,
          "sku" TEXT,
          "price" DOUBLE PRECISION NOT NULL,
          "salePrice" DOUBLE PRECISION,
          "stock" INTEGER NOT NULL DEFAULT 0,
          "colors" TEXT,
          "sizes" TEXT,
          "images" TEXT,
          "active" BOOLEAN NOT NULL DEFAULT true,
          "featured" BOOLEAN NOT NULL DEFAULT false,
          "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
          "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
          CONSTRAINT "Product_businessId_fkey" FOREIGN KEY ("businessId") REFERENCES "Business"("id") ON DELETE CASCADE ON UPDATE CASCADE,
          CONSTRAINT "Product_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "Category"("id") ON DELETE SET NULL ON UPDATE CASCADE
        );
        
        CREATE TABLE IF NOT EXISTS "Order" (
          "id" TEXT NOT NULL PRIMARY KEY,
          "businessId" TEXT NOT NULL,
          "customerId" TEXT,
          "orderNumber" TEXT NOT NULL,
          "status" TEXT NOT NULL DEFAULT 'pending',
          "subtotal" DOUBLE PRECISION NOT NULL,
          "deliveryFee" DOUBLE PRECISION NOT NULL DEFAULT 0,
          "discount" DOUBLE PRECISION NOT NULL DEFAULT 0,
          "total" DOUBLE PRECISION NOT NULL,
          "paymentMethod" TEXT,
          "paymentStatus" TEXT NOT NULL DEFAULT 'pending',
          "deliveryAddress" TEXT,
          "customerName" TEXT NOT NULL,
          "customerPhone" TEXT NOT NULL,
          "customerEmail" TEXT,
          "notes" TEXT,
          "source" TEXT NOT NULL DEFAULT 'ai',
          "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
          "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
          CONSTRAINT "Order_businessId_fkey" FOREIGN KEY ("businessId") REFERENCES "Business"("id") ON DELETE CASCADE ON UPDATE CASCADE,
          CONSTRAINT "Order_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "Customer"("id") ON DELETE SET NULL ON UPDATE CASCADE
        );
        
        CREATE TABLE IF NOT EXISTS "OrderItem" (
          "id" TEXT NOT NULL PRIMARY KEY,
          "orderId" TEXT NOT NULL,
          "productId" TEXT NOT NULL,
          "productName" TEXT NOT NULL,
          "quantity" INTEGER NOT NULL,
          "price" DOUBLE PRECISION NOT NULL,
          "color" TEXT,
          "size" TEXT,
          CONSTRAINT "OrderItem_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "Order"("id") ON DELETE CASCADE ON UPDATE CASCADE,
          CONSTRAINT "OrderItem_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE RESTRICT ON UPDATE CASCADE
        );
        
        CREATE TABLE IF NOT EXISTS "Conversation" (
          "id" TEXT NOT NULL PRIMARY KEY,
          "businessId" TEXT NOT NULL,
          "customerId" TEXT,
          "channel" TEXT NOT NULL DEFAULT 'web',
          "status" TEXT NOT NULL DEFAULT 'active',
          "aiActive" BOOLEAN NOT NULL DEFAULT true,
          "assignedToStaff" TEXT,
          "lastMessageAt" TIMESTAMP(3),
          "pinned" BOOLEAN NOT NULL DEFAULT false,
          "customerName" TEXT,
          "customerPhone" TEXT,
          "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
          "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
          CONSTRAINT "Conversation_businessId_fkey" FOREIGN KEY ("businessId") REFERENCES "Business"("id") ON DELETE CASCADE ON UPDATE CASCADE,
          CONSTRAINT "Conversation_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "Customer"("id") ON DELETE SET NULL ON UPDATE CASCADE
        );
        
        CREATE TABLE IF NOT EXISTS "Message" (
          "id" TEXT NOT NULL PRIMARY KEY,
          "conversationId" TEXT NOT NULL,
          "senderType" TEXT NOT NULL,
          "senderId" TEXT,
          "content" TEXT NOT NULL,
          "contentType" TEXT NOT NULL DEFAULT 'text',
          "metadata" TEXT,
          "isRead" BOOLEAN NOT NULL DEFAULT false,
          "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
          CONSTRAINT "Message_conversationId_fkey" FOREIGN KEY ("conversationId") REFERENCES "Conversation"("id") ON DELETE CASCADE ON UPDATE CASCADE
        );
        
        CREATE TABLE IF NOT EXISTS "DeliveryZone" (
          "id" TEXT NOT NULL PRIMARY KEY,
          "businessId" TEXT NOT NULL,
          "city" TEXT NOT NULL,
          "fee" DOUBLE PRECISION NOT NULL,
          "estimatedDays" TEXT NOT NULL,
          "courierNotes" TEXT,
          "active" BOOLEAN NOT NULL DEFAULT true,
          "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
          "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
          CONSTRAINT "DeliveryZone_businessId_fkey" FOREIGN KEY ("businessId") REFERENCES "Business"("id") ON DELETE CASCADE ON UPDATE CASCADE
        );
        
        CREATE TABLE IF NOT EXISTS "PaymentMethod" (
          "id" TEXT NOT NULL PRIMARY KEY,
          "businessId" TEXT NOT NULL,
          "name" TEXT NOT NULL,
          "type" TEXT NOT NULL,
          "config" TEXT,
          "active" BOOLEAN NOT NULL DEFAULT true,
          "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
          "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
          CONSTRAINT "PaymentMethod_businessId_fkey" FOREIGN KEY ("businessId") REFERENCES "Business"("id") ON DELETE CASCADE ON UPDATE CASCADE
        );
        
        CREATE TABLE IF NOT EXISTS "FAQ" (
          "id" TEXT NOT NULL PRIMARY KEY,
          "businessId" TEXT NOT NULL,
          "question" TEXT NOT NULL,
          "answer" TEXT NOT NULL,
          "keywords" TEXT,
          "category" TEXT,
          "active" BOOLEAN NOT NULL DEFAULT true,
          "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
          "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
          CONSTRAINT "FAQ_businessId_fkey" FOREIGN KEY ("businessId") REFERENCES "Business"("id") ON DELETE CASCADE ON UPDATE CASCADE
        );
        
        CREATE TABLE IF NOT EXISTS "Promotion" (
          "id" TEXT NOT NULL PRIMARY KEY,
          "businessId" TEXT NOT NULL,
          "name" TEXT NOT NULL,
          "type" TEXT NOT NULL,
          "discountType" TEXT NOT NULL,
          "discountValue" DOUBLE PRECISION NOT NULL,
          "minOrder" DOUBLE PRECISION,
          "maxDiscount" DOUBLE PRECISION,
          "code" TEXT,
          "validFrom" TIMESTAMP(3),
          "validUntil" TIMESTAMP(3),
          "active" BOOLEAN NOT NULL DEFAULT true,
          "autoApply" BOOLEAN NOT NULL DEFAULT false,
          "description" TEXT,
          "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
          "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
          CONSTRAINT "Promotion_businessId_fkey" FOREIGN KEY ("businessId") REFERENCES "Business"("id") ON DELETE CASCADE ON UPDATE CASCADE
        );
        
        CREATE TABLE IF NOT EXISTS "AISetting" (
          "id" TEXT NOT NULL PRIMARY KEY,
          "businessId" TEXT NOT NULL,
          "personality" TEXT NOT NULL DEFAULT 'professional',
          "tone" TEXT NOT NULL DEFAULT 'helpful',
          "greetingMessage" TEXT,
          "workingHoursReply" TEXT,
          "autoReply" BOOLEAN NOT NULL DEFAULT true,
          "language" TEXT NOT NULL DEFAULT 'en',
          "apiKey" TEXT,
          "model" TEXT NOT NULL DEFAULT 'gpt-4o-mini',
          "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
          "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
          CONSTRAINT "AISetting_businessId_fkey" FOREIGN KEY ("businessId") REFERENCES "Business"("id") ON DELETE CASCADE ON UPDATE CASCADE
        );
        
        CREATE TABLE IF NOT EXISTS "Analytics" (
          "id" TEXT NOT NULL PRIMARY KEY,
          "businessId" TEXT NOT NULL,
          "date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
          "metricType" TEXT NOT NULL,
          "metricValue" DOUBLE PRECISION NOT NULL,
          "metadata" TEXT,
          "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
          CONSTRAINT "Analytics_businessId_fkey" FOREIGN KEY ("businessId") REFERENCES "Business"("id") ON DELETE CASCADE ON UPDATE CASCADE
        );
        
        CREATE TABLE IF NOT EXISTS "Notification" (
          "id" TEXT NOT NULL PRIMARY KEY,
          "businessId" TEXT NOT NULL,
          "type" TEXT NOT NULL,
          "title" TEXT NOT NULL,
          "message" TEXT NOT NULL,
          "read" BOOLEAN NOT NULL DEFAULT false,
          "metadata" TEXT,
          "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
          CONSTRAINT "Notification_businessId_fkey" FOREIGN KEY ("businessId") REFERENCES "Business"("id") ON DELETE CASCADE ON UPDATE CASCADE
        );
      `);

      // Create indexes
      await db.$executeRawUnsafe(`
        CREATE INDEX IF NOT EXISTS "Staff_email_idx" ON "Staff"("email");
        CREATE INDEX IF NOT EXISTS "Staff_businessId_idx" ON "Staff"("businessId");
        CREATE INDEX IF NOT EXISTS "Customer_phone_idx" ON "Customer"("phone");
        CREATE INDEX IF NOT EXISTS "Customer_businessId_idx" ON "Customer"("businessId");
        CREATE INDEX IF NOT EXISTS "CustomerMemory_customerId_key_idx" ON "CustomerMemory"("customerId", "key");
        CREATE INDEX IF NOT EXISTS "CustomerMemory_businessId_idx" ON "CustomerMemory"("businessId");
        CREATE UNIQUE INDEX IF NOT EXISTS "Category_businessId_slug_key" ON "Category"("businessId", "slug");
        CREATE INDEX IF NOT EXISTS "Category_businessId_idx" ON "Category"("businessId");
        CREATE INDEX IF NOT EXISTS "Product_businessId_idx" ON "Product"("businessId");
        CREATE INDEX IF NOT EXISTS "Product_categoryId_idx" ON "Product"("categoryId");
        CREATE INDEX IF NOT EXISTS "Product_active_idx" ON "Product"("active");
        CREATE INDEX IF NOT EXISTS "Product_featured_idx" ON "Product"("featured");
        CREATE INDEX IF NOT EXISTS "Order_businessId_idx" ON "Order"("businessId");
        CREATE INDEX IF NOT EXISTS "Order_customerId_idx" ON "Order"("customerId");
        CREATE INDEX IF NOT EXISTS "Order_status_idx" ON "Order"("status");
        CREATE UNIQUE INDEX IF NOT EXISTS "Order_businessId_orderNumber_key" ON "Order"("businessId", "orderNumber");
        CREATE INDEX IF NOT EXISTS "OrderItem_orderId_idx" ON "OrderItem"("orderId");
        CREATE INDEX IF NOT EXISTS "OrderItem_productId_idx" ON "OrderItem"("productId");
        CREATE INDEX IF NOT EXISTS "Conversation_businessId_idx" ON "Conversation"("businessId");
        CREATE INDEX IF NOT EXISTS "Conversation_customerId_idx" ON "Conversation"("customerId");
        CREATE INDEX IF NOT EXISTS "Conversation_status_idx" ON "Conversation"("status");
        CREATE INDEX IF NOT EXISTS "Conversation_lastMessageAt_idx" ON "Conversation"("lastMessageAt");
        CREATE INDEX IF NOT EXISTS "Message_conversationId_idx" ON "Message"("conversationId");
        CREATE INDEX IF NOT EXISTS "Message_createdAt_idx" ON "Message"("createdAt");
        CREATE INDEX IF NOT EXISTS "DeliveryZone_businessId_idx" ON "DeliveryZone"("businessId");
        CREATE INDEX IF NOT EXISTS "PaymentMethod_businessId_idx" ON "PaymentMethod"("businessId");
        CREATE INDEX IF NOT EXISTS "FAQ_businessId_idx" ON "FAQ"("businessId");
        CREATE INDEX IF NOT EXISTS "Promotion_businessId_idx" ON "Promotion"("businessId");
        CREATE INDEX IF NOT EXISTS "Promotion_code_idx" ON "Promotion"("code");
        CREATE INDEX IF NOT EXISTS "Promotion_active_idx" ON "Promotion"("active");
        CREATE UNIQUE INDEX IF NOT EXISTS "AISetting_businessId_key" ON "AISetting"("businessId");
        CREATE INDEX IF NOT EXISTS "Analytics_businessId_idx" ON "Analytics"("businessId");
        CREATE INDEX IF NOT EXISTS "Analytics_date_idx" ON "Analytics"("date");
        CREATE UNIQUE INDEX IF NOT EXISTS "Analytics_businessId_date_metricType_key" ON "Analytics"("businessId", "date", "metricType");
        CREATE INDEX IF NOT EXISTS "Notification_businessId_idx" ON "Notification"("businessId");
        CREATE INDEX IF NOT EXISTS "Notification_read_idx" ON "Notification"("read");
        CREATE INDEX IF NOT EXISTS "Notification_createdAt_idx" ON "Notification"("createdAt");
      `);

      globalForPrisma.dbInitialized = true;
      console.log('[DB] Database tables auto-created successfully');
    } catch (error) {
      console.error('[DB] Failed to auto-create database tables:', error);
      // Don't throw - let individual routes handle the error
    }
  })();

  return initPromise;
}

// Auto-initialize on first import in serverless
if (typeof globalThis !== 'undefined') {
  // Fire and forget - don't block module import
  autoInitDatabase();
}

export { autoInitDatabase };
