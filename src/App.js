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
  Phone, Calendar, Search, ChevronRight, Settings, Trash2, Bell, Edit, User, CreditCard, Gauge,
  ClipboardList, Camera, CheckSquare, XCircle, DollarSign,ChevronDown,ChevronUp
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

  const [drivers, setDrivers] = useState([]);
  const [fleet, setFleet] = useState([]);
  const [orders, setOrders] = useState([]);
  const [maintenance, setMaintenance] = useState([]);
// --- แทรกตรงนี้ ---
const checkAlert = (dateStr) => {
  if (!dateStr) return false;
  const now = new Date();
  const expiry = new Date(dateStr);
  const threeMonths = new Date();
  threeMonths.setMonth(now.getMonth() + 3);
  now.setHours(0,0,0,0);
  return expiry <= threeMonths; 
};

const hasFleetAlert = fleet.some(f => f.status !== 'Inactive' && (checkAlert(f.taxExpiry) || checkAlert(f.insuranceExpiry)));
const hasEmployeeAlert = drivers.some(d => d.status !== 'Inactive' && checkAlert(d.licenseExpiry));
// ----------------
  useEffect(() => {
    const initAuth = async () => {
      try {
        await signInAnonymously(auth);
      } catch (err) {
        console.error("Auth Error:", err);
        setLoading(false);
      }
    };
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (currentUser) setUser(currentUser);
      else initAuth();
    });
    return () => unsubscribe();
  }, []);

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
      });
    };
    unsubscribes.push(fetchData('drivers', setDrivers));
    unsubscribes.push(fetchData('fleet', setFleet));
    unsubscribes.push(fetchData('orders', setOrders));
    unsubscribes.push(fetchData('maintenance', setMaintenance));
    return () => unsubscribes.forEach(unsub => unsub());
  }, [user]);

  const handleLogout = async () => { await signOut(auth); window.location.reload(); };
  const seedData = async () => { setLoading(false); }; // Dummy

  if (loading) return <div className="flex h-screen items-center justify-center bg-slate-50 text-slate-500">Loading...</div>;

  return (
    <div className="flex flex-col h-screen bg-[#F2F5F9] font-sans text-slate-700 overflow-hidden selection:bg-indigo-100 selection:text-indigo-700">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/70 backdrop-blur-xl border-b border-white/20 shadow-sm shrink-0">
  <div className="w-full px-6 h-20 flex items-center justify-between">
    <div className="flex items-center space-x-4">
      {/* ปรับพื้นหลัง Icon เป็นสีเหลือง (bg-yellow-400) และไอคอนรูปรถเป็นสีดำ (text-black) */}
      <div className="bg-yellow-400 p-2.5 rounded-2xl shadow-lg shadow-yellow-500/20">
        <Truck className="w-6 h-6 text-black" strokeWidth={2.5} />
      </div>
      <div>
        {/* เปลี่ยนชื่อเป็น SIAM INTERMODAL TRANSPORT ตัวใหญ่ทั้งหมด */}
        <h1 className="text-xl font-black tracking-tight text-slate-800">SIAM INTERMODAL TRANSPORT</h1>
        <p className="text-[11px] font-bold text-slate-400 tracking-wider uppercase">Logistics Platform</p>
      </div>
    </div>
          
     
<nav className="hidden xl:flex items-center p-2 bg-slate-100/50 rounded-xl border border-slate-200/50">
  <NavButton icon={<LayoutDashboard size={24}/>} label="Dashboard" active={activeTab === 'dashboard'} onClick={() => setActiveTab('dashboard')} />
  <NavButton icon={<Truck size={24}/>} label="Fleet" active={activeTab === 'fleet'} onClick={() => setActiveTab('fleet')} hasAlert={hasFleetAlert} />
  <NavButton icon={<Users size={24}/>} label="Employees" active={activeTab === 'employees'} onClick={() => setActiveTab('employees')} hasAlert={hasEmployeeAlert} />
  <NavButton icon={<Package size={24}/>} label="Shipments" active={activeTab === 'orders'} onClick={() => setActiveTab('orders')} />
  <NavButton icon={<Wrench size={24}/>} label="Service" active={activeTab === 'maintenance'} onClick={() => setActiveTab('maintenance')} />
  <NavButton icon={<FileText size={24}/>} label="Report" active={activeTab === 'reports'} onClick={() => setActiveTab('reports')} />
</nav>
          <div className="flex items-center space-x-4">
            <div className="xl:hidden flex items-center bg-white p-1 rounded-full border border-slate-200 shadow-sm">
                <button onClick={() => setActiveTab('dashboard')} className="p-2 rounded-full text-slate-400"><LayoutDashboard size={20}/></button>
            </div>
            <div className="flex items-center space-x-3 pl-4 border-l border-slate-200">
               <button className="p-2 text-slate-400 hover:text-indigo-600 transition-colors relative"><Bell size={20} /></button>
              <div className="text-right hidden sm:block leading-tight">
                <p className="text-sm font-bold text-slate-800">{user?.isAnonymous ? 'Admin User' : 'Staff'}</p>
                <p className="text-[10px] text-slate-400 font-medium">HQ - Bang Si Thong</p>
              </div>
              <div className="h-10 w-10 rounded-full bg-indigo-100 flex items-center justify-center border border-white shadow-sm"><span className="text-indigo-600 font-bold text-sm">AD</span></div>
              <button onClick={handleLogout} className="p-2 hover:bg-red-50 text-slate-300 hover:text-red-500 transition-all rounded-full"><LogOut size={18} /></button>
            </div>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="flex-1 overflow-auto p-4 md:p-8 relative scroll-smooth">
        <div className="w-full pb-24">
          <div className="animate-fade-in">
            {activeTab === 'dashboard' && <DashboardView drivers={drivers} fleet={fleet} orders={orders} maintenance={maintenance} />}
            {activeTab === 'fleet' && <FleetView fleet={fleet} db={db} />}
            {activeTab === 'employees' && <EmployeeView drivers={drivers} db={db} />}
            {activeTab === 'orders' && <OrderView orders={orders} fleet={fleet} drivers={drivers} db={db} />}
            {activeTab === 'maintenance' && <MaintenanceView maintenance={maintenance} fleet={fleet} db={db} />}
            {activeTab === 'reports' && <ReportsView orders={orders} fleet={fleet} />}
          </div>
        </div>
      </main>
    </div>
  );
}

