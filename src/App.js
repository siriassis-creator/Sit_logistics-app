import React, { useState, useEffect } from 'react';
import { initializeApp } from 'firebase/app';
import { 
  getAuth, 
  signInAnonymously, 
  onAuthStateChanged, 
  signOut 
} from 'firebase/auth';
import { 
  getFirestore, 
  collection, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc, 
  onSnapshot, 
  serverTimestamp
} from 'firebase/firestore';
// Import Icons
import { 
  LayoutDashboard, Truck, Users, Package, Wrench, FileText, 
  LogOut, Plus, X, CheckCircle, AlertTriangle, Clock, MapPin, 
  Phone, Calendar, ChevronRight, Search, Bell
} from 'lucide-react';
// Import Charts
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, 
  Legend, ResponsiveContainer, PieChart, Pie, Cell
} from 'recharts';

// --- Firebase Configuration ---
const firebaseConfig = {
  apiKey: "AIzaSyA1t_oeHrwdwK_D7lvHnZr6uHOajxciO7s",
  authDomain: "sit-logistics-22d9d.firebaseapp.com",
  projectId: "sit-logistics-22d9d",
  storageBucket: "sit-logistics-22d9d.firebasestorage.app",
  messagingSenderId: "147870294446",
  appId: "1:147870294446:web:a4f228a8a8b9233b8fe83f",
  measurementId: "G-GGD85V4YXJ"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// --- Main Component ---
export default function App() {
  const [user, setUser] = useState(null);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Data States
  const [drivers, setDrivers] = useState([]);
  const [fleet, setFleet] = useState([]);
  const [orders, setOrders] = useState([]);
  const [maintenance, setMaintenance] = useState([]);

  // --- Auth Initialization ---
  useEffect(() => {
    const initAuth = async () => {
      try {
        await signInAnonymously(auth);
      } catch (err) {
        console.error("Auth Error:", err);
        if (err.code === 'auth/admin-restricted-operation' || err.code === 'auth/operation-not-allowed') {
            setError("Error: กรุณาเปิดใช้งาน 'Anonymous' ใน Firebase Console -> Authentication -> Sign-in method");
        } else {
            setError(`ไม่สามารถเข้าสู่ระบบได้: ${err.message}`);
        }
        setLoading(false);
      }
    };

    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
      } else {
        initAuth();
      }
    });

    return () => unsubscribe();
  }, []);

  // --- Data Fetching (Realtime) ---
  useEffect(() => {
    if (!user) return;

    const collections = ['drivers', 'fleet', 'orders', 'maintenance'];
    const unsubscribes = [];

    const fetchData = (colName, setState) => {
      const q = collection(db, colName);
      return onSnapshot(q, (snapshot) => {
        const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setState(data);
        setLoading(false); 
      }, (err) => {
        console.error(`Error fetching ${colName}:`, err);
        if (err.code === 'permission-denied') {
            setError("Permission denied. โปรดตรวจสอบ Firestore Security Rules");
            setLoading(false);
        }
      });
    };

    unsubscribes.push(fetchData('drivers', setDrivers));
    unsubscribes.push(fetchData('fleet', setFleet));
    unsubscribes.push(fetchData('orders', setOrders));
    unsubscribes.push(fetchData('maintenance', setMaintenance));

    return () => unsubscribes.forEach(unsub => unsub());
  }, [user]);

  // --- Helpers ---
  const handleLogout = async () => {
    await signOut(auth);
    window.location.reload();
  };

  const seedData = async () => {
    if (fleet.length > 0) {
        alert('มีข้อมูลในระบบแล้ว');
        return;
    }
    
    const mockFleet = [
      { plate: '70-1234', type: 'หัวลาก 10 ล้อ', brand: 'HINO', customer: 'SCG', status: 'Available', createdAt: serverTimestamp() },
      { plate: '71-5678', type: 'หางพื้นเรียบ', brand: 'PANUS', customer: 'Nestle', status: 'In Transit', createdAt: serverTimestamp() },
      { plate: '72-9012', type: 'หัวลาก 10 ล้อ', brand: 'ISUZU', customer: 'PTT', status: 'Maintenance', createdAt: serverTimestamp() },
    ];
    
    const mockDrivers = [
      { name: 'สมชาย ใจดี', phone: '081-111-2222', photoUrl: '', licenseType: 'ท.4', experience: 5, training: ['การขับขี่เชิงป้องกัน', 'สินค้าอันตราย'], createdAt: serverTimestamp() },
      { name: 'วิชัย มุ่งมั่น', phone: '089-999-8888', photoUrl: '', licenseType: 'ท.3', experience: 3, training: ['การปฐมพยาบาล'], createdAt: serverTimestamp() },
    ];

    try {
      setLoading(true);
      for (const f of mockFleet) await addDoc(collection(db, 'fleet'), f);
      for (const d of mockDrivers) await addDoc(collection(db, 'drivers'), d);
    } catch (e) {
      console.error("Error seeding data:", e);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return (
    <div className="flex flex-col items-center justify-center h-screen bg-slate-50 text-slate-500 gap-4">
        <div className="relative">
            <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-indigo-500"></div>
            <div className="absolute top-0 left-0 h-16 w-16 rounded-full border-t-4 border-transparent border-indigo-200 animate-pulse"></div>
        </div>
        <p className="font-medium tracking-wide animate-pulse">Connecting to Services...</p>
    </div>
  );

  if (error) return (
    <div className="flex flex-col items-center justify-center h-screen bg-red-50 text-red-600 p-8 text-center">
        <div className="bg-white p-8 rounded-3xl shadow-xl border border-red-100 max-w-lg">
            <div className="bg-red-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <AlertTriangle size={32} className="text-red-500" />
            </div>
            <h2 className="text-2xl font-bold mb-2 text-slate-800">Connection Error</h2>
            <p className="text-slate-500 mb-6">{error}</p>
            <button onClick={() => window.location.reload()} className="bg-red-500 text-white px-6 py-3 rounded-full font-semibold shadow-lg shadow-red-200 hover:bg-red-600 transition-all hover:scale-105 active:scale-95">
                Try Again
            </button>
        </div>
    </div>
  );

  return (
    <div className="flex flex-col h-screen bg-[#F2F5F9] font-sans text-slate-700 overflow-hidden selection:bg-indigo-100 selection:text-indigo-700">
      {/* --- Top Navigation Bar (Glassmorphism) --- */}
      <header className="sticky top-0 z-50 bg-white/70 backdrop-blur-xl border-b border-white/20 shadow-sm shrink-0">
        <div className="container mx-auto px-4 lg:px-6 h-20 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="bg-gradient-to-br from-indigo-500 to-violet-600 p-2.5 rounded-2xl shadow-lg shadow-indigo-500/20">
              <Truck className="w-6 h-6 text-white" strokeWidth={2.5} />
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight text-slate-800">Siam Inter Modal</h1>
              <div className="flex items-center space-x-2">
                <span className="h-1.5 w-1.5 bg-green-500 rounded-full animate-pulse"></span>
                <p className="text-[11px] font-semibold text-slate-400 tracking-wider uppercase">Logistics Platform</p>
              </div>
            </div>
          </div>
          
          <nav className="hidden xl:flex items-center p-1.5 bg-slate-100/50 rounded-full border border-slate-200/50">
            <NavButton icon={<LayoutDashboard size={18}/>} label="Dashboard" active={activeTab === 'dashboard'} onClick={() => setActiveTab('dashboard')} />
            <NavButton icon={<Truck size={18}/>} label="Fleet" active={activeTab === 'fleet'} onClick={() => setActiveTab('fleet')} />
            <NavButton icon={<Users size={18}/>} label="Team" active={activeTab === 'employees'} onClick={() => setActiveTab('employees')} />
            <NavButton icon={<Package size={18}/>} label="Shipments" active={activeTab === 'orders'} onClick={() => setActiveTab('orders')} />
            <NavButton icon={<Wrench size={18}/>} label="Service" active={activeTab === 'maintenance'} onClick={() => setActiveTab('maintenance')} />
            <NavButton icon={<FileText size={18}/>} label="Report" active={activeTab === 'reports'} onClick={() => setActiveTab('reports')} />
          </nav>

          <div className="flex items-center space-x-4">
             {/* Mobile Menu Toggle */}
             <div className="xl:hidden flex items-center bg-white p-1 rounded-full border border-slate-200 shadow-sm">
                <button onClick={() => setActiveTab('dashboard')} className={`p-2 rounded-full transition-all ${activeTab === 'dashboard' ? 'bg-indigo-50 text-indigo-600' : 'text-slate-400'}`}><LayoutDashboard size={20}/></button>
                <button onClick={() => setActiveTab('orders')} className={`p-2 rounded-full transition-all ${activeTab === 'orders' ? 'bg-indigo-50 text-indigo-600' : 'text-slate-400'}`}><Package size={20}/></button>
                <button onClick={() => setActiveTab('fleet')} className={`p-2 rounded-full transition-all ${activeTab === 'fleet' ? 'bg-indigo-50 text-indigo-600' : 'text-slate-400'}`}><Truck size={20}/></button>
             </div>

            <div className="flex items-center space-x-3 pl-4 border-l border-slate-200">
               <button className="p-2 text-slate-400 hover:text-indigo-600 transition-colors relative">
                  <Bell size={20} />
                  <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border border-white"></span>
               </button>
              <div className="text-right hidden sm:block leading-tight">
                <p className="text-sm font-bold text-slate-800">{user?.isAnonymous ? 'Admin User' : 'Staff'}</p>
                <p className="text-[10px] text-slate-400 font-medium">HQ - Bang Si Thong</p>
              </div>
              <div className="h-10 w-10 rounded-full bg-gradient-to-tr from-indigo-100 to-purple-100 flex items-center justify-center border border-white shadow-sm">
                 <span className="text-indigo-600 font-bold text-sm">AD</span>
              </div>
              <button 
                onClick={handleLogout}
                className="p-2 rounded-full hover:bg-red-50 text-slate-300 hover:text-red-500 transition-all"
                title="Log Out"
              >
                <LogOut size={18} />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* --- Main Content Area --- */}
      <main className="flex-1 overflow-auto p-4 md:p-8 relative scroll-smooth">
        <div className="container mx-auto max-w-[1400px] pb-24">
          
          {/* Header Section of Page */}
          <div className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-4 animate-fade-in-up">
             <div>
                <h2 className="text-3xl font-extrabold text-slate-800 tracking-tight">
                    {activeTab === 'dashboard' && 'Overview'}
                    {activeTab === 'fleet' && 'Fleet Management'}
                    {activeTab === 'employees' && 'Driver Team'}
                    {activeTab === 'orders' && 'Shipments & Jobs'}
                    {activeTab === 'maintenance' && 'Maintenance & PM'}
                    {activeTab === 'reports' && 'Analytics'}
                </h2>
                <p className="text-slate-500 mt-1 font-medium">Welcome back, here is what's happening today.</p>
             </div>
             {activeTab === 'dashboard' && (
                 <div className="text-sm font-medium text-slate-400 bg-white/60 px-4 py-2 rounded-full backdrop-blur-sm border border-white/50 shadow-sm">
                    {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                 </div>
             )}
          </div>

          <div className="animate-fade-in">
            {activeTab === 'dashboard' && <DashboardView drivers={drivers} fleet={fleet} orders={orders} maintenance={maintenance} />}
            {activeTab === 'fleet' && <FleetView fleet={fleet} db={db} />}
            {activeTab === 'employees' && <EmployeeView drivers={drivers} db={db} />}
            {activeTab === 'orders' && <OrderView orders={orders} fleet={fleet} drivers={drivers} db={db} />}
            {activeTab === 'maintenance' && <MaintenanceView maintenance={maintenance} fleet={fleet} db={db} />}
            {activeTab === 'reports' && <ReportsView orders={orders} fleet={fleet} />}
          </div>
        </div>
        
        {/* FAB for Demo Data */}
        {fleet.length === 0 && activeTab === 'dashboard' && !loading && (
          <div className="fixed bottom-8 right-8 z-40">
            <button onClick={seedData} className="group bg-indigo-600 text-white font-bold pl-4 pr-6 py-4 rounded-full shadow-2xl shadow-indigo-500/40 hover:bg-indigo-500 transition-all hover:scale-105 active:scale-95 flex items-center gap-3">
              <div className="bg-white/20 p-1.5 rounded-full group-hover:rotate-90 transition-transform">
                 <Plus size={20} /> 
              </div>
              <span>Generate Demo Data</span>
            </button>
          </div>
        )}
      </main>
    </div>
  );
}

// --- Sub-Components (Refactored for Modern iOS Look) ---

function NavButton({ icon, label, active, onClick }) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center space-x-2 px-5 py-2.5 rounded-full transition-all duration-300 text-sm font-semibold ${
        active 
          ? 'bg-white text-indigo-600 shadow-md shadow-slate-200 scale-100' 
          : 'text-slate-500 hover:bg-white/60 hover:text-slate-700'
      }`}
    >
      {React.cloneElement(icon, { size: active ? 18 : 18, strokeWidth: active ? 2.5 : 2 })}
      <span>{label}</span>
    </button>
  );
}

function DashboardView({ drivers, fleet, orders, maintenance }) {
  const stats = [
    { label: 'Total Fleet', value: fleet.length, sub: 'Vehicles', color: 'text-blue-600', bg: 'bg-blue-50', ring: 'ring-blue-100', icon: <Truck /> },
    { label: 'Pending Jobs', value: orders.filter(o => o.status === 'Pending').length, sub: 'Orders', color: 'text-amber-500', bg: 'bg-amber-50', ring: 'ring-amber-100', icon: <Clock /> },
    { label: 'Active Transit', value: orders.filter(o => o.status === 'In Transit').length, sub: 'On Road', color: 'text-emerald-500', bg: 'bg-emerald-50', ring: 'ring-emerald-100', icon: <MapPin /> },
    { label: 'Maintenance', value: maintenance.filter(m => m.status !== 'Completed').length, sub: 'Issues', color: 'text-rose-500', bg: 'bg-rose-50', ring: 'ring-rose-100', icon: <Wrench /> },
  ];

  return (
    <div className="space-y-8">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, idx) => (
          <div key={idx} className="bg-white p-6 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 flex items-center justify-between hover:scale-[1.02] transition-transform duration-300 cursor-default">
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">{stat.label}</p>
              <div className="flex items-baseline space-x-2">
                 <p className="text-4xl font-extrabold text-slate-800 tracking-tight">{stat.value}</p>
                 <span className="text-xs font-semibold text-slate-400">{stat.sub}</span>
              </div>
            </div>
            <div className={`p-4 rounded-2xl ${stat.bg} ${stat.color} ring-4 ${stat.ring}`}>
              {React.cloneElement(stat.icon, { size: 24, strokeWidth: 2.5 })}
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Recent Jobs Table */}
        <div className="lg:col-span-2 bg-white p-8 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100">
          <div className="flex justify-between items-center mb-6">
             <h3 className="font-bold text-xl text-slate-800 flex items-center">
                <div className="bg-indigo-100 p-2 rounded-xl mr-3 text-indigo-600"><Package size={20}/></div>
                Live Shipments
             </h3>
             <button className="text-indigo-600 text-sm font-semibold hover:bg-indigo-50 px-3 py-1 rounded-full transition-colors">View All</button>
          </div>
          
          <div className="overflow-hidden rounded-2xl border border-slate-100">
            <table className="w-full text-sm">
              <thead className="bg-slate-50/80 text-slate-500 font-semibold border-b border-slate-100">
                <tr>
                  <th className="p-4 text-left">Tracking ID</th>
                  <th className="p-4 text-left">Customer</th>
                  <th className="p-4 text-left">Status</th>
                  <th className="p-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 bg-white">
                {orders.slice(0, 5).map(order => (
                  <tr key={order.id} className="hover:bg-slate-50/80 transition-colors group">
                    <td className="p-4 font-mono font-medium text-slate-600">{order.jobId}</td>
                    <td className="p-4 font-bold text-slate-800">{order.customer}</td>
                    <td className="p-4">
                      <StatusBadge status={order.status} />
                    </td>
                    <td className="p-4 text-right">
                       <ChevronRight size={18} className="text-slate-300 group-hover:text-indigo-500 ml-auto transition-colors" />
                    </td>
                  </tr>
                ))}
                {orders.length === 0 && <tr><td colSpan="4" className="p-8 text-center text-slate-400 italic">No recent activity</td></tr>}
              </tbody>
            </table>
          </div>
        </div>

        {/* Fleet Status Card */}
        <div className="bg-white p-8 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 flex flex-col">
          <h3 className="font-bold text-xl mb-6 text-slate-800 flex items-center">
             <div className="bg-emerald-100 p-2 rounded-xl mr-3 text-emerald-600"><Truck size={20}/></div>
             Fleet Status
          </h3>
           <div className="flex-1 flex flex-col justify-center space-y-8">
                {['Available', 'In Transit', 'Maintenance'].map(status => {
                  const count = fleet.filter(f => f.status === status).length;
                  const percent = fleet.length ? (count / fleet.length) * 100 : 0;
                  const colorClass = status === 'Available' ? 'bg-emerald-500' : status === 'In Transit' ? 'bg-indigo-500' : 'bg-rose-500';
                  
                  return (
                    <div key={status}>
                      <div className="flex justify-between text-sm mb-3 font-medium">
                        <span className="text-slate-600">{status}</span>
                        <span className="font-bold text-slate-900">{count}</span>
                      </div>
                      <div className="w-full bg-slate-100 rounded-full h-3 overflow-hidden">
                        <div className={`${colorClass} h-3 rounded-full shadow-lg transition-all duration-1000 ease-out`} style={{ width: `${percent}%` }}></div>
                      </div>
                    </div>
                  )
                })}
           </div>
           <div className="mt-8 pt-6 border-t border-slate-100 text-center">
               <p className="text-xs text-slate-400 font-medium">Total Capacity Utilized: {Math.round((fleet.filter(f => f.status !== 'Available').length / (fleet.length || 1)) * 100)}%</p>
           </div>
        </div>
      </div>
    </div>
  );
}

function FleetView({ fleet, db }) {
  const [showModal, setShowModal] = useState(false);
  const [filterCustomer, setFilterCustomer] = useState('All');
  
  const customers = ['All', ...new Set(fleet.map(f => f.customer).filter(Boolean))];
  const filteredFleet = filterCustomer === 'All' ? fleet : fleet.filter(f => f.customer === filterCustomer);

  const handleAdd = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const data = {
      plate: formData.get('plate'),
      type: formData.get('type'),
      brand: formData.get('brand'),
      customer: formData.get('customer'),
      status: 'Available',
      createdAt: serverTimestamp()
    };
    await addDoc(collection(db, 'fleet'), data);
    setShowModal(false);
  };

  return (
    <div>
      <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4 bg-white p-4 rounded-2xl shadow-sm border border-slate-100">
        <div className="relative w-full md:w-64">
             <Search className="absolute left-3 top-2.5 text-slate-400" size={18} />
             <input type="text" placeholder="Search plate..." className="w-full pl-10 pr-4 py-2 rounded-xl bg-slate-50 border-none focus:ring-2 focus:ring-indigo-500/20 text-sm font-medium text-slate-700" />
        </div>
        <div className="flex gap-3 w-full md:w-auto">
            <select 
                className="bg-slate-50 border-none text-slate-700 text-sm rounded-xl px-4 py-2 font-medium focus:ring-2 focus:ring-indigo-500/20 cursor-pointer"
                value={filterCustomer}
                onChange={(e) => setFilterCustomer(e.target.value)}
            >
                {customers.map(c => <option key={c} value={c}>{c === 'All' ? 'All Customers' : c}</option>)}
            </select>
            <PrimaryButton onClick={() => setShowModal(true)} icon={<Plus size={18} />} label="Add Vehicle" />
        </div>
      </div>

      <div className="bg-white rounded-3xl shadow-[0_4px_20px_rgb(0,0,0,0.03)] border border-slate-100 overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead className="bg-slate-50/80 border-b border-slate-100 text-slate-500 text-xs uppercase tracking-wider font-semibold">
            <tr>
              <th className="p-5 pl-8">Plate No.</th>
              <th className="p-5">Type</th>
              <th className="p-5">Brand</th>
              <th className="p-5">Assigned To</th>
              <th className="p-5">Status</th>
              <th className="p-5 text-right pr-8">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {filteredFleet.map(item => (
              <tr key={item.id} className="hover:bg-indigo-50/30 transition-colors group">
                <td className="p-5 pl-8 font-bold text-slate-700">{item.plate}</td>
                <td className="p-5 text-slate-600 font-medium">{item.type}</td>
                <td className="p-5 text-slate-500">{item.brand}</td>
                <td className="p-5 font-medium text-indigo-600">{item.customer || '-'}</td>
                <td className="p-5">
                  <StatusBadge status={item.status} />
                </td>
                <td className="p-5 text-right pr-8">
                  <button onClick={() => deleteDoc(doc(db, 'fleet', item.id))} className="text-slate-300 hover:text-rose-500 transition-colors p-2 rounded-full hover:bg-rose-50">
                    <X size={18}/>
                  </button>
                </td>
              </tr>
            ))}
            {filteredFleet.length === 0 && <tr><td colSpan="6" className="p-12 text-center text-slate-400">No vehicles found.</td></tr>}
          </tbody>
        </table>
      </div>

      {showModal && (
        <Modal title="Add New Vehicle" onClose={() => setShowModal(false)}>
          <form onSubmit={handleAdd} className="space-y-5">
            <InputGroup label="License Plate" name="plate" placeholder="70-xxxx" required />
            <div className="grid grid-cols-2 gap-5">
                <SelectGroup label="Vehicle Type" name="type" options={['10-Wheel Truck', '6-Wheel Truck', '4-Wheel Pickup', 'Flatbed Trailer', 'Container Trailer']} />
                <InputGroup label="Brand" name="brand" placeholder="e.g. ISUZU" />
            </div>
            <InputGroup label="Assigned Customer" name="customer" placeholder="Optional" />
            <SubmitButton label="Save Vehicle" />
          </form>
        </Modal>
      )}
    </div>
  );
}

function EmployeeView({ drivers, db }) {
    const [showModal, setShowModal] = useState(false);
  
    const handleAdd = async (e) => {
      e.preventDefault();
      const formData = new FormData(e.target);
      const trainingStr = formData.get('training');
      const data = {
        name: formData.get('name'),
        phone: formData.get('phone'),
        licenseType: formData.get('licenseType'),
        photoUrl: formData.get('photoUrl') || '',
        training: trainingStr ? trainingStr.split(',') : [],
        createdAt: serverTimestamp()
      };
      await addDoc(collection(db, 'drivers'), data);
      setShowModal(false);
    };
  
    return (
      <div>
        <div className="flex justify-between items-center mb-8">
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold text-slate-800">Drivers</h2>
            <span className="bg-slate-200 text-slate-600 text-xs font-bold px-2 py-1 rounded-full">{drivers.length}</span>
          </div>
          <PrimaryButton onClick={() => setShowModal(true)} icon={<Plus size={18} />} label="New Driver" />
        </div>
  
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {drivers.map(driver => (
            <div key={driver.id} className="bg-white rounded-3xl shadow-[0_4px_20px_rgb(0,0,0,0.03)] border border-slate-100 p-6 flex flex-col items-center text-center relative hover:shadow-lg transition-all hover:-translate-y-1 group">
               <button onClick={() => deleteDoc(doc(db, 'drivers', driver.id))} className="absolute top-4 right-4 text-slate-300 hover:text-rose-500 opacity-0 group-hover:opacity-100 transition-opacity"><X size={18}/></button>
              
              <div className="relative mb-4">
                 <div className="w-24 h-24 rounded-full overflow-hidden bg-slate-100 border-4 border-white shadow-md">
                    <img src={driver.photoUrl} alt={driver.name} className="w-full h-full object-cover" 
                        onError={(e) => e.target.src = `https://ui-avatars.com/api/?name=${driver.name}&background=6366f1&color=fff`} />
                 </div>
                 <div className="absolute bottom-1 right-1 bg-green-500 w-5 h-5 rounded-full border-2 border-white"></div>
              </div>

              <h3 className="font-bold text-lg text-slate-800">{driver.name}</h3>
              <p className="text-slate-500 text-sm flex items-center justify-center mt-1 gap-1"><Phone size={14}/> {driver.phone}</p>
              
              <div className="mt-6 w-full text-left bg-slate-50/50 p-4 rounded-2xl border border-slate-100">
                  <div className="flex justify-between items-center mb-3 pb-3 border-b border-slate-100">
                    <span className="text-xs font-semibold text-slate-400 uppercase">License</span>
                    <span className="font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded text-sm">{driver.licenseType}</span>
                  </div>
                  <div className="mb-2 text-xs font-semibold text-slate-400 uppercase">Certificates</div>
                  <div className="flex flex-wrap gap-2">
                      {driver.training && driver.training.length > 0 ? (
                          driver.training.map((t, i) => (
                              <span key={i} className="px-2 py-1 bg-white border border-slate-200 text-slate-600 text-[10px] rounded-md shadow-sm font-medium">{t.trim()}</span>
                          ))
                      ) : <span className="text-xs text-slate-400 italic">None</span>}
                  </div>
              </div>
            </div>
          ))}
        </div>
  
        {showModal && (
          <Modal title="Register Driver" onClose={() => setShowModal(false)}>
            <form onSubmit={handleAdd} className="space-y-5">
              <InputGroup label="Full Name" name="name" required />
              <div className="grid grid-cols-2 gap-5">
                  <InputGroup label="Phone Number" name="phone" />
                  <SelectGroup label="License Class" name="licenseType" options={['Type 2', 'Type 3', 'Type 4']} />
              </div>
              <InputGroup label="Photo URL" name="photoUrl" placeholder="https://..." />
              <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">Training (Comma separated)</label>
                  <textarea name="training" className="w-full bg-slate-50 border-none p-3 rounded-xl focus:ring-2 focus:ring-indigo-500/20 text-slate-700 font-medium resize-none" rows="2" placeholder="Defensive Driving, Hazmat..."></textarea>
              </div>
              <SubmitButton label="Register" />
            </form>
          </Modal>
        )}
      </div>
    );
  }

