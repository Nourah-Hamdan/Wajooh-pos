"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

export default function POSLoginPage() {
  const router = useRouter();

  const staffList = [
    {
      name: "ماجد",
      letter: "م",
      title: "المدير",
      status: "متاح",
      path: "/owner",
      role: "owner",
    },
    {
      name: "ابوالحمد علي",
      letter: "أ",
      title: "كاشير",
      status: "متاح",
      path: "/dashboard",
      role: "cashier",
    },
    {
      name: "حازم بكرى",
      letter: "ح",
      title: "كاشير",
      status: "متاح",
      path: "/dashboard",
      role: "cashier",
    },
  ];

  const [selectedUser, setSelectedUser] = useState<{
    name: string;
    letter: string;
    title: string;
    path: string;
  } | null>(null);
  const [pin, setPin] = useState<string[]>([]);
  const [errorMsg, setErrorMsg] = useState("");
  const [forgotMsgModal, setForgotMsgModal] = useState(false);

  useEffect(() => {
    setSelectedUser(null);
    setPin([]);
  }, []);

  const handleCardClick = (person: {
    name: string;
    letter: string;
    title: string;
    path: string;
  }) => {
    setSelectedUser(person);
    setPin([]);
    setErrorMsg("");
  };

  const handleNumClick = (num: string) => {
    if (pin.length < 4) {
      const newPin = [...pin, num];
      setPin(newPin);
      setErrorMsg("");

      if (newPin.length === 4 && selectedUser) {
        const enteredPin = newPin.join("");
        const storageKey = `user_pin_${selectedUser.name}`;
        const savedPin = localStorage.getItem(storageKey);

        if (!savedPin) {
          // الرمز الافتراضي لو أول مرة (1234 مثلاً أو أي 4 أرقام)
          localStorage.setItem(storageKey, enteredPin);
          router.push(selectedUser.path);
        } else {
          if (enteredPin === savedPin) {
            router.push(selectedUser.path);
          } else {
            setErrorMsg("الرمز السري غير صحيح");
            setPin([]);
          }
        }
      }
    }
  };

  const handleDelete = () => {
    setPin(pin.slice(0, -1));
    setErrorMsg("");
  };

  return (
    <div
      dir="rtl"
      className="min-h-screen bg-white flex flex-col items-center justify-center p-6 select-none font-sans"
    >
      {!selectedUser ? (
        <div className="bg-white border border-slate-200 rounded-3xl shadow-2xl max-w-5xl w-full overflow-hidden flex flex-col">
          <header className="bg-[#1e293b] text-white px-8 py-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="bg-amber-500 text-slate-900 text-xs font-black px-2.5 py-1 rounded-md">
                POS
              </span>
              <h1 className="text-sm font-bold tracking-wide text-white">
                صالون وجوه ستايل للرجال
              </h1>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs bg-slate-800 text-slate-300 px-3 py-1.5 rounded-lg border border-slate-700 font-medium">
                👤 نظام النقاط
              </span>
            </div>
          </header>

          <div className="p-10 flex flex-col items-center space-y-8 bg-white">
            <div className="bg-slate-100 border border-slate-200 px-10 py-3 rounded-2xl shadow-xs">
              <h2 className="text-sm font-bold text-slate-800 tracking-wide">
                اختر الموظف
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full">
              {staffList.map((person, index) => (
                <div
                  key={index}
                  onClick={() => handleCardClick(person)}
                  className="bg-white hover:bg-slate-50 border border-slate-200 hover:border-amber-400 p-8 rounded-3xl transition-all cursor-pointer flex flex-col items-center justify-between shadow-sm group hover:shadow-md"
                >
                  <div className="w-20 h-20 bg-[#1e293b] text-white rounded-full flex items-center justify-center text-2xl font-bold shadow-md group-hover:scale-105 transition-transform mb-4">
                    {person.letter}
                  </div>

                  <div className="text-center space-y-1 mb-6">
                    <h3 className="text-lg font-black text-slate-900 truncate max-w-[200px]">
                      {person.name}
                    </h3>
                    <p className="text-xs text-slate-500 font-medium">
                      {person.title}
                    </p>
                  </div>

                  <div className="flex items-center gap-2 bg-slate-100 px-4 py-1.5 rounded-full border border-slate-200">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                    <span className="text-xs font-bold text-emerald-700">
                      {person.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-white border border-slate-200 rounded-3xl shadow-2xl max-w-md w-full p-8 flex flex-col items-center space-y-6 relative">
          <button
            onClick={() => setSelectedUser(null)}
            className="absolute top-6 left-6 bg-slate-100 hover:bg-slate-200 text-slate-800 px-4 py-2 rounded-xl text-xs font-bold transition-colors cursor-pointer border border-slate-200"
          >
            رجوع
          </button>

          <div className="flex flex-col items-center space-y-2 mt-4">
            <div className="w-16 h-16 bg-[#1e293b] text-white rounded-full flex items-center justify-center text-xl font-bold shadow-md">
              {selectedUser.letter}
            </div>
            <h3 className="text-base font-bold text-slate-900">
              {selectedUser.name} ({selectedUser.title})
            </h3>
            <p className="text-xs text-slate-500">أدخل رمزك السري (4 أرقام)</p>
          </div>

          <div className="flex gap-4 my-2" dir="ltr">
            {[0, 1, 2, 3].map((i) => (
              <div
                key={i}
                className={`w-3.5 h-3.5 rounded-full border-2 border-[#1e293b] transition-all ${
                  pin.length > i ? "bg-[#1e293b]" : "bg-transparent"
                }`}
              />
            ))}
          </div>

          {errorMsg && (
            <p className="text-xs text-red-500 font-bold text-center">
              {errorMsg}
            </p>
          )}

          <div
            className="grid grid-cols-3 gap-4 w-full max-w-[260px]"
            dir="ltr"
          >
            {["1", "2", "3", "4", "5", "6", "7", "8", "9"].map((num) => (
              <button
                key={num}
                onClick={() => handleNumClick(num)}
                className="w-16 h-16 mx-auto bg-slate-100 hover:bg-slate-200 active:bg-slate-300 text-slate-800 font-medium rounded-full text-2xl transition-all cursor-pointer flex items-center justify-center shadow-xs"
              >
                {num}
              </button>
            ))}
            <div />
            <button
              onClick={() => handleNumClick("0")}
              className="w-16 h-16 mx-auto bg-slate-100 hover:bg-slate-200 active:bg-slate-300 text-slate-800 font-medium rounded-full text-2xl transition-all cursor-pointer flex items-center justify-center shadow-xs"
            >
              0
            </button>
            <button
              onClick={handleDelete}
              className="w-16 h-16 mx-auto text-slate-700 hover:bg-slate-100 font-bold text-xl transition-all cursor-pointer flex items-center justify-center"
            >
              ⌫
            </button>
          </div>

          {/* زر نسيت الرمز يوجهه لمراجعة المدير */}
          <button
            onClick={() => setForgotMsgModal(true)}
            className="text-xs font-bold text-amber-600 hover:text-amber-700 transition-colors cursor-pointer mt-1"
          >
            نسيت الرمز السري؟
          </button>
        </div>
      )}

      {/* نافذة تنبيه مراجعة المدير عند نسيان الرمز */}
      {forgotMsgModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div
            className="bg-white rounded-3xl p-6 sm:p-8 w-full max-w-md shadow-2xl border border-slate-200 text-center space-y-4"
            dir="rtl"
          >
            <div className="w-14 h-14 bg-amber-100 text-amber-700 rounded-full flex items-center justify-center mx-auto text-2xl font-bold">
              ℹ️
            </div>
            <h3 className="text-lg font-bold text-slate-800">
              نسيت الرمز السري؟
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              يرجى مراجعة المدير (ماجد) لإعادة تعيين وتغيير الرمز السري الخاص بك
              من لوحة تحكم الإدارة.
            </p>
            <button
              onClick={() => setForgotMsgModal(false)}
              className="w-full bg-[#1e293b] hover:bg-slate-800 text-white font-bold py-3 rounded-xl text-sm cursor-pointer shadow-sm"
            >
              حسناً ✓
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