// --- MAINTENANCE VIEW (UPDATED LOGIC) ---
function MaintenanceView({ maintenance, fleet, db }) {
    const [showModal, setShowModal] = useState(false);
    const [showDetailModal, setShowDetailModal] = useState(false);
    const [selectedJob, setSelectedJob] = useState(null);
    const [tabFilter, setTabFilter] = useState('Active'); // Active, History
    const [searchTerm, setSearchTerm] = useState('');

    const formatDate = (ts) => {
        if (!ts) return '-';
        if (ts.seconds) return new Date(ts.seconds * 1000).toLocaleDateString('th-TH');
        return new Date(ts).toLocaleDateString('th-TH');
    };

    const getStatusColor = (status) => {
        switch(status) {
            case 'Pending': return 'bg-orange-100 text-orange-600 border-orange-200';
            case 'In Progress': return 'bg-blue-100 text-blue-600 border-blue-200';
            case 'Completed': return 'bg-green-100 text-green-600 border-green-200';
            case 'Rejected': return 'bg-red-50 text-red-500 border-red-100';
            default: return 'bg-gray-100 text-gray-500';
        }
    };

    const handleCreateRequest = async (e) => {
        e.preventDefault();
        const formData = new FormData(e.target);
        const truckId = formData.get('truckId');
        const truck = fleet.find(f => f.id === truckId);

        const data = {
            jobId: `REP-${Math.floor(10000 + Math.random() * 90000)}`,
            truckId,
            truckPlate: truck ? truck.plate : 'Unknown',
            type: formData.get('type'),
            priority: formData.get('priority'),
            issue: formData.get('issue'),
            driverName: formData.get('driverName'),
            photoUrl: formData.get('photoUrl') || '',
            status: 'Pending', 
            requestDate: new Date().toISOString(),
            createdAt: serverTimestamp()
        };

        try {
            await addDoc(collection(db, 'maintenance'), data);
            
            // *** UPDATE FLEET STATUS ***
            // เมื่อแจ้งซ่อม -> เปลี่ยนสถานะรถเป็น Maintenance ทันที
            if (truckId) {
                await updateDoc(doc(db, 'fleet', truckId), { status: 'Maintenance' });
            }

            setShowModal(false);
        } catch (err) { alert('Error creating request'); }
    };

    const handleUpdateStatus = async (jobId, newStatus, extraData = {}) => {
        try {
            const updateData = { status: newStatus, ...extraData };
            
            if(newStatus === 'In Progress') updateData.approvedDate = new Date().toISOString();
            if(newStatus === 'Completed') updateData.completedDate = new Date().toISOString();
            if(newStatus === 'Rejected') updateData.rejectedDate = new Date().toISOString();

            await updateDoc(doc(db, 'maintenance', jobId), updateData);
            
            // *** UPDATE FLEET STATUS ***
            // ถ้าซ่อมเสร็จ หรือ ถูกปฏิเสธ -> เปลี่ยนสถานะรถกลับเป็น Available
            if (newStatus === 'Completed' || newStatus === 'Rejected') {
                if(selectedJob.truckId) {
                    await updateDoc(doc(db, 'fleet', selectedJob.truckId), { status: 'Available' });
                }
            }

            setSelectedJob(prev => ({...prev, ...updateData}));
            if(newStatus === 'Completed' || newStatus === 'Rejected') setShowDetailModal(false);

        } catch(err) { console.error(err); alert('Update failed'); }
    };

    const filteredJobs = maintenance.filter(m => {
        const matchesTab = tabFilter === 'Active' 
            ? (m.status === 'Pending' || m.status === 'In Progress') 
            : (m.status === 'Completed' || m.status === 'Rejected');
        
        const matchesSearch = 
            (m.truckPlate && m.truckPlate.includes(searchTerm)) ||
            (m.jobId && m.jobId.includes(searchTerm)) ||
            (m.issue && m.issue.toLowerCase().includes(searchTerm.toLowerCase()));

        return matchesTab && matchesSearch;
    });

    return (
        <div className="space-y-6 font-sans">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between"><div><p className="text-slate-400 text-xs font-bold uppercase">รออนุมัติ</p><p className="text-2xl font-bold text-orange-500">{maintenance.filter(m=>m.status==='Pending').length}</p></div><div className="bg-orange-50 p-3 rounded-full text-orange-500"><Clock size={20}/></div></div>
                <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between"><div><p className="text-slate-400 text-xs font-bold uppercase">กำลังซ่อม</p><p className="text-2xl font-bold text-blue-500">{maintenance.filter(m=>m.status==='In Progress').length}</p></div><div className="bg-blue-50 p-3 rounded-full text-blue-500"><Wrench size={20}/></div></div>
                <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between"><div><p className="text-slate-400 text-xs font-bold uppercase">เสร็จสิ้น (เดือนนี้)</p><p className="text-2xl font-bold text-green-500">{maintenance.filter(m=>m.status==='Completed').length}</p></div><div className="bg-green-50 p-3 rounded-full text-green-500"><CheckCircle size={20}/></div></div>
                <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between"><div><p className="text-slate-400 text-xs font-bold uppercase">ค่าใช้จ่ายรวม</p><p className="text-2xl font-bold text-slate-700">฿{maintenance.reduce((sum, m) => sum + (Number(m.cost)||0), 0).toLocaleString()}</p></div><div className="bg-slate-50 p-3 rounded-full text-slate-500"><DollarSign size={20}/></div></div>
            </div>

            <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="flex flex-col md:flex-row justify-between items-center p-4 border-b border-slate-100 gap-4">
                    <div className="flex bg-slate-100 p-1 rounded-lg">
                        <button onClick={() => setTabFilter('Active')} className={`px-4 py-1.5 rounded-md text-sm font-bold transition-all ${tabFilter === 'Active' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>ดำเนินการอยู่</button>
                        <button onClick={() => setTabFilter('History')} className={`px-4 py-1.5 rounded-md text-sm font-bold transition-all ${tabFilter === 'History' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>ประวัติการซ่อม</button>
                    </div>
                    <div className="flex gap-3 w-full md:w-auto">
                        <div className="relative flex-1 md:w-64"><Search className="absolute left-3 top-2.5 text-slate-400" size={16} /><input type="text" placeholder="ค้นหา Job ID, ทะเบียน..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full pl-9 pr-4 py-2 rounded-lg bg-slate-50 text-sm outline-none focus:ring-2 focus:ring-indigo-500/20" /></div>
                        <button onClick={() => setShowModal(true)} className="bg-rose-500 hover:bg-rose-600 text-white text-sm font-bold px-4 py-2 rounded-lg flex items-center gap-2 shadow-sm transition-colors whitespace-nowrap"><Plus size={18} /> แจ้งซ่อม</button>
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 text-xs font-bold uppercase whitespace-nowrap">
                            <tr><th className="p-4">Job ID</th><th className="p-4">ทะเบียนรถ</th><th className="p-4">ปัญหา/อาการ</th><th className="p-4">ความเร่งด่วน</th><th className="p-4">ผู้แจ้ง</th><th className="p-4">วันที่แจ้ง</th><th className="p-4">สถานะ</th><th className="p-4 text-center">จัดการ</th></tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 text-sm">
                            {filteredJobs.map(job => (
                                <tr key={job.id} onClick={() => { setSelectedJob(job); setShowDetailModal(true); }} className="hover:bg-slate-50 cursor-pointer transition-colors group">
                                    <td className="p-4 font-mono font-bold text-slate-700">{job.jobId}</td>
                                    <td className="p-4 font-bold text-indigo-600">{job.truckPlate}</td>
                                    <td className="p-4 text-slate-600 max-w-xs truncate">{job.issue}</td>
                                    <td className="p-4"><span className={`text-[10px] font-bold px-2 py-1 rounded border ${job.priority === 'Critical' ? 'bg-red-50 text-red-600 border-red-200' : job.priority === 'High' ? 'bg-orange-50 text-orange-600 border-orange-200' : 'bg-slate-50 text-slate-600 border-slate-200'}`}>{job.priority}</span></td>
                                    <td className="p-4 text-slate-600">{job.driverName || '-'}</td>
                                    <td className="p-4 text-slate-500">{formatDate(job.requestDate)}</td>
                                    <td className="p-4"><span className={`px-2 py-1 rounded-full text-xs font-bold border ${getStatusColor(job.status)}`}>{job.status}</span></td>
                                    <td className="p-4 text-center"><button className="text-slate-400 hover:text-indigo-600 p-1.5 rounded-full hover:bg-indigo-50 transition-colors"><ChevronRight size={18} /></button></td>
                                </tr>
                            ))}
                            {filteredJobs.length === 0 && <tr><td colSpan="8" className="p-12 text-center text-slate-400 italic">ไม่พบรายการซ่อมบำรุง</td></tr>}
                        </tbody>
                    </table>
                </div>
            </div>

            {showModal && (
                <Modal title="แจ้งซ่อมบำรุง (Request Maintenance)" onClose={() => setShowModal(false)}>
                    <form onSubmit={handleCreateRequest} className="space-y-5">
                        <div>
                            <label className="block text-sm font-bold text-slate-700 mb-2">เลือกรถที่ต้องการซ่อม</label>
                            <select required name="truckId" className="w-full bg-slate-50 border-none p-3 rounded-xl focus:ring-2 focus:ring-rose-500/20 text-slate-700 font-medium outline-none">
                                <option value="">-- เลือกรถ --</option>
                                {fleet.map(f => <option key={f.id} value={f.id}>{f.plate} ({f.brand})</option>)}
                            </select>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div><label className="block text-sm font-bold text-slate-700 mb-2">ประเภทการซ่อม</label><select name="type" className="w-full bg-slate-50 border-none p-3 rounded-xl outline-none"><option>ซ่อมทั่วไป (Breakdown)</option><option>เช็คระยะ (PM)</option><option>ยาง (Tire)</option><option>อุบัติเหตุ (Accident)</option></select></div>
                            <div><label className="block text-sm font-bold text-slate-700 mb-2">ความเร่งด่วน</label><select name="priority" className="w-full bg-slate-50 border-none p-3 rounded-xl outline-none"><option value="Normal">ปกติ (Normal)</option><option value="High">ด่วน (High)</option><option value="Critical">รถตาย/วิ่งไม่ได้ (Critical)</option></select></div>
                        </div>
                        <InputGroup label="ผู้แจ้ง (ชื่อคนขับ/หัวหน้างาน)" name="driverName" required />
                        <div><label className="block text-sm font-bold text-slate-700 mb-2">รายละเอียดปัญหา/อาการ</label><textarea required name="issue" rows="3" className="w-full bg-slate-50 border-none p-3 rounded-xl outline-none resize-none" placeholder="เช่น แอร์ไม่เย็น, เบรคมีเสียงดัง..."></textarea></div>
                        <div>
                            <label className="block text-sm font-bold text-slate-700 mb-2">รูปภาพ/เอกสารแนบ</label>
                            <div className="flex gap-2"><input name="photoUrl" placeholder="วางลิงก์รูปภาพ (URL)..." className="flex-1 bg-slate-50 border-none p-3 rounded-xl outline-none" /><button type="button" className="bg-slate-100 p-3 rounded-xl text-slate-500 hover:bg-slate-200"><Camera size={20}/></button></div>
                        </div>
                        <button type="submit" className="w-full bg-rose-500 hover:bg-rose-600 text-white font-bold p-4 rounded-xl shadow-lg shadow-rose-200 transition-all">ส่งเรื่องแจ้งซ่อม</button>
                    </form>
                </Modal>
            )}

            {selectedJob && showDetailModal && (
                <Modal title={`รายละเอียดงานซ่อม #${selectedJob.jobId}`} onClose={() => setShowDetailModal(false)} maxWidth="max-w-2xl">
                    <div className="space-y-6">
                        <div className="flex justify-between items-center bg-slate-50 p-4 rounded-xl border border-slate-100">
                            <div className="flex items-center gap-3"><div className={`w-3 h-3 rounded-full ${selectedJob.status === 'Completed' ? 'bg-green-500' : selectedJob.status === 'In Progress' ? 'bg-blue-500' : 'bg-orange-500'}`}></div><div><p className="text-xs text-slate-400 uppercase font-bold">สถานะปัจจุบัน</p><p className="font-bold text-slate-800">{selectedJob.status}</p></div></div>
                            <div className="text-right"><p className="text-xs text-slate-400 uppercase font-bold">วันที่แจ้ง</p><p className="font-mono text-slate-600">{new Date(selectedJob.requestDate).toLocaleString('th-TH')}</p></div>
                        </div>
                        <div className="grid grid-cols-2 gap-6 text-sm">
                            <div><p className="text-slate-400 mb-1">ทะเบียนรถ</p><p className="font-bold text-lg text-slate-800">{selectedJob.truckPlate}</p></div>
                            <div><p className="text-slate-400 mb-1">ประเภท</p><p className="font-semibold text-slate-700">{selectedJob.type}</p></div>
                            <div className="col-span-2"><p className="text-slate-400 mb-1">อาการที่แจ้ง</p><p className="bg-slate-50 p-3 rounded-lg border border-slate-100 text-slate-700 leading-relaxed">{selectedJob.issue}</p></div>
                            {selectedJob.photoUrl && (<div className="col-span-2"><p className="text-slate-400 mb-2">รูปภาพแนบ</p><img src={selectedJob.photoUrl} alt="Evidence" className="h-40 rounded-lg object-cover border border-slate-200" /></div>)}
                        </div>
                        <div className="pt-4 border-t border-slate-100">
                            {selectedJob.status === 'Pending' && (
                                <div className="flex gap-3">
                                    <button onClick={() => handleUpdateStatus(selectedJob.id, 'In Progress')} className="flex-1 bg-blue-600 text-white py-3 rounded-xl font-bold hover:bg-blue-700 shadow-lg shadow-blue-200 flex justify-center items-center gap-2"><CheckSquare size={18}/> อนุมัติซ่อม</button>
                                    <button onClick={() => handleUpdateStatus(selectedJob.id, 'Rejected')} className="flex-1 bg-white border border-red-200 text-red-600 py-3 rounded-xl font-bold hover:bg-red-50 flex justify-center items-center gap-2"><XCircle size={18}/> ปฏิเสธ</button>
                                </div>
                            )}
                            {selectedJob.status === 'In Progress' && (
                                <div className="bg-green-50 p-4 rounded-xl border border-green-100">
                                    <h4 className="font-bold text-green-800 mb-3 flex items-center"><ClipboardList size={18} className="mr-2"/> ลงบันทึกปิดงานซ่อม</h4>
                                    <form onSubmit={(e) => { e.preventDefault(); const cost = e.target.cost.value; const note = e.target.note.value; if(window.confirm('ยืนยันปิดงานซ่อม?')) handleUpdateStatus(selectedJob.id, 'Completed', { cost: Number(cost), finishNote: note }); }} className="space-y-3">
                                        <div className="flex gap-3"><div className="flex-1"><label className="block text-xs font-bold text-green-700 mb-1">ค่าใช้จ่ายจริง (บาท)</label><input required name="cost" type="number" className="w-full p-2 rounded-lg border border-green-200 focus:outline-none focus:ring-2 focus:ring-green-500/20" placeholder="0.00" /></div><div className="flex-[2]"><label className="block text-xs font-bold text-green-700 mb-1">หมายเหตุการซ่อม</label><input name="note" className="w-full p-2 rounded-lg border border-green-200 focus:outline-none focus:ring-2 focus:ring-green-500/20" placeholder="เช่น เปลี่ยนอะไหล่, เติมน้ำยาแอร์..." /></div></div>
                                        <button type="submit" className="w-full bg-green-600 text-white py-2 rounded-lg font-bold hover:bg-green-700 shadow-sm">บันทึกเสร็จสิ้น</button>
                                    </form>
                                </div>
                            )}
                            {selectedJob.status === 'Completed' && (
                                <div className="bg-slate-50 p-4 rounded-xl text-center border border-slate-200">
                                    <div className="flex justify-center mb-2"><CheckCircle size={32} className="text-green-500"/></div><h3 className="font-bold text-slate-800">งานซ่อมเสร็จสิ้นแล้ว</h3><p className="text-sm text-slate-500 mt-1">ค่าใช้จ่ายสุทธิ: <span className="font-mono font-bold text-slate-800">฿{selectedJob.cost?.toLocaleString()}</span></p><p className="text-xs text-slate-400 mt-2">ปิดงานเมื่อ: {formatDate(selectedJob.completedDate)}</p>
                                </div>
                            )}
                        </div>
                    </div>
                </Modal>
            )}
        </div>
    );
}

// --- FLEET VIEW (UNCHANGED) ---
// --- FLEET VIEW (GROUPED & COLLAPSIBLE) ---
// --- FLEET VIEW (DYNAMIC GROUPING BY STATUS) ---
function FleetView({ fleet, db }) {
  const [showModal, setShowModal] = useState(false);
  const [selectedTruck, setSelectedTruck] = useState(null); 
  const [editingTruck, setEditingTruck] = useState(null);   
  const [searchTerm, setSearchTerm] = useState('');
  const [filterMode, setFilterMode] = useState('all');

  // State สำหรับการย่อ/ขยาย แต่ละกลุ่มอิสระ
  // key = ชื่อ status, value = boolean (true=เปิด, false=ปิด)
  const [expandedGroups, setExpandedGroups] = useState({
      'Available': true,
      'In Transit': true,
      'Maintenance': true,
      'Inactive': false
  });

  // --- Helpers ---
  const toggleGroup = (status) => {
      setExpandedGroups(prev => ({ ...prev, [status]: !prev[status] }));
  };

  const getExpiryStatus = (dateStr) => {
      if (!dateStr) return 'unknown';
      const now = new Date();
      const expiry = new Date(dateStr);
      const threeMonths = new Date();
      threeMonths.setMonth(now.getMonth() + 3);
      now.setHours(0,0,0,0); expiry.setHours(0,0,0,0);
      if (expiry < now) return 'expired';
      if (expiry <= threeMonths) return 'warning';
      return 'ok';
  };

  const formatDateBE = (dateString) => {
      if (!dateString) return "-";
      const date = new Date(dateString);
      return `${date.getDate().toString().padStart(2, '0')}/${(date.getMonth() + 1).toString().padStart(2, '0')}/${date.getFullYear() + 543}`;
  };

  // Helper เลือกสีหัวข้อตามสถานะ
  const getGroupStyle = (status) => {
      switch(status) {
          case 'Available': return { bg: 'bg-green-50', border: 'border-green-100', text: 'text-green-800', icon: 'text-green-600', dot: 'bg-green-500' };
          case 'In Transit': return { bg: 'bg-indigo-50', border: 'border-indigo-100', text: 'text-indigo-800', icon: 'text-indigo-600', dot: 'bg-indigo-500' };
          case 'Maintenance': return { bg: 'bg-rose-50', border: 'border-rose-100', text: 'text-rose-800', icon: 'text-rose-600', dot: 'bg-rose-500' };
          case 'Inactive': return { bg: 'bg-slate-50', border: 'border-slate-100', text: 'text-slate-600', icon: 'text-slate-500', dot: 'bg-slate-400' };
          default: return { bg: 'bg-gray-50', border: 'border-gray-100', text: 'text-gray-800', icon: 'text-gray-600', dot: 'bg-gray-500' };
      }
  };

  // --- Handlers (Save/Delete/Modal) ---
  const handleSave = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const data = {
      plate: formData.get('plate'), type: formData.get('type'), brand: formData.get('brand'),
      model: formData.get('model'), mileage: formData.get('mileage'), 
      taxExpiry: formData.get('taxExpiry'), insuranceExpiry: formData.get('insuranceExpiry'),
      status: formData.get('status'), photoUrl: formData.get('photoUrl') || '',
    };
    try {
      if (editingTruck) await updateDoc(doc(db, 'fleet', editingTruck.id), data);
      else { data.createdAt = serverTimestamp(); await addDoc(collection(db, 'fleet'), data); }
      setShowModal(false); setEditingTruck(null);
    } catch (err) { alert("บันทึกไม่สำเร็จ"); }
  };

  const handleDelete = async (id, e) => {
      e.stopPropagation();
      if(window.confirm("ยืนยันการลบข้อมูลรถคันนี้?")) { await deleteDoc(doc(db, 'fleet', id)); setSelectedTruck(null); }
  };

  const openAddModal = () => { setEditingTruck(null); setShowModal(true); };
  const openEditModal = (truck, e) => { if(e) e.stopPropagation(); setEditingTruck(truck); setSelectedTruck(null); setShowModal(true); };

  // --- Filtering & Grouping Logic ---
  const alertTrucks = fleet.filter(f => {
      const tax = getExpiryStatus(f.taxExpiry);
      const ins = getExpiryStatus(f.insuranceExpiry);
      return (tax === 'expired' || tax === 'warning' || ins === 'expired' || ins === 'warning') && f.status !== 'Inactive';
  });

  const filteredAll = fleet.filter(item => {
      const term = searchTerm.toLowerCase();
      const matchSearch = (
          (item.plate && item.plate.toLowerCase().includes(term)) ||
          (item.brand && item.brand.toLowerCase().includes(term)) ||
          (item.type && item.type.toLowerCase().includes(term))
      );
      if (filterMode === 'alert') {
          const tax = getExpiryStatus(item.taxExpiry);
          const ins = getExpiryStatus(item.insuranceExpiry);
          return matchSearch && (tax !== 'ok' || ins !== 'ok');
      }
      return matchSearch;
  });

  // 1. หา Status ทั้งหมดที่มีในข้อมูลที่กรองแล้ว
  const availableStatuses = [...new Set(filteredAll.map(f => f.status || 'Available'))];
  
  // 2. เรียงลำดับ Status ตามความสำคัญ (Custom Sort)
  const statusOrder = ['Available', 'In Transit', 'Maintenance', 'Inactive'];
  availableStatuses.sort((a, b) => {
      const indexA = statusOrder.indexOf(a);
      const indexB = statusOrder.indexOf(b);
      // ถ้าสถานะไม่อยู่ในลิสต์ ให้ไปอยู่ท้ายๆ ตามตัวอักษร
      if (indexA === -1 && indexB === -1) return a.localeCompare(b);
      if (indexA === -1) return 1;
      if (indexB === -1) return -1;
      return indexA - indexB;
  });

  // --- Reusable Table Component ---
  const renderFleetTable = (data, status) => {
      if (data.length === 0) return null; // ไม่แสดงตารางถ้าไม่มีข้อมูลในกลุ่มนั้น

      return (
          <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead className="bg-white/50 text-slate-500 text-xs font-bold uppercase whitespace-nowrap border-b border-slate-100">
                  <tr>
                    <th className="py-3 px-4 w-32">ทะเบียนรถ</th>
                    <th className="py-3 px-4 w-24">สถานะ</th>
                    <th className="py-3 px-4">ประเภท</th>
                    <th className="py-3 px-4">ยี่ห้อ/รุ่น</th>
                    <th className="py-3 px-4 text-right">เลขไมล์ (km)</th>
                    <th className="py-3 px-4 text-center">ภาษีรถยนต์</th>
                    <th className="py-3 px-4 text-center">พ.ร.บ./ประกัน</th>
                    <th className="py-3 px-4 text-center">จัดการ</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-sm whitespace-nowrap bg-white">
                  {data.map(item => {
                      const taxStatus = getExpiryStatus(item.taxExpiry);
                      const insStatus = getExpiryStatus(item.insuranceExpiry);
                      
                      return (
                        <tr key={item.id} onClick={() => setSelectedTruck(item)} className="hover:bg-yellow-50 transition-colors cursor-pointer group">
                          <td className="py-3 px-4 font-bold text-slate-800 text-base">{item.plate}</td>
                          <td className="py-3 px-4"><StatusBadge status={item.status || 'Available'} /></td>
                          <td className="py-3 px-4 text-slate-600">{item.type}</td>
                          <td className="py-3 px-4 text-slate-600">{item.brand} <span className="text-slate-400 text-xs">{item.model}</span></td>
                          <td className="py-3 px-4 text-right font-mono text-slate-700">{item.mileage ? parseInt(item.mileage).toLocaleString() : '-'}</td>
                          
                          <td className="py-3 px-4 text-center">
                              <span className={`text-xs font-bold px-2 py-1 rounded-lg border ${taxStatus === 'expired' ? 'bg-red-100 text-red-600 border-red-200' : taxStatus === 'warning' ? 'bg-orange-100 text-orange-600 border-orange-200' : 'bg-slate-50 text-slate-600 border-slate-200'}`}>
                                  {formatDateBE(item.taxExpiry)}
                              </span>
                          </td>
                          <td className="py-3 px-4 text-center">
                              <span className={`text-xs font-bold px-2 py-1 rounded-lg border ${insStatus === 'expired' ? 'bg-red-100 text-red-600 border-red-200' : insStatus === 'warning' ? 'bg-orange-100 text-orange-600 border-orange-200' : 'bg-slate-50 text-slate-600 border-slate-200'}`}>
                                  {formatDateBE(item.insuranceExpiry)}
                              </span>
                          </td>

                          <td className="py-3 px-4 text-center">
                              <div className="flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                  <button onClick={(e) => openEditModal(item, e)} className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-full transition-colors"><Wrench size={16}/></button>
                                  <button onClick={(e) => handleDelete(item.id, e)} className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-full transition-colors"><X size={18}/></button>
                              </div>
                          </td>
                        </tr>
                      )
                  })}
                </tbody>
              </table>
          </div>
      );
  };

  return (
    <div className="space-y-6 font-sans">
      
      {/* Alert Banner */}
      {alertTrucks.length > 0 && (
          <div 
            onClick={() => setFilterMode(filterMode === 'alert' ? 'all' : 'alert')}
            className={`p-4 rounded-xl border flex items-center justify-between cursor-pointer transition-all shadow-sm ${filterMode === 'alert' ? 'bg-orange-100 border-orange-300 ring-2 ring-orange-200' : 'bg-white border-orange-200 hover:bg-orange-50'}`}
          >
              <div className="flex items-center gap-3">
                  <div className="bg-orange-500 text-white p-2 rounded-lg animate-pulse"><AlertTriangle size={20} /></div>
                  <div>
                      <h4 className="font-bold text-orange-800 text-sm">แจ้งเตือนเอกสารรถ ({alertTrucks.length})</h4>
                      <p className="text-xs text-orange-600 mt-0.5">พบรถ {alertTrucks.length} คัน ภาษีหรือ พ.ร.บ. ใกล้หมดอายุ/หมดอายุแล้ว</p>
                  </div>
              </div>
              <div className="text-xs font-bold bg-white text-orange-600 px-3 py-1.5 rounded-full border border-orange-200 shadow-sm">{filterMode === 'alert' ? 'แสดงทั้งหมด' : 'ดูรายการ'}</div>
          </div>
      )}


<div className="flex flex-col md:flex-row justify-between items-center bg-yellow-400 p-6 rounded-xl border border-yellow-500/20 shadow-md gap-4">
    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 w-full md:w-auto">
        <div className="flex items-center gap-3">
            {/* ไอคอนและข้อความเป็นสีดำเพื่อให้เด่นบนพื้นเหลือง */}
            <Truck size={24} className="text-black" strokeWidth={2.5} />
            <h2 className="text-lg font-black text-black tracking-tight uppercase">ข้อมูลรถบรรทุก</h2>
        </div>
        <span className="bg-black/10 text-black text-xs font-bold px-2 py-0.5 rounded border border-black/10">ทั้งหมด {fleet.length} คัน</span>
    </div>
    
    <div className="flex flex-col md:flex-row gap-3 items-center w-full md:w-auto">
        <div className="relative w-full md:w-auto">
            <Search className="absolute left-3 top-2.5 text-black/40" size={16} />
            {/* ปรับพื้นหลังช่อง Search เล็กน้อยให้ดูสะอาดตาบนพื้นเหลือง */}
            <input 
                type="text" 
                placeholder="ค้นหาทะเบียน..." 
                value={searchTerm} 
                onChange={(e) => setSearchTerm(e.target.value)} 
                className="w-full md:w-64 pl-9 pr-4 py-2 rounded-full bg-white/50 text-black placeholder-black/50 text-sm outline-none border border-black/10 focus:ring-2 focus:ring-black/5" 
            />
        </div>
        {/* ปุ่มเพิ่มรถเป็นสีดำตัวอักษรเหลืองเพื่อให้ตัดกับพื้นหลังใหญ่ */}
        <button 
            onClick={openAddModal} 
            className="w-full md:w-auto bg-black text-yellow-400 hover:bg-zinc-800 text-sm font-bold px-6 py-2.5 rounded-full flex justify-center items-center gap-2 shadow-lg transition-all active:scale-95"
        >
            <Plus size={18} /> เพิ่มรถใหม่
        </button>
    </div>
</div>

      {/* --- Dynamic Grouping Loop --- */}
      {availableStatuses.map(status => {
          const groupData = filteredAll.filter(item => (item.status || 'Available') === status);
          if (groupData.length === 0) return null;

          const styles = getGroupStyle(status);
          const isExpanded = expandedGroups[status] ?? true; // Default true if undefined

          return (
              <div key={status} className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                  <div 
                    onClick={() => toggleGroup(status)}
                    className={`flex justify-between items-center p-4 border-b cursor-pointer transition-colors ${styles.bg} ${styles.border} hover:opacity-90`}
                  >
                      <div className="flex items-center gap-2">
                          <div className={`p-1 rounded-md transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`}>
                              <ChevronRight size={20} className={styles.icon} />
                          </div>
                          <h3 className={`font-bold text-sm flex items-center gap-2 ${styles.text}`}>
                              <div className={`w-2 h-2 rounded-full ${styles.dot} ${status === 'Maintenance' ? 'animate-pulse' : ''}`}></div>
                              {status}
                          </h3>
                          <span className={`text-xs px-2 py-0.5 rounded-full font-bold ml-2 bg-white/50 ${styles.text}`}>{groupData.length}</span>
                      </div>
                  </div>
                  
                  <div className={`transition-all duration-300 ease-in-out ${isExpanded ? 'max-h-[2000px] opacity-100' : 'max-h-0 opacity-0 overflow-hidden'}`}>
                      {renderFleetTable(groupData, status)}
                  </div>
              </div>
          );
      })}

      {/* --- Modals --- */}
      {showModal && (
        <Modal title={editingTruck ? "แก้ไขข้อมูลรถ" : "เพิ่มรถใหม่"} onClose={() => setShowModal(false)}>
          <form onSubmit={handleSave} className="space-y-6">
            <div className="flex justify-center mb-4"><div className="w-32 h-32 bg-slate-100 rounded-2xl border-2 border-dashed border-slate-300 flex items-center justify-center overflow-hidden relative">{editingTruck?.photoUrl ? <img src={editingTruck.photoUrl} className="w-full h-full object-cover" alt="Vehicle" /> : <Truck size={40} className="text-slate-300" />}<span className="absolute bottom-2 text-[10px] text-slate-400 font-bold bg-white/80 px-2 rounded">PHOTO</span></div></div>
            <div className="bg-slate-50 p-5 rounded-xl border border-slate-100 space-y-4">
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center"><Truck size={14} className="mr-1.5"/> ข้อมูลทั่วไป</h4>
                <div className="grid grid-cols-2 gap-4"><InputGroup label="ทะเบียนรถ" name="plate" required placeholder="70-xxxx" defaultValue={editingTruck?.plate} /><div><label className="block text-sm font-bold text-slate-700 mb-2">ประเภทรถ</label><select name="type" defaultValue={editingTruck?.type || 'หัวลาก 10 ล้อ'} className="w-full bg-slate-50 border-none p-3 rounded-xl focus:ring-2 focus:ring-indigo-500/20 text-slate-700 font-medium outline-none">{['หัวลาก 10 ล้อ', 'รถบรรทุก 6 ล้อ', 'รถกระบะ 4 ล้อ', 'หางพื้นเรียบ', 'หางตู้คอนเทนเนอร์'].map(t => <option key={t} value={t}>{t}</option>)}</select></div></div>
                <div className="grid grid-cols-2 gap-4"><InputGroup label="ยี่ห้อ" name="brand" placeholder="ISUZU, HINO" defaultValue={editingTruck?.brand} /><InputGroup label="รุ่น (Model)" name="model" placeholder="Vector, 360..." defaultValue={editingTruck?.model} /></div>
                <div className="grid grid-cols-2 gap-4">
                    <InputGroup label="เลขไมล์ปัจจุบัน (km)" name="mileage" type="number" placeholder="0" defaultValue={editingTruck?.mileage} />
                    <div><label className="block text-sm font-bold text-slate-700 mb-2">สถานะปัจจุบัน</label>
                        <select name="status" defaultValue={editingTruck?.status || 'Available'} className="w-full bg-white border border-slate-200 p-3 rounded-xl focus:ring-2 focus:ring-indigo-500/20 text-slate-700 font-medium outline-none">
                            <option value="Available">🟢 ว่าง (Available)</option>
                            <option value="In Transit">🔵 กำลังขนส่ง (In Transit)</option>
                            <option value="Maintenance">🔴 ซ่อมบำรุง (Maintenance)</option>
                            <option value="Inactive">⚫ เลิกใช้งาน (Inactive)</option>
                        </select>
                    </div>
                </div>
            </div>
            <div className="bg-orange-50 p-5 rounded-xl border border-orange-100 space-y-4">
                <h4 className="text-xs font-bold text-orange-600 uppercase tracking-wider flex items-center"><FileText size={14} className="mr-1.5"/> ข้อมูลต่ออายุ</h4>
                <div className="grid grid-cols-2 gap-4"><InputGroup label="วันหมดอายุภาษี" name="taxExpiry" type="date" required defaultValue={editingTruck?.taxExpiry} /><InputGroup label="วันหมดอายุ พ.ร.บ./ประกัน" name="insuranceExpiry" type="date" required defaultValue={editingTruck?.insuranceExpiry} /></div>
            </div>
            <InputGroup label="ลิงก์รูปถ่ายรถ (URL)" name="photoUrl" placeholder="https://..." defaultValue={editingTruck?.photoUrl} />
            <SubmitButton label={editingTruck ? "บันทึกการแก้ไข" : "เพิ่มรถเข้าสู่ระบบ"} />
          </form>
        </Modal>
      )}

      {selectedTruck && (
          <Modal title="รายละเอียดรถบรรทุก" onClose={() => setSelectedTruck(null)} maxWidth="max-w-2xl">
              <div className="space-y-6">
                  <div className="relative h-48 w-full rounded-2xl overflow-hidden bg-slate-100 border border-slate-200">
                      <img src={selectedTruck.photoUrl} className="w-full h-full object-cover" onError={(e) => e.target.src = "https://placehold.co/600x400?text=No+Image"} />
                      <div className="absolute top-4 right-4"><StatusBadge status={selectedTruck.status} /></div>
                      <div className="absolute bottom-0 left-0 w-full bg-gradient-to-t from-black/70 to-transparent p-6 pt-12"><h2 className="text-3xl font-bold text-white tracking-tight">{selectedTruck.plate}</h2><p className="text-slate-200 text-sm font-medium">{selectedTruck.brand} {selectedTruck.model} • {selectedTruck.type}</p></div>
                  </div>
                  <div className="p-4 rounded-xl border bg-slate-50 border-slate-100 flex items-center justify-between"><div><p className="text-xs text-slate-400 font-bold uppercase mb-1">เลขไมล์ปัจจุบัน</p><p className="text-2xl font-bold text-slate-800 tracking-tight font-mono">{selectedTruck.mileage ? parseInt(selectedTruck.mileage).toLocaleString() : '-'} <span className="text-sm text-slate-500 font-sans font-normal ml-1">km</span></p></div><div className="bg-white p-3 rounded-full border border-slate-200 text-slate-400"><Gauge size={24} /></div></div>
                  <div className="grid grid-cols-2 gap-6">
                      <div className={`p-4 rounded-xl border ${getExpiryStatus(selectedTruck.taxExpiry) === 'ok' ? 'bg-slate-50 border-slate-100' : 'bg-red-50 border-red-100'}`}><p className="text-xs text-slate-400 uppercase font-bold mb-1">วันหมดอายุภาษี</p><p className={`text-lg font-bold ${getExpiryStatus(selectedTruck.taxExpiry) === 'ok' ? 'text-slate-700' : 'text-red-600'}`}>{formatDateBE(selectedTruck.taxExpiry)}</p>{getExpiryStatus(selectedTruck.taxExpiry) !== 'ok' && <p className="text-xs text-red-500 font-bold mt-1">⚠️ ควรดำเนินการต่ออายุ</p>}</div>
                      <div className={`p-4 rounded-xl border ${getExpiryStatus(selectedTruck.insuranceExpiry) === 'ok' ? 'bg-slate-50 border-slate-100' : 'bg-red-50 border-red-100'}`}><p className="text-xs text-slate-400 uppercase font-bold mb-1">วันหมดอายุ พ.ร.บ.</p><p className={`text-lg font-bold ${getExpiryStatus(selectedTruck.insuranceExpiry) === 'ok' ? 'text-slate-700' : 'text-red-600'}`}>{formatDateBE(selectedTruck.insuranceExpiry)}</p>{getExpiryStatus(selectedTruck.insuranceExpiry) !== 'ok' && <p className="text-xs text-red-500 font-bold mt-1">⚠️ ควรดำเนินการต่ออายุ</p>}</div>
                  </div>
                  <div className="flex gap-3 pt-4 border-t border-slate-100"><button onClick={(e) => openEditModal(selectedTruck, e)} className="flex-1 bg-indigo-600 text-white py-3 rounded-xl font-bold hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-200">แก้ไขข้อมูล</button><button onClick={(e) => handleDelete(selectedTruck.id, e)} className="flex-1 bg-white text-red-500 border border-red-100 py-3 rounded-xl font-bold hover:bg-red-50 transition-colors">ลบข้อมูล</button></div>
              </div>
          </Modal>
      )}
    </div>
  );
}

// --- EMPLOYEE VIEW (UNCHANGED) ---
// --- EMPLOYEE VIEW (GROUPED & COLLAPSIBLE) ---
function EmployeeView({ drivers, db }) {
  const [showAddModal, setShowAddModal] = useState(false);
  const [showCourseModal, setShowCourseModal] = useState(false);
  const [selectedDriver, setSelectedDriver] = useState(null);
  const [editingDriver, setEditingDriver] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  
  // State สำหรับการกรองจาก Alert
  const [filterMode, setFilterMode] = useState('all'); // 'all' | 'alert'
  
  // State สำหรับการย่อ/ขยายกลุ่ม
  const [expandActive, setExpandActive] = useState(true);
  const [expandInactive, setExpandInactive] = useState(false);

  const [courses, setCourses] = useState([]);
  const [newCourseName, setNewCourseName] = useState('');
  const [selectedCourses, setSelectedCourses] = useState([]);

  // คำนวณยอดรวม (นับจากทั้งหมด ไม่สน Filter)
  const activeCount = drivers.filter(d => !d.status || d.status === 'Active').length;
  const inactiveCount = drivers.filter(d => d.status === 'Inactive').length;

  useEffect(() => {
      const q = collection(db, 'training_courses');
      const unsubscribe = onSnapshot(q, (snapshot) => {
          const courseData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
          if (courseData.length === 0) setCourses([{ id: '1', name: 'การขับขี่เชิงป้องกัน' }]); 
          else setCourses(courseData);
      });
      return () => unsubscribe();
  }, [db]);

  // --- Logic Helpers ---
  const getLicenseStatus = (expiryDateStr) => {
      if (!expiryDateStr) return 'unknown';
      const now = new Date();
      const expiry = new Date(expiryDateStr);
      const threeMonthsFromNow = new Date();
      threeMonthsFromNow.setMonth(now.getMonth() + 3);
      now.setHours(0,0,0,0); expiry.setHours(0,0,0,0);
      if (expiry < now) return 'expired';
      if (expiry <= threeMonthsFromNow) return 'warning';
      return 'ok';
  };

  const calculateDuration = (targetDate, isBirthday = false) => {
      if (!targetDate) return { text: "-", isExpired: false };
      const now = new Date();
      const target = new Date(targetDate);
      let start = isBirthday ? target : now;
      let end = isBirthday ? now : target;
      let isExpired = false;
      if (!isBirthday && now > target) { isExpired = true; let temp = start; start = end; end = temp; }
      let years = end.getFullYear() - start.getFullYear();
      let months = end.getMonth() - start.getMonth();
      let days = end.getDate() - start.getDate();
      if (days < 0) { months--; const prevMonth = new Date(end.getFullYear(), end.getMonth(), 0); days += prevMonth.getDate(); }
      if (months < 0) { years--; months += 12; }
      if (years < 0) years = 0;
      return { text: `${years} ปี ${months} เดือน ${days} วัน`, isExpired };
  };

  const formatDateBE = (dateString) => {
      if (!dateString) return "-";
      const date = new Date(dateString);
      return `${date.getDate().toString().padStart(2, '0')}/${(date.getMonth() + 1).toString().padStart(2, '0')}/${date.getFullYear() + 543}`;
  };

  const formatPhoneNumber = (val) => {
      if(!val) return "-";
      const p = val.replace(/[^\d]/g, "");
      if(p.length < 4) return p;
      if(p.length < 7) return `${p.slice(0,3)}-${p.slice(3)}`;
      return `${p.slice(0,3)}-${p.slice(3,6)}-${p.slice(6,10)}`;
  };

  const generateEmpId = (existing) => {
      if (!existing.length) return 'SIT-000001';
      const ids = existing.map(d => d.empId).filter(id => id && id.startsWith('SIT-')).map(id => parseInt(id.replace('SIT-', ''), 10)).filter(n => !isNaN(n));
      if (!ids.length) return 'SIT-000001';
      return `SIT-${String(Math.max(...ids) + 1).padStart(6, '0')}`;
  };

  const handleSave = async (e) => {
      e.preventDefault();
      const formData = new FormData(e.target);
      const data = {
          name: formData.get('name'), 
          idCard: formData.get('idCard'), 
          birthDate: formData.get('birthDate'),
          idCardExpiry: formData.get('idCardExpiry'), 
          licenseNumber: formData.get('licenseNumber'),
          licenseExpiry: formData.get('licenseExpiry'), 
          licenseType: formData.get('licenseType'),
          phone: formData.get('phone').replace(/[^\d]/g, ""), 
          lineId: formData.get('lineId'),
          startDate: formData.get('startDate'),
          status: formData.get('status'), 
          training: selectedCourses, 
          photoUrl: formData.get('photoUrl') || '',
      };
      try {
          if (editingDriver) await updateDoc(doc(db, 'drivers', editingDriver.id), data);
          else {
              data.empId = generateEmpId(drivers);
              data.createdAt = serverTimestamp();
              await addDoc(collection(db, 'drivers'), data);
          }
          setShowAddModal(false); setEditingDriver(null); setSelectedCourses([]);
      } catch (err) { alert("Error saving data"); }
  };

  const handleDeleteDriver = async (id, e) => {
      e.stopPropagation();
      if(window.confirm("ยืนยันการลบ?")) { await deleteDoc(doc(db, 'drivers', id)); setSelectedDriver(null); }
  };

  // --- Filtering Logic ---
  const alertDrivers = drivers.filter(d => {
      const status = getLicenseStatus(d.licenseExpiry);
      return status === 'expired' || status === 'warning';
  });

  // กรองข้อมูลตาม Search + Alert Mode
  const filteredAll = drivers.filter(driver => {
      const term = searchTerm.toLowerCase();
      const matchSearch = (
          (driver.name && driver.name.toLowerCase().includes(term)) ||
          (driver.empId && driver.empId.toLowerCase().includes(term)) ||
          (driver.idCard && driver.idCard.includes(term)) ||
          (driver.licenseNumber && driver.licenseNumber.includes(term))
      );

      // ถ้าเปิดโหมด Alert ให้กรองเฉพาะคนที่มีปัญหา
      if (filterMode === 'alert') {
          const status = getLicenseStatus(driver.licenseExpiry);
          return matchSearch && (status === 'expired' || status === 'warning');
      }

      return matchSearch;
  });

  const activeDrivers = filteredAll.filter(d => !d.status || d.status === 'Active');
  const inactiveDrivers = filteredAll.filter(d => d.status === 'Inactive');

  // --- Reusable Table Renderer ---
  const renderTable = (listData, emptyMessage) => (
      <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-slate-50 text-slate-500 text-xs font-bold uppercase whitespace-nowrap border-b border-slate-200">
              <tr>
                <th className="py-3 px-4">รหัส</th>
                <th className="py-3 px-4">สถานะ</th>
                <th className="py-3 px-4">ชื่อ-นามสกุล</th>
                <th className="py-3 px-4">บัตร ปชช.</th>
                <th className="py-3 px-4">เกิด (พ.ศ.)</th>
                <th className="py-3 px-4">อายุ</th>
                <th className="py-3 px-4">เลขใบขับขี่</th>
                <th className="py-3 px-4">ประเภท</th>
                <th className="py-3 px-4 text-center">วันหมดอายุ (ใบขับขี่)</th>
                <th className="py-3 px-4">คงเหลือ (วัน)</th>
                <th className="py-3 px-4">เริ่มงาน</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm whitespace-nowrap bg-white">
              {listData.map(driver => {
                  const age = calculateDuration(driver.birthDate, true);
                  const licenseRenew = calculateDuration(driver.licenseExpiry);
                  const licenseStatus = getLicenseStatus(driver.licenseExpiry);
                  
                  let expireColorClass = "text-slate-600";
                  let rowBgClass = "hover:bg-yellow-50"; 
                  if (licenseStatus === 'expired') { expireColorClass = "text-red-600 font-bold"; rowBgClass = "bg-red-50 hover:bg-red-100"; }
                  else if (licenseStatus === 'warning') { expireColorClass = "text-orange-600 font-bold"; }

                  return (
                    <tr key={driver.id} onClick={() => setSelectedDriver(driver)} className={`${rowBgClass} transition-colors cursor-pointer`}>
                      <td className="py-3 px-4 font-mono font-bold text-indigo-600">{driver.empId}</td>
                      <td className="py-3 px-4"><span className={`px-2 py-1 rounded-full text-[10px] font-bold border ${driver.status === 'Inactive' ? 'bg-slate-100 text-slate-500 border-slate-200' : 'bg-green-100 text-green-700 border-green-200'}`}>{driver.status || 'Active'}</span></td>
                      <td className="py-3 px-4 font-bold text-slate-700">{driver.name}</td>
                      <td className="py-3 px-4 font-mono text-slate-500">{driver.idCard}</td>
                      <td className="py-3 px-4 text-slate-600">{formatDateBE(driver.birthDate)}</td>
                      <td className="py-3 px-4 text-slate-600">{age.text}</td>
                      <td className="py-3 px-4 font-mono text-slate-600">{driver.licenseNumber}</td>
                      <td className="py-3 px-4"><span className="bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded border border-indigo-100 font-bold text-xs">{driver.licenseType}</span></td>
                      <td className={`py-3 px-4 text-center ${expireColorClass}`}>{formatDateBE(driver.licenseExpiry)}</td>
                      <td className="py-3 px-4"><span className={`px-2 py-0.5 rounded text-xs font-bold ${licenseStatus === 'expired' ? 'bg-red-100 text-red-600' : licenseStatus === 'warning' ? 'bg-orange-100 text-orange-600' : 'bg-green-100 text-green-700'}`}>{licenseStatus === 'expired' ? 'หมดอายุแล้ว' : licenseRenew.text}</span></td>
                      <td className="py-3 px-4 text-slate-600">{formatDateBE(driver.startDate)}</td>
                    </tr>
                  );
              })}
              {listData.length === 0 && <tr><td colSpan="11" className="py-8 text-center text-slate-400 italic">{emptyMessage}</td></tr>}
            </tbody>
          </table>
      </div>
  );

  return (
    <div className="space-y-6 font-sans">
      
      {/* Alert Banner (Restore) */}
      {alertDrivers.length > 0 && (
          <div 
            onClick={() => setFilterMode(filterMode === 'alert' ? 'all' : 'alert')}
            className={`p-4 rounded-xl border flex items-center justify-between cursor-pointer transition-all shadow-sm ${filterMode === 'alert' ? 'bg-orange-100 border-orange-300 ring-2 ring-orange-200' : 'bg-white border-orange-200 hover:bg-orange-50'}`}
          >
              <div className="flex items-center gap-3">
                  <div className="bg-orange-500 text-white p-2 rounded-lg animate-pulse"><AlertTriangle size={20} /></div>
                  <div>
                      <h4 className="font-bold text-orange-800 text-sm">แจ้งเตือนใบขับขี่ ({alertDrivers.length})</h4>
                      <p className="text-xs text-orange-600 mt-0.5">พบพนักงาน {alertDrivers.length} คน ใบขับขี่หมดอายุ หรือ เหลืออายุไม่ถึง 3 เดือน</p>
                  </div>
              </div>
              <div className="text-xs font-bold bg-white text-orange-600 px-3 py-1.5 rounded-full border border-orange-200 shadow-sm">
                  {filterMode === 'alert' ? 'แสดงทั้งหมด' : 'กดเพื่อดูรายชื่อ'}
              </div>
          </div>
      )}

      {/* Header Controls */}

<div className="flex flex-col md:flex-row justify-between items-center bg-yellow-400 p-6 rounded-xl border border-yellow-500/20 shadow-md gap-4">
     <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 w-full md:w-auto">
        {/* ปรับไอคอนและข้อความเป็นสีดำเพื่อให้เด่นบนพื้นเหลือง */}
        <div className="flex items-center gap-3">
            <Users size={24} className="text-black" strokeWidth={2.5} />
            <h2 className="text-lg font-black text-black tracking-tight uppercase">รายชื่อพนักงานขับรถ</h2>
        </div>
        <div className="flex gap-2">
            {/* ปรับสีป้ายนับจำนวนให้ดูสะอาดตาบนพื้นเหลือง */}
            <span className="bg-black/10 text-black text-xs font-bold px-2 py-0.5 rounded border border-black/10">ทั้งหมด {drivers.length}</span>
            <span className="bg-white/40 text-green-800 text-xs font-bold px-2 py-0.5 rounded border border-green-200/50 flex items-center">
                <div className="w-2 h-2 bg-green-600 rounded-full mr-1.5 animate-pulse"></div>Active {activeCount}
            </span>
        </div>
     </div>
     
     <div className="flex flex-col md:flex-row gap-3 items-center w-full md:w-auto">
         <div className="relative w-full md:w-auto">
             <Search className="absolute left-3 top-2.5 text-black/40" size={16} />
             {/* ปรับพื้นหลังช่อง Search ให้เป็นสีขาวโปร่งแสง (White/50) */}
             <input 
                type="text" 
                placeholder="ค้นหาชื่อ, รหัส..." 
                value={searchTerm} 
                onChange={(e) => setSearchTerm(e.target.value)} 
                className="w-full md:w-64 pl-9 pr-4 py-2 rounded-full bg-white/50 text-black placeholder-black/50 text-sm outline-none border border-black/10 focus:ring-2 focus:ring-black/5" 
             />
         </div>
         <div className="flex gap-2 w-full md:w-auto">
             {/* ปุ่มจัดการหัวข้อเป็นแบบโปร่งแสงเล็กน้อย */}
             <button onClick={() => setShowCourseModal(true)} className="flex-1 md:flex-none bg-black/5 hover:bg-black/10 text-black text-sm font-bold px-4 py-2 rounded-full flex justify-center items-center gap-2 border border-black/10">
                <Settings size={16} /> <span className="hidden lg:inline">หัวข้ออบรม</span>
             </button>
             {/* ปุ่มเพิ่มพนักงานเป็นสีดำตัวอักษรเหลืองเพื่อให้เป็น Action หลักที่เด่นชัด */}
             <button 
                onClick={() => { setEditingDriver(null); setSelectedCourses([]); setShowAddModal(true); }} 
                className="flex-1 md:flex-none bg-black text-yellow-400 hover:bg-zinc-800 text-sm font-bold px-6 py-2.5 rounded-full flex justify-center items-center gap-2 shadow-lg transition-all active:scale-95 whitespace-nowrap"
             >
                <Plus size={18} /> เพิ่มพนักงาน
             </button>
         </div>
     </div>
</div>

      {/* --- Group 1: ACTIVE --- */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <div onClick={() => setExpandActive(!expandActive)} className="flex justify-between items-center p-4 bg-green-50/50 border-b border-green-100 cursor-pointer hover:bg-green-50 transition-colors">
              <div className="flex items-center gap-2"><div className={`p-1 rounded-md transition-transform duration-200 ${expandActive ? 'rotate-180' : ''}`}><ChevronRight size={20} className="text-green-600" /></div><h3 className="font-bold text-green-800 text-sm flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>พนักงานปัจจุบัน (Active)</h3><span className="bg-green-200 text-green-800 text-xs px-2 py-0.5 rounded-full font-bold ml-2">{activeDrivers.length}</span></div>
          </div>
          <div className={`transition-all duration-300 ease-in-out ${expandActive ? 'max-h-[2000px] opacity-100' : 'max-h-0 opacity-0 overflow-hidden'}`}>
              {renderTable(activeDrivers, "ไม่พบข้อมูลพนักงาน Active")}
          </div>
      </div>

      {/* --- Group 2: INACTIVE --- */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <div onClick={() => setExpandInactive(!expandInactive)} className="flex justify-between items-center p-4 bg-slate-50 border-b border-slate-100 cursor-pointer hover:bg-slate-100 transition-colors">
              <div className="flex items-center gap-2"><div className={`p-1 rounded-md transition-transform duration-200 ${expandInactive ? 'rotate-180' : ''}`}><ChevronRight size={20} className="text-slate-500" /></div><h3 className="font-bold text-slate-600 text-sm flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-slate-400"></div>พนักงานที่พ้นสภาพ/ลาออก (Inactive)</h3><span className="bg-slate-200 text-slate-600 text-xs px-2 py-0.5 rounded-full font-bold ml-2">{inactiveDrivers.length}</span></div>
          </div>
          <div className={`transition-all duration-300 ease-in-out ${expandInactive ? 'max-h-[2000px] opacity-100' : 'max-h-0 opacity-0 overflow-hidden'}`}>
              {renderTable(inactiveDrivers, "ไม่มีข้อมูลพนักงาน Inactive")}
          </div>
      </div>

      {/* --- Modals --- */}
      {showAddModal && (
        <Modal title={editingDriver ? "แก้ไขข้อมูลพนักงาน" : "ลงทะเบียนพนักงานใหม่"} onClose={() => setShowAddModal(false)}>
          <form onSubmit={handleSave} className="space-y-6">
            <div className="bg-slate-50 p-5 rounded-xl border border-slate-100 space-y-4">
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center"><User size={14} className="mr-1.5"/> ข้อมูลส่วนตัว</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <InputGroup label="ชื่อ-นามสกุล" name="name" required placeholder="สมชาย ใจดี" defaultValue={editingDriver?.name} />
                    <div className="grid grid-cols-2 gap-4"><InputGroup label="เบอร์โทรศัพท์" name="phone" required placeholder="081xxxxxxx" maxLength={10} defaultValue={editingDriver?.phone} /><InputGroup label="Line ID" name="lineId" placeholder="@lineid" defaultValue={editingDriver?.lineId} /></div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4"><InputGroup label="เลขบัตรประชาชน" name="idCard" required maxLength={13} defaultValue={editingDriver?.idCard} /><InputGroup label="วันเกิด" name="birthDate" type="date" required defaultValue={editingDriver?.birthDate} /></div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4"><InputGroup label="วันหมดอายุบัตร ปชช." name="idCardExpiry" type="date" defaultValue={editingDriver?.idCardExpiry} /><div className="grid grid-cols-2 gap-2"><InputGroup label="วันที่เริ่มงาน" name="startDate" type="date" required defaultValue={editingDriver?.startDate} /><div><label className="block text-sm font-bold text-slate-700 mb-2">สถานะ</label><select name="status" defaultValue={editingDriver?.status || 'Active'} className="w-full bg-slate-50 border-none p-3 rounded-xl focus:ring-2 focus:ring-indigo-500/20 text-slate-700 font-medium outline-none"><option value="Active">Active</option><option value="Inactive">Inactive</option></select></div></div></div>
            </div>
            <div className="bg-yellow-50 p-5 rounded-xl border border-yellow-100 space-y-4">
                <h4 className="text-xs font-bold text-yellow-600 uppercase tracking-wider flex items-center"><CreditCard size={14} className="mr-1.5"/> ข้อมูลใบขับขี่</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4"><div><label className="block text-sm font-bold text-slate-700 mb-2">ประเภท</label><select name="licenseType" defaultValue={editingDriver?.licenseType || 'ท.2'} className="w-full bg-slate-50 border-none p-3 rounded-xl focus:ring-2 focus:ring-indigo-500 text-slate-700 outline-none">{['ท.2', 'ท.3', 'ท.4'].map(opt => <option key={opt} value={opt}>{opt}</option>)}</select></div><div className="md:col-span-2"><InputGroup label="เลขที่ใบขับขี่" name="licenseNumber" required defaultValue={editingDriver?.licenseNumber} /></div></div><InputGroup label="วันหมดอายุใบขับขี่" name="licenseExpiry" type="date" required defaultValue={editingDriver?.licenseExpiry} />
            </div>
            <div className="p-1"><div className="flex justify-between items-center mb-3"><h4 className="text-sm font-bold text-slate-700 flex items-center"><CheckCircle size={16} className="mr-2 text-green-500" /> ประวัติการอบรม</h4><button type="button" onClick={() => setShowCourseModal(true)} className="text-xs text-blue-600 hover:underline">จัดการหัวข้อ</button></div><div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-40 overflow-y-auto pr-2">{courses.map((course) => (<div key={course.id} onClick={() => { if(selectedCourses.includes(course.name)) setSelectedCourses(selectedCourses.filter(c => c !== course.name)); else setSelectedCourses([...selectedCourses, course.name]); }} className={`p-3 rounded-lg border cursor-pointer flex items-center ${selectedCourses.includes(course.name) ? 'bg-indigo-50 border-indigo-500 text-indigo-700 font-bold' : 'bg-white border-slate-200 text-slate-600'}`}><div className={`w-5 h-5 rounded border mr-3 flex items-center justify-center ${selectedCourses.includes(course.name) ? 'bg-indigo-500 border-indigo-500' : 'border-slate-300'}`}>{selectedCourses.includes(course.name) && <CheckCircle size={14} className="text-white" />}</div><span className="text-xs">{course.name}</span></div>))}</div></div>
            <InputGroup label="ลิงก์รูปถ่าย (URL)" name="photoUrl" placeholder="https://..." defaultValue={editingDriver?.photoUrl} />
            <SubmitButton label={editingDriver ? "บันทึกการแก้ไข" : "บันทึกข้อมูล"} />
          </form>
        </Modal>
      )}

      {selectedDriver && (
          <Modal title="ข้อมูลพนักงานอย่างละเอียด" onClose={() => setSelectedDriver(null)} maxWidth="max-w-4xl">
              <div className="flex flex-col md:flex-row gap-8">
                  <div className="w-full md:w-1/3 flex flex-col items-center"><div className="w-40 h-40 rounded-full border-4 border-yellow-400 shadow-xl overflow-hidden bg-slate-100 mb-6"><img src={selectedDriver.photoUrl} className="w-full h-full object-cover" onError={(e) => e.target.src = `https://ui-avatars.com/api/?name=${selectedDriver.name}`} /></div><h2 className="text-2xl font-bold text-slate-900 text-center">{selectedDriver.name}</h2><div className="flex flex-col items-center gap-2 mt-2"><span className="bg-indigo-600 text-white px-4 py-1 rounded-full font-mono font-bold tracking-wider">{selectedDriver.empId}</span><span className={`px-3 py-1 rounded-full text-xs font-bold border ${selectedDriver.status === 'Inactive' ? 'bg-slate-100 text-slate-500 border-slate-200' : 'bg-green-100 text-green-700 border-green-200'}`}>{selectedDriver.status || 'Active'}</span></div><div className="flex gap-4 mt-8 w-full"><button onClick={(e) => { e.stopPropagation(); setEditingDriver(selectedDriver); setSelectedCourses(selectedDriver.training || []); setSelectedDriver(null); setShowAddModal(true); }} className="flex-1 bg-slate-100 hover:bg-indigo-50 text-slate-700 hover:text-indigo-600 font-bold py-3 rounded-xl flex items-center justify-center gap-2 transition-colors border border-slate-200"><Edit size={18} /> แก้ไข</button><button onClick={(e) => handleDeleteDriver(selectedDriver.id, e)} className="flex-1 bg-red-50 hover:bg-red-100 text-red-600 font-bold py-3 rounded-xl flex items-center justify-center gap-2 transition-colors border border-red-100"><Trash2 size={18} /> ลบ</button></div></div>
                  <div className="w-full md:w-2/3 space-y-6"><div className="bg-slate-50 p-6 rounded-2xl border border-slate-100"><h4 className="text-sm font-bold text-slate-400 uppercase mb-4 flex items-center"><User size={16} className="mr-2"/> ข้อมูลส่วนตัว</h4><div className="grid grid-cols-2 gap-y-4 gap-x-8 text-sm"><div><p className="text-slate-400 text-xs">เบอร์โทรศัพท์</p><p className="font-bold text-lg text-slate-800">{formatPhoneNumber(selectedDriver.phone)}</p></div><div><p className="text-slate-400 text-xs">Line ID</p><p className="font-bold text-sm text-green-600 break-all">{selectedDriver.lineId || '-'}</p></div><div><p className="text-slate-400 text-xs">วันเริ่มงาน</p><p className="font-semibold text-slate-700">{formatDateBE(selectedDriver.startDate)}</p></div><div className="col-span-2 border-t border-slate-200 pt-4"><p className="text-slate-400 text-xs">เลขบัตรประชาชน</p><p className="font-mono text-slate-700 text-base tracking-widest">{selectedDriver.idCard}</p></div><div><p className="text-slate-400 text-xs">วันเกิด</p><p className="font-semibold text-slate-700">{formatDateBE(selectedDriver.birthDate)}</p></div><div><p className="text-slate-400 text-xs">อายุ</p><p className="font-semibold text-slate-700">{calculateDuration(selectedDriver.birthDate, true).text}</p></div><div><p className="text-slate-400 text-xs">วันหมดอายุบัตร ปชช.</p><p className="font-semibold text-slate-700">{formatDateBE(selectedDriver.idCardExpiry)}</p></div></div></div><div className="bg-yellow-50/50 p-6 rounded-2xl border border-yellow-100"><h4 className="text-sm font-bold text-yellow-600 uppercase mb-4 flex items-center"><CreditCard size={16} className="mr-2"/> ข้อมูลใบขับขี่</h4><div className="grid grid-cols-2 gap-y-4 gap-x-8 text-sm"><div><p className="text-slate-400 text-xs">ประเภท</p><p className="font-bold text-lg text-slate-800">{selectedDriver.licenseType}</p></div><div><p className="text-slate-400 text-xs">เลขที่ใบขับขี่</p><p className="font-mono text-slate-700 text-base">{selectedDriver.licenseNumber}</p></div><div className="col-span-2 border-t border-yellow-200 pt-4"><div className="flex justify-between items-end"><div><p className="text-slate-400 text-xs">วันหมดอายุ</p><p className="font-semibold text-slate-700">{formatDateBE(selectedDriver.licenseExpiry)}</p></div><div className="text-right"><p className="text-slate-400 text-xs">เวลาที่เหลือ</p>{(() => { const renew = calculateDuration(selectedDriver.licenseExpiry); return <p className={`font-bold ${renew.isExpired ? 'text-red-600' : 'text-green-600'}`}>{renew.isExpired ? 'หมดอายุแล้ว' : renew.text}</p> })()}</div></div></div></div></div><div><h4 className="text-sm font-bold text-slate-400 uppercase mb-3 flex items-center"><CheckCircle size={16} className="mr-2"/> ประวัติการอบรม</h4><div className="flex flex-wrap gap-2">{selectedDriver.training && selectedDriver.training.length > 0 ? (selectedDriver.training.map((t, i) => (<span key={i} className="px-3 py-1.5 bg-white text-slate-600 text-xs rounded-lg border border-slate-200 shadow-sm font-medium">{t}</span>))) : <span className="text-slate-400 italic text-sm">- ไม่มีการอบรม -</span>}</div></div></div>
              </div>
          </Modal>
      )}

      {showCourseModal && (
          <Modal title="จัดการหัวข้อการอบรม" onClose={() => setShowCourseModal(false)}>
              <div className="space-y-6">
                  <form onSubmit={(e) => { e.preventDefault(); if(newCourseName.trim()) { addDoc(collection(db, 'training_courses'), { name: newCourseName.trim(), createdAt: serverTimestamp() }); setNewCourseName(''); } }} className="flex gap-2"><input type="text" value={newCourseName} onChange={(e) => setNewCourseName(e.target.value)} placeholder="เพิ่มหัวข้อใหม่..." className="flex-1 bg-slate-50 border border-slate-200 rounded-lg px-4 py-2 outline-none focus:ring-2 focus:ring-indigo-500/20" /><button type="submit" disabled={!newCourseName.trim()} className="bg-indigo-600 text-white font-bold px-4 py-2 rounded-lg hover:bg-indigo-700 disabled:bg-slate-300">เพิ่ม</button></form>
                  <div className="space-y-2 max-h-[50vh] overflow-y-auto">{courses.map(course => (<div key={course.id} className="flex justify-between items-center p-3 bg-white border border-slate-100 rounded-lg shadow-sm"><span className="text-sm text-slate-700">{course.name}</span><button onClick={() => window.confirm('ลบ?') && deleteDoc(doc(db, 'training_courses', course.id))} className="text-slate-300 hover:text-red-500 p-1 rounded hover:bg-red-50"><Trash2 size={16} /></button></div>))}</div>
              </div>
          </Modal>
      )}
    </div>
  );
}

// --- Placeholder Views (No Changes) ---

// --- DASHBOARD VIEW (REAL-TIME DATA) ---
// --- DASHBOARD VIEW (UPGRADED WITH EMPLOYEE STATS & CHARTS) ---
function DashboardView({ drivers, fleet, orders, maintenance }) {
    
  // --- 1. Helper: คำนวณสถานะวันหมดอายุ ---
  const getExpiryStatus = (dateStr) => {
      if (!dateStr) return 'ok';
      const now = new Date();
      const expiry = new Date(dateStr);
      const threeMonths = new Date();
      threeMonths.setMonth(now.getMonth() + 3);
      now.setHours(0,0,0,0); expiry.setHours(0,0,0,0);

      if (expiry < now) return 'expired';
      if (expiry <= threeMonths) return 'warning';
      return 'ok';
  };

  // --- 2. การเตรียมข้อมูล (Data Preparation) ---
  
  // สรุปพนักงาน
  const activeDrivers = drivers.filter(d => !d.status || d.status === 'Active');
  const inactiveDriversCount = drivers.filter(d => d.status === 'Inactive').length;

  // ข้อมูลสำหรับกราฟพนักงาน (License Status)
  const driverLicenseChartData = [
      { name: 'ปกติ', value: activeDrivers.filter(d => getExpiryStatus(d.licenseExpiry) === 'ok').length, fill: '#10B981' },
      { name: 'ใกล้หมดอายุ', value: activeDrivers.filter(d => getExpiryStatus(d.licenseExpiry) === 'warning').length, fill: '#F59E0B' },
      { name: 'หมดอายุแล้ว', value: activeDrivers.filter(d => getExpiryStatus(d.licenseExpiry) === 'expired').length, fill: '#EF4444' },
  ];

  // ข้อมูลสถานะรถ (Fleet Status)
  const fleetStatusData = [
      { name: 'Available', value: fleet.filter(f => (!f.status || f.status === 'Available') && f.status !== 'Inactive').length, color: '#10B981' }, 
      { name: 'In Transit', value: fleet.filter(f => f.status === 'In Transit').length, color: '#6366F1' }, 
      { name: 'Maintenance', value: fleet.filter(f => f.status === 'Maintenance').length, color: '#F43F5E' }, 
  ].filter(d => d.value > 0);

  // รวบรวมแจ้งเตือนด่วน (Alert Center)
  const driverAlerts = drivers
      .filter(d => getExpiryStatus(d.licenseExpiry) !== 'ok' && d.status !== 'Inactive')
      .map(d => ({ type: 'Driver', name: d.name, detail: 'ใบขับขี่', date: d.licenseExpiry, status: getExpiryStatus(d.licenseExpiry) }));

  const fleetAlerts = [];
  fleet.filter(f => f.status !== 'Inactive').forEach(f => {
      const taxStatus = getExpiryStatus(f.taxExpiry);
      const insStatus = getExpiryStatus(f.insuranceExpiry);
      if (taxStatus !== 'ok') fleetAlerts.push({ type: 'Fleet', name: f.plate, detail: 'ภาษีรถยนต์', date: f.taxExpiry, status: taxStatus });
      if (insStatus !== 'ok') fleetAlerts.push({ type: 'Fleet', name: f.plate, detail: 'พ.ร.บ./ประกัน', date: f.insuranceExpiry, status: insStatus });
  });

  const allAlerts = [...driverAlerts, ...fleetAlerts].sort((a,b) => new Date(a.date) - new Date(b.date));

  return (
      <div className="space-y-6 font-sans">
          
          {/* 1. Top Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex items-center justify-between relative overflow-hidden group">
                  <div className="absolute right-0 top-0 h-full w-1 bg-yellow-400"></div>
                  <div>
                      <p className="text-xs text-slate-400 uppercase font-bold mb-1">พนักงาน (Active)</p>
                      <h3 className="text-3xl font-bold text-slate-800">{activeDrivers.length} <span className="text-sm font-normal text-slate-400">/ {drivers.length}</span></h3>
                  </div>
                  <div className="bg-yellow-100 p-3 rounded-full text-yellow-700 group-hover:scale-110 transition-transform"><Users size={24}/></div>
              </div>

              <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex items-center justify-between relative overflow-hidden group">
                  <div className="absolute right-0 top-0 h-full w-1 bg-indigo-500"></div>
                  <div>
                      <p className="text-xs text-slate-400 uppercase font-bold mb-1">รถพร้อมใช้ (Active)</p>
                      <h3 className="text-3xl font-bold text-indigo-900">{fleet.filter(f => f.status !== 'Inactive').length} <span className="text-sm font-normal text-slate-400">/ {fleet.length}</span></h3>
                  </div>
                  <div className="bg-indigo-50 p-3 rounded-full text-indigo-600 group-hover:scale-110 transition-transform"><Truck size={24}/></div>
              </div>

              <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex items-center justify-between relative overflow-hidden group">
                  <div className="absolute right-0 top-0 h-full w-1 bg-blue-500"></div>
                  <div>
                      <p className="text-xs text-slate-400 uppercase font-bold mb-1">งานกำลังวิ่ง</p>
                      <h3 className="text-3xl font-bold text-blue-600">{orders.filter(o => o.status === 'In Transit').length}</h3>
                  </div>
                  <div className="bg-blue-50 p-3 rounded-full text-blue-600 group-hover:scale-110 transition-transform"><MapPin size={24}/></div>
              </div>

              <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex items-center justify-between relative overflow-hidden group">
                  <div className="absolute right-0 top-0 h-full w-1 bg-orange-500"></div>
                  <div>
                      <p className="text-xs text-slate-400 uppercase font-bold mb-1">แจ้งซ่อมค้าง</p>
                      <h3 className="text-3xl font-bold text-orange-500">{maintenance.filter(m => m.status === 'Pending').length}</h3>
                  </div>
                  <div className="bg-orange-50 p-3 rounded-full text-orange-500 group-hover:scale-110 transition-transform"><Wrench size={24}/></div>
              </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              
              {/* 2. Employee License Chart */}
              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col h-80">
                  <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
                      <CreditCard size={18} className="text-yellow-500"/> สถานะใบขับขี่พนักงาน (Active)
                  </h3>
                  <div className="flex-1 w-full">
                      <ResponsiveContainer width="100%" height="100%">
                          <BarChart data={driverLicenseChartData} layout="vertical" margin={{ left: 20, right: 30 }}>
                              <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#F1F5F9" />
                              <XAxis type="number" hide />
                              <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} style={{ fontSize: '12px', fontWeight: 'bold' }} />
                              <Tooltip cursor={{fill: '#F8FAFC'}} contentStyle={{ borderRadius: '10px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }} />
                              <Bar dataKey="value" radius={[0, 4, 4, 0]} barSize={30} label={{ position: 'right', fontSize: 12, fontWeight: 'bold' }} />
                          </BarChart>
                      </ResponsiveContainer>
                  </div>
              </div>

              {/* 3. Fleet Status Chart */}
              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col h-80">
                  <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
                      <Truck size={18} className="text-indigo-500"/> สถานะการใช้งานรถ
                  </h3>
                  <div className="flex-1 w-full relative">
                      <ResponsiveContainer width="100%" height="100%">
                          <PieChart>
                              <Pie data={fleetStatusData} cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value">
                                  {fleetStatusData.map((entry, index) => (
                                      <Cell key={`cell-${index}`} fill={entry.color} strokeWidth={0} />
                                  ))}
                              </Pie>
                              <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }} />
                              <Legend verticalAlign="bottom" iconType="circle" wrapperStyle={{ fontSize: '12px', fontWeight: 'bold' }} />
                          </PieChart>
                      </ResponsiveContainer>
                      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 -mt-4 text-center">
                          <span className="text-2xl font-bold text-slate-800">{fleet.filter(f => f.status !== 'Inactive').length}</span>
                          <p className="text-[10px] text-slate-400 font-bold">ACTIVE</p>
                      </div>
                  </div>
              </div>
          </div>

          {/* 4. Combined Alert Center */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm flex flex-col">
              <div className="p-5 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                  <h3 className="font-bold text-lg text-slate-800 flex items-center gap-2">
                      <AlertTriangle size={20} className="text-rose-500"/> รายการต้องจัดการเร่งด่วน
                  </h3>
                  <span className="bg-rose-100 text-rose-600 text-xs font-bold px-3 py-1 rounded-full">{allAlerts.length} รายการ</span>
              </div>
              <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-3 max-h-80 overflow-y-auto custom-scrollbar">
                  {allAlerts.length > 0 ? allAlerts.map((alert, idx) => (
                      <div key={idx} className={`flex items-center justify-between p-3 rounded-xl border transition-all ${alert.status === 'expired' ? 'bg-rose-50 border-rose-100' : 'bg-white border-slate-100 hover:border-orange-200'}`}>
                          <div className="flex items-center gap-4">
                              <div className={`p-2 rounded-lg shrink-0 ${alert.type === 'Driver' ? 'bg-yellow-100 text-yellow-700' : 'bg-indigo-100 text-indigo-600'}`}>
                                  {alert.type === 'Driver' ? <User size={18}/> : <Truck size={18}/>}
                              </div>
                              <div>
                                  <p className="text-sm font-bold text-slate-800">{alert.name} <span className="font-normal text-slate-400 text-xs ml-1">({alert.type === 'Driver' ? 'พนักงาน' : 'รถ'})</span></p>
                                  <p className={`text-xs font-bold ${alert.status === 'expired' ? 'text-rose-600' : 'text-orange-500'}`}>
                                      {alert.detail} {alert.status === 'expired' ? 'หมดอายุแล้วเมื่อ' : 'หมดอายุวันที่'} {new Date(alert.date).toLocaleDateString('th-TH')}
                                  </p>
                              </div>
                          </div>
                          <ChevronRight size={18} className="text-slate-300" />
                      </div>
                  )) : (
                      <div className="col-span-2 py-10 flex flex-col items-center justify-center text-slate-300">
                          <CheckCircle size={40} className="mb-2 opacity-20"/>
                          <p className="font-bold">ไม่มีรายการค้างจัดการ</p>
                      </div>
                  )}
              </div>
          </div>
      </div>
  );
}

// --- ORDER VIEW (SHIPMENT MANAGEMENT) ---
// --- ORDER VIEW (COMPLETE VERSION) ---
// --- ORDER VIEW (V4: SPECIFIC TRAILER TYPE & TRAILERPLATE VARIABLE) ---
// --- ORDER VIEW (V5: MULTI-SELECT, EDIT/DELETE, GROUP FILTER) ---
// --- ORDER VIEW (V6: FIXED DRIVERNAME & FULL DATETIME SLOTS) ---
// --- ORDER VIEW (GROUPED BY DATE & COLLAPSIBLE) ---
// ==========================================
// ORDER VIEW (COMPLETE & GROUPED BY DATE)
// ==========================================
// ==========================================
// 🚀 ORDER VIEW (ฉบับปรับปรุง: คีย์ข้อมูล 6 รายการ + จัดกลุ่มตามวัน)
// ==========================================
// ==========================================
// 🚀 ORDER VIEW (ฉบับปรับปรุงสมบูรณ์: ค้นหาครอบคลุม + คีย์ข้อมูล 6 รายการ)
// ==========================================
function OrderView({ orders, drivers, fleet, db }) {
  const [showAddModal, setShowAddModal] = useState(false);
  const [showLoadModal, setShowLoadModal] = useState(false);
  const [editingLoadJob, setEditingLoadJob] = useState(null);
  const [selectedJobs, setSelectedJobs] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedGroups, setExpandedGroups] = useState({});

  const GAS_WEB_APP_URL = "https://script.google.com/macros/s/AKfycbxEgLJxXgwi1rnGRyHjwWsC8kjo3_wZJ3j4K4iFlCUzvIUCG6axq5_x_yQdyiN_RtSkfw/exec";

  // --- Helpers ---
  const formatDateTime = (date) => {
    if (!date) return "-";
    const d = new Date(date);
    const pad = (n) => n.toString().padStart(2, '0');
    return `${pad(d.getMonth() + 1)}/${pad(d.getDate())}/${d.getFullYear()} ${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
  };

  // --- Handlers ---
  const handleCreateOrder = async (e) => {
    e.preventDefault();
    try {
      const formData = new FormData(e.target);
      const truck = fleet.find(f => f.id === formData.get('truckId'));
      const trailer = fleet.find(f => f.id === formData.get('trailerId'));
      const rawDate = formData.get('date');
      const d = new Date(rawDate);
      const dateFormatted = `${(d.getMonth() + 1).toString().padStart(2, '0')}/${d.getDate().toString().padStart(2, '0')}/${d.getFullYear()}`;

      await addDoc(collection(db, 'orders'), {
        orderNumber: `JOB-${Date.now().toString().slice(-6)}`,
        date: dateFormatted,
        slottime: `${dateFormatted} ${formData.get('slottime')}`,
        factorycall: `${dateFormatted} ${formData.get('factorycall')}`,
        oriogin: formData.get('oriogin'),
        destination: formData.get('destination'),
        loadingtype: formData.get('loadingtype'),
        truckplate: truck?.plate || '',
        trailerplate: trailer?.plate || '',
        status: 'Draft',
        createdAt: serverTimestamp(),
        lastUpdate: new Date().toISOString()
      });
      setShowAddModal(false);
    } catch (err) { alert("Error: " + err.message); }
  };

  const handleUpdateLoadInfo = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    try {
      await updateDoc(doc(db, 'orders', editingLoadJob.id), {
        docNumber: formData.get('docNumber') || '',
        truckWeight: formData.get('truckWeight') || '',
        cargoWeight: formData.get('cargoWeight') || '',
        gateIn: formData.get('gateIn') || '',
        gateOut: formData.get('gateOut') || '',
        ecdNumber: formData.get('ecdNumber') || '',
        lastUpdate: new Date().toISOString()
      });
      setShowLoadModal(false);
      setEditingLoadJob(null);
      alert("บันทึกข้อมูลหน้างานเรียบร้อย");
    } catch (err) { alert("Update Error: " + err.message); }
  };

  const handleBulkSend = async () => {
    if (selectedJobs.length === 0) return;
    const adminTime = formatDateTime(new Date());
    if (!window.confirm(`ยืนยันส่งงานจำนวน ${selectedJobs.length} รายการ?`)) return;

    for (const jobId of selectedJobs) {
      const order = orders.find(o => o.id === jobId);
      if (!order?.driverLineId) continue;
      await updateDoc(doc(db, 'orders', jobId), { status: 'รอ พขร ตอบรับงาน', admincall: adminTime });
      const details = { ...order, drivername: order.driverName, admincall: adminTime };
      fetch(`${GAS_WEB_APP_URL}?action=sendJob&orderId=${jobId}&userId=${order.driverLineId}&details=${encodeURIComponent(JSON.stringify(details))}`, { mode: 'no-cors' });
    }
    setSelectedJobs([]);
    alert("ส่งงานเรียบร้อย");
  };

  // ✅ 🔍 Logic การค้นหาแบบ Global (ค้นหาได้ทุกฟิลด์)
  const filteredOrders = orders.filter(o => {
    const term = searchTerm.toLowerCase();
    return (
      o.orderNumber?.toLowerCase().includes(term) || 
      o.truckplate?.toLowerCase().includes(term) || 
      o.trailerplate?.toLowerCase().includes(term) || 
      o.driverName?.toLowerCase().includes(term) ||
      o.docNumber?.toLowerCase().includes(term) ||
      o.ecdNumber?.toLowerCase().includes(term) ||
      o.oriogin?.toLowerCase().includes(term) ||
      o.destination?.toLowerCase().includes(term)
    );
  });

  const grouped = filteredOrders.reduce((acc, curr) => {
    const d = curr.date || 'Other';
    if (!acc[d]) acc[d] = [];
    acc[d].push(curr);
    return acc;
  }, {});

  const sortedDates = Object.keys(grouped).sort((a, b) => new Date(b) - new Date(a));

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header & Search */}
 
<div className="flex flex-col md:flex-row justify-between items-center bg-yellow-400 p-6 rounded-xl border border-yellow-500/20 shadow-md gap-4">
    <div className="flex items-center gap-3">
        {/* ปรับพื้นหลัง Icon และตัวไอคอนให้เป็นสีดำเพื่อให้เด่นบนพื้นเหลือง */}
        <div className="bg-black/5 p-2.5 rounded-lg">
            <Package size={24} className="text-black" strokeWidth={2.5} />
        </div>
        <div>
            <h2 className="text-xl font-black text-black tracking-tight uppercase">Shipments</h2>
            <p className="text-[10px] font-bold text-black/60 uppercase tracking-widest">Global Search Active</p>
        </div>
    </div>
    
    <div className="flex gap-2 w-full md:w-auto">
        <div className="relative flex-1 md:w-80">
            <Search className="absolute left-3 top-2.5 text-black/40" size={16} />
            {/* ปรับพื้นหลังช่อง Search ให้เป็นสีขาวโปร่งแสง (White/50) เข้ากับ Theme ใหม่ */}
            <input 
                type="text" 
                placeholder="ค้นหา ID, ทะเบียน, ชื่อ, เอกสาร..." 
                className="w-full pl-9 pr-4 py-2 bg-white/50 text-black placeholder-black/50 rounded-full text-sm outline-none border border-black/10 focus:ring-2 focus:ring-black/5 transition-all" 
                onChange={e => setSearchTerm(e.target.value)} 
            />
        </div>
        {/* ปุ่มสร้างใบงานเป็นสีดำตัวอักษรเหลืองเพื่อให้เป็น Action หลักที่เด่นชัด */}
        <button 
            onClick={() => setShowAddModal(true)} 
            className="bg-black text-yellow-400 px-6 py-2 rounded-full font-bold text-sm hover:scale-105 transition-transform active:scale-95 shadow-lg"
        >
            + สร้างใบงาน
        </button>
    </div>
</div>

      {/* รายการแบ่งตามวัน */}
      <div className="space-y-4">
        {sortedDates.map(date => {
          const isExpanded = expandedGroups[date] !== true;
          return (
            <div key={date} className="bg-white rounded-[2rem] border border-slate-200 overflow-hidden shadow-sm">
              <div className="p-5 bg-slate-50 border-b flex justify-between items-center cursor-pointer hover:bg-slate-100" onClick={() => setExpandedGroups(p => ({...p, [date]: !p[date]}))}>
                <span className="font-bold text-slate-700 flex items-center gap-2"><Calendar size={18} className="text-indigo-500"/> {date} <span className="text-xs bg-white px-2 py-0.5 rounded-full border border-slate-200 text-slate-400">{grouped[date].length} งาน</span></span>
                <ChevronDown className={isExpanded ? 'rotate-180 transition-transform' : 'transition-transform'} />
              </div>
              {isExpanded && (
                <div className="p-5 space-y-4">
                  {grouped[date].map(order => (
                    <div key={order.id} className={`relative border-2 rounded-[2rem] p-6 transition-all ${selectedJobs.includes(order.id) ? 'border-indigo-500 bg-indigo-50/10 shadow-md' : 'border-slate-100 hover:border-indigo-100'}`}>
                      <div className="absolute top-6 right-6 flex flex-col items-end gap-1">
                        <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase border shadow-sm ${order.status === 'Draft' ? 'bg-slate-100 text-slate-400' : 'bg-orange-100 text-orange-600 border-orange-200 animate-pulse'}`}>{order.status || 'Draft'}</span>
                      </div>
                      
                      <div className="flex items-center gap-4 mb-4">
                        {order.status === 'Draft' && <input type="checkbox" checked={selectedJobs.includes(order.id)} onChange={() => setSelectedJobs(p => p.includes(order.id) ? p.filter(i => i !== order.id) : [...p, order.id])} className="w-6 h-6 rounded-lg accent-indigo-600 cursor-pointer" />}
                        <h3 className="text-lg font-black text-slate-800 tracking-tight">{order.orderNumber}</h3>
                        
                        {/* ✅ ปุ่มคีย์ข้อมูลหน้างาน (แสดงเมื่อไม่ใช่ Draft) */}
                        {order.status !== 'Draft' && (
                          <button 
                            onClick={() => { setEditingLoadJob(order); setShowLoadModal(true); }}
                            className="bg-indigo-600 text-white px-4 py-1.5 rounded-xl text-xs font-bold hover:bg-indigo-700 shadow-md flex items-center gap-1.5 transition-all"
                          >
                            <Edit size={14}/> ข้อมูลหน้างาน
                          </button>
                        )}
                        
                        {order.status === 'Draft' && <button onClick={() => deleteDoc(doc(db, 'orders', order.id))} className="text-slate-200 hover:text-red-500 ml-auto"><Trash2 size={18}/></button>}
                      </div>

                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 bg-slate-50/50 p-4 rounded-2xl text-[10px]">
                        <div><p className="text-slate-400 font-bold uppercase mb-1">ทะเบียน</p><p className="font-bold">{order.truckplate} / {order.trailerplate}</p></div>
                        <div><p className="text-slate-400 font-bold uppercase mb-1">Slot / Factory</p><p className="font-bold">{order.slottime?.split(' ')[1]} / {order.factorycall?.split(' ')[1]}</p></div>
                        <div><p className="text-slate-400 font-bold uppercase mb-1">ต้นทาง</p><p className="font-bold">{order.oriogin}</p></div>
                        <div><p className="text-slate-400 font-bold uppercase mb-1">พขร.</p><p className="font-bold text-indigo-600">{order.driverName || 'ยังไม่มอบหมาย'}</p></div>
                      </div>

                      {/* ✅ แสดงแถบข้อมูล 6 อย่างที่คีย์เข้าไปแล้ว */}
                      {(order.docNumber || order.truckWeight || order.ecdNumber) && (
                        <div className="mt-4 grid grid-cols-3 md:grid-cols-6 gap-2 border-t border-dashed pt-4 text-[9px] border-slate-200">
                          <div className="bg-indigo-50 border border-indigo-100 p-2 rounded-lg"><p className="text-indigo-400 font-bold uppercase">Doc No.</p><p className="font-bold text-indigo-700 truncate">{order.docNumber || '-'}</p></div>
                          <div className="bg-slate-50 border border-slate-100 p-2 rounded-lg"><p className="text-slate-400 font-bold uppercase">น้ำหนักรถ</p><p className="font-bold text-slate-700">{order.truckWeight || '0'} kg</p></div>
                          <div className="bg-slate-50 border border-slate-100 p-2 rounded-lg"><p className="text-slate-400 font-bold uppercase">น้ำหนักสินค้า</p><p className="font-bold text-slate-700">{order.cargoWeight || '0'} kg</p></div>
                          <div className="bg-slate-50 border border-slate-100 p-2 rounded-lg"><p className="text-slate-400 font-bold uppercase">Gate In</p><p className="font-bold text-slate-700">{order.gateIn || '-'}</p></div>
                          <div className="bg-slate-50 border border-slate-100 p-2 rounded-lg"><p className="text-slate-400 font-bold uppercase">Gate Out</p><p className="font-bold text-slate-700">{order.gateOut || '-'}</p></div>
                          <div className="bg-indigo-50 border border-indigo-100 p-2 rounded-lg"><p className="text-indigo-400 font-bold uppercase">ECD No.</p><p className="font-bold text-indigo-700 truncate">{order.ecdNumber || '-'}</p></div>
                        </div>
                      )}

                      {order.status === 'Draft' && (
                        <div className="mt-4 pt-3 border-t border-slate-50">
                          <select className="w-full bg-indigo-50 p-2 rounded-xl text-xs font-bold text-indigo-700 outline-none border-none cursor-pointer" value={order.driverId || ''} onChange={async e => {
                            const drv = drivers.find(d => d.id === e.target.value);
                            if (drv) await updateDoc(doc(db, 'orders', order.id), { driverId: drv.id, driverName: drv.name, driverLineId: drv.lineId });
                          }}>
                            <option value="">🎯 มอบหมาย พขร.</option>
                            {drivers.filter(d => d.status === 'Active').map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                          </select>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* --- Modal สร้างใบงานใหม่ --- */}
      {showAddModal && (
        <Modal title="สร้างใบงานใหม่" onClose={() => setShowAddModal(false)}>
          <form onSubmit={handleCreateOrder} className="space-y-4">
            <div className="grid grid-cols-2 gap-3 bg-slate-50 p-5 rounded-[2rem] border border-slate-100">
              <InputGroup label="วันนัดส่ง" name="date" type="date" required />
              <InputGroup label="ต้นทาง (oriogin)" name="oriogin" required placeholder="ชื่อลาน..." />
              <InputGroup label="Slot Time" name="slottime" type="time" required />
              <InputGroup label="โรงงานเรียกเข้า" name="factorycall" type="time" required />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div><label className="text-xs font-bold text-slate-400 block mb-2 uppercase">หัวลาก 10 ล้อ</label><select name="truckId" className="w-full p-3.5 bg-white border border-slate-200 rounded-2xl text-sm font-bold outline-none" required><option value="">-- เลือกหัว --</option>{fleet.filter(f => f.type === 'หัวลาก 10 ล้อ').map(f => <option key={f.id} value={f.id}>{f.plate}</option>)}</select></div>
              <div><label className="text-xs font-bold text-slate-400 block mb-2 uppercase">หางตู้คอนเทนเนอร์</label><select name="trailerId" className="w-full p-3.5 bg-white border border-slate-200 rounded-2xl text-sm font-bold outline-none" required><option value="">-- เลือกหาง --</option>{fleet.filter(f => f.type === 'หางตู้คอนเทนเนอร์').map(f => <option key={f.id} value={f.id}>{f.plate}</option>)}</select></div>
            </div>
            <InputGroup label="ปลายทาง" name="destination" required placeholder="ชื่อโรงงาน..." />
            <InputGroup label="สถานที่โหลด" name="loadingtype" required placeholder="คลังสินค้า..." />
            <button type="submit" className="w-full bg-black text-white p-4 rounded-[1.5rem] font-bold mt-4 hover:scale-[1.02] transition-transform">บันทึกใบงานดราฟท์ (Draft)</button>
          </form>
        </Modal>
      )}

      {/* --- Modal บันทึกข้อมูลหน้างาน 6 รายการ --- */}
      {showLoadModal && (
        <Modal title={`บันทึกข้อมูลงาน #${editingLoadJob?.orderNumber}`} onClose={() => { setShowLoadModal(false); setEditingLoadJob(null); }}>
          <form onSubmit={handleUpdateLoadInfo} className="space-y-4">
            <div className="bg-indigo-50/50 p-5 rounded-[2rem] border border-indigo-100 space-y-4">
              <InputGroup label="1. หมายเลขเอกสาร" name="docNumber" defaultValue={editingLoadJob?.docNumber} required />
              <InputGroup label="6. หมายเลข ECD" name="ecdNumber" defaultValue={editingLoadJob?.ecdNumber} required />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <InputGroup label="2. น้ำหนักรถ (kg)" name="truckWeight" type="number" defaultValue={editingLoadJob?.truckWeight} />
              <InputGroup label="3. น้ำหนักสินค้า (kg)" name="cargoWeight" type="number" defaultValue={editingLoadJob?.cargoWeight} />
            </div>
            <div className="grid grid-cols-2 gap-4 bg-slate-50 p-5 rounded-[2rem] border border-slate-100">
              <div><label className="block text-xs font-bold text-slate-500 mb-2 uppercase">4. เวลา Gate-In</label><input type="time" name="gateIn" defaultValue={editingLoadJob?.gateIn} className="w-full p-3 rounded-xl border border-slate-200 outline-none font-bold text-sm" /></div>
              <div><label className="block text-xs font-bold text-slate-500 mb-2 uppercase">5. เวลา Gate-Out</label><input type="time" name="gateOut" defaultValue={editingLoadJob?.gateOut} className="w-full p-3 rounded-xl border border-slate-200 outline-none font-bold text-sm" /></div>
            </div>
            <button type="submit" className="w-full bg-indigo-600 text-white p-4 rounded-[1.5rem] font-bold shadow-lg hover:bg-indigo-700 transition-all">อัปเดตข้อมูลหน้างาน</button>
          </form>
        </Modal>
      )}
    </div>
  );
}
function ReportsView() { return <div className="p-8 text-center text-slate-400">Reports View (Coming Soon)</div>; }

// --- Helpers UI ---
function StatusBadge({ status }) {
    const styles = {
        'Available': 'bg-emerald-100 text-emerald-700 border-emerald-200',
        'In Transit': 'bg-indigo-100 text-indigo-700 border-indigo-200',
        'Maintenance': 'bg-rose-100 text-rose-700 border-rose-200',
        'Active': 'bg-green-100 text-green-700 border-green-200',
        'Inactive': 'bg-slate-100 text-slate-500 border-slate-200'
    };
    return <span className={`px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider border ${styles[status] || 'bg-gray-100 text-gray-500'}`}>{status}</span>;
}

function NavButton({ icon, label, active, onClick, hasAlert }) {
  return (
    <button 
      onClick={onClick} 
      // ปรับ class เมื่อ active ให้เป็น bg-yellow-400 (เหลือง) และ text-black (ดำ)
      className={`relative flex items-center space-x-3 px-7 py-3 rounded-lg transition-all duration-300 text-base font-black ${
        active 
          ? 'bg-yellow-400 text-black shadow-md border border-yellow-500/20 scale-100' 
          : 'text-slate-500 hover:bg-white/60 hover:text-slate-700'
      }`}
    >
      {/* ขยายขนาด Icon เป็น 24 */}
      {React.cloneElement(icon, { size: 24, strokeWidth: active ? 3 : 2 })}
      <span>{label}</span>
      
      {/* จุดแจ้งเตือน Alert */}
      {hasAlert && (
          <span className="absolute top-1.5 right-2 flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500 border-2 border-white"></span>
          </span>
      )}
    </button>
  );
}

function InputGroup({ label, name, placeholder, required, defaultValue, type="text", maxLength }) {
    return (<div><label className="block text-sm font-bold text-slate-700 mb-2">{label}</label><input required={required} type={type} name={name} maxLength={maxLength} defaultValue={defaultValue} className="w-full bg-slate-50 border-none p-3 rounded-xl focus:ring-2 focus:ring-indigo-500/20 text-slate-700 font-medium outline-none transition-all" placeholder={placeholder} /></div>)
}

function SelectGroup({ label, name, options }) {
    return (<div><label className="block text-sm font-bold text-slate-700 mb-2">{label}</label><select name={name} className="w-full bg-slate-50 border-none p-3 rounded-xl focus:ring-2 focus:ring-indigo-500/20 text-slate-700 font-medium outline-none cursor-pointer">{options.map(opt => <option key={opt}>{opt}</option>)}</select></div>)
}

function SubmitButton({ label, children }) {
    return (<button type="submit" className="w-full bg-black text-white font-bold p-4 rounded-xl hover:bg-slate-800 transition-all shadow-lg hover:shadow-xl mt-2">{label || children}</button>)
}

function Modal({ title, children, onClose, maxWidth = "max-w-lg" }) {
  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in">
      <div className={`bg-white rounded-[2rem] shadow-2xl w-full ${maxWidth} overflow-hidden border border-white/50 transform transition-all scale-100 animate-slide-up flex flex-col max-h-[90vh]`}>
        <div className="flex justify-between items-center p-6 border-b border-slate-100 bg-white/80 backdrop-blur shrink-0">
          <h3 className="font-bold text-xl text-slate-800">{title}</h3>
          <button onClick={onClose} className="bg-slate-100 p-2 rounded-full text-slate-400 hover:bg-rose-50 hover:text-rose-500 transition-colors"><X size={20}/></button>
        </div>
        <div className="p-8 overflow-y-auto custom-scrollbar">{children}</div>
      </div>
    </div>
  );
}