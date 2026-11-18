"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

export default function CashierDashboard() {
  const router = useRouter();

  // إجبار النظام على فتح المنيو والفاتورة دائماً كصفحة أساسية عند الدخول
  const [activeTab, setActiveTab] = useState<"pos" | "revenues" | "supplies">(
    "pos",
  );
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const staffList = [
    { id: 1, name: "عبد الرحيم الضعيف", type: "حلاق" },
    { id: 2, name: "يوسف مرزوق", type: "حلاق" },
    { id: 3, name: "علال النفخ", type: "حلاق" },
    { id: 4, name: "محمد فريد عبد الدايم", type: "حلاق" },
    { id: 5, name: "يوسف لبصيلي", type: "حلاق" },
    { id: 6, name: "مراد الميموني", type: "حلاق" },
    { id: 7, name: "رشيق عبد القادر", type: "حلاق" },
    { id: 8, name: "عبد الله امشوشاد", type: "حلاق" },
    { id: 9, name: "أشرف محفاظ", type: "حلاق" },
    { id: 10, name: "محمد حقاني", type: "حلاق" },
    { id: 11, name: "إدريس بو راس", type: "حلاق" },
    { id: 12, name: "عبدالباسط عبدالكريم", type: "بديكير ومناكير" },
    { id: 13, name: "جوفين بنتاس فوري", type: "بديكير ومناكير" },
    { id: 14, name: "جويسيليو بيرون بانديولا", type: "بديكير ومناكير" },
    { id: 15, name: "جيفري بيرون بانديولا", type: "بديكير ومناكير" },
    { id: 16, name: "جويل جولاران الموجورا", type: "بديكير ومناكير" },
  ];

  // جعل الفاتورة تبدأ فارغة تماماً بدون أي خدمات افتراضية
  const [cart, setCart] = useState<
    Array<{ id: number; name: string; price: number; worker: string }>
  >([]);

  const [isProteinModalOpen, setIsProteinModalOpen] = useState(false);
  const [proteinPriceInput, setProteinPriceInput] = useState("10");
  const [pendingProteinService, setPendingProteinService] = useState<any>(null);

  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);
  const [lastReceiptData, setLastReceiptData] = useState<{
    items: any[];
    total: number;
    customerName: string;
    customerPhone: string;
    date: string;
  } | null>(null);

  const [isCustomerModalOpen, setIsCustomerModalOpen] = useState(false);
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [phoneError, setPhoneError] = useState("");
  const [nameError, setNameError] = useState("");
  const [isShaking, setIsShaking] = useState(false);

  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<"knet" | "cash" | "mixed">(
    "knet",
  );
  const [amountReceived, setAmountReceived] = useState("");
  const [cashPart, setCashPart] = useState("");

  const [dailySales, setDailySales] = useState<number>(0);
  const [dailyBookingsCount, setDailyBookingsCount] = useState<number>(0);
  const [dailyPurchases, setDailyPurchases] = useState<string>("");
  const [dailyPettyExpenses, setDailyPettyExpenses] = useState<string>("");
  const [dailyExpenses, setDailyExpenses] = useState<string>("");

  const sanitizeAmount = (value: string) => {
    let cleaned = value.replace(/[,]/g, ".").replace(/[^\d.]/g, "");
    const parts = cleaned.split(".");
    if (parts.length > 2) {
      cleaned = parts[0] + "." + parts.slice(1).join("");
    }
    return cleaned;
  };

  useEffect(() => {
    // فرض بدء التبويب على المنيو والفاتورة عند كل تحميل
    setActiveTab("pos");

    const todayStr = new Date().toDateString();
    const lastActiveDay = localStorage.getItem("salon_active_day");

    if (lastActiveDay !== todayStr) {
      localStorage.setItem("salon_active_day", todayStr);
      localStorage.setItem("salon_daily_sales", "0");
      localStorage.setItem("salon_daily_bookings", "0");
      localStorage.setItem("salon_invoices_log", JSON.stringify([]));
      setDailySales(0);
      setDailyBookingsCount(0);
    } else {
      const savedSales = localStorage.getItem("salon_daily_sales");
      if (savedSales) setDailySales(Number(savedSales));

      const savedCustomers = localStorage.getItem("salon_daily_bookings");
      if (savedCustomers) setDailyBookingsCount(Number(savedCustomers));
    }

    const savedPurchases = localStorage.getItem("salon_manual_purchases");
    if (savedPurchases) setDailyPurchases(sanitizeAmount(savedPurchases));

    const savedPetty = localStorage.getItem("salon_manual_petty");
    if (savedPetty) setDailyPettyExpenses(sanitizeAmount(savedPetty));

    const savedExp = localStorage.getItem("salon_manual_expenses");
    if (savedExp) setDailyExpenses(sanitizeAmount(savedExp));
  }, []);

  const menuServices = [
    { id: 1, name: "حلاقة شعر", price: 3, category: "حلاق" },
    { id: 2, name: "صبغ شعر", price: 5, category: "حلاق" },
    { id: 3, name: "تنعيم شعر", price: 5, category: "حلاق" },
    { id: 4, name: "تمليس شعر", price: 5, category: "حلاق" },
    { id: 5, name: "تحديد شعر", price: 1, category: "حلاق" },
    { id: 6, name: "حمام بخار للشعر", price: 3, category: "حلاق" },
    { id: 7, name: "حلاقة شعر طفل", price: 2.5, category: "حلاق" },
    { id: 8, name: "حلاقة لحية بخار سنفرة", price: 3, category: "حلاق" },
    { id: 9, name: "حلاقة لحية عادي", price: 2.5, category: "حلاق" },
    { id: 10, name: "تنظيف بشرة", price: 5, category: "حلاق" },
    { id: 11, name: "حلاقة لحية مع صبغ لحية", price: 5, category: "حلاق" },
    { id: 12, name: "صبغ لحية", price: 2.5, category: "حلاق" },
    { id: 13, name: "صبغ قفل", price: 1, category: "حلاق" },
    { id: 14, name: "تجهيز معاريس", price: 60, category: "حلاق" },
    { id: 15, name: "صبغ أطراف", price: 1, category: "حلاق" },
    { id: 16, name: "صبغ أطراف مع قفل", price: 2, category: "حلاق" },
    { id: 17, name: "شمع وجه كامل", price: 2, category: "حلاق" },
    { id: 18, name: "شمع الأنف", price: 1, category: "حلاق" },
    { id: 19, name: "شمع أذن", price: 1, category: "حلاق" },
    { id: 20, name: "لزقة خشم", price: 1, category: "حلاق" },
    { id: 21, name: "ماسك للبشرة", price: 2, category: "حلاق" },
    { id: 22, name: "بدكير", price: 4, category: "بديكير ومناكير" },
    { id: 23, name: "منكير", price: 4, category: "بديكير ومناكير" },
    { id: 24, name: "مساج ساعة", price: 10, category: "حلاق" },
    { id: 25, name: "مساج نصف ساعة", price: 6, category: "حلاق" },
    { id: 26, name: "حمام ملكي", price: 10, category: "حلاق" },
    { id: 27, name: "حمام مغربي", price: 7, category: "حلاق" },
    { id: 28, name: "بروتين للشعر يبدأ من", price: 10, category: "حلاق" },
  ];

  const [productsList, setProductsList] = useState([
    {
      id: 1,
      name: "شامبو استرخاء خاص",
      price: 6.0,
      stock: 3,
      category: "كباين",
    },
    {
      id: 2,
      name: "كريم مساج ملكي",
      price: 10.0,
      stock: 12,
      category: "كباين",
    },
    { id: 3, name: "جل شعر احترافي", price: 3.5, stock: 4, category: "صالون" },
    { id: 4, name: "زيت لحية أصلي", price: 5.0, stock: 8, category: "صالون" },
  ]);

  const [newProductName, setNewProductName] = useState("");
  const [newProductPrice, setNewProductPrice] = useState("");
  const [newProductStock, setNewProductStock] = useState("");
  const [newProductCategory, setNewProductCategory] = useState<
    "كباين" | "صالون"
  >("كباين");

  const handleAddProduct = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProductName || !newProductPrice) return;
    setProductsList([
      ...productsList,
      {
        id: Date.now(),
        name: newProductName,
        price: Number(newProductPrice),
        stock: Number(newProductStock) || 0,
        category: newProductCategory,
      },
    ]);
    setNewProductName("");
    setNewProductPrice("");
    setNewProductStock("");
  };

  const handleDeleteProduct = (id: number) => {
    setProductsList(productsList.filter((p) => p.id !== id));
  };

  const handleIncreaseStock = (id: number) => {
    setProductsList(
      productsList.map((p) => (p.id === id ? { ...p, stock: p.stock + 1 } : p)),
    );
  };

  const handleDecreaseStock = (id: number) => {
    setProductsList(
      productsList.map((p) =>
        p.id === id ? { ...p, stock: Math.max(0, p.stock - 1) } : p,
      ),
    );
  };

  const cabinProducts = productsList.filter((p) => p.category === "كباين");
  const salonProducts = productsList.filter((p) => p.category === "صالون");

  const saveAmount = (
    value: string,
    setter: (val: string) => void,
    storageKey: string,
  ) => {
    const numericValue = sanitizeAmount(value);
    setter(numericValue);
    localStorage.setItem(storageKey, numericValue);
  };

  const addToCart = (service: {
    id: number;
    name: string;
    price: number;
    category: string;
  }) => {
    if (service.name.includes("بروتين")) {
      setPendingProteinService(service);
      setProteinPriceInput("10");
      setIsProteinModalOpen(true);
      return;
    }

    addServiceToCartFinal(service, service.price);
  };

  const addServiceToCartFinal = (service: any, price: number) => {
    const filteredStaff = staffList.filter((s) => s.type === service.category);
    const defaultWorker =
      filteredStaff.length > 0 ? filteredStaff[0].name : staffList[0].name;

    setCart([
      ...cart,
      {
        id: service.id,
        name: service.name,
        price: price,
        worker: defaultWorker,
      },
    ]);
  };

  const handleConfirmProtein = () => {
    const parsed = parseFloat(proteinPriceInput);
    if (isNaN(parsed) || parsed <= 0) {
      alert("الرجاء إدخال رقم صحيح ومقبول");
      return;
    }
    if (pendingProteinService) {
      addServiceToCartFinal(pendingProteinService, parsed);
    }
    setIsProteinModalOpen(false);
    setPendingProteinService(null);
  };

  const updateWorker = (index: number, workerName: string) => {
    const newCart = [...cart];
    newCart[index].worker = workerName;
    setCart(newCart);
  };

  const removeFromCart = (index: number) => {
    const newCart = cart.filter((_, i) => i !== index);
    setCart(newCart);
  };

  const totalAmount = cart.reduce((sum, item) => sum + item.price, 0);

  const handleStartCheckout = () => {
    if (cart.length === 0) {
      alert("الرجاء إضافة خدمات للفاتورة أولاً");
      return;
    }
    setCustomerName("");
    setCustomerPhone("");
    setPhoneError("");
    setNameError("");
    setIsCustomerModalOpen(true);
  };

  const handleProceedToPayment = () => {
    setNameError("");
    setPhoneError("");

    let hasError = false;

    if (!customerName.trim()) {
      setNameError("الرجاء إدخال اسم الزبون");
      hasError = true;
    } else {
      const nameRegex = /^[\u0621-\u064A\u0646a-zA-Z\s]*$/;
      if (!nameRegex.test(customerName)) {
        setNameError("اسم الزبون يجب أن يتكون من أحرف فقط بدون أرقام أو رموز");
        hasError = true;
      }
    }

    if (!customerPhone.trim()) {
      setPhoneError("الرجاء إدخال رقم الهاتف");
      hasError = true;
    } else {
      const phoneClean = customerPhone.trim();
      const phoneRegex = /^\d{8}$/;
      if (!phoneRegex.test(phoneClean)) {
        setPhoneError("رقم الهاتف غير صحيح، يجب أن يكون 8 أرقام بالضبط");
        hasError = true;
      }
    }

    if (hasError) {
      setIsShaking(true);
      setTimeout(() => setIsShaking(false), 500);
      return;
    }

    setIsCustomerModalOpen(false);
    setAmountReceived(totalAmount.toString());
    setCashPart("");
    setIsCheckoutOpen(true);
  };

  const handleSkipCustomer = () => {
    setIsCustomerModalOpen(false);
    setAmountReceived(totalAmount.toString());
    setCashPart("");
    setIsCheckoutOpen(true);
  };

  const handleKeypad = (val: string) => {
    if (val === "C") {
      setAmountReceived("");
    } else {
      setAmountReceived((prev) => prev + val);
    }
  };

  const cashChange = Number(amountReceived) - totalAmount;
  const mixedKnetPart = totalAmount - (Number(cashPart) || 0);

  const confirmPayment = () => {
    const newSales = dailySales + totalAmount;
    const newBookings = dailyBookingsCount + 1;
    setDailySales(newSales);
    setDailyBookingsCount(newBookings);

    localStorage.setItem("salon_daily_sales", newSales.toString());
    localStorage.setItem("salon_daily_bookings", newBookings.toString());

    const existingInvoices = JSON.parse(
      localStorage.getItem("salon_invoices_log") || "[]",
    );
    const newInvoice = {
      id: Date.now(),
      customerName: customerName.trim() || "زبون عابر",
      customerPhone: customerPhone.trim() || "-",
      items: [...cart],
      total: totalAmount,
      paymentMethod,
      time: new Date().toLocaleTimeString("en-GB", {
        hour: "2-digit",
        minute: "2-digit",
      }),
    };
    localStorage.setItem(
      "salon_invoices_log",
      JSON.stringify([newInvoice, ...existingInvoices]),
    );

    const currentMonthRev = Number(
      localStorage.getItem("salon_monthly_revenue") || "0",
    );
    const updatedMonthlyRev = currentMonthRev + totalAmount;
    localStorage.setItem("salon_monthly_revenue", updatedMonthlyRev.toString());

    cart.forEach((item) => {
      const workerKey = `worker_income_${item.worker.trim()}`;
      const existingWorkerTotal = Number(
        localStorage.getItem(workerKey) || "0",
      );
      localStorage.setItem(
        workerKey,
        (existingWorkerTotal + item.price).toString(),
      );
    });

    window.dispatchEvent(new Event("storage"));

    setLastReceiptData({
      items: [...cart],
      total: totalAmount,
      customerName: customerName || "زبون عابر",
      customerPhone: customerPhone || "-",
      date: new Date().toLocaleString("en-GB"),
    });

    setIsCheckoutOpen(false);
    setIsSuccessModalOpen(true);
    setCart([]);
  };

  const handlePrintReceipt = () => {
    if (!lastReceiptData) return;
    const printWindow = window.open("", "_blank", "width=400,height=600");
    if (printWindow) {
      printWindow.document.write(`
        <html dir="rtl">
          <head>
            <title>إيصال دفع - صالون وجوه ستايل</title>
            <style>
              body { font-family: monospace; padding: 20px; text-align: right; width: 280px; margin: auto; color: #000; }
              .center { text-align: center; }
              .bold { font-weight: bold; }
              .line { border-bottom: 1px dashed #000; margin: 10px 0; }
              .flex { display: flex; justify-content: space-between; font-size: 13px; margin: 4px 0; }
            </style>
          </head>
          <body>
            <div class="center bold" style="font-size: 16px;">صالون وجوه ستايل للرجال</div>
            <div class="center" style="font-size: 11px;">إيصال خدمة / فاتورة مبيعات</div>
            <div class="center" style="font-size: 10px; margin-top: 4px;">${lastReceiptData.date}</div>
            <div class="line"></div>
            <div style="font-size: 12px;">
              <div><strong>الزبون:</strong> ${lastReceiptData.customerName}</div>
              <div><strong>الهاتف:</strong> ${lastReceiptData.customerPhone}</div>
            </div>
            <div class="line"></div>
            <div>
              ${lastReceiptData.items
                .map(
                  (it) => `
                <div class="flex">
                  <span>${it.name} (${it.worker})</span>
                  <span class="bold">${it.price} د.ك</span>
                </div>
              `,
                )
                .join("")}
            </div>
            <div class="line"></div>
            <div class="flex bold" style="font-size: 15px;">
              <span>الإجمالي الكلي:</span>
              <span>${lastReceiptData.total} د.ك</span>
            </div>
            <div class="line"></div>
            <div class="center" style="font-size: 11px; margin-top: 15px;">
              شكراً لزيارتكم صالون وجوه ستايل ✓
            </div>
          </body>
        </html>
      `);
      printWindow.document.close();
      printWindow.focus();
      setTimeout(() => {
        printWindow.print();
        printWindow.close();
      }, 500);
    }
  };

  return (
    <div
      dir="rtl"
      className="min-h-screen bg-slate-100 flex flex-col select-none font-sans relative"
    >
      <style jsx global>{`
        @keyframes shake {
          0%,
          100% {
            transform: translateX(0);
          }
          20%,
          60% {
            transform: translateX(-8px);
          }
          40%,
          80% {
            transform: translateX(8px);
          }
        }
        .animate-shake {
          animation: shake 0.4s ease-in-out;
        }
      `}</style>

      <header className="bg-slate-900 text-white px-6 py-3.5 flex items-center justify-between shadow-sm z-30">
        <div className="flex items-center gap-4">
          <button
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="text-white hover:text-amber-400 p-1.5 rounded-lg bg-slate-800 border border-slate-700 cursor-pointer flex items-center justify-center"
            title="القائمة الجانبية"
          >
            <span className="text-lg font-bold">☰</span>
          </button>
          <div className="flex items-center gap-3">
            <span className="text-xs bg-amber-500 text-slate-900 font-bold px-2.5 py-1 rounded-md">
              POS
            </span>
            <h1 className="text-base font-bold tracking-wide">
              صالون وجوه ستايل للرجال - الكاشير
            </h1>
          </div>
        </div>

        <button
          onClick={() => router.push("/")}
          className="text-xs bg-slate-800 hover:bg-slate-700 text-slate-200 px-3.5 py-1.5 rounded-lg border border-slate-700 transition-colors cursor-pointer"
        >
          ← تسجيل الخروج
        </button>
      </header>

      {isSidebarOpen && (
        <div className="fixed inset-0 z-40 flex">
          <div
            className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs"
            onClick={() => setIsSidebarOpen(false)}
          ></div>
          <div className="relative bg-slate-900 text-white w-72 p-6 flex flex-col justify-between shadow-2xl z-50 border-r border-slate-800">
            <div>
              <div className="flex items-center justify-between pb-4 border-b border-slate-800 mb-6">
                <h2 className="font-bold text-base text-amber-400">
                  قائمة الكاشير
                </h2>
                <button
                  onClick={() => setIsSidebarOpen(false)}
                  className="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 flex items-center justify-center text-slate-300 font-bold cursor-pointer"
                >
                  ✕
                </button>
              </div>

              <nav className="space-y-2">
                <button
                  onClick={() => {
                    setActiveTab("pos");
                    setIsSidebarOpen(false);
                  }}
                  className={`w-full text-right px-4 py-3 rounded-xl font-bold text-sm transition-colors cursor-pointer flex items-center gap-3 ${
                    activeTab === "pos"
                      ? "bg-amber-500 text-slate-900"
                      : "bg-slate-800/60 hover:bg-slate-800 text-slate-200"
                  }`}
                >
                  <span>🧾</span> المنيو والفاتورة
                </button>
                <button
                  onClick={() => {
                    setActiveTab("revenues");
                    setIsSidebarOpen(false);
                  }}
                  className={`w-full text-right px-4 py-3 rounded-xl font-bold text-sm transition-colors cursor-pointer flex items-center gap-3 ${
                    activeTab === "revenues"
                      ? "bg-amber-500 text-slate-900"
                      : "bg-slate-800/60 hover:bg-slate-800 text-slate-200"
                  }`}
                >
                  <span>📊</span> الإحصائيات العامة
                </button>
                <button
                  onClick={() => {
                    setActiveTab("supplies");
                    setIsSidebarOpen(false);
                  }}
                  className={`w-full text-right px-4 py-3 rounded-xl font-bold text-sm transition-colors cursor-pointer flex items-center gap-3 ${
                    activeTab === "supplies"
                      ? "bg-amber-500 text-slate-900"
                      : "bg-slate-800/60 hover:bg-slate-800 text-slate-200"
                  }`}
                >
                  <span>📦</span> إدارة المنتجات
                </button>
              </nav>
            </div>

            <div className="pt-4 border-t border-slate-800 text-xs text-slate-400 text-center">
              صالون وجوه ستايل © 2026
            </div>
          </div>
        </div>
      )}

      {activeTab === "pos" && (
        <main className="flex-1 p-4 sm:p-6 grid grid-cols-1 lg:grid-cols-12 gap-6 max-w-7xl mx-auto w-full">
          <section className="lg:col-span-8 bg-white rounded-2xl p-6 shadow-xs border border-slate-200 flex flex-col">
            <div className="mb-6 flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h2 className="font-bold text-slate-800 text-lg">
                  المنيو (الخدمات والأسعار)
                </h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  انقر على الخدمة لإضافتها للفاتورة مباشرة
                </p>
              </div>
              <span className="text-xs bg-amber-50 text-amber-800 px-3 py-1 rounded-full font-medium border border-amber-200">
                {menuServices.length} خدمة متوفرة
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3.5 max-h-[520px] overflow-y-auto pr-1">
              {menuServices.map((srv) => (
                <button
                  key={srv.id}
                  onClick={() => addToCart(srv)}
                  className="bg-slate-50 hover:bg-amber-50/40 border border-slate-200 hover:border-amber-400 p-4 rounded-xl flex flex-col items-center justify-between text-center transition-all duration-200 group shadow-2xs hover:shadow-md cursor-pointer min-h-[90px]"
                >
                  <h3 className="font-bold text-slate-800 text-xs sm:text-sm group-hover:text-amber-700 line-clamp-2">
                    {srv.name}
                  </h3>
                  <span className="text-xs font-extrabold text-amber-700 bg-amber-100/70 px-2.5 py-0.5 rounded-full mt-2">
                    {srv.name.includes("بروتين")
                      ? "يبدأ من 10 د.ك"
                      : `${srv.price} د.ك`}
                  </span>
                </button>
              ))}
            </div>
          </section>

          <section className="lg:col-span-4 bg-white rounded-2xl p-5 shadow-xs border border-slate-200 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
                <h2 className="font-bold text-slate-800 text-lg">
                  الفاتورة الحالية
                </h2>
                <span className="text-xs bg-slate-100 text-slate-600 px-2.5 py-1 rounded-full font-medium">
                  {cart.length} خدمات
                </span>
              </div>

              <div className="space-y-3 max-h-[350px] overflow-y-auto pl-1">
                {cart.length === 0 ? (
                  <div className="text-center py-16 text-slate-400 text-sm">
                    لم يتم اختيار أي خدمة بعد (الفاتورة فارغة)
                  </div>
                ) : (
                  cart.map((item, index) => {
                    const isPedicure =
                      item.name.includes("بدكير") ||
                      item.name.includes("منكير");
                    const allowedType = isPedicure ? "بديكير ومناكير" : "حلاق";
                    const filteredStaffForService = staffList.filter(
                      (s) => s.type === allowedType,
                    );

                    return (
                      <div
                        key={index}
                        className="bg-slate-50 p-3 rounded-xl border border-slate-200/80 space-y-2"
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-slate-800 text-xs sm:text-sm">
                            {item.name}
                          </span>
                          <div className="flex items-center gap-3">
                            <span className="font-bold text-amber-600 text-xs sm:text-sm">
                              {item.price} د.ك
                            </span>
                            <button
                              onClick={() => removeFromCart(index)}
                              className="text-red-400 hover:text-red-600 text-xs px-1.5 py-0.5 rounded font-bold cursor-pointer"
                            >
                              ✕
                            </button>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 pt-1 border-t border-slate-200/60">
                          <span className="text-[11px] text-slate-500 font-medium">
                            المسؤول:
                          </span>
                          <select
                            value={item.worker}
                            onChange={(e) =>
                              updateWorker(index, e.target.value)
                            }
                            className="w-full text-xs bg-white border border-slate-300 rounded-lg p-1 text-slate-800 font-medium focus:outline-none focus:border-amber-500 cursor-pointer"
                          >
                            {filteredStaffForService.map((worker) => (
                              <option key={worker.id} value={worker.name}>
                                {worker.name} ({worker.type})
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>

            <div className="pt-4 border-t border-slate-100 mt-3 space-y-3">
              <div className="flex items-center justify-between text-base sm:text-lg font-extrabold text-slate-900 bg-amber-50/60 p-3.5 rounded-xl border border-amber-200/50">
                <span>الإجمالي:</span>
                <span className="text-amber-700">{totalAmount} د.ك</span>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => setCart([])}
                  className="w-full bg-slate-100 hover:bg-slate-200 text-slate-700 py-3 rounded-xl font-bold text-sm transition-colors cursor-pointer"
                >
                  مسح
                </button>
                <button
                  onClick={handleStartCheckout}
                  className="w-full bg-emerald-600 hover:bg-emerald-700 text-white py-3 rounded-xl font-bold text-sm transition-colors shadow-sm cursor-pointer"
                >
                  إتمام الدفع ✓
                </button>
              </div>
            </div>
          </section>
        </main>
      )}

      {activeTab === "revenues" && (
        <main className="flex-1 p-4 sm:p-8 max-w-7xl mx-auto w-full">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            <div className="bg-slate-900 text-white p-6 rounded-2xl shadow-md border border-slate-800 flex flex-col justify-between min-h-[130px]">
              <span className="text-xs font-bold text-slate-400">
                مبيعات اليوم
              </span>
              <div className="mt-3">
                <span className="text-2xl sm:text-3xl font-black text-amber-400">
                  {dailySales} <span className="text-sm font-bold">د.ك</span>
                </span>
              </div>
            </div>

            <div className="bg-slate-900 text-white p-6 rounded-2xl shadow-md border border-slate-800 flex flex-col justify-between min-h-[130px]">
              <span className="text-xs font-bold text-slate-400">
                فواتير اليوم
              </span>
              <div className="mt-3">
                <span className="text-2xl sm:text-3xl font-black text-amber-400">
                  {dailyBookingsCount}{" "}
                  <span className="text-sm font-bold text-slate-400">
                    فواتير
                  </span>
                </span>
              </div>
            </div>

            <div className="bg-slate-900 text-white p-6 rounded-2xl shadow-md border border-slate-800 flex flex-col justify-between min-h-[130px]">
              <span className="text-xs font-bold text-slate-400">
                مشتريات اليوم
              </span>
              <div className="mt-2 flex items-center gap-2">
                <input
                  type="text"
                  inputMode="decimal"
                  placeholder="0"
                  value={dailyPurchases}
                  onChange={(e) =>
                    saveAmount(
                      e.target.value,
                      setDailyPurchases,
                      "salon_manual_purchases",
                    )
                  }
                  className="bg-slate-800 border border-slate-700 rounded-xl p-2.5 text-amber-400 font-bold text-lg w-full focus:outline-none focus:border-amber-500"
                />
                <span className="text-sm font-bold text-slate-400 shrink-0">
                  د.ك
                </span>
              </div>
            </div>

            <div className="bg-slate-900 text-white p-6 rounded-2xl shadow-md border border-slate-800 flex flex-col justify-between min-h-[130px]">
              <span className="text-xs font-bold text-slate-400">
                المصروفات النثرية اليوم
              </span>
              <div className="mt-2 flex items-center gap-2">
                <input
                  type="text"
                  inputMode="decimal"
                  placeholder="0"
                  value={dailyPettyExpenses}
                  onChange={(e) =>
                    saveAmount(
                      e.target.value,
                      setDailyPettyExpenses,
                      "salon_manual_petty",
                    )
                  }
                  className="bg-slate-800 border border-slate-700 rounded-xl p-2.5 text-amber-400 font-bold text-lg w-full focus:outline-none focus:border-amber-500"
                />
                <span className="text-sm font-bold text-slate-400 shrink-0">
                  د.ك
                </span>
              </div>
            </div>

            <div className="bg-slate-900 text-white p-6 rounded-2xl shadow-md border border-slate-800 flex flex-col justify-between min-h-[130px]">
              <span className="text-xs font-bold text-slate-400">
                مصروفات اليوم
              </span>
              <div className="mt-2 flex items-center gap-2">
                <input
                  type="text"
                  inputMode="decimal"
                  placeholder="0"
                  value={dailyExpenses}
                  onChange={(e) =>
                    saveAmount(
                      e.target.value,
                      setDailyExpenses,
                      "salon_manual_expenses",
                    )
                  }
                  className="bg-slate-800 border border-slate-700 rounded-xl p-2.5 text-amber-400 font-bold text-lg w-full focus:outline-none focus:border-amber-500"
                />
                <span className="text-sm font-bold text-slate-400 shrink-0">
                  د.ك
                </span>
              </div>
            </div>
          </div>
        </main>
      )}

      {activeTab === "supplies" && (
        <main className="flex-1 p-4 sm:p-8 max-w-7xl mx-auto w-full space-y-8">
          <div className="bg-white rounded-2xl p-6 shadow-xs border border-slate-200">
            <h3 className="font-bold text-slate-800 text-base mb-4">
              إضافة منتج جديد للمخزون
            </h3>
            <form
              onSubmit={handleAddProduct}
              className="grid grid-cols-1 sm:grid-cols-5 gap-3"
            >
              <input
                type="text"
                placeholder="اسم المنتج"
                value={newProductName}
                onChange={(e) => setNewProductName(e.target.value)}
                className="bg-slate-50 border border-slate-300 rounded-xl p-3 text-sm text-slate-800 focus:outline-none focus:border-amber-500"
              />
              <select
                value={newProductCategory}
                onChange={(e) =>
                  setNewProductCategory(e.target.value as "كباين" | "صالون")
                }
                className="bg-slate-50 border border-slate-300 rounded-xl p-3 text-sm text-slate-800 focus:outline-none focus:border-amber-500"
              >
                <option value="كباين">منتجات الكباين</option>
                <option value="صالون">منتجات الصالون</option>
              </select>
              <input
                type="text"
                inputMode="decimal"
                placeholder="السعر (د.ك)"
                value={newProductPrice}
                onChange={(e) =>
                  setNewProductPrice(sanitizeAmount(e.target.value))
                }
                className="bg-slate-50 border border-slate-300 rounded-xl p-3 text-sm text-slate-800 focus:outline-none focus:border-amber-500"
              />
              <input
                type="text"
                inputMode="numeric"
                placeholder="الكمية"
                value={newProductStock}
                onChange={(e) =>
                  setNewProductStock(e.target.value.replace(/[^\d]/g, ""))
                }
                className="bg-slate-50 border border-slate-300 rounded-xl p-3 text-sm text-slate-800 focus:outline-none focus:border-amber-500"
              />
              <button
                type="submit"
                className="bg-amber-500 hover:bg-amber-600 text-slate-900 font-bold rounded-xl p-3 text-sm transition-colors cursor-pointer shadow-sm"
              >
                إضافة المنتج ✓
              </button>
            </form>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-xs border border-slate-200">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-4">
              <h3 className="font-bold text-slate-800 text-lg">
                🧴 منتجات الكباين
              </h3>
              <span className="text-xs bg-amber-50 text-amber-800 px-3 py-1 rounded-full font-medium border border-amber-200">
                {cabinProducts.length} منتجات
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-right text-xs sm:text-sm">
                <thead>
                  <tr className="bg-slate-50 text-slate-500 border-b border-slate-200">
                    <th className="p-3 font-bold rounded-r-xl">اسم المنتج</th>
                    <th className="p-3 font-bold">السعر</th>
                    <th className="p-3 font-bold">
                      الكمية بالمخزون (تعديل سريع)
                    </th>
                    <th className="p-3 font-bold rounded-l-xl text-center">
                      إدارة
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {cabinProducts.map((prod) => (
                    <tr
                      key={prod.id}
                      className="hover:bg-slate-50/60 transition-colors"
                    >
                      <td className="p-3.5 font-bold text-slate-800">
                        {prod.name}
                      </td>
                      <td className="p-3.5 font-bold text-amber-700">
                        {prod.price} د.ك
                      </td>
                      <td className="p-3.5">
                        <div className="flex items-center gap-3">
                          <span className="font-bold px-3 py-1 rounded-full text-xs bg-slate-100 text-slate-700">
                            {prod.stock} حبة
                          </span>
                          <div className="flex items-center gap-1">
                            <button
                              onClick={() => handleDecreaseStock(prod.id)}
                              className="w-7 h-7 bg-slate-200 hover:bg-slate-300 text-slate-800 rounded-lg font-bold flex items-center justify-center cursor-pointer transition-colors"
                              title="نقصان (-1)"
                            >
                              -
                            </button>
                            <button
                              onClick={() => handleIncreaseStock(prod.id)}
                              className="w-7 h-7 bg-amber-500 hover:bg-amber-600 text-slate-900 rounded-lg font-bold flex items-center justify-center cursor-pointer transition-colors"
                              title="زيادة (+1)"
                            >
                              +
                            </button>
                          </div>
                        </div>
                      </td>
                      <td className="p-3.5 text-center">
                        <button
                          onClick={() => handleDeleteProduct(prod.id)}
                          className="bg-red-50 hover:bg-red-100 text-red-600 px-3 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer"
                        >
                          حذف 🗑️
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-xs border border-slate-200">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-4">
              <h3 className="font-bold text-slate-800 text-lg">
                🛍️ منتجات الصالون
              </h3>
              <span className="text-xs bg-amber-50 text-amber-800 px-3 py-1 rounded-full font-medium border border-amber-200">
                {salonProducts.length} منتجات
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-right text-xs sm:text-sm">
                <thead>
                  <tr className="bg-slate-50 text-slate-500 border-b border-slate-200">
                    <th className="p-3 font-bold rounded-r-xl">اسم المنتج</th>
                    <th className="p-3 font-bold">السعر</th>
                    <th className="p-3 font-bold">
                      الكمية بالمخزون (تعديل سريع)
                    </th>
                    <th className="p-3 font-bold rounded-l-xl text-center">
                      إدارة
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {salonProducts.map((prod) => (
                    <tr
                      key={prod.id}
                      className="hover:bg-slate-50/60 transition-colors"
                    >
                      <td className="p-3.5 font-bold text-slate-800">
                        {prod.name}
                      </td>
                      <td className="p-3.5 font-bold text-amber-700">
                        {prod.price} د.ك
                      </td>
                      <td className="p-3.5">
                        <div className="flex items-center gap-3">
                          <span className="font-bold px-3 py-1 rounded-full text-xs bg-slate-100 text-slate-700">
                            {prod.stock} حبة
                          </span>
                          <div className="flex items-center gap-1">
                            <button
                              onClick={() => handleDecreaseStock(prod.id)}
                              className="w-7 h-7 bg-slate-200 hover:bg-slate-300 text-slate-800 rounded-lg font-bold flex items-center justify-center cursor-pointer transition-colors"
                              title="نقصان (-1)"
                            >
                              -
                            </button>
                            <button
                              onClick={() => handleIncreaseStock(prod.id)}
                              className="w-7 h-7 bg-amber-500 hover:bg-amber-600 text-slate-900 rounded-lg font-bold flex items-center justify-center cursor-pointer transition-colors"
                              title="زيادة (+1)"
                            >
                              +
                            </button>
                          </div>
                        </div>
                      </td>
                      <td className="p-3.5 text-center">
                        <button
                          onClick={() => handleDeleteProduct(prod.id)}
                          className="bg-red-50 hover:bg-red-100 text-red-600 px-3 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer"
                        >
                          حذف 🗑️
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </main>
      )}

      {isProteinModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-slate-900 text-white rounded-3xl p-6 sm:p-8 w-full max-w-md shadow-2xl border border-slate-800">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800 mb-5">
              <div>
                <h3 className="text-lg font-bold text-white">
                  تحديد سعر بروتين الشعر
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  أدخل القيمة المطلوبة للخدمة يدوياً (د.ك)
                </p>
              </div>
              <button
                onClick={() => setIsProteinModalOpen(false)}
                className="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 flex items-center justify-center text-slate-300 font-bold cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">
                  القيمة (د.ك):
                </label>
                <input
                  type="text"
                  inputMode="decimal"
                  placeholder="10"
                  value={proteinPriceInput}
                  onChange={(e) =>
                    setProteinPriceInput(sanitizeAmount(e.target.value))
                  }
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl p-3 text-lg font-bold text-amber-400 focus:outline-none focus:border-amber-500 text-center font-mono"
                  autoFocus
                />
              </div>

              <div className="grid grid-cols-2 gap-3 pt-3">
                <button
                  onClick={() => setIsProteinModalOpen(false)}
                  className="w-full bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold py-3 rounded-xl text-sm cursor-pointer border border-slate-700"
                >
                  إلغاء ✕
                </button>
                <button
                  onClick={handleConfirmProtein}
                  className="w-full bg-amber-500 hover:bg-amber-600 text-slate-900 font-extrabold py-3 rounded-xl text-sm shadow-sm cursor-pointer"
                >
                  تأكيد وإضافة ✓
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {isSuccessModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-slate-900 text-white rounded-3xl p-6 sm:p-8 w-full max-w-md shadow-2xl border border-slate-800 text-center space-y-4">
            <div className="w-16 h-16 bg-emerald-500/20 text-emerald-400 rounded-full flex items-center justify-center mx-auto text-3xl font-bold border border-emerald-500/30">
              ✓
            </div>
            <div>
              <h3 className="text-xl font-bold text-white">
                تم إتمام الدفع بنجاح
              </h3>
              <p className="text-xs text-slate-400 mt-1">
                تمت طباعة الفاتورة وتسجيل المبيعات في الإحصائيات العامة ومداخيل
                العمالة وسجل الفواتير بنجاح.
              </p>
            </div>
            <div className="grid grid-cols-2 gap-3 pt-2">
              <button
                onClick={handlePrintReceipt}
                className="w-full bg-slate-800 hover:bg-slate-700 text-amber-400 font-bold py-3 rounded-xl text-sm cursor-pointer border border-slate-700"
              >
                🖨️ طباعة الإيصال
              </button>
              <button
                onClick={() => setIsSuccessModalOpen(false)}
                className="w-full bg-amber-500 hover:bg-amber-600 text-slate-900 font-extrabold py-3 rounded-xl text-sm shadow-sm cursor-pointer"
              >
                حسناً ✓
              </button>
            </div>
          </div>
        </div>
      )}

      {isCustomerModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div
            className={`bg-white rounded-3xl p-6 sm:p-8 w-full max-w-md shadow-2xl border transition-all duration-200 ${
              isShaking
                ? "animate-shake border-red-500 ring-4 ring-red-100"
                : "border-slate-200"
            }`}
          >
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-5">
              <div>
                <h3 className="text-lg font-bold text-slate-800">
                  بيانات الزبون <span className="text-red-500">*</span>
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  الرجاء إدخال اسم ورقم هاتف الزبون (إجباري للمتابعة)
                </p>
              </div>
              <button
                onClick={() => setIsCustomerModalOpen(false)}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-600 font-bold cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  اسم الزبون:
                </label>
                <input
                  type="text"
                  placeholder="أدخل اسم الزبون (أحرف فقط)"
                  value={customerName}
                  onChange={(e) => {
                    setCustomerName(e.target.value);
                    setNameError("");
                  }}
                  className={`w-full bg-slate-50 border rounded-xl p-3 text-sm text-slate-800 focus:outline-none ${
                    nameError
                      ? "border-red-500 bg-red-50/30"
                      : "border-slate-300"
                  }`}
                />
                {nameError && (
                  <p className="text-xs text-red-500 mt-1 font-medium">
                    {nameError}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  رقم الهاتف:
                </label>
                <input
                  type="tel"
                  maxLength={8}
                  placeholder="رقم الهاتف (8 أرقام بالضبط)"
                  value={customerPhone}
                  onChange={(e) => {
                    setCustomerPhone(e.target.value);
                    setPhoneError("");
                  }}
                  className={`w-full bg-slate-50 border rounded-xl p-3 text-sm text-slate-800 focus:outline-none ${
                    phoneError
                      ? "border-red-500 bg-red-50/30"
                      : "border-slate-300"
                  }`}
                />
                {phoneError && (
                  <p className="text-xs text-red-500 mt-1 font-medium">
                    {phoneError}
                  </p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-3 pt-3">
                <button
                  onClick={handleSkipCustomer}
                  className="w-full bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold py-3 rounded-xl text-sm cursor-pointer"
                >
                  تخطي ✕
                </button>
                <button
                  onClick={handleProceedToPayment}
                  className="w-full bg-amber-500 hover:bg-amber-600 text-slate-900 font-extrabold py-3 rounded-xl text-sm shadow-sm cursor-pointer"
                >
                  متابعة للدفع ✓
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {isCheckoutOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-slate-900 text-white rounded-3xl p-6 w-full max-w-xl shadow-2xl border border-slate-800">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800 mb-5">
              <h3 className="text-xl font-bold text-white">الدفع</h3>
              <button
                onClick={() => setIsCheckoutOpen(false)}
                className="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 flex items-center justify-center text-slate-300 font-bold cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between bg-slate-800/80 p-4 rounded-2xl border border-slate-700">
                <span className="text-slate-400 font-medium">
                  الإجمالي المطلوب:
                </span>
                <span className="text-2xl font-black text-amber-400">
                  {totalAmount} د.ك
                </span>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <button
                  onClick={() => setPaymentMethod("knet")}
                  className={`py-2.5 rounded-xl font-bold text-sm border transition-all cursor-pointer ${
                    paymentMethod === "knet"
                      ? "bg-amber-500 text-slate-900 border-amber-500"
                      : "bg-slate-800 text-slate-300 border-slate-700"
                  }`}
                >
                  💳 كي نت
                </button>
                <button
                  onClick={() => setPaymentMethod("cash")}
                  className={`py-2.5 rounded-xl font-bold text-sm border transition-all cursor-pointer ${
                    paymentMethod === "cash"
                      ? "bg-amber-500 text-slate-900 border-amber-500"
                      : "bg-slate-800 text-slate-300 border-slate-700"
                  }`}
                >
                  💵 نقداً (كاش)
                </button>
                <button
                  onClick={() => setPaymentMethod("mixed")}
                  className={`py-2.5 rounded-xl font-bold text-sm border transition-all cursor-pointer ${
                    paymentMethod === "mixed"
                      ? "bg-amber-500 text-slate-900 border-amber-500"
                      : "bg-slate-800 text-slate-300 border-slate-700"
                  }`}
                >
                  🔀 مختلط (كاش + كي نت)
                </button>
              </div>

              {paymentMethod === "cash" && (
                <div className="space-y-3 bg-slate-800/50 p-4 rounded-2xl border border-slate-800">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-slate-400 font-medium">
                      المبلغ المستلم من الزبون:
                    </span>
                    <span className="text-lg font-bold text-amber-400">
                      {amountReceived || "0"} د.ك
                    </span>
                  </div>

                  <div className="grid grid-cols-4 gap-2 pt-2">
                    {["1", "2", "3", "5", "10", "20", "50", "C"].map((btn) => (
                      <button
                        key={btn}
                        onClick={() => handleKeypad(btn)}
                        className="bg-slate-800 hover:bg-slate-700 text-white font-bold py-2.5 rounded-xl border border-slate-700 text-sm cursor-pointer"
                      >
                        {btn}
                      </button>
                    ))}
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-slate-700 text-sm">
                    <span className="text-slate-400">الباقي للزبون:</span>
                    <span className="font-bold text-emerald-400">
                      {cashChange >= 0 ? `${cashChange} د.ك` : "المبلغ غير كاف"}
                    </span>
                  </div>
                </div>
              )}

              {paymentMethod === "mixed" && (
                <div className="space-y-3 bg-slate-800/50 p-4 rounded-2xl border border-slate-800 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-300 font-medium">
                      المبلغ المدفوع نقداً (كاش):
                    </span>
                    <input
                      type="number"
                      placeholder="أدخل مبلغ الكاش"
                      value={cashPart}
                      onChange={(e) => setCashPart(e.target.value)}
                      className="bg-slate-900 border border-slate-700 rounded-lg p-2 text-amber-400 font-bold text-sm w-32 text-center"
                    />
                  </div>
                  <div className="flex items-center justify-between pt-2 border-t border-slate-700 text-sm">
                    <span className="text-slate-300">
                      المبلغ الباقي يُدفع عبر (كي نت):
                    </span>
                    <span className="font-bold text-emerald-400">
                      {mixedKnetPart >= 0 ? `${mixedKnetPart} د.ك` : "0 د.ك"}
                    </span>
                  </div>
                </div>
              )}

              <button
                onClick={confirmPayment}
                className="w-full bg-amber-500 hover:bg-amber-600 text-slate-900 font-extrabold py-3.5 rounded-2xl transition-all shadow-lg text-base cursor-pointer"
              >
                تأكيد الدفع ({totalAmount} د.ك) ✓
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