function OrderView({ orders, fleet, drivers, db }) {
    const [showModal, setShowModal] = useState(false);

    const handleAdd = async (e) => {
        e.preventDefault();
        const formData = new FormData(e.target);
        
        const truckId = formData.get('truckId');
        if(truckId) await updateDoc(doc(db, 'fleet', truckId), { status: 'In Transit' });

        const fleetItem = fleet.find(f => f.id === truckId);
        const driverItem = drivers.find(d => d.id === formData.get('driverId'));

        const data = {
            jobId: 'JOB-' + Math.floor(1000 + Math.random() * 9000),
            customer: formData.get('customer'),
            origin: formData.get('origin'),
            destination: formData.get('destination'),
            truckId: truckId,
            truckPlate: fleetItem ? fleetItem.plate : 'N/A',
            driverId: formData.get('driverId'),
            driverName: driverItem ? driverItem.name : 'N/A',
            status: 'Pending',
            date: new Date().toISOString().split('T')[0],
            createdAt: serverTimestamp()
        };
        await addDoc(collection(db, 'orders'), data);
        setShowModal(false);
    };

    const updateStatus = async (orderId, newStatus, truckId) => {
        await updateDoc(doc(db, 'orders', orderId), { status: newStatus });
        if(newStatus === 'Completed' || newStatus === 'Cancelled') {
             if(truckId) await updateDoc(doc(db, 'fleet', truckId), { status: 'Available' });
        }
    };

    return (
        <div>
            <div className="flex justify-between items-center mb-8">
                <h2 className="text-xl font-bold text-slate-800">Shipment Management</h2>
                <PrimaryButton onClick={() => setShowModal(true)} icon={<Plus size={18} />} label="New Shipment" />
            </div>

            <div className="space-y-4">
                {orders.length === 0 && <div className="text-center text-slate-400 py-20 bg-white rounded-3xl border border-dashed border-slate-200">No active shipments</div>}
                {orders.map(order => (
                    <div key={order.id} className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-6 hover:shadow-md transition-shadow">
                        <div className="flex-1">
                            <div className="flex items-center gap-3 mb-3">
                                <span className="font-mono text-[10px] bg-slate-800 text-white px-2 py-1 rounded-md font-bold tracking-wider">{order.jobId}</span>
                                <StatusBadge status={order.status} />
                                <span className="text-lg font-bold text-slate-800">{order.customer}</span>
                            </div>
                            
                            <div className="flex flex-col md:flex-row md:items-center gap-4 text-sm">
                                <div className="flex items-center gap-3 bg-slate-50 px-4 py-2 rounded-xl text-slate-600 font-medium">
                                    <span className="flex items-center"><MapPin size={16} className="mr-2 text-indigo-400"/> {order.origin}</span>
                                    <span className="text-slate-300">→</span>
                                    <span className="flex items-center">{order.destination}</span>
                                </div>
                                
                                <div className="flex items-center gap-4 text-xs text-slate-500 font-medium ml-2">
                                    <span className="flex items-center"><Truck size={14} className="mr-1 text-slate-400"/> {order.truckPlate}</span>
                                    <span className="w-1 h-1 rounded-full bg-slate-300"></span>
                                    <span className="flex items-center"><Users size={14} className="mr-1 text-slate-400"/> {order.driverName}</span>
                                    <span className="w-1 h-1 rounded-full bg-slate-300"></span>
                                    <span className="flex items-center"><Calendar size={14} className="mr-1 text-slate-400"/> {order.date}</span>
                                </div>
                            </div>
                        </div>
                        
                        <div className="flex items-center gap-3 border-t border-slate-100 md:border-t-0 pt-4 md:pt-0">
                            {order.status === 'Pending' && (
                                <ActionButton onClick={() => updateStatus(order.id, 'In Transit', order.truckId)} label="Start" color="blue" />
                            )}
                            {order.status === 'In Transit' && (
                                <ActionButton onClick={() => updateStatus(order.id, 'Completed', order.truckId)} label="Complete" color="green" />
                            )}
                            <button onClick={() => {
                                 if(window.confirm('Delete this order?')) deleteDoc(doc(db, 'orders', order.id));
                            }} className="w-10 h-10 flex items-center justify-center rounded-full text-slate-300 hover:text-rose-500 hover:bg-rose-50 transition-colors"><X size={20}/></button>
                        </div>
                    </div>
                ))}
            </div>

            {showModal && (
                <Modal title="New Shipment Order" onClose={() => setShowModal(false)}>
                    <form onSubmit={handleAdd} className="space-y-5">
                        <InputGroup label="Customer" name="customer" required />
                        <div className="grid grid-cols-2 gap-5">
                            <InputGroup label="Origin" name="origin" required />
                            <InputGroup label="Destination" name="destination" required />
                        </div>
                        <div className="grid grid-cols-2 gap-5">
                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-2">Select Vehicle</label>
                                <select required name="truckId" className="w-full bg-slate-50 border-none p-3 rounded-xl focus:ring-2 focus:ring-indigo-500/20 text-slate-700 font-medium">
                                    <option value="">-- Choose Truck --</option>
                                    {fleet.filter(f => f.status === 'Available').map(f => (
                                        <option key={f.id} value={f.id}>{f.plate} ({f.type})</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-2">Driver</label>
                                <select required name="driverId" className="w-full bg-slate-50 border-none p-3 rounded-xl focus:ring-2 focus:ring-indigo-500/20 text-slate-700 font-medium">
                                    <option value="">-- Choose Driver --</option>
                                    {drivers.map(d => (
                                        <option key={d.id} value={d.id}>{d.name}</option>
                                    ))}
                                </select>
                            </div>
                        </div>
                        <SubmitButton label="Create Order" />
                    </form>
                </Modal>
            )}
        </div>
    );
}

function MaintenanceView({ maintenance, fleet, db }) {
    const [showModal, setShowModal] = useState(false);

    const handleAdd = async (e) => {
        e.preventDefault();
        const formData = new FormData(e.target);
        const truckId = formData.get('truckId');
        const truck = fleet.find(f => f.id === truckId);

        if(truckId) await updateDoc(doc(db, 'fleet', truckId), { status: 'Maintenance' });

        await addDoc(collection(db, 'maintenance'), {
            truckId,
            truckPlate: truck ? truck.plate : 'Unknown',
            issue: formData.get('issue'),
            type: formData.get('type'),
            priority: formData.get('priority'),
            status: 'Open',
            reportedDate: new Date().toISOString().split('T')[0],
            createdAt: serverTimestamp()
        });
        setShowModal(false);
    };

    const completeMaintenance = async (m) => {
        if(window.confirm('Mark as repaired? Truck will become Available.')) {
            await updateDoc(doc(db, 'maintenance', m.id), { status: 'Completed', completedDate: new Date().toISOString().split('T')[0] });
            await updateDoc(doc(db, 'fleet', m.truckId), { status: 'Available' });
        }
    }

    return (
        <div>
            <div className="flex justify-between items-center mb-8">
                <h2 className="text-xl font-bold text-slate-800">Maintenance Tickets</h2>
                <button onClick={() => setShowModal(true)} className="bg-rose-500 hover:bg-rose-600 text-white font-bold px-5 py-2.5 rounded-full flex items-center shadow-lg shadow-rose-200 transition-all">
                    <Wrench size={18} className="mr-2" /> Report Issue
                </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                 {/* Active Issues */}
                 <div className="space-y-4">
                    <h3 className="font-bold text-slate-800 flex items-center mb-4"><span className="w-2 h-6 bg-rose-500 rounded-full mr-3"></span> Active Issues</h3>
                    {maintenance.filter(m => m.status === 'Open').map(m => (
                        <div key={m.id} className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 flex justify-between items-start group hover:border-rose-100 transition-colors">
                            <div>
                                <div className="flex items-center gap-3 mb-2">
                                     <span className="font-black text-xl text-slate-800">{m.truckPlate}</span>
                                     <span className={`text-[10px] uppercase font-bold px-2 py-1 rounded-md ${m.priority === 'Critical' ? 'bg-rose-100 text-rose-600' : 'bg-amber-100 text-amber-600'}`}>{m.priority}</span>
                                </div>
                                <p className="text-slate-600 text-sm mb-3 font-medium leading-relaxed">{m.issue}</p>
                                <span className="bg-slate-100 text-slate-500 text-xs px-2 py-1 rounded font-semibold">{m.type}</span>
                            </div>
                            <button onClick={() => completeMaintenance(m)} className="text-emerald-500 hover:bg-emerald-50 p-2 rounded-full transition-colors" title="Mark Completed">
                                <CheckCircle size={32} />
                            </button>
                        </div>
                    ))}
                    {maintenance.filter(m => m.status === 'Open').length === 0 && (
                        <div className="p-8 text-center border-2 border-dashed border-slate-200 rounded-3xl">
                            <CheckCircle size={40} className="mx-auto text-emerald-200 mb-2"/>
                            <p className="text-slate-400 font-medium">All systems operational</p>
                        </div>
                    )}
                 </div>

                 {/* History */}
                 <div>
                    <h3 className="font-bold text-slate-800 flex items-center mb-4"><span className="w-2 h-6 bg-slate-300 rounded-full mr-3"></span> Repair History</h3>
                    <div className="bg-white rounded-3xl shadow-sm overflow-hidden border border-slate-100">
                        <table className="w-full text-sm">
                            <thead className="bg-slate-50 text-slate-500 font-semibold">
                                <tr>
                                    <th className="p-4 text-left">Vehicle</th>
                                    <th className="p-4 text-left">Issue</th>
                                    <th className="p-4 text-right">Fixed Date</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50">
                                {maintenance.filter(m => m.status === 'Completed').slice(0,10).map(m => (
                                    <tr key={m.id} className="hover:bg-slate-50">
                                        <td className="p-4 font-bold text-slate-700">{m.truckPlate}</td>
                                        <td className="p-4 text-slate-500">{m.issue}</td>
                                        <td className="p-4 text-right text-slate-400 font-mono">{m.completedDate}</td>
                                    </tr>
                                ))}
                                {maintenance.filter(m => m.status === 'Completed').length === 0 && <tr><td colSpan="3" className="p-8 text-center text-slate-400">No history yet</td></tr>}
                            </tbody>
                        </table>
                    </div>
                 </div>
            </div>

            {showModal && (
                <Modal title="Report Maintenance" onClose={() => setShowModal(false)}>
                    <form onSubmit={handleAdd} className="space-y-5">
                        <div>
                            <label className="block text-sm font-bold text-slate-700 mb-2">Vehicle</label>
                            <select required name="truckId" className="w-full bg-slate-50 border-none p-3 rounded-xl focus:ring-2 focus:ring-indigo-500/20 text-slate-700 font-medium">
                                {fleet.map(f => <option key={f.id} value={f.id}>{f.plate}</option>)}
                            </select>
                        </div>
                        <div className="grid grid-cols-2 gap-5">
                            <SelectGroup label="Type" name="type" options={['Breakdown', 'PM (Periodic)', 'Tire', 'Accident']} />
                            <SelectGroup label="Priority" name="priority" options={['Normal', 'High', 'Critical']} />
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-slate-700 mb-2">Description</label>
                            <textarea required name="issue" className="w-full bg-slate-50 border-none p-3 rounded-xl focus:ring-2 focus:ring-indigo-500/20 text-slate-700 font-medium resize-none" rows="3" placeholder="Describe the problem..."></textarea>
                        </div>
                        <button type="submit" className="w-full bg-rose-500 text-white font-bold p-3 rounded-xl hover:bg-rose-600 shadow-lg shadow-rose-200 transition-all">Submit Report</button>
                    </form>
                </Modal>
            )}
        </div>
    );
}

function ReportsView({ orders, fleet }) {
    const completedOrders = orders.filter(o => o.status === 'Completed');
    const revenueMock = completedOrders.map(o => ({
        name: o.jobId,
        value: Math.floor(Math.random() * 5000) + 2000 
    }));

    const fleetStatusData = [
        { name: 'Available', value: fleet.filter(f => f.status === 'Available').length, color: '#10B981' },
        { name: 'In Transit', value: fleet.filter(f => f.status === 'In Transit').length, color: '#6366F1' },
        { name: 'Maintenance', value: fleet.filter(f => f.status === 'Maintenance').length, color: '#F43F5E' },
    ].filter(d => d.value > 0);

    return (
        <div className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100 h-96">
                    <h3 className="font-bold text-lg mb-6 text-slate-800">Fleet Utilization</h3>
                    <ResponsiveContainer width="100%" height="85%">
                        <PieChart>
                            <Pie 
                                data={fleetStatusData} 
                                dataKey="value" 
                                nameKey="name" 
                                cx="50%" 
                                cy="50%" 
                                innerRadius={60} 
                                outerRadius={100} 
                                paddingAngle={5}
                            >
                                {fleetStatusData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={entry.color} strokeWidth={0} />
                                ))}
                            </Pie>
                            <Tooltip contentStyle={{backgroundColor: 'rgba(255, 255, 255, 0.9)', color: '#333', borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)'}} />
                            <Legend verticalAlign="bottom" height={36}/>
                        </PieChart>
                    </ResponsiveContainer>
                </div>

                <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100 h-96">
                    <h3 className="font-bold text-lg mb-6 text-slate-800">Completed Deliveries Value</h3>
                    {completedOrders.length > 0 ? (
                        <ResponsiveContainer width="100%" height="85%">
                             <BarChart data={revenueMock.slice(0, 10)}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                                <XAxis dataKey="name" stroke="#94a3b8" tick={{fontSize: 10}} tickLine={false} axisLine={false} />
                                <YAxis stroke="#94a3b8" tick={{fontSize: 10}} tickLine={false} axisLine={false} />
                                <Tooltip cursor={{fill: '#f8fafc'}} contentStyle={{backgroundColor: '#1e293b', color: '#fff', borderRadius: '8px', border: 'none'}} />
                                <Bar dataKey="value" fill="#6366f1" radius={[4, 4, 0, 0]} barSize={32} />
                            </BarChart>
                        </ResponsiveContainer>
                    ) : (
                        <div className="h-full flex flex-col items-center justify-center text-slate-400 gap-2">
                             <BarChart size={48} className="text-slate-200" />
                             <span>No data available yet</span>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}

// --- UI Components (Reusable) ---

function StatusBadge({ status }) {
    const styles = {
        'Available': 'bg-emerald-100 text-emerald-700 border-emerald-200',
        'In Transit': 'bg-indigo-100 text-indigo-700 border-indigo-200',
        'Maintenance': 'bg-rose-100 text-rose-700 border-rose-200',
        'Pending': 'bg-amber-100 text-amber-700 border-amber-200',
        'Completed': 'bg-slate-100 text-slate-700 border-slate-200',
        'Open': 'bg-rose-100 text-rose-700 border-rose-200'
    };
    
    return (
        <span className={`px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider border ${styles[status] || 'bg-gray-100 text-gray-500'}`}>
            {status}
        </span>
    );
}

function PrimaryButton({ onClick, icon, label }) {
    return (
        <button onClick={onClick} className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold px-5 py-2.5 rounded-full flex items-center shadow-lg shadow-indigo-200 hover:shadow-indigo-300 transition-all active:scale-95">
            <span className="mr-2">{icon}</span> {label}
        </button>
    );
}

function ActionButton({ onClick, label, color }) {
    const colors = {
        blue: 'bg-indigo-600 hover:bg-indigo-700 shadow-indigo-200',
        green: 'bg-emerald-500 hover:bg-emerald-600 shadow-emerald-200',
    }
    return (
        <button onClick={onClick} className={`${colors[color]} text-white font-semibold px-6 py-2 rounded-full text-sm shadow-lg transition-all hover:-translate-y-0.5 w-full md:w-auto`}>
            {label}
        </button>
    )
}

function InputGroup({ label, name, placeholder, required }) {
    return (
        <div>
            <label className="block text-sm font-bold text-slate-700 mb-2">{label}</label>
            <input required={required} name={name} className="w-full bg-slate-50 border-none p-3 rounded-xl focus:ring-2 focus:ring-indigo-500/20 text-slate-700 font-medium outline-none transition-all" placeholder={placeholder} />
        </div>
    )
}

function SelectGroup({ label, name, options }) {
    return (
        <div>
            <label className="block text-sm font-bold text-slate-700 mb-2">{label}</label>
            <select name={name} className="w-full bg-slate-50 border-none p-3 rounded-xl focus:ring-2 focus:ring-indigo-500/20 text-slate-700 font-medium outline-none cursor-pointer">
                {options.map(opt => <option key={opt}>{opt}</option>)}
            </select>
        </div>
    )
}

function SubmitButton({ label }) {
    return (
        <button type="submit" className="w-full bg-black text-white font-bold p-4 rounded-xl hover:bg-slate-800 transition-all shadow-lg hover:shadow-xl mt-2">
            {label}
        </button>
    )
}

function Modal({ title, children, onClose }) {
  return (
    <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in">
      <div className="bg-white rounded-[2rem] shadow-2xl w-full max-w-lg overflow-hidden border border-white/50 transform transition-all scale-100 animate-slide-up">
        <div className="flex justify-between items-center p-6 border-b border-slate-100 bg-white/80 backdrop-blur">
          <h3 className="font-bold text-xl text-slate-800">{title}</h3>
          <button onClick={onClose} className="bg-slate-100 p-2 rounded-full text-slate-400 hover:bg-rose-50 hover:text-rose-500 transition-colors"><X size={20}/></button>
        </div>
        <div className="p-8 overflow-y-auto max-h-[75vh]">
          {children}
        </div>
      </div>
    </div>
  );
}