"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

interface StaffMember {
  id: number;
  name: string;
  type: string;
  residencyExpiry: string;
}

interface MonthlyArchive {
  monthKey: string;
  monthName: string;
  totalRevenue: number;
  periodRange?: string;
  isManual?: boolean;
  archivedTime?: string;
}

interface DailyArchiveLog {
  dateStr: string;
  sales: number;
  bookings: number;
  purchases: number;
  petty: number;
  expenses: number;
}

interface InvoiceItem {
  name: string;
  price: number;
  worker: string;
}

interface InvoiceLog {
  id: number;
  customerName: string;
  customerPhone: string;
  items: InvoiceItem[];
  total: number;
  paymentMethod: string;
  time: string;
}

const DEFAULT_STAFF_USERS = [
  { id: "majed", name: "ماجد", roleLabel: "المدير" },
  { id: "abualhamad", name: "ابوالحمد علي", roleLabel: "كاشير" },
  { id: "hazem", name: "حازم بكرى", roleLabel: "كاشير" },
];

const DEFAULT_MONTHLY_ARCHIVES: MonthlyArchive[] = [
  {
    monthKey: "2026-10",
    monthName: "أكتوبر 2026",
    totalRevenue: 3450.0,
    periodRange: "من 01/10/2026 إلى 31/10/2026",
    isManual: false,
  },
  {
    monthKey: "2026-09",
    monthName: "سبتمبر 2026",
    totalRevenue: 3120.5,
    periodRange: "من 01/09/2026 إلى 30/09/2026",
    isManual: false,
  },
];

const MONTH_NAMES_AR = [
  "يناير",
  "فبراير",
  "مارس",
  "أبريل",
  "مايو",
  "يونيو",
  "يوليو",
  "أغسطس",
  "سبتمبر",
  "أكتوبر",
  "نوفمبر",
  "ديسمبر",
];

const formatDateDDMMYYYY = (date: Date) => {
  const dd = String(date.getDate()).padStart(2, "0");
  const mm = String(date.getMonth() + 1).padStart(2, "0");
  const yyyy = date.getFullYear();
  return `${dd}/${mm}/${yyyy}`;
};

