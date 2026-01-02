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
  Phone, Calendar 
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
            setError("Permission denied. โปรดตรวจสอบ Firestore Security Rules (อนุญาตให้อ่าน/เขียน)");
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
        alert('มีข้อมูลในระบบแล้ว ไม่จำเป็นต้องสร้างข้อมูลตัวอย่างเพิ่ม');
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
      alert('สร้างข้อมูลตัวอย่างใน Firestore เรียบร้อย!');
    } catch (e) {
      console.error("Error seeding data:", e);
      alert(`เกิดข้อผิดพลาด: ${e.message}`);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return (
    <div className="flex flex-col items-center justify-center h-screen bg-zinc-100 text-zinc-600 gap-4">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-500"></div>
        <p>กำลังเชื่อมต่อฐานข้อมูล...</p>
    </div>
  );

  if (error) return (
    <div className="flex flex-col items-center justify-center h-screen bg-red-50 text-red-600 p-8 text-center">
        <AlertTriangle size={48} className="mb-4" />
        <h2 className="text-2xl font-bold mb-2">เกิดข้อผิดพลาด</h2>
        <p className="max-w-md bg-white p-4 rounded shadow border border-red-100">{error}</p>
        <button onClick={() => window.location.reload()} className="mt-6 bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700">ลองใหม่อีกครั้ง</button>
    </div>
  );

  return (
    <div className="flex flex-col h-screen bg-zinc-50 font-sans text-zinc-800 overflow-hidden">
      {/* --- Top Navigation Bar --- */}
      <header className="bg-zinc-900 text-white shadow-xl z-50 border-b border-yellow-500 shrink-0">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="bg-yellow-400 p-1.5 rounded-lg shadow-lg shadow-yellow-400/20">
              <Truck className="w-6 h-6 text-black" strokeWidth={2.5} />
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight text-white uppercase hidden sm:block">Siam Inter Modal</h1>
              <h1 className="text-xl font-bold tracking-tight text-white uppercase sm:hidden">SIM</h1>
              <div className="flex items-center space-x-2">
                <span className="h-0.5 w-4 bg-yellow-500 rounded-full"></span>
                <p className="text-[10px] text-zinc-400 tracking-wider">TRANSPORT MANAGEMENT SYSTEM</p>
              </div>
            </div>
          </div>
          
          <nav className="hidden lg:flex items-center space-x-1">
            <NavButton icon={<LayoutDashboard size={18}/>} label="Dashboard" active={activeTab === 'dashboard'} onClick={() => setActiveTab('dashboard')} />
            <NavButton icon={<Truck size={18}/>} label="Fleet" active={activeTab === 'fleet'} onClick={() => setActiveTab('fleet')} />
            <NavButton icon={<Users size={18}/>} label="พนักงาน" active={activeTab === 'employees'} onClick={() => setActiveTab('employees')} />
            <NavButton icon={<Package size={18}/>} label="Order/Shipment" active={activeTab === 'orders'} onClick={() => setActiveTab('orders')} />
            <NavButton icon={<Wrench size={18}/>} label="Maintenance" active={activeTab === 'maintenance'} onClick={() => setActiveTab('maintenance')} />
            <NavButton icon={<FileText size={18}/>} label="รายงาน" active={activeTab === 'reports'} onClick={() => setActiveTab('reports')} />
          </nav>
          
          <div className="lg:hidden flex space-x-2">
             <button onClick={() => setActiveTab('dashboard')} className={`p-2 rounded ${activeTab === 'dashboard' ? 'bg-yellow-400 text-black' : 'text-zinc-400'}`}><LayoutDashboard size={20}/></button>
             <button onClick={() => setActiveTab('orders')} className={`p-2 rounded ${activeTab === 'orders' ? 'bg-yellow-400 text-black' : 'text-zinc-400'}`}><Package size={20}/></button>
             <button onClick={() => setActiveTab('fleet')} className={`p-2 rounded ${activeTab === 'fleet' ? 'bg-yellow-400 text-black' : 'text-zinc-400'}`}><Truck size={20}/></button>
          </div>

          <div className="flex items-center space-x-3 ml-4">
            <div className="text-right hidden sm:block">
              <p className="text-sm font-bold text-yellow-400">{user?.isAnonymous ? 'Admin (Demo)' : 'Staff'}</p>
              <p className="text-xs text-zinc-500">Online</p>
            </div>
            <button 
              onClick={handleLogout}
              className="p-2 hover:bg-zinc-800 rounded-full transition-colors text-zinc-400 hover:text-white"
              title="ออกจากระบบ"
            >
              <LogOut size={20} />
            </button>
          </div>
        </div>
      </header>

      {/* --- Main Content Area --- */}
      <main className="flex-1 overflow-auto p-4 md:p-6 bg-zinc-50 relative">
        <div className="container mx-auto max-w-7xl pb-20">
          {activeTab === 'dashboard' && <DashboardView drivers={drivers} fleet={fleet} orders={orders} maintenance={maintenance} />}
          {activeTab === 'fleet' && <FleetView fleet={fleet} db={db} />}
          {activeTab === 'employees' && <EmployeeView drivers={drivers} db={db} />}
          {activeTab === 'orders' && <OrderView orders={orders} fleet={fleet} drivers={drivers} db={db} />}
          {activeTab === 'maintenance' && <MaintenanceView maintenance={maintenance} fleet={fleet} db={db} />}
          {activeTab === 'reports' && <ReportsView orders={orders} fleet={fleet} />}
        </div>
        
        {/* Mock Data Generator Button */}
        {fleet.length === 0 && activeTab === 'dashboard' && !loading && (
          <div className="fixed bottom-6 right-6 z-40 animate-bounce">
            <button onClick={seedData} className="bg-yellow-400 text-black font-bold px-6 py-3 rounded-full shadow-xl hover:bg-yellow-300 transition-colors border-4 border-white flex items-center gap-2">
              <Plus size={20} /> สร้างข้อมูลตัวอย่าง (Demo Data)
            </button>
          </div>
        )}
      </main>
    </div>
  );
}

