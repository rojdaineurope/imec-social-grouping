import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { UserCircle, Users, Tag, Search, Loader2, UserPlus } from 'lucide-react';

const API_BASE = "http://localhost:8000";

const App: React.FC = () => {
  const [name, setName] = useState('');
  const [attrs, setAttrs] = useState('');
  const [userId, setUserId] = useState<string | null>(null);
  const [userName, setUserName] = useState<string>(''); // Son kaydolan ismi tutmak için
  const [groupMembers, setGroupMembers] = useState<any[]>([]);
  const [userGroupId, setUserGroupId] = useState<string | null>(null); // Grup ID'sini tutmak için yeni state
  const [status, setStatus] = useState('PENDING');
  const [loading, setLoading] = useState(false);

  // Kayıt Fonksiyonu
  const handleRegister = async () => {
  // Virgülle ayrılan özellikleri diziye çevir
  const attributesArray = attrs.split(',').map(a => a.trim()).filter(a => a !== "");

  // 🚨 FRONTEND KONTROLÜ
  if (attributesArray.length !== 5) {
    return alert("Please enter 5 attributes (Ex. Python, Java, AI, Research, Imec)");
  }
  // 2. BENZERSİZLİK KONTROLU (Aynı özellik tekrar edemez)
  const uniqueAttributes = new Set(attributesArray);
  if (uniqueAttributes.size !== 5) {
    return alert("Attributes must be unique.");
  }
  if (!name) return alert("Please enter your name.");

  try {
    const response = await axios.post(`${API_BASE}/users`, {
      name: name,
      attributes: attributesArray
    });
    
    // ✨ ESKİ VERİLERİ TEMİZLE VE YENİLERİNİ SET ET
    const newId = response.data.user_id;
    const newGroupId = response.data.group_id; // Backend'den gelen grup id
    

    setUserId(newId);
    setUserName(name);
    alert("successful registration.Enjoy your group!");
  } catch (err) {
    alert("Error:Are you sure you entered 5 attributes?");
  }
};

  // Grubu Manuel Getir
 const fetchMyGroup = async () => {
  if (!userId) return alert("Add first a user!");
  setLoading(true);
  try {
    const userRes = await axios.get(`${API_BASE}/users/${userId}`);
    const gid = userRes.data.group_id;
    
    // UI'da Group ID'yi göstermek için state'i güncelle
    setUserGroupId(gid); 

    if (gid && gid !== "PENDING") {
      setStatus('ASSIGNED');
      const groupRes = await axios.get(`${API_BASE}/groups/${gid}`);
      
      if (groupRes.data && groupRes.data.members) {
        setGroupMembers(groupRes.data.members);
      } else {
        alert("Group found.");
      }
    } else {
      setStatus('PENDING');
      alert("Matching algorithm is working,please try again in few seconds.");
    }
  } catch (err) {
    console.error("Detailed error:", err);
    alert("Could not access the server.");
  } finally {
    setLoading(false);
  }
};

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-8 font-sans">
      <div className="max-w-5xl mx-auto space-y-8">
        
        {/* Başlık */}
        <header className="text-center">
          <h1 className="text-4xl font-extrabold text-blue-700">imec Social Match</h1>
          <p className="text-slate-500 mt-2">Researcher Networking & Grouping System</p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          {/* SOL TARAF: KAYIT FORMU (HİÇ GİTMEZ) */}
          <section className="bg-white p-8 rounded-3xl shadow-xl shadow-slate-200/50 border border-slate-100 h-fit">
            <div className="flex items-center gap-3 mb-6 text-blue-600">
              <UserPlus size={28} />
              <h2 className="text-2xl font-bold text-slate-800 text-left">Add New Researcher</h2>
            </div>
            
            <div className="space-y-5">
              <div className="text-left">
                <label className="block text-sm font-bold text-slate-700 mb-2">Full Name</label>
                <input 
                  className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:bg-white outline-none transition-all" 
                  placeholder="e.g. Marie Curie" 
                  onChange={e => setName(e.target.value)} 
                />
              </div>
              <div className="text-left">
                <label className="block text-sm font-bold text-slate-700 mb-2">Attributes (Comma Separated)</label>
                <input 
                  className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:bg-white outline-none transition-all" 
                  placeholder="e.g. Physics, Python, Researcher" 
                  onChange={e => setAttrs(e.target.value)} 
                />
              </div>
              <button 
                onClick={handleRegister} 
                className="w-full bg-blue-600 text-white font-bold py-4 rounded-2xl hover:bg-blue-700 shadow-lg shadow-blue-200 transition-transform active:scale-95"
              >
                Add to Network
              </button>
            </div>
          </section>
          {/* SAĞ TARAF: KEŞFETME VE GRUP PANELİ */}
          <section className="space-y-6 text-left">
            <div className="bg-white p-6 rounded-3xl shadow-md border border-slate-100 border-l-8 border-l-blue-600">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-bold text-slate-500 text-[10px] uppercase tracking-widest mb-1">Last Added Researcher</h3>
                  <p className="text-xl font-bold text-slate-800">{userName || "None yet"}</p>
                </div>
                {/* Durum etiketi */}
                <div className={`px-4 py-1 rounded-full text-xs font-bold ${status === 'PENDING' ? 'bg-amber-100 text-amber-600' : 'bg-green-100 text-green-700'}`}>
                  {status}
                </div>
              </div>
              {/* ID BİLGİLERİ BURAYA GELİYOR */}
              {userId && (
               <div className="mt-4 space-y-3 p-4 bg-slate-50 rounded-2xl border border-slate-100">
                 <div>
                 <p className="text-[9px] font-bold text-slate-400 uppercase tracking-tighter">My Personal User ID</p>
                 <p className="text-[11px] font-mono text-blue-600 break-all bg-white p-2 rounded-lg border border-slate-200 mt-1">
                    {userId}
                 </p>
               </div>
                
               {userGroupId && (
                 <div className="animate-in fade-in duration-500">
                    <p className="text-[9px] font-bold text-slate-400 uppercase tracking-tighter">Assigned Group ID</p>
                    <p className="text-[11px] font-mono text-purple-600 break-all bg-white p-2 rounded-lg border border-slate-200 mt-1">
                       {userGroupId}
                    </p>
                </div>
              )}
               </div>
               
          )}
              {/* BUTON BURADA: userId varsa her zaman göster */}
             
                 <button 
                   onClick={fetchMyGroup} 
                   className="w-full mt-6 bg-green-500 hover:bg-green-600 text-white font-bold py-3 rounded-2xl flex items-center justify-center gap-2 transition-all shadow-lg shadow-green-100"
                 >
                   {loading ? <Loader2 className="animate-spin" size={20} /> : <Search size={20}/>}
                  Discover My Group
                 </button>
         
             </div>
             {/* Grup üyeleri listesi aşağıda devam eder... */}
          </section>
          

            {/* Grup Listesi */}
            <div className="bg-white p-6 rounded-3xl shadow-lg border border-slate-100">
              <div className="flex items-center gap-3 mb-6 border-b pb-4">
                <Users className="text-blue-600" />
                <h3 className="text-xl font-bold text-slate-800">Group Members</h3>
              </div>

              <div className="space-y-4">
                {groupMembers.length === 0 ? (
                  <div className="py-12 text-center">
                    <div className="bg-slate-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Users className="text-slate-300" size={32} />
                    </div>
                    <p className="text-slate-400 italic">No group members to display. Please add users and search.</p>
                  </div>
                ) : (
                  groupMembers.map((member: any) => (
                    <div 
                      key={member.id} 
                      className={`p-5 rounded-2xl border transition-all animate-in slide-in-from-right-4 ${
                        member.id === userId ? 'bg-blue-50 border-blue-200 ring-2 ring-blue-50' : 'bg-slate-50 border-slate-100'
                      }`}
                    >
                      <div className="flex justify-between items-center mb-3">
                        <p className="font-bold text-slate-800 text-left">
                          {member.name} {member.id === userId && <span className="ml-2 bg-blue-600 text-white text-[10px] px-2 py-0.5 rounded-full uppercase">You</span>}
                        </p>
                      </div>
                      <div className="flex flex-wrap gap-2 text-left">
                        {member.attributes.map((a: string) => (
                          <span key={a} className="flex items-center gap-1 text-[10px] bg-white border border-slate-200 px-2 py-1 rounded-lg text-slate-500 font-bold uppercase tracking-tighter">
                            <Tag size={10} className="text-blue-400" /> {a}
                          </span>
                        ))}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          

        </div>
      </div>
    </div>
  );
};

export default App;