export default function OwnerDashboard() {
  const router = useRouter();

  const [activeMenu, setActiveMenu] = useState<
    | "overview"
    | "staff"
    | "monthly_income"
    | "products"
    | "archive"
    | "invoices"
    | "daily_archive"
    | "security"
  >("overview");

  const [editingUserId, setEditingUserId] = useState<string | null>(null);
  const [newUserPinValue, setNewUserPinValue] = useState("");

  const [monthlyArchives, setMonthlyArchives] = useState<MonthlyArchive[]>(
    DEFAULT_MONTHLY_ARCHIVES,
  );

  const [dailyArchivesList, setDailyArchivesList] = useState<DailyArchiveLog[]>(
    [],
  );

  const [ownerStats, setOwnerStats] = useState({
    monthlyRevenue: 0,
    dailySales: 0,
    dailyBookings: 0,
    dailyPurchases: 0,
    dailyIncidentalExpenses: 0,
    dailyExpenses: 0,
  });

  const [invoicesLog, setInvoicesLog] = useState<InvoiceLog[]>([]);

  const [customModal, setCustomModal] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    type: "alert" | "confirm";
    onConfirm?: () => void;
  }>({
    isOpen: false,
    title: "",
    message: "",
    type: "alert",
  });

  const showAlert = (title: string, message: string) => {
    setCustomModal({ isOpen: true, title, message, type: "alert" });
  };

  const showConfirm = (
    title: string,
    message: string,
    onConfirm: () => void,
  ) => {
    setCustomModal({
      isOpen: true,
      title,
      message,
      type: "confirm",
      onConfirm,
    });
  };

  const loadOwnerData = () => {
    const savedSales = Number(localStorage.getItem("salon_daily_sales") || "0");
    const savedBookings = Number(
      localStorage.getItem("salon_daily_bookings") || "0",
    );

    let savedMonthlyRev = Number(
      localStorage.getItem("salon_monthly_revenue") || "0",
    );
    if (
      !localStorage.getItem("salon_rev_cleaned_v1") &&
      (savedMonthlyRev === 3196.1 || savedMonthlyRev === 3269.1)
    ) {
      savedMonthlyRev = savedSales;
      localStorage.setItem("salon_monthly_revenue", savedMonthlyRev.toString());
      localStorage.setItem("salon_rev_cleaned_v1", "true");
    }

    const savedPurchases = Number(
      localStorage.getItem("salon_manual_purchases") || "0",
    );
    const savedIncidental = Number(
      localStorage.getItem("salon_manual_petty") || "0",
    );
    const savedExpenses = Number(
      localStorage.getItem("salon_manual_expenses") || "0",
    );

    const savedLog = JSON.parse(
      localStorage.getItem("salon_invoices_log") || "[]",
    );
    const savedDailyHist = JSON.parse(
      localStorage.getItem("salon_daily_history_archive") || "[]",
    );

    const storedMonthlyArchivesRaw = localStorage.getItem(
      "salon_monthly_archives_list",
    );
    let currentArchives: MonthlyArchive[] = DEFAULT_MONTHLY_ARCHIVES;
    if (storedMonthlyArchivesRaw) {
      currentArchives = JSON.parse(storedMonthlyArchivesRaw);
    } else {
      localStorage.setItem(
        "salon_monthly_archives_list",
        JSON.stringify(DEFAULT_MONTHLY_ARCHIVES),
      );
    }

    const now = new Date();
    const currentMonthKey = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
    const firstDayOfCurrentMonth = `01/${String(now.getMonth() + 1).padStart(2, "0")}/${now.getFullYear()}`;

    if (!localStorage.getItem("salon_current_period_start")) {
      localStorage.setItem(
        "salon_current_period_start",
        firstDayOfCurrentMonth,
      );
    }

    const lastActiveMonth = localStorage.getItem("salon_last_active_month");
    if (lastActiveMonth && lastActiveMonth !== currentMonthKey) {
      const [prevYearStr, prevMonthStr] = lastActiveMonth.split("-");
      const prevYear = Number(prevYearStr);
      const prevMonthIdx = Number(prevMonthStr) - 1;
      const prevMonthName = `${MONTH_NAMES_AR[prevMonthIdx]} ${prevYear}`;
      const lastDayPrevMonth = new Date(prevYear, prevMonthIdx + 1, 0);
      const periodStart =
        localStorage.getItem("salon_current_period_start") ||
        `01/${prevMonthStr}/${prevYear}`;
      const periodEnd = formatDateDDMMYYYY(lastDayPrevMonth);

      if (savedMonthlyRev > 0) {
        const autoArchiveEntry: MonthlyArchive = {
          monthKey: `${lastActiveMonth}-auto-${Date.now()}`,
          monthName: prevMonthName,
          totalRevenue: savedMonthlyRev,
          periodRange: `من ${periodStart} إلى ${periodEnd}`,
          isManual: false,
        };
        currentArchives = [autoArchiveEntry, ...currentArchives];
        localStorage.setItem(
          "salon_monthly_archives_list",
          JSON.stringify(currentArchives),
        );
      }

      savedMonthlyRev = 0;
      localStorage.setItem("salon_monthly_revenue", "0");
      localStorage.setItem(
        "salon_current_period_start",
        firstDayOfCurrentMonth,
      );
    }
    localStorage.setItem("salon_last_active_month", currentMonthKey);

    setMonthlyArchives(currentArchives);
    setOwnerStats({
      monthlyRevenue: savedMonthlyRev,
      dailySales: savedSales,
      dailyBookings: savedBookings,
      dailyPurchases: savedPurchases,
      dailyIncidentalExpenses: savedIncidental,
      dailyExpenses: savedExpenses,
    });

    setInvoicesLog(savedLog);
    setDailyArchivesList(savedDailyHist);
  };

  useEffect(() => {
    setActiveMenu("overview");
    loadOwnerData();
    const handleStorage = () => loadOwnerData();
    window.addEventListener("storage", handleStorage);
    return () => window.removeEventListener("storage", handleStorage);
  }, []);

  const handleSaveUserPin = (userName: string) => {
    if (!/^\d{4}$/.test(newUserPinValue.trim())) {
      showAlert("تنبيه", "الرمز السري يجب أن يتكون من 4 أرقام بالضبط.");
      return;
    }
    const storageKey = `user_pin_${userName}`;
    localStorage.setItem(storageKey, newUserPinValue.trim());
    setEditingUserId(null);
    setNewUserPinValue("");
    showAlert("تم الحفظ", `تم تحديث الرمز السري للموظف (${userName}) بنجاح ✓`);
  };

  const handleTestArchiveDay = () => {
    const todayStr = new Date().toLocaleDateString("en-GB");
    const testLog: DailyArchiveLog = {
      dateStr: todayStr,
      sales: ownerStats.dailySales,
      bookings: ownerStats.dailyBookings,
      purchases: ownerStats.dailyPurchases,
      petty: ownerStats.dailyIncidentalExpenses,
      expenses: ownerStats.dailyExpenses,
    };

    const existingHist = JSON.parse(
      localStorage.getItem("salon_daily_history_archive") || "[]",
    );
    const filteredHist = existingHist.filter(
      (item: DailyArchiveLog) => item.dateStr !== todayStr,
    );
    const updatedHist = [testLog, ...filteredHist];

    localStorage.setItem(
      "salon_daily_history_archive",
      JSON.stringify(updatedHist),
    );
    setDailyArchivesList(updatedHist);
    showAlert(
      "نجاح الأرشفة",
      "تمت أرشفة بيانات اليوم بنجاح في الأرشيف اليومي!",
    );
  };

  const handleArchiveCurrentMonth = () => {
    const now = new Date();
    const currentMonthStr = `${MONTH_NAMES_AR[now.getMonth()]} ${now.getFullYear()}`;
    const firstDayOfMonth = `01/${String(now.getMonth() + 1).padStart(2, "0")}/${now.getFullYear()}`;
    const periodStart =
      localStorage.getItem("salon_current_period_start") || firstDayOfMonth;
    const periodEnd = formatDateDDMMYYYY(now);
    const archivedTime = now.toLocaleTimeString("en-GB", {
      hour: "2-digit",
      minute: "2-digit",
    });

    showConfirm(
      "تأكيد أرشفة الشهر",
      `هل أنت متأكد من أرشفة الإيرادات الحالية (${ownerStats.monthlyRevenue.toFixed(1)} د.ك) للفترة من ${periodStart} إلى ${periodEnd} وتصفير العداد؟`,
      () => {
        const newArchiveEntry: MonthlyArchive = {
          monthKey: `manual-${Date.now()}`,
          monthName: `${currentMonthStr}`,
          totalRevenue: ownerStats.monthlyRevenue,
          periodRange: `من ${periodStart} إلى ${periodEnd}`,
          isManual: true,
          archivedTime,
        };

        const updatedArchives = [newArchiveEntry, ...monthlyArchives];
        setMonthlyArchives(updatedArchives);
        localStorage.setItem(
          "salon_monthly_archives_list",
          JSON.stringify(updatedArchives),
        );

        localStorage.setItem("salon_current_period_start", periodEnd);

        setOwnerStats((prev) => ({ ...prev, monthlyRevenue: 0 }));
        localStorage.setItem("salon_monthly_revenue", "0");
        window.dispatchEvent(new Event("storage"));

        showAlert(
          "تمت الأرشفة بنجاح",
          `تم حفظ الإيرادات للفترة (${newArchiveEntry.periodRange}) وتصفير العداد.`,
        );
      },
    );
  };

  const [staffList, setStaffList] = useState<StaffMember[]>([
    {
      id: 1,
      name: "عبد الرحيم الضعيف",
      type: "حلاق",
      residencyExpiry: "2027-05-23",
    },
    { id: 2, name: "يوسف مرزوق", type: "حلاق", residencyExpiry: "2027-06-22" },
    { id: 3, name: "علال النفخ", type: "حلاق", residencyExpiry: "2027-06-05" },
    {
      id: 4,
      name: "محمد فريد عبد الدايم",
      type: "حلاق",
      residencyExpiry: "2027-05-06",
    },
    { id: 5, name: "يوسف لبصيلي", type: "حلاق", residencyExpiry: "2027-04-13" },
    {
      id: 6,
      name: "مراد الميموني",
      type: "حلاق",
      residencyExpiry: "2027-05-06",
    },
    {
      id: 7,
      name: "رشيق عبد القادر",
      type: "حلاق",
      residencyExpiry: "2027-12-20",
    },
    {
      id: 8,
      name: "عبد الله امشوشاد",
      type: "حلاق",
      residencyExpiry: "2027-06-22",
    },
    { id: 9, name: "أشرف محفاظ", type: "حلاق", residencyExpiry: "2026-12-01" },
    { id: 10, name: "محمد حقاني", type: "حلاق", residencyExpiry: "2026-12-19" },
    {
      id: 11,
      name: "إدريس بو راس",
      type: "حلاق",
      residencyExpiry: "2026-12-19",
    },
    {
      id: 12,
      name: "عبدالباسط عبدالكريم",
      type: "بديكير ومناكير",
      residencyExpiry: "2027-09-19",
    },
    {
      id: 13,
      name: "جوفين بنتاس فوري",
      type: "بديكير ومناكير",
      residencyExpiry: "2027-09-04",
    },
    {
      id: 14,
      name: "جويسيليو بيرون بانديولا",
      type: "بديكير ومناكير",
      residencyExpiry: "2027-09-04",
    },
    {
      id: 15,
      name: "جيفري بيرون بانديولا",
      type: "بديكير ومناكير",
      residencyExpiry: "2027-09-04",
    },
    {
      id: 16,
      name: "جويل جولاران الموجورا",
      type: "بديكير ومناكير",
      residencyExpiry: "2027-07-23",
    },
  ]);

  const [newStaffName, setNewStaffName] = useState("");
  const [newStaffType, setNewStaffType] = useState("حلاق");
  const [newStaffExpiry, setNewStaffExpiry] = useState("");
  const [editingStaffId, setEditingStaffId] = useState<number | null>(null);
  const [updatedExpiryDate, setUpdatedExpiryDate] = useState("");

  const handleAddStaff = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newStaffName || !newStaffExpiry) return;
    setStaffList([
      ...staffList,
      {
        id: staffList.length + 1,
        name: newStaffName,
        type: newStaffType,
        residencyExpiry: newStaffExpiry,
      },
    ]);
    setNewStaffName("");
    setNewStaffExpiry("");
  };

  const handleDeleteStaff = (id: number) => {
    setStaffList(staffList.filter((staff) => staff.id !== id));
  };

  const handleUpdateExpiry = (id: number) => {
    if (!updatedExpiryDate) return;
    setStaffList(
      staffList.map((staff) =>
        staff.id === id
          ? { ...staff, residencyExpiry: updatedExpiryDate }
          : staff,
      ),
    );
    setEditingStaffId(null);
    setUpdatedExpiryDate("");
  };

  const getResidencyStatus = (expiryDate: string) => {
    const today = new Date();
    const expiry = new Date(expiryDate);
    const diffTime = expiry.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 0) {
      return (
        <span className="bg-red-100 text-red-800 px-2.5 py-1 rounded-full text-[11px] font-bold">
          منتهية ❌
        </span>
      );
    } else if (diffDays <= 30) {
      return (
        <span className="bg-amber-100 text-amber-800 px-2.5 py-1 rounded-full text-[11px] font-bold">
          تنبيه: قريبة الانتهاء ⚠️
        </span>
      );
    } else {
      return (
        <span className="bg-emerald-100 text-emerald-800 px-2.5 py-1 rounded-full text-[11px] font-bold">
          سارية ✓
        </span>
      );
    }
  };

  const getBadgeColor = () =>
    "bg-slate-100 text-slate-700 border border-slate-200";

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
    setProductsList(productsList.filter((prod) => prod.id !== id));
  };

  const handleIncreaseStock = (id: number) => {
    setProductsList(
      productsList.map((prod) =>
        prod.id === id ? { ...prod, stock: prod.stock + 1 } : prod,
      ),
    );
  };

  const handleDecreaseStock = (id: number) => {
    setProductsList(
      productsList.map((prod) =>
        prod.id === id ? { ...prod, stock: Math.max(0, prod.stock - 1) } : prod,
      ),
    );
  };

  const cabinProducts = productsList.filter((p) => p.category === "كباين");
  const salonProducts = productsList.filter((p) => p.category === "صالون");

  const incomeFilteredStaff = staffList.filter(
    (st) => st.type === "حلاق" || st.type === "بديكير ومناكير",
  );

  return (
    <div
      dir="rtl"
      className="min-h-screen bg-slate-100 flex flex-col select-none font-sans relative"
    >
      <header className="bg-slate-900 text-white px-6 py-4 flex items-center justify-between shadow-sm z-20">
        <div className="flex items-center gap-3">
          <span className="text-xs bg-amber-500 text-slate-900 font-bold px-2.5 py-1 rounded-md">
            مدير
          </span>
          <h1 className="text-base font-bold tracking-wide">
            صالون وجوه ستايل للرجال - لوحة تحكم المدير (ماجد)
          </h1>
        </div>

        <button
          onClick={() => router.push("/")}
          className="text-xs bg-slate-800 hover:bg-slate-700 text-slate-200 px-3.5 py-1.5 rounded-lg border border-slate-700 transition-colors cursor-pointer"
        >
          ← تسجيل الخروج
        </button>
      </header>

      <div className="flex-1 flex flex-col md:flex-row">
        <aside className="w-full md:w-72 bg-white border-l border-slate-200 p-4 flex md:flex-col gap-2 shadow-xs overflow-x-auto">
          <button
            onClick={() => setActiveMenu("overview")}
            className={`flex items-center gap-3 px-4 py-3 rounded-xl font-bold text-sm transition-all cursor-pointer whitespace-nowrap ${
              activeMenu === "overview"
                ? "bg-amber-500 text-slate-900 shadow-xs"
                : "text-slate-600 hover:bg-slate-50"
            }`}
          >
            <span>📊</span>
            <span>الإحصائيات العامة</span>
          </button>

          <button
            onClick={() => setActiveMenu("archive")}
            className={`flex items-center gap-3 px-4 py-3 rounded-xl font-bold text-sm transition-all cursor-pointer whitespace-nowrap ${
              activeMenu === "archive"
                ? "bg-amber-500 text-slate-900 shadow-xs"
                : "text-slate-600 hover:bg-slate-50"
            }`}
          >
            <span>📁</span>
            <span>الأرشيف وإيرادات الشهور</span>
          </button>

          <button
            onClick={() => setActiveMenu("daily_archive")}
            className={`flex items-center gap-3 px-4 py-3 rounded-xl font-bold text-sm transition-all cursor-pointer whitespace-nowrap ${
              activeMenu === "daily_archive"
                ? "bg-amber-500 text-slate-900 shadow-xs"
                : "text-slate-600 hover:bg-slate-50"
            }`}
          >
            <span>📅</span>
            <span>أرشيف الأيام السابقة</span>
          </button>

          <button
            onClick={() => setActiveMenu("staff")}
            className={`flex items-center gap-3 px-4 py-3 rounded-xl font-bold text-sm transition-all cursor-pointer whitespace-nowrap ${
              activeMenu === "staff"
                ? "bg-amber-500 text-slate-900 shadow-xs"
                : "text-slate-600 hover:bg-slate-50"
            }`}
          >
            <span>👥</span>
            <span>العمالة</span>
          </button>

          <button
            onClick={() => setActiveMenu("monthly_income")}
            className={`flex items-center gap-3 px-4 py-3 rounded-xl font-bold text-sm transition-all cursor-pointer whitespace-nowrap ${
              activeMenu === "monthly_income"
                ? "bg-amber-500 text-slate-900 shadow-xs"
                : "text-slate-600 hover:bg-slate-50"
            }`}
          >
            <span>💰</span>
            <span>مداخيل الشهر</span>
          </button>

          <button
            onClick={() => setActiveMenu("products")}
            className={`flex items-center gap-3 px-4 py-3 rounded-xl font-bold text-sm transition-all cursor-pointer whitespace-nowrap ${
              activeMenu === "products"
                ? "bg-amber-500 text-slate-900 shadow-xs"
                : "text-slate-600 hover:bg-slate-50"
            }`}
          >
            <span>🧴</span>
            <span>إدارة المنتجات</span>
          </button>

          <button
            onClick={() => {
              loadOwnerData();
              setActiveMenu("invoices");
            }}
            className={`flex items-center gap-3 px-4 py-3 rounded-xl font-bold text-sm transition-all cursor-pointer whitespace-nowrap ${
              activeMenu === "invoices"
                ? "bg-amber-500 text-slate-900 shadow-xs"
                : "text-slate-600 hover:bg-slate-50"
            }`}
          >
            <span>🧾</span>
            <span>سجل فواتير اليوم</span>
          </button>

          <button
            onClick={() => setActiveMenu("security")}
            className={`flex items-center gap-3 px-4 py-3 rounded-xl font-bold text-sm transition-all cursor-pointer whitespace-nowrap ${
              activeMenu === "security"
                ? "bg-amber-500 text-slate-900 shadow-xs"
                : "text-slate-600 hover:bg-slate-50"
            }`}
          >
            <span>🔐</span>
            <span>كلمات السر والصلاحيات</span>
          </button>
        </aside>

        <main className="flex-1 p-4 sm:p-8 max-w-7xl mx-auto w-full space-y-6">
          {activeMenu === "overview" && (
            <div className="space-y-6 animate-in fade-in duration-200">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
                <div className="bg-slate-900 text-white p-6 rounded-2xl shadow-md border border-slate-800 flex flex-col justify-between min-h-[130px]">
                  <span className="text-xs font-bold text-slate-400">
                    إيرادات الشهر (الحالي) 📈
                  </span>
                  <div className="mt-3">
                    <span className="text-2xl sm:text-3xl font-black text-amber-400">
                      {ownerStats.monthlyRevenue.toFixed(1)}{" "}
                      <span className="text-sm font-bold">د.ك</span>
                    </span>
                  </div>
                </div>

                <div className="bg-slate-900 text-white p-6 rounded-2xl shadow-md border border-slate-800 flex flex-col justify-between min-h-[130px]">
                  <span className="text-xs font-bold text-slate-400">
                    مبيعات اليوم 📅
                  </span>
                  <div className="mt-3">
                    <span className="text-2xl sm:text-3xl font-black text-amber-400">
                      {ownerStats.dailySales.toFixed(1)}{" "}
                      <span className="text-sm font-bold">د.ك</span>
                    </span>
                  </div>
                </div>

                <div
                  onClick={() => {
                    loadOwnerData();
                    setActiveMenu("invoices");
                  }}
                  className="bg-slate-900 hover:bg-slate-800 text-white p-6 rounded-2xl shadow-md border border-slate-800 flex flex-col justify-between min-h-[130px] cursor-pointer transition-all hover:border-amber-500 group"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-400 group-hover:text-amber-400">
                      فواتير اليوم 🧾 (انقر للعرض)
                    </span>
                    <span className="text-xs bg-amber-500/20 text-amber-400 px-2 py-0.5 rounded font-bold">
                      عرض الكل 👁️
                    </span>
                  </div>
                  <div className="mt-3">
                    <span className="text-2xl sm:text-3xl font-black text-amber-400">
                      {ownerStats.dailyBookings}{" "}
                      <span className="text-sm font-bold text-slate-400">
                        فواتير
                      </span>
                    </span>
                  </div>
                </div>

                <div className="bg-slate-900 text-white p-6 rounded-2xl shadow-md border border-slate-800 flex flex-col justify-between min-h-[130px]">
                  <span className="text-xs font-bold text-slate-400">
                    مشتريات اليوم 🛍️
                  </span>
                  <div className="mt-3">
                    <span className="text-2xl sm:text-3xl font-black text-amber-400">
                      {ownerStats.dailyPurchases}{" "}
                      <span className="text-sm font-bold">د.ك</span>
                    </span>
                  </div>
                </div>

                <div className="bg-slate-900 text-white p-6 rounded-2xl shadow-md border border-slate-800 flex flex-col justify-between min-h-[130px]">
                  <span className="text-xs font-bold text-slate-400">
                    المصروفات النثرية اليوم 📝
                  </span>
                  <div className="mt-3">
                    <span className="text-2xl sm:text-3xl font-black text-amber-400">
                      {ownerStats.dailyIncidentalExpenses}{" "}
                      <span className="text-sm font-bold">د.ك</span>
                    </span>
                  </div>
                </div>

                <div className="bg-slate-900 text-white p-6 rounded-2xl shadow-md border border-slate-800 flex flex-col justify-between min-h-[130px]">
                  <span className="text-xs font-bold text-slate-400">
                    مصروفات اليوم 💸
                  </span>
                  <div className="mt-3">
                    <span className="text-2xl sm:text-3xl font-black text-amber-400">
                      {ownerStats.dailyExpenses}{" "}
                      <span className="text-sm font-bold">د.ك</span>
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* تبويب إدارة أرقام السر (للمدير فقط) */}
          {activeMenu === "security" && (
            <div className="space-y-6 animate-in fade-in duration-200">
              <div className="bg-white rounded-2xl p-6 shadow-xs border border-slate-200">
                <div className="pb-4 border-b border-slate-100 mb-4">
                  <h3 className="font-bold text-slate-800 text-lg">
                    🔐 إدارة الأرقام السرية للموظفين (ماجد، ابوالحمد، حازم)
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    بإمكانك تغيير الرمز السري المكون من 4 أرقام لأي موظف نسى
                    رقمه
                  </p>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-right text-xs sm:text-sm">
                    <thead>
                      <tr className="bg-slate-50 text-slate-500 border-b border-slate-200">
                        <th className="p-3 font-bold">اسم الموظف</th>
                        <th className="p-3 font-bold">الصلاحية</th>
                        <th className="p-3 font-bold">الرمز السري الحالي</th>
                        <th className="p-3 font-bold text-center">
                          إدارة الرمز
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {DEFAULT_STAFF_USERS.map((usr) => {
                        const currentPin =
                          localStorage.getItem(`user_pin_${usr.name}`) ||
                          "غير محدد";
                        return (
                          <tr key={usr.id} className="hover:bg-slate-50/60">
                            <td className="p-3.5 font-bold text-slate-800">
                              {usr.name}
                            </td>
                            <td className="p-3.5">
                              <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-slate-100 text-slate-700">
                                {usr.roleLabel}
                              </span>
                            </td>
                            <td className="p-3.5 font-mono font-bold text-slate-700">
                              {currentPin}
                            </td>
                            <td className="p-3.5 text-center">
                              {editingUserId === usr.id ? (
                                <div className="flex items-center justify-center gap-2">
                                  <input
                                    type="text"
                                    maxLength={4}
                                    placeholder="4 أرقام"
                                    value={newUserPinValue}
                                    onChange={(e) =>
                                      setNewUserPinValue(
                                        e.target.value.replace(/[^\d]/g, ""),
                                      )
                                    }
                                    className="border border-amber-400 rounded-lg px-2.5 py-1 text-xs font-mono w-28 text-center"
                                    autoFocus
                                  />
                                  <button
                                    onClick={() => handleSaveUserPin(usr.name)}
                                    className="bg-emerald-500 text-white px-3 py-1 rounded-lg text-xs font-bold cursor-pointer"
                                  >
                                    حفظ ✓
                                  </button>
                                  <button
                                    onClick={() => {
                                      setEditingUserId(null);
                                      setNewUserPinValue("");
                                    }}
                                    className="bg-slate-200 text-slate-700 px-2.5 py-1 rounded-lg text-xs font-bold cursor-pointer"
                                  >
                                    إلغاء
                                  </button>
                                </div>
                              ) : (
                                <button
                                  onClick={() => {
                                    setEditingUserId(usr.id);
                                    setNewUserPinValue("");
                                  }}
                                  className="bg-amber-50 hover:bg-amber-100 text-amber-700 border border-amber-200 px-3.5 py-1.5 rounded-lg text-xs font-bold cursor-pointer"
                                >
                                  تغيير الرمز 🔑
                                </button>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {activeMenu === "daily_archive" && (
            <div className="bg-white rounded-2xl p-6 shadow-xs border border-slate-200 animate-in fade-in duration-200 space-y-6">
              <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                <div>
                  <h3 className="font-bold text-slate-800 text-xl">
                    📅 أرشيف الأيام السابقة
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    مراجعة المبيعات، المشتريات، والمصروفات لكل يوم مضى بالتفصيل
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <button
                    onClick={handleTestArchiveDay}
                    className="bg-amber-500 hover:bg-amber-600 text-slate-900 font-bold px-4 py-2 rounded-xl text-xs transition-colors cursor-pointer shadow-xs"
                  >
                    ⚡ تجربة: أرشفة اليوم الحالي الآن
                  </button>
                  <span className="text-xs bg-amber-50 text-amber-800 px-3 py-1 rounded-full font-medium border border-amber-200">
                    {dailyArchivesList.length} أيام مؤرشفة
                  </span>
                </div>
              </div>

              <div className="space-y-4">
                {dailyArchivesList.length === 0 ? (
                  <div className="text-center py-16 text-slate-400 text-sm">
                    لا توجد أيام مؤرشفة حتى الآن.
                  </div>
                ) : (
                  dailyArchivesList.map((dayItem, idx) => (
                    <div
                      key={idx}
                      className="bg-slate-50 border border-slate-200/80 rounded-2xl p-5 space-y-3 shadow-2xs"
                    >
                      <div className="flex justify-between items-center text-sm border-b border-slate-200 pb-3 font-bold text-slate-800">
                        <span>التاريخ: {dayItem.dateStr}</span>
                        <span className="text-amber-700">
                          عدد الفواتير: {dayItem.bookings} فواتير
                        </span>
                      </div>

                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-1 text-xs sm:text-sm">
                        <div className="bg-white p-3 rounded-xl border border-slate-200">
                          <span className="text-slate-500 block">
                            مبيعات اليوم:
                          </span>
                          <span className="font-black text-emerald-600 text-base">
                            {dayItem.sales} د.ك
                          </span>
                        </div>
                        <div className="bg-white p-3 rounded-xl border border-slate-200">
                          <span className="text-slate-500 block">
                            مشتريات اليوم:
                          </span>
                          <span className="font-black text-slate-800 text-base">
                            {dayItem.purchases} د.ك
                          </span>
                        </div>
                        <div className="bg-white p-3 rounded-xl border border-slate-200">
                          <span className="text-slate-500 block">
                            المصروفات النثرية:
                          </span>
                          <span className="font-black text-slate-800 text-base">
                            {dayItem.petty} د.ك
                          </span>
                        </div>
                        <div className="bg-white p-3 rounded-xl border border-slate-200">
                          <span className="text-slate-500 block">
                            مصروفات اليوم:
                          </span>
                          <span className="font-black text-red-600 text-base">
                            {dayItem.expenses} د.ك
                          </span>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {activeMenu === "invoices" && (
            <div className="bg-white rounded-2xl p-6 shadow-xs border border-slate-200 animate-in fade-in duration-200 space-y-6">
              <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                <div>
                  <h3 className="font-bold text-slate-800 text-xl">
                    سجل فواتير اليوم 🧾
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    عرض كافة الفواتير والخدمات والأسماء والعمال التي تم إتمامها
                    اليوم
                  </p>
                </div>
                <span className="text-xs bg-amber-50 text-amber-800 px-3 py-1 rounded-full font-medium border border-amber-200">
                  {invoicesLog.length} فواتير مسجلة
                </span>
              </div>

              <div className="space-y-4">
                {invoicesLog.length === 0 ? (
                  <div className="text-center py-16 text-slate-400 text-sm">
                    لا توجد فواتير مسجلة حتى الآن اليوم.
                  </div>
                ) : (
                  invoicesLog.map((inv) => (
                    <div
                      key={inv.id}
                      className="bg-slate-50 border border-slate-200/80 rounded-2xl p-5 space-y-3 shadow-2xs"
                    >
                      <div className="flex justify-between items-center text-xs border-b border-slate-200 pb-3">
                        <div>
                          <span className="font-bold text-slate-900 text-sm">
                            الزبون: {inv.customerName}
                          </span>
                          <span className="text-slate-500 mr-3">
                            (الهاتف: {inv.customerPhone})
                          </span>
                        </div>
                        <span className="text-slate-500 font-mono font-bold">
                          {inv.time}
                        </span>
                      </div>

                      <div className="space-y-1.5 pt-1">
                        {inv.items.map((it, i) => (
                          <div
                            key={i}
                            className="flex justify-between text-xs sm:text-sm text-slate-700"
                          >
                            <span>
                              • {it.name}{" "}
                              <span className="text-slate-500">
                                (المسؤول: {it.worker})
                              </span>
                            </span>
                            <span className="font-bold text-amber-700">
                              {it.price} د.ك
                            </span>
                          </div>
                        ))}
                      </div>

                      <div className="flex justify-between items-center pt-3 border-t border-slate-200 font-extrabold text-sm sm:text-base">
                        <span className="text-slate-700">
                          الإجمالي الكلي ({inv.paymentMethod}):
                        </span>
                        <span className="text-emerald-600">
                          {inv.total} د.ك
                        </span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {activeMenu === "archive" && (
            <div className="bg-white rounded-2xl p-6 shadow-xs border border-slate-200 animate-in fade-in duration-200 space-y-6">
              <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <span className="text-2xl">📊</span>
                  <div>
                    <h3 className="font-bold text-slate-800 text-lg">
                      أرشيف الإيرادات الشهرية
                    </h3>
                    <p className="text-xs text-slate-400 mt-0.5">
                      سجل الشهور السابقة والفترات المؤرشفة يدوياً بالتاريخ
                      الدقيق
                    </p>
                  </div>
                </div>
                <button
                  onClick={handleArchiveCurrentMonth}
                  className="bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 font-bold px-4 py-2 rounded-xl text-xs transition-colors cursor-pointer flex items-center gap-2 shadow-xs"
                >
                  <span>🔄</span> أرشفة الشهر الحالي وتصفير الإيرادات
                </button>
              </div>

              <div className="space-y-3">
                {monthlyArchives.map((archive) => (
                  <div
                    key={archive.monthKey}
                    className={`border rounded-2xl p-5 flex items-center justify-between shadow-xs transition-all ${
                      archive.isManual
                        ? "bg-amber-50/40 border-amber-200"
                        : "bg-slate-50 border-slate-200/80"
                    }`}
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-bold text-slate-800 text-lg">
                          {archive.monthName}
                        </span>
                        {archive.periodRange && (
                          <span className="text-xs font-mono font-bold bg-white border border-slate-200 text-slate-700 px-2.5 py-0.5 rounded-lg">
                            📅 {archive.periodRange}
                          </span>
                        )}
                      </div>

                      {archive.isManual ? (
                        <div className="text-xs text-amber-700 font-bold flex items-center gap-2">
                          <span>أرشفة يدوية ⚠️</span>
                          {archive.archivedTime && (
                            <span className="text-slate-500 font-mono">
                              الساعة {archive.archivedTime}
                            </span>
                          )}
                        </div>
                      ) : (
                        <div className="text-xs text-emerald-600 font-bold">
                          مكتمل ومحفوظ ✓
                        </div>
                      )}
                    </div>
                    <span className="text-xl font-black text-amber-700 shrink-0 mr-4">
                      {archive.totalRevenue.toFixed(1)} د.ك
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeMenu === "staff" && (
            <div className="space-y-6 animate-in fade-in duration-200">
              <div className="bg-white rounded-2xl p-6 shadow-xs border border-slate-200">
                <h3 className="font-bold text-slate-800 text-base mb-4">
                  إضافة عامل جديد
                </h3>
                <form
                  onSubmit={handleAddStaff}
                  className="grid grid-cols-1 sm:grid-cols-4 gap-3"
                >
                  <input
                    type="text"
                    placeholder="اسم الموظف"
                    value={newStaffName}
                    onChange={(e) => setNewStaffName(e.target.value)}
                    className="bg-slate-50 border border-slate-300 rounded-xl p-3 text-sm text-slate-800"
                  />
                  <select
                    value={newStaffType}
                    onChange={(e) => setNewStaffType(e.target.value)}
                    className="bg-slate-50 border border-slate-300 rounded-xl p-3 text-sm text-slate-800"
                  >
                    <option value="حلاق">حلاق</option>
                    <option value="بديكير ومناكير">بديكير ومناكير</option>
                    <option value="منظف">منظف</option>
                    <option value="مندوب">مندوب</option>
                    <option value="سايق">سايق</option>
                    <option value="محاسب">محاسب</option>
                  </select>
                  <input
                    type="date"
                    lang="en"
                    value={newStaffExpiry}
                    onChange={(e) => setNewStaffExpiry(e.target.value)}
                    className="bg-slate-50 border border-slate-300 rounded-xl p-3 text-sm text-slate-800 font-mono text-right"
                  />
                  <button
                    type="submit"
                    className="bg-amber-500 hover:bg-amber-600 text-slate-900 font-bold rounded-xl p-3 text-sm cursor-pointer shadow-sm"
                  >
                    إضافة العامل ✓
                  </button>
                </form>
              </div>

              <div className="bg-white rounded-2xl p-6 shadow-xs border border-slate-200">
                <h3 className="font-bold text-slate-800 text-lg mb-4">
                  قائمة العمالة والإقامات
                </h3>
                <div className="overflow-x-auto">
                  <table className="w-full text-right text-xs sm:text-sm">
                    <thead>
                      <tr className="bg-slate-50 text-slate-500 border-b border-slate-200">
                        <th className="p-3 font-bold w-12">م</th>
                        <th className="p-3 font-bold">اسم الموظف</th>
                        <th className="p-3 font-bold">القسم</th>
                        <th className="p-3 font-bold">تاريخ انتهاء الإقامة</th>
                        <th className="p-3 font-bold">الحالة</th>
                        <th className="p-3 font-bold text-center">
                          الإدارة والتجديد
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {staffList.map((staff, index) => (
                        <tr key={staff.id} className="hover:bg-slate-50/60">
                          <td className="p-3.5 font-bold text-slate-500 font-mono">
                            {index + 1}
                          </td>
                          <td className="p-3.5 font-bold text-slate-800">
                            {staff.name}
                          </td>
                          <td className="p-3.5">
                            <span
                              className={`px-2.5 py-1 rounded-full text-[11px] font-bold ${getBadgeColor()}`}
                            >
                              {staff.type}
                            </span>
                          </td>
                          <td className="p-3.5 text-slate-700 font-bold font-mono">
                            {staff.residencyExpiry}
                          </td>
                          <td className="p-3.5">
                            {getResidencyStatus(staff.residencyExpiry)}
                          </td>
                          <td className="p-3.5 text-center">
                            {editingStaffId === staff.id ? (
                              <div className="flex items-center justify-center gap-2">
                                <input
                                  type="date"
                                  lang="en"
                                  value={updatedExpiryDate}
                                  onChange={(e) =>
                                    setUpdatedExpiryDate(e.target.value)
                                  }
                                  className="border rounded-lg p-1 text-xs font-mono"
                                />
                                <button
                                  onClick={() => handleUpdateExpiry(staff.id)}
                                  className="bg-emerald-500 text-white px-2.5 py-1 rounded-lg text-xs font-bold cursor-pointer"
                                >
                                  حفظ
                                </button>
                                <button
                                  onClick={() => setEditingStaffId(null)}
                                  className="bg-slate-200 text-slate-700 px-2 py-1 rounded-lg text-xs font-bold cursor-pointer"
                                >
                                  إلغاء
                                </button>
                              </div>
                            ) : (
                              <div className="flex items-center justify-center gap-2">
                                <button
                                  onClick={() => {
                                    setEditingStaffId(staff.id);
                                    setUpdatedExpiryDate(staff.residencyExpiry);
                                  }}
                                  className="bg-amber-50 hover:bg-amber-100 text-amber-700 px-3 py-1.5 rounded-lg text-xs font-bold cursor-pointer"
                                >
                                  تجديد 🔄
                                </button>
                                <button
                                  onClick={() => handleDeleteStaff(staff.id)}
                                  className="bg-red-50 hover:bg-red-100 text-red-600 px-3 py-1.5 rounded-lg text-xs font-bold cursor-pointer"
                                >
                                  حذف 🗑️
                                </button>
                              </div>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {activeMenu === "monthly_income" && (
            <div className="bg-white rounded-2xl p-6 shadow-xs border border-slate-200 animate-in fade-in duration-200 space-y-6">
              <h3 className="font-bold text-slate-800 text-lg">
                تقارير مداخيل الشهر للعمالة
              </h3>
              <div className="overflow-x-auto">
                <table className="w-full text-right text-xs sm:text-sm">
                  <thead>
                    <tr className="bg-slate-50 text-slate-500 border-b border-slate-200">
                      <th className="p-3 font-bold rounded-r-xl">اسم الموظف</th>
                      <th className="p-3 font-bold">القسم</th>
                      <th className="p-3 font-bold rounded-l-xl">
                        مدخول الشهر 💰
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {incomeFilteredStaff.map((st, idx) => {
                      const workerInc = Number(
                        localStorage.getItem(
                          `worker_income_${st.name.trim()}`,
                        ) || "0",
                      );
                      return (
                        <tr key={idx} className="hover:bg-slate-50/60">
                          <td className="p-3.5 font-bold text-slate-800">
                            {st.name}
                          </td>
                          <td className="p-3.5">
                            <span className="px-2.5 py-1 rounded-full text-[11px] font-medium bg-slate-100 text-slate-700">
                              {st.type}
                            </span>
                          </td>
                          <td className="p-3.5 font-black text-amber-700 text-base">
                            {workerInc} د.ك
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeMenu === "products" && (
            <div className="space-y-8 animate-in fade-in duration-200">
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
                    className="bg-slate-50 border border-slate-300 rounded-xl p-3 text-sm text-slate-800"
                  />
                  <select
                    value={newProductCategory}
                    onChange={(e) =>
                      setNewProductCategory(e.target.value as any)
                    }
                    className="bg-slate-50 border border-slate-300 rounded-xl p-3 text-sm text-slate-800"
                  >
                    <option value="كباين">منتجات الكباين</option>
                    <option value="صالون">منتجات الصالون</option>
                  </select>
                  <input
                    type="number"
                    placeholder="السعر (د.ك)"
                    value={newProductPrice}
                    onChange={(e) => setNewProductPrice(e.target.value)}
                    className="bg-slate-50 border border-slate-300 rounded-xl p-3 text-sm text-slate-800"
                  />
                  <input
                    type="number"
                    placeholder="الكمية"
                    value={newProductStock}
                    onChange={(e) => setNewProductStock(e.target.value)}
                    className="bg-slate-50 border border-slate-300 rounded-xl p-3 text-sm text-slate-800"
                  />
                  <button
                    type="submit"
                    className="bg-amber-500 hover:bg-amber-600 text-slate-900 font-bold rounded-xl p-3 text-sm cursor-pointer shadow-sm"
                  >
                    إضافة المنتج ✓
                  </button>
                </form>
              </div>

              {/* منتجات الكباين */}
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
                        <th className="p-3 font-bold rounded-r-xl">
                          اسم المنتج
                        </th>
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
                        <tr key={prod.id} className="hover:bg-slate-50/60">
                          <td className="p-3.5 font-bold text-slate-800">
                            {prod.name}
                          </td>
                          <td className="p-3.5 font-bold text-amber-700">
                            {prod.price} د.ك
                          </td>
                          <td className="p-3.5">
                            <div className="flex items-center gap-3">
                              <span
                                className={`font-bold px-3 py-1 rounded-full text-xs ${prod.stock < 5 ? "text-red-600 bg-red-50 border border-red-200" : "text-slate-700 bg-slate-100"}`}
                              >
                                {prod.stock} حبة {prod.stock < 5 && "⚠️"}
                              </span>
                              <div className="flex items-center gap-1">
                                <button
                                  onClick={() => handleDecreaseStock(prod.id)}
                                  className="w-7 h-7 bg-slate-200 hover:bg-slate-300 text-slate-800 rounded-lg font-bold flex items-center justify-center cursor-pointer"
                                >
                                  -
                                </button>
                                <button
                                  onClick={() => handleIncreaseStock(prod.id)}
                                  className="w-7 h-7 bg-amber-500 hover:bg-amber-600 text-slate-900 rounded-lg font-bold flex items-center justify-center cursor-pointer"
                                >
                                  +
                                </button>
                              </div>
                            </div>
                          </td>
                          <td className="p-3.5 text-center">
                            <button
                              onClick={() => handleDeleteProduct(prod.id)}
                              className="bg-red-50 hover:bg-red-100 text-red-600 px-3 py-1.5 rounded-lg text-xs font-bold cursor-pointer"
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

              {/* منتجات الصالون */}
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
                        <th className="p-3 font-bold rounded-r-xl">
                          اسم المنتج
                        </th>
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
                        <tr key={prod.id} className="hover:bg-slate-50/60">
                          <td className="p-3.5 font-bold text-slate-800">
                            {prod.name}
                          </td>
                          <td className="p-3.5 font-bold text-amber-700">
                            {prod.price} د.ك
                          </td>
                          <td className="p-3.5">
                            <div className="flex items-center gap-3">
                              <span
                                className={`font-bold px-3 py-1 rounded-full text-xs ${prod.stock < 5 ? "text-red-600 bg-red-50 border border-red-200" : "text-slate-700 bg-slate-100"}`}
                              >
                                {prod.stock} حبة {prod.stock < 5 && "⚠️"}
                              </span>
                              <div className="flex items-center gap-1">
                                <button
                                  onClick={() => handleDecreaseStock(prod.id)}
                                  className="w-7 h-7 bg-slate-200 hover:bg-slate-300 text-slate-800 rounded-lg font-bold flex items-center justify-center cursor-pointer"
                                >
                                  -
                                </button>
                                <button
                                  onClick={() => handleIncreaseStock(prod.id)}
                                  className="w-7 h-7 bg-amber-500 hover:bg-amber-600 text-slate-900 rounded-lg font-bold flex items-center justify-center cursor-pointer"
                                >
                                  +
                                </button>
                              </div>
                            </div>
                          </td>
                          <td className="p-3.5 text-center">
                            <button
                              onClick={() => handleDeleteProduct(prod.id)}
                              className="bg-red-50 hover:bg-red-100 text-red-600 px-3 py-1.5 rounded-lg text-xs font-bold cursor-pointer"
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
            </div>
          )}
        </main>
      </div>

      {customModal.isOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-slate-900 text-white rounded-3xl p-6 sm:p-8 w-full max-w-md shadow-2xl border border-slate-800 text-center space-y-5 animate-in fade-in duration-200">
            <div className="w-14 h-14 bg-amber-500/20 text-amber-400 rounded-full flex items-center justify-center mx-auto text-2xl font-bold border border-amber-500/30">
              {customModal.type === "confirm" ? "⚠️" : "ℹ️"}
            </div>
            <div>
              <h3 className="text-xl font-bold text-white">
                {customModal.title}
              </h3>
              <p className="text-xs text-slate-300 mt-2 leading-relaxed">
                {customModal.message}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-2">
              {customModal.type === "confirm" ? (
                <>
                  <button
                    onClick={() =>
                      setCustomModal({ ...customModal, isOpen: false })
                    }
                    className="w-full bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold py-3 rounded-xl text-sm cursor-pointer border border-slate-700"
                  >
                    إلغاء ✕
                  </button>
                  <button
                    onClick={() => {
                      if (customModal.onConfirm) customModal.onConfirm();
                      setCustomModal({ ...customModal, isOpen: false });
                    }}
                    className="w-full bg-amber-500 hover:bg-amber-600 text-slate-900 font-extrabold py-3 rounded-xl text-sm shadow-sm cursor-pointer"
                  >
                    تأكيد ✓
                  </button>
                </>
              ) : (
                <button
                  onClick={() =>
                    setCustomModal({ ...customModal, isOpen: false })
                  }
                  className="col-span-2 w-full bg-amber-500 hover:bg-amber-600 text-slate-900 font-extrabold py-3 rounded-xl text-sm shadow-sm cursor-pointer"
                >
                  حسناً ✓
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