// --- Sub-Components ---

function NavButton({ icon, label, active, onClick }) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center space-x-2 px-3 py-2 rounded-lg transition-all duration-200 text-sm font-medium ${
        active 
          ? 'bg-yellow-400 text-black shadow-lg shadow-yellow-400/20 translate-y-[-1px]' 
          : 'text-zinc-400 hover:bg-zinc-800 hover:text-white'
      }`}
    >
      {icon}
      <span>{label}</span>
    </button>
  );
}

function DashboardView({ drivers, fleet, orders, maintenance }) {
  const stats = [
    { label: 'รถทั้งหมด', value: fleet.length, color: 'text-blue-500', bg: 'bg-zinc-900', icon: <Truck /> },
    { label: 'งานรอดำเนินการ', value: orders.filter(o => o.status === 'Pending').length, color: 'text-yellow-400', bg: 'bg-zinc-900', icon: <Clock /> },
    { label: 'กำลังขนส่ง', value: orders.filter(o => o.status === 'In Transit').length, color: 'text-green-500', bg: 'bg-zinc-900', icon: <MapPin /> },
    { label: 'แจ้งซ่อม', value: maintenance.filter(m => m.status !== 'Completed').length, color: 'text-red-500', bg: 'bg-zinc-900', icon: <Wrench /> },
  ];

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-zinc-900 uppercase tracking-tight">Dashboard <span className="text-yellow-500">ภาพรวม</span></h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, idx) => (
          <div key={idx} className="bg-white p-6 rounded-xl shadow-sm border border-zinc-200 flex items-center justify-between hover:shadow-md transition-shadow">
            <div>
              <p className="text-sm font-medium text-zinc-500 uppercase tracking-wide">{stat.label}</p>
              <p className="text-3xl font-black text-zinc-900 mt-1">{stat.value}</p>
            </div>
            <div className={`p-4 rounded-xl ${stat.bg} ${stat.color} shadow-lg`}>
              {stat.icon}
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-zinc-200">
          <h3 className="font-bold text-lg mb-4 flex items-center text-zinc-900 border-b border-zinc-100 pb-2">
            <Package className="mr-2 size-5 text-yellow-500"/> งานล่าสุด (Realtime)
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-zinc-50 text-zinc-500 uppercase text-xs">
                <tr>
                  <th className="p-3 text-left rounded-l-lg">Job ID</th>
                  <th className="p-3 text-left">ลูกค้า</th>
                  <th className="p-3 text-left rounded-r-lg">สถานะ</th>
                </tr>
              </thead>
              <tbody>
                {orders.slice(0, 5).map(order => (
                  <tr key={order.id} className="border-b border-zinc-50 hover:bg-zinc-50 transition-colors">
                    <td className="p-3 font-mono font-medium text-zinc-700">{order.jobId}</td>
                    <td className="p-3 font-medium">{order.customer}</td>
                    <td className="p-3">
                      <span className={`px-2 py-1 rounded-md text-xs font-bold ${
                        order.status === 'Completed' ? 'bg-green-100 text-green-800' :
                        order.status === 'In Transit' ? 'bg-blue-100 text-blue-800' :
                        'bg-yellow-100 text-yellow-800'
                      }`}>
                        {order.status}
                      </span>
                    </td>
                  </tr>
                ))}
                {orders.length === 0 && <tr><td colSpan="3" className="p-4 text-center text-zinc-400">ไม่มีข้อมูลงานล่าสุด</td></tr>}
              </tbody>
            </table>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-zinc-200">
          <h3 className="font-bold text-lg mb-4 flex items-center text-zinc-900 border-b border-zinc-100 pb-2">
            <Truck className="mr-2 size-5 text-yellow-500"/> สถานะรถ (Fleet Status)
          </h3>
           <div className="h-64 flex items-center justify-center">
             <div className="w-full space-y-6">
                {['Available', 'In Transit', 'Maintenance'].map(status => {
                  const count = fleet.filter(f => f.status === status).length;
                  const percent = fleet.length ? (count / fleet.length) * 100 : 0;
                  const color = status === 'Available' ? 'bg-emerald-500' : status === 'In Transit' ? 'bg-blue-500' : 'bg-red-500';
                  return (
                    <div key={status}>
                      <div className="flex justify-between text-sm mb-2 font-medium">
                        <span className="text-zinc-600">{status}</span>
                        <span className="font-bold text-zinc-900">{count} คัน</span>
                      </div>
                      <div className="w-full bg-zinc-100 rounded-full h-3 overflow-hidden">
                        <div className={`${color} h-3 rounded-full shadow-sm transition-all duration-500`} style={{ width: `${percent}%` }}></div>
                      </div>
                    </div>
                  )
                })}
             </div>
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
      <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
        <h2 className="text-2xl font-bold text-zinc-900">ข้อมูล Fleet รถ <span className="text-zinc-400 text-lg ml-2">({filteredFleet.length})</span></h2>
        <div className="flex gap-2 w-full md:w-auto">
            <select 
                className="border border-zinc-300 rounded-lg px-3 py-2 text-sm bg-white focus:ring-2 focus:ring-yellow-400 outline-none"
                value={filterCustomer}
                onChange={(e) => setFilterCustomer(e.target.value)}
            >
                {customers.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
            <button onClick={() => setShowModal(true)} className="bg-yellow-400 hover:bg-yellow-300 text-black font-bold px-4 py-2 rounded-lg flex items-center shadow-md transition-colors">
            <Plus size={18} className="mr-2" /> เพิ่มรถใหม่
            </button>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-zinc-200 overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead className="bg-zinc-900 text-white text-sm uppercase">
            <tr>
              <th className="p-4 font-medium">ทะเบียน</th>
              <th className="p-4 font-medium">ประเภท</th>
              <th className="p-4 font-medium">ยี่ห้อ</th>
              <th className="p-4 font-medium">ลูกค้าประจำ</th>
              <th className="p-4 font-medium">สถานะ</th>
              <th className="p-4 font-medium">จัดการ</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-100">
            {filteredFleet.map(item => (
              <tr key={item.id} className="hover:bg-yellow-50 transition-colors">
                <td className="p-4 font-bold text-zinc-800">{item.plate}</td>
                <td className="p-4 text-zinc-600">{item.type}</td>
                <td className="p-4 text-zinc-600">{item.brand}</td>
                <td className="p-4 text-blue-600 font-medium">{item.customer || '-'}</td>
                <td className="p-4">
                  <span className={`px-3 py-1 rounded-md text-xs font-bold uppercase tracking-wider ${
                    item.status === 'Available' ? 'bg-green-100 text-green-700 border border-green-200' :
                    item.status === 'In Transit' ? 'bg-blue-100 text-blue-700 border border-blue-200' :
                    'bg-red-100 text-red-700 border border-red-200'
                  }`}>
                    {item.status}
                  </span>
                </td>
                <td className="p-4">
                  <button onClick={() => deleteDoc(doc(db, 'fleet', item.id))} className="text-zinc-400 hover:text-red-500 transition-colors">
                    <X size={18}/>
                  </button>
                </td>
              </tr>
            ))}
            {filteredFleet.length === 0 && <tr><td colSpan="6" className="p-8 text-center text-zinc-400">ไม่พบข้อมูล</td></tr>}
          </tbody>
        </table>
      </div>

      {showModal && (
        <Modal title="เพิ่มรถใหม่" onClose={() => setShowModal(false)}>
          <form onSubmit={handleAdd} className="space-y-4">
            <div><label className="block text-sm font-bold text-zinc-700 mb-1">ทะเบียนรถ</label><input required name="plate" className="w-full border border-zinc-300 p-2 rounded focus:ring-2 focus:ring-yellow-400 outline-none" placeholder="70-xxxx" /></div>
            <div className="grid grid-cols-2 gap-4">
                <div><label className="block text-sm font-bold text-zinc-700 mb-1">ประเภท</label>
                <select name="type" className="w-full border border-zinc-300 p-2 rounded focus:ring-2 focus:ring-yellow-400 outline-none">
                    <option>หัวลาก 10 ล้อ</option>
                    <option>รถบรรทุก 6 ล้อ</option>
                    <option>รถกระบะ 4 ล้อ</option>
                    <option>หางพื้นเรียบ</option>
                    <option>หางตู้</option>
                </select>
                </div>
                <div><label className="block text-sm font-bold text-zinc-700 mb-1">ยี่ห้อ</label><input name="brand" className="w-full border border-zinc-300 p-2 rounded focus:ring-2 focus:ring-yellow-400 outline-none" placeholder="ISUZU, HINO" /></div>
            </div>
            <div><label className="block text-sm font-bold text-zinc-700 mb-1">ลูกค้าประจำ (ถ้ามี)</label><input name="customer" className="w-full border border-zinc-300 p-2 rounded focus:ring-2 focus:ring-yellow-400 outline-none" placeholder="เช่น SCG" /></div>
            <button type="submit" className="w-full bg-black text-white font-bold p-3 rounded hover:bg-zinc-800 transition-colors">บันทึกข้อมูล</button>
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
        photoUrl: formData.get('photoUrl') || 'https://via.placeholder.com/150',
        training: trainingStr ? trainingStr.split(',') : [],
        createdAt: serverTimestamp()
      };
      await addDoc(collection(db, 'drivers'), data);
      setShowModal(false);
    };
  
    return (
      <div>
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-zinc-900">ฐานข้อมูลพนักงานขับรถ</h2>
          <button onClick={() => setShowModal(true)} className="bg-yellow-400 hover:bg-yellow-300 text-black font-bold px-4 py-2 rounded-lg flex items-center shadow-md">
            <Plus size={18} className="mr-2" /> เพิ่มพนักงาน
          </button>
        </div>
  
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {drivers.map(driver => (
            <div key={driver.id} className="bg-white rounded-xl shadow-sm border border-zinc-200 p-6 flex flex-col items-center text-center relative hover:shadow-lg transition-all hover:-translate-y-1">
               <button onClick={() => deleteDoc(doc(db, 'drivers', driver.id))} className="absolute top-4 right-4 text-zinc-300 hover:text-red-500"><X size={18}/></button>
              <div className="w-24 h-24 rounded-full overflow-hidden bg-zinc-100 mb-4 border-4 border-yellow-400 shadow-sm">
                <img src={driver.photoUrl} alt={driver.name} className="w-full h-full object-cover" 
                     onError={(e) => e.target.src = 'https://ui-avatars.com/api/?name='+driver.name} />
              </div>
              <h3 className="font-bold text-lg text-zinc-900">{driver.name}</h3>
              <p className="text-zinc-500 text-sm flex items-center justify-center mt-1"><Phone size={14} className="mr-1"/> {driver.phone}</p>
              
              <div className="mt-4 w-full text-left bg-zinc-50 p-4 rounded-lg text-sm border border-zinc-100">
                  <div className="flex justify-between mb-2 pb-2 border-b border-zinc-200">
                    <span className="text-zinc-500">ใบขับขี่:</span>
                    <span className="font-bold text-black bg-yellow-400 px-2 rounded-sm">{driver.licenseType}</span>
                  </div>
                  <div className="mb-2 text-zinc-500 font-medium">Driver Matrix (อบรม):</div>
                  <div className="flex flex-wrap gap-2">
                      {driver.training && driver.training.length > 0 ? (
                          driver.training.map((t, i) => (
                              <span key={i} className="px-2 py-1 bg-zinc-800 text-yellow-400 text-xs rounded font-medium">{t.trim()}</span>
                          ))
                      ) : <span className="text-xs text-zinc-400">- ไม่มีประวัติ -</span>}
                  </div>
              </div>
            </div>
          ))}
        </div>
  
        {showModal && (
          <Modal title="เพิ่มพนักงานใหม่" onClose={() => setShowModal(false)}>
            <form onSubmit={handleAdd} className="space-y-4">
              <div><label className="block text-sm font-bold text-zinc-700 mb-1">ชื่อ-นามสกุล</label><input required name="name" className="w-full border border-zinc-300 p-2 rounded focus:ring-2 focus:ring-yellow-400 outline-none" /></div>
              <div className="grid grid-cols-2 gap-4">
                  <div><label className="block text-sm font-bold text-zinc-700 mb-1">เบอร์โทรศัพท์</label><input name="phone" className="w-full border border-zinc-300 p-2 rounded focus:ring-2 focus:ring-yellow-400 outline-none" /></div>
                  <div><label className="block text-sm font-bold text-zinc-700 mb-1">ประเภทใบขับขี่</label>
                    <select name="licenseType" className="w-full border border-zinc-300 p-2 rounded focus:ring-2 focus:ring-yellow-400 outline-none">
                        <option>ท.2</option>
                        <option>ท.3</option>
                        <option>ท.4</option>
                    </select>
                  </div>
              </div>
              <div><label className="block text-sm font-bold text-zinc-700 mb-1">รูปถ่าย (URL Link)</label><input name="photoUrl" className="w-full border border-zinc-300 p-2 rounded focus:ring-2 focus:ring-yellow-400 outline-none" placeholder="https://..." /></div>
              <div>
                  <label className="block text-sm font-bold text-zinc-700 mb-1">ประวัติการอบรม (คั่นด้วยจุลภาค)</label>
                  <textarea name="training" className="w-full border border-zinc-300 p-2 rounded focus:ring-2 focus:ring-yellow-400 outline-none" rows="2" placeholder="ขับขี่เชิงป้องกัน, สินค้าอันตราย, การดับเพลิง"></textarea>
              </div>
              <button type="submit" className="w-full bg-black text-white font-bold p-3 rounded hover:bg-zinc-800 transition-colors">บันทึก</button>
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
        
        // Update truck status
        const truckId = formData.get('truckId');
        if(truckId) {
            await updateDoc(doc(db, 'fleet', truckId), { status: 'In Transit' });
        }

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
            status: 'Pending', // Pending, In Transit, Delivered, Cancelled
            date: new Date().toISOString().split('T')[0],
            createdAt: serverTimestamp()
        };
        await addDoc(collection(db, 'orders'), data);
        setShowModal(false);
    };

    const updateStatus = async (orderId, newStatus, truckId) => {
        await updateDoc(doc(db, 'orders', orderId), { status: newStatus });
        if(newStatus === 'Completed' || newStatus === 'Cancelled') {
             // Release truck
             if(truckId) await updateDoc(doc(db, 'fleet', truckId), { status: 'Available' });
        }
    };

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-zinc-900">จ่ายงาน / Shipment</h2>
                <button onClick={() => setShowModal(true)} className="bg-yellow-400 hover:bg-yellow-300 text-black font-bold px-4 py-2 rounded-lg flex items-center shadow-md">
                    <Plus size={18} className="mr-2" /> สร้างใบงานใหม่
                </button>
            </div>

            <div className="space-y-4">
                {orders.length === 0 && <div className="text-center text-zinc-400 py-10 bg-white rounded-xl border border-dashed border-zinc-300">ยังไม่มีรายการงาน</div>}
                {orders.map(order => (
                    <div key={order.id} className="bg-white p-4 rounded-xl shadow-sm border border-zinc-200 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:border-yellow-400 transition-colors">
                        <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                                <span className="font-mono text-xs bg-zinc-900 text-yellow-400 px-2 py-1 rounded font-bold">{order.jobId}</span>
                                <span className={`text-xs px-2 py-1 rounded-md font-bold uppercase tracking-wider ${
                                    order.status === 'Completed' ? 'bg-green-100 text-green-700' :
                                    order.status === 'In Transit' ? 'bg-blue-100 text-blue-700' :
                                    'bg-yellow-100 text-yellow-700'
                                }`}>{order.status}</span>
                                <span className="text-sm font-bold text-zinc-800">{order.customer}</span>
                            </div>
                            <div className="flex items-center text-sm text-zinc-600 gap-4 mt-2 bg-zinc-50 p-2 rounded-lg inline-flex">
                                <div className="flex items-center"><MapPin size={14} className="mr-1 text-zinc-400"/> {order.origin}</div>
                                <div className="flex items-center text-zinc-400">→</div>
                                <div className="flex items-center"><MapPin size={14} className="mr-1 text-zinc-400"/> {order.destination}</div>
                            </div>
                            <div className="flex items-center text-xs text-zinc-500 gap-4 mt-2 ml-1">
                                <span className="flex items-center"><Truck size={12} className="mr-1"/> {order.truckPlate}</span>
                                <span className="flex items-center"><Users size={12} className="mr-1"/> {order.driverName}</span>
                                <span className="flex items-center"><Calendar size={12} className="mr-1"/> {order.date}</span>
                            </div>
                        </div>
                        
                        <div className="flex items-center gap-2 border-t border-zinc-100 md:border-t-0 pt-3 md:pt-0">
                            {order.status === 'Pending' && (
                                <button onClick={() => updateStatus(order.id, 'In Transit', order.truckId)} className="bg-blue-600 hover:bg-blue-700 text-white font-medium px-4 py-2 rounded-lg text-sm w-full md:w-auto shadow-sm">
                                    เริ่มงาน
                                </button>
                            )}
                            {order.status === 'In Transit' && (
                                <button onClick={() => updateStatus(order.id, 'Completed', order.truckId)} className="bg-green-600 hover:bg-green-700 text-white font-medium px-4 py-2 rounded-lg text-sm w-full md:w-auto shadow-sm">
                                    จบงาน
                                </button>
                            )}
                            <button onClick={() => {
                                 if(window.confirm('คุณต้องการลบใบงานนี้ใช่หรือไม่?')) {
                                     deleteDoc(doc(db, 'orders', order.id));
                                 }
                            }} className="text-zinc-400 hover:text-red-500 p-2 transition-colors"><X size={18}/></button>
                        </div>
                    </div>
                ))}
            </div>

            {showModal && (
                <Modal title="สร้างใบงาน (Shipment)" onClose={() => setShowModal(false)}>
                    <form onSubmit={handleAdd} className="space-y-4">
                        <div><label className="block text-sm font-bold text-zinc-700 mb-1">ลูกค้า</label><input required name="customer" className="w-full border border-zinc-300 p-2 rounded focus:ring-2 focus:ring-yellow-400 outline-none" /></div>
                        <div className="grid grid-cols-2 gap-4">
                            <div><label className="block text-sm font-bold text-zinc-700 mb-1">ต้นทาง</label><input required name="origin" className="w-full border border-zinc-300 p-2 rounded focus:ring-2 focus:ring-yellow-400 outline-none" /></div>
                            <div><label className="block text-sm font-bold text-zinc-700 mb-1">ปลายทาง</label><input required name="destination" className="w-full border border-zinc-300 p-2 rounded focus:ring-2 focus:ring-yellow-400 outline-none" /></div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-bold text-zinc-700 mb-1">เลือกรถ</label>
                                <select required name="truckId" className="w-full border border-zinc-300 p-2 rounded focus:ring-2 focus:ring-yellow-400 outline-none">
                                    <option value="">-- เลือกรถ --</option>
                                    {fleet.filter(f => f.status === 'Available').map(f => (
                                        <option key={f.id} value={f.id}>{f.plate} ({f.type})</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-zinc-700 mb-1">พนักงานขับรถ</label>
                                <select required name="driverId" className="w-full border border-zinc-300 p-2 rounded focus:ring-2 focus:ring-yellow-400 outline-none">
                                    <option value="">-- เลือกคนขับ --</option>
                                    {drivers.map(d => (
                                        <option key={d.id} value={d.id}>{d.name}</option>
                                    ))}
                                </select>
                            </div>
                        </div>
                        <button type="submit" className="w-full bg-black text-white font-bold p-3 rounded hover:bg-zinc-800 transition-colors">จ่ายงาน</button>
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
        if(window.confirm('ยืนยันการซ่อมเสร็จสิ้น? สถานะรถจะกลับมาเป็น Available')) {
            await updateDoc(doc(db, 'maintenance', m.id), { status: 'Completed', completedDate: new Date().toISOString().split('T')[0] });
            await updateDoc(doc(db, 'fleet', m.truckId), { status: 'Available' });
        }
    }

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-zinc-900">Maintenance & PM</h2>
                <button onClick={() => setShowModal(true)} className="bg-red-600 hover:bg-red-700 text-white font-bold px-4 py-2 rounded-lg flex items-center shadow-md">
                    <Wrench size={18} className="mr-2" /> แจ้งซ่อม / PM
                </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                 {/* Active Issues */}
                 <div className="space-y-4">
                    <h3 className="font-bold text-red-600 flex items-center border-b border-red-100 pb-2"><AlertTriangle size={18} className="mr-2"/> กำลังดำเนินการซ่อม</h3>
                    {maintenance.filter(m => m.status === 'Open').map(m => (
                        <div key={m.id} className="bg-white p-4 rounded-lg shadow-sm border-l-4 border-l-red-500 border-t border-r border-b border-zinc-200">
                             <div className="flex justify-between items-start">
                                <div>
                                    <div className="font-black text-xl text-zinc-800">{m.truckPlate}</div>
                                    <div className="text-zinc-600 text-sm mb-2">{m.issue}</div>
                                    <div className="flex gap-2 text-xs font-semibold">
                                        <span className="bg-zinc-100 text-zinc-600 px-2 py-1 rounded">Type: {m.type}</span>
                                        <span className="bg-red-100 text-red-700 px-2 py-1 rounded">Priority: {m.priority}</span>
                                    </div>
                                </div>
                                <button onClick={() => completeMaintenance(m)} className="text-green-600 hover:bg-green-50 p-2 rounded transition-colors" title="Mark as Completed">
                                    <CheckCircle size={28} />
                                </button>
                             </div>
                        </div>
                    ))}
                    {maintenance.filter(m => m.status === 'Open').length === 0 && <p className="text-zinc-400 italic bg-white p-4 rounded-lg border border-dashed border-zinc-200 text-center">ไม่มีรายการซ่อมค้าง</p>}
                 </div>

                 {/* History */}
                 <div>
                    <h3 className="font-bold text-zinc-700 mb-4 flex items-center border-b border-zinc-100 pb-2"><Clock size={18} className="mr-2"/> ประวัติการซ่อมล่าสุด</h3>
                    <div className="bg-white rounded-lg shadow-sm overflow-hidden border border-zinc-200">
                        <table className="w-full text-sm">
                            <thead className="bg-zinc-900 text-white">
                                <tr>
                                    <th className="p-3 text-left">รถ</th>
                                    <th className="p-3 text-left">อาการ</th>
                                    <th className="p-3 text-left">วันที่เสร็จ</th>
                                </tr>
                            </thead>
                            <tbody>
                                {maintenance.filter(m => m.status === 'Completed').slice(0,10).map(m => (
                                    <tr key={m.id} className="border-b border-zinc-100 hover:bg-zinc-50">
                                        <td className="p-3 font-bold">{m.truckPlate}</td>
                                        <td className="p-3 text-zinc-600">{m.issue}</td>
                                        <td className="p-3 text-zinc-500">{m.completedDate || '-'}</td>
                                    </tr>
                                ))}
                                {maintenance.filter(m => m.status === 'Completed').length === 0 && <tr><td colSpan="3" className="p-4 text-center text-zinc-400">ยังไม่มีประวัติ</td></tr>}
                            </tbody>
                        </table>
                    </div>
                 </div>
            </div>

            {showModal && (
                <Modal title="แจ้งซ่อม / PM" onClose={() => setShowModal(false)}>
                    <form onSubmit={handleAdd} className="space-y-4">
                        <div>
                            <label className="block text-sm font-bold text-zinc-700 mb-1">เลือกรถ</label>
                            <select required name="truckId" className="w-full border border-zinc-300 p-2 rounded focus:ring-2 focus:ring-yellow-400 outline-none">
                                {fleet.map(f => <option key={f.id} value={f.id}>{f.plate} ({f.customer || 'No Customer'})</option>)}
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-zinc-700 mb-1">ประเภท</label>
                            <select name="type" className="w-full border border-zinc-300 p-2 rounded focus:ring-2 focus:ring-yellow-400 outline-none">
                                <option>Breakdown (ซ่อมฉุกเฉิน)</option>
                                <option>PM (บำรุงรักษาตามระยะ)</option>
                                <option>Tire (ยาง)</option>
                                <option>Accident (อุบัติเหตุ)</option>
                            </select>
                        </div>
                        <div><label className="block text-sm font-bold text-zinc-700 mb-1">รายละเอียดอาการ / รายการซ่อม</label><textarea required name="issue" className="w-full border border-zinc-300 p-2 rounded focus:ring-2 focus:ring-yellow-400 outline-none" rows="3"></textarea></div>
                        <div>
                            <label className="block text-sm font-bold text-zinc-700 mb-1">ความเร่งด่วน</label>
                            <select name="priority" className="w-full border border-zinc-300 p-2 rounded focus:ring-2 focus:ring-yellow-400 outline-none">
                                <option>Normal</option>
                                <option>High</option>
                                <option>Critical</option>
                            </select>
                        </div>
                        <button type="submit" className="w-full bg-red-600 text-white font-bold p-3 rounded hover:bg-red-700 transition-colors">แจ้งซ่อม</button>
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
        { name: 'In Transit', value: fleet.filter(f => f.status === 'In Transit').length, color: '#3B82F6' },
        { name: 'Maintenance', value: fleet.filter(f => f.status === 'Maintenance').length, color: '#EF4444' },
    ].filter(d => d.value > 0);

    return (
        <div className="space-y-6">
            <h2 className="text-2xl font-bold text-zinc-900">รายงานสรุปผล</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white p-6 rounded-xl shadow-sm border border-zinc-200 h-80">
                    <h3 className="font-bold text-lg mb-4 text-zinc-800">สัดส่วนสถานะรถ (Fleet Utilization)</h3>
                    <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                            <Pie data={fleetStatusData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label>
                                {fleetStatusData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={entry.color} />
                                ))}
                            </Pie>
                            <Tooltip contentStyle={{backgroundColor: '#18181b', color: '#fff', border: 'none'}} />
                            <Legend />
                        </PieChart>
                    </ResponsiveContainer>
                </div>

                <div className="bg-white p-6 rounded-xl shadow-sm border border-zinc-200 h-80">
                    <h3 className="font-bold text-lg mb-4 text-zinc-800">จำนวนงานที่เสร็จสิ้น (Mock Data)</h3>
                    {completedOrders.length > 0 ? (
                        <ResponsiveContainer width="100%" height="100%">
                             <BarChart data={revenueMock.slice(0, 10)}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#e4e4e7" />
                                <XAxis dataKey="name" stroke="#71717a" />
                                <YAxis stroke="#71717a" />
                                <Tooltip contentStyle={{backgroundColor: '#18181b', color: '#fff', border: 'none'}} cursor={{fill: '#f4f4f5'}} />
                                <Bar dataKey="value" fill="#fbbf24" name="ค่าขนส่ง (บาท)" radius={[4, 4, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    ) : (
                        <div className="h-full flex items-center justify-center text-zinc-400">ยังไม่มีข้อมูลงานที่เสร็จสิ้น</div>
                    )}
                </div>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-sm border border-zinc-200">
                <h3 className="font-bold text-lg mb-4 text-zinc-800">Export Data</h3>
                <div className="flex gap-4">
                    <button className="flex items-center space-x-2 border border-zinc-300 px-4 py-2 rounded hover:bg-zinc-50 font-medium text-zinc-700">
                        <FileText size={16}/> <span>Export Orders (CSV)</span>
                    </button>
                    <button className="flex items-center space-x-2 border border-zinc-300 px-4 py-2 rounded hover:bg-zinc-50 font-medium text-zinc-700">
                        <FileText size={16}/> <span>Export Driver Matrix (PDF)</span>
                    </button>
                </div>
                <p className="text-xs text-zinc-400 mt-2">*ฟังก์ชัน Export ยังไม่เปิดใช้งานในเวอร์ชัน Demo</p>
            </div>
        </div>
    )
}

function Modal({ title, children, onClose }) {
  return (
    <div className="fixed inset-0 bg-zinc-900/70 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden border border-zinc-200 transform transition-all scale-100">
        <div className="flex justify-between items-center p-4 border-b border-zinc-100 bg-zinc-50">
          <h3 className="font-bold text-lg text-zinc-900">{title}</h3>
          <button onClick={onClose} className="text-zinc-400 hover:text-red-500 transition-colors"><X/></button>
        </div>
        <div className="p-6 overflow-y-auto max-h-[80vh]">
          {children}
        </div>
      </div>
    </div>
  );
}