"use client"

import { useState } from "react"
import { ThemeProvider } from "next-themes"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { Toaster } from "sonner"
import { DashboardLayout } from "@/components/layout/DashboardLayout"
import DashboardSection from "@/components/sections/DashboardSection"
import ProductsSection from "@/components/sections/ProductsSection"
import CategoriesSection from "@/components/sections/CategoriesSection"
import OrdersSection from "@/components/sections/OrdersSection"
import CustomersSection from "@/components/sections/CustomersSection"
import ConversationsSection from "@/components/sections/ConversationsSection"
import AISettingsSection from "@/components/sections/AISettingsSection"
import DeliverySection from "@/components/sections/DeliverySection"
import PaymentsSection from "@/components/sections/PaymentsSection"
import PromotionsSection from "@/components/sections/PromotionsSection"
import FAQSection from "@/components/sections/FAQSection"
import AnalyticsSection from "@/components/sections/AnalyticsSection"
import StaffSection from "@/components/sections/StaffSection"
import SettingsSection from "@/components/sections/SettingsSection"
import NotificationsSection from "@/components/sections/NotificationsSection"
import type { NavSection } from "@/components/layout/Header"

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30 * 1000,
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
})

function AppContent() {
  const [activeSection, setActiveSection] = useState<NavSection>("dashboard")

  const renderSection = () => {
    switch (activeSection) {
      case "dashboard":
        return <DashboardSection />
      case "products":
        return <ProductsSection />
      case "categories":
        return <CategoriesSection />
      case "orders":
        return <OrdersSection />
      case "customers":
        return <CustomersSection />
      case "conversations":
        return <ConversationsSection />
      case "ai-sales":
        return <AISettingsSection />
      case "delivery":
        return <DeliverySection />
      case "payments":
        return <PaymentsSection />
      case "promotions":
        return <PromotionsSection />
      case "faq":
        return <FAQSection />
      case "analytics":
        return <AnalyticsSection />
      case "staff":
        return <StaffSection />
      case "settings":
        return <SettingsSection />
      case "notifications":
        return <NotificationsSection />
      default:
        return <DashboardSection />
    }
  }

  return (
    <DashboardLayout activeSection={activeSection} onSectionChange={setActiveSection}>
      {renderSection()}
    </DashboardLayout>
  )
}

export default function Home() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
        <AppContent />
        <Toaster richColors position="top-right" />
      </ThemeProvider>
    </QueryClientProvider>
  )
}
