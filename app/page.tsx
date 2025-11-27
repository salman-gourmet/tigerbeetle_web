'use client';

import { useState, useEffect } from 'react';

// --- Types ---
type User = {
  _id: string;
  username: string;
  email: string;
  tb_account_id: string;
};

type UserDetail = {
  financials: { balance: string; credits: string; debits: string };
  history: any[];
  user: { _id: string, username: string, email: string, tb_account_id: string }
};

export default function Dashboard() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);

  // Form States
  const [newUser, setNewUser] = useState({ username: '', email: '' });
  const [deposit, setDeposit] = useState({ userId: '', amount: '' });
  const [transfer, setTransfer] = useState({ senderId: '', receiverId: '', amount: '' });

  // Selected User for details view
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [selectedUserDetail, setSelectedUserDetail] = useState<UserDetail | null>(null);

  // --- Actions ---

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/users');
      const data = await res.json();
      setUsers(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchUserDetail = async (id: string) => {
    // Toggle off if clicking same user
    if (selectedUserId === id) {
      setSelectedUserId(null);
      setSelectedUserDetail(null);
      return;
    }

    setSelectedUserId(id);
    setSelectedUserDetail(null); // Clear old data while loading
    try {
      const res = await fetch(`/api/users/${id}`);
      const data = await res.json();
      setSelectedUserDetail(data);
    } catch (err) {
      alert("Failed to fetch user details");
    }
  };

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUser.username || !newUser.email) return;

    await fetch('/api/users', {
      method: 'POST',
      body: JSON.stringify(newUser),
    });
    setNewUser({ username: '', email: '' });
    fetchUsers(); // Refresh list
    alert("User Created!");
  };

  const handleDeposit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!deposit.userId || !deposit.amount) return;

    const res = await fetch('/api/deposit', {
      method: 'POST',
      body: JSON.stringify(deposit),
    });

    if (res.ok) {
      alert("Deposit Successful!");
      setDeposit({ ...deposit, amount: '' });
      // Refresh details if this user is currently open
      if (selectedUserId === deposit.userId) fetchUserDetail(deposit.userId);
    } else {
      alert("Deposit Failed");
    }
  };

  const handleTransfer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!transfer.senderId || !transfer.receiverId || !transfer.amount) return;

    const res = await fetch('/api/transfer', {
      method: 'POST',
      body: JSON.stringify(transfer),
    });

    if (res.ok) {
      alert("Transfer Successful!");
      setTransfer({ ...transfer, amount: '' });
      // Refresh details if sender or receiver is open
      if (selectedUserId === transfer.senderId) fetchUserDetail(transfer.senderId);
      if (selectedUserId === transfer.receiverId) fetchUserDetail(transfer.receiverId);
    } else {
      alert("Transfer Failed (Check funds?)");
    }
  };

  // Load users on mount
  useEffect(() => {
    fetchUsers();
  }, []);


  const isSystemDebit = (id: string) => {
    // start with 999
    if (id === "999") {
      return "System"
    }
    return id
  }

  // --- Components ---

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 p-6 font-sans">
      <div className="max-w-6xl mx-auto space-y-8">

        {/* Header */}
        <header className="flex flex-col md:flex-row justify-between items-center bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
          <div>
            <h1 className="text-3xl font-bold text-indigo-700 tracking-tight">TigerBeetle</h1>
          </div>
          <div className="mt-4 md:mt-0">
            <button
              onClick={fetchUsers}
              disabled={loading}
              className={`text-sm font-medium flex items-center gap-2 cursor-pointer transition-colors ${loading
                ? 'text-slate-400 cursor-not-allowed'
                : 'text-indigo-600 hover:text-indigo-800 hover:underline'
                }`}
            >
              {loading ? (
                <>
                  {/* Tailwind Spinner */}
                  <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Refreshing...
                </>
              ) : (
                <>Refresh Data ↻</>
              )}
            </button>
          </div>
        </header>

        <div className="flex flex-col gap-4">

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

            {/* 1. Create User */}
            <section className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 h-full">
              <h2 className="text-lg font-semibold mb-4 text-slate-800 flex items-center gap-2">
                <span>👤</span> Create User
              </h2>
              <form onSubmit={handleCreateUser} className="space-y-3">
                <input
                  type="text" placeholder="Username"
                  className="w-full p-2 border rounded-lg bg-slate-50 focus:ring-2 focus:ring-indigo-500 outline-none"
                  value={newUser.username}
                  onChange={e => setNewUser({ ...newUser, username: e.target.value })}
                />
                <input
                  type="email" placeholder="Email"
                  className="w-full p-2 border rounded-lg bg-slate-50 focus:ring-2 focus:ring-indigo-500 outline-none"
                  value={newUser.email}
                  onChange={e => setNewUser({ ...newUser, email: e.target.value })}
                />
                <button type="submit" className="w-full bg-slate-900 text-white py-2 rounded-lg hover:bg-slate-800 transition font-medium">
                  Create User
                </button>
              </form>
            </section>

            {/* 2. Deposit */}
            <section className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 h-full">
              <h2 className="text-lg font-semibold mb-4 text-slate-800 flex items-center gap-2">
                <span>💰</span> Deposit Funds
              </h2>
              <form onSubmit={handleDeposit} className="space-y-3">
                <select
                  className="w-full p-2 border rounded-lg bg-slate-50 focus:ring-2 focus:ring-green-500 outline-none"
                  value={deposit.userId}
                  onChange={e => setDeposit({ ...deposit, userId: e.target.value })}
                >
                  <option value="">Select User</option>
                  {users.map(u => <option key={u._id} value={u._id}>{u.username}</option>)}
                </select>
                <input
                  type="number" placeholder="Amount"
                  className="w-full p-2 border rounded-lg bg-slate-50 focus:ring-2 focus:ring-green-500 outline-none"
                  value={deposit.amount}
                  onChange={e => setDeposit({ ...deposit, amount: e.target.value })}
                />
                <button type="submit" className="w-full bg-green-600 text-white py-2 rounded-lg hover:bg-green-700 transition font-medium">
                  Deposit
                </button>
              </form>
            </section>

            {/* 3. Transfer */}
            <section className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 h-full">
              <h2 className="text-lg font-semibold mb-4 text-slate-800 flex items-center gap-2">
                <span>💸</span> Transfer
              </h2>
              <form onSubmit={handleTransfer} className="space-y-3">
                <div className="grid grid-cols-2 gap-2">
                  <div className='col-span-2 md:col-span-1'>
                    {/* <label className="text-xs font-bold text-slate-400 uppercase">From</label> */}
                    <select
                      className="w-full p-2 border rounded-lg bg-slate-50 focus:ring-2 focus:ring-indigo-500 outline-none"
                      value={transfer.senderId}
                      onChange={e => setTransfer({ ...transfer, senderId: e.target.value })}
                    >
                      <option value="">Sender</option>
                      {users.map(u => <option key={u._id} value={u._id}>{u.username}</option>)}
                    </select>
                  </div>
                  <div className='col-span-2 md:col-span-1'>
                    {/* <label className="text-xs font-bold text-slate-400 uppercase">To</label> */}
                    <select
                      className="w-full p-2 border rounded-lg bg-slate-50 focus:ring-2 focus:ring-indigo-500 outline-none"
                      value={transfer.receiverId}
                      onChange={e => setTransfer({ ...transfer, receiverId: e.target.value })}
                    >
                      <option value="">Receiver</option>
                      {users.filter(u => u._id !== transfer.senderId).map(u => <option key={u._id} value={u._id}>{u.username}</option>)}
                    </select>
                  </div>
                </div>

                <input
                  type="number" placeholder="Amount"
                  className="w-full p-2 border rounded-lg bg-slate-50 focus:ring-2 focus:ring-indigo-500 outline-none"
                  value={transfer.amount}
                  onChange={e => setTransfer({ ...transfer, amount: e.target.value })}
                />
                <button type="submit" className="w-full bg-indigo-600 text-white py-2 rounded-lg hover:bg-indigo-700 transition font-medium">
                  Transfer Funds
                </button>
              </form>
            </section>
          </div>
          {/* RIGHT COLUMN: LIST */}
          {/* --- ROW 2: SPLIT VIEW (One Row: 60% Left / 40% Right) --- */}
          <div className="flex-col md:flex md:flex-row gap-8 items-start">

            {/* LEFT COLUMN: User Listing (60% Width) */}
            <div className="w-full md:w-[35%] lg:w-[33%]">
              <h2 className="text-xl font-bold mb-4 text-slate-800">User Directory</h2>

              {loading ? (
                <div className="p-12 text-center text-slate-500 bg-white rounded-xl border border-dashed border-slate-300">
                  Loading users...
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-4 h-[120px] md:h-[425px] overflow-y-scroll">
                  {users.length > 0 ? users.map((user) => (
                    <div
                      key={user._id}
                      onClick={() => fetchUserDetail(user._id)}
                      className={`cursor-pointer group relative bg-white rounded-xl border transition-all duration-200 p-4
                            ${selectedUserId === user._id
                          ? 'border-indigo-500 ring-1 ring-indigo-500 shadow-md'
                          : 'border-slate-200 hover:border-indigo-300 hover:shadow-md'
                        }`}
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className={`font-bold text-md ${selectedUserId === user._id ? 'text-indigo-700' : 'text-slate-900'}`}>
                            {user.username}
                          </h3>
                          <p className="text-[12px] text-slate-500">{user.email}</p>
                        </div>
                        <span className={`text-[10px] px-2 py-1 rounded font-mono transition-colors ${selectedUserId === user._id ? 'bg-indigo-100 text-indigo-700' : 'bg-slate-100 text-slate-500'}`}>
                          ID: {user.tb_account_id.toString()}
                        </span>
                      </div>


                    </div>
                  )) :
                    <div className="p-12 text-center text-slate-500 bg-white rounded-xl border border-dashed border-slate-300 min-h-[430px]">
                      Users not found...
                    </div>
                  }
                </div>
              )}
            </div>

            {/* RIGHT COLUMN: Details Panel (40% Width & Sticky) */}
            <div className="w-full md:w-[65%] lg:w-[68%] sticky top-6 mt-6 md:mt-0">
              <h2 className="text-xl font-bold mb-4 text-slate-800">Account Details</h2>

              <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden min-h-[400px] relative">

                {/* CASE 1: USER SELECTED */}
                {selectedUserId && selectedUserDetail ? (
                  <div className="p-6 animate-in fade-in zoom-in-95 duration-400">
                    {/* Header */}
                    <div className="mb-6 pb-6 border-b border-slate-100">
                      <h3 className="text-slate-500 text-sm font-medium uppercase tracking-wider">Total Balance</h3>
                      <div className="flex items-baseline gap-1 mt-1">
                        <span className="text-4xl font-bold text-slate-900 tracking-tight">{selectedUserDetail.financials.balance}</span>
                        <span className="text-emerald-600 font-medium bg-emerald-50 px-2 py-1 rounded-md text-xs">UNITS</span>
                      </div>
                      <div className="mt-4 grid grid-cols-2 gap-4">
                        <div className="bg-slate-50 p-3 rounded-lg">
                          <p className="text-xs text-slate-400 mb-1">Total Credits</p>
                          <p className="font-mono text-emerald-600 font-semibold">+{selectedUserDetail.financials.credits}</p>
                        </div>
                        <div className="bg-slate-50 p-3 rounded-lg">
                          <p className="text-xs text-slate-400 mb-1">Total Debits</p>
                          <p className="font-mono text-red-500 font-semibold">-{selectedUserDetail.financials.debits}</p>
                        </div>
                      </div>
                    </div>

                    {/* History */}
                    <div>
                      <h3 className="text-slate-800 font-bold mb-4">Transaction History</h3>
                      {selectedUserDetail.history.length === 0 ? (
                        <p className="text-sm text-slate-400 italic text-center py-8">No transactions found.</p>
                      ) : (
                        /* 1. CHANGED: grid-cols-1 on small screens, grid-cols-3 on larger screens */
                        <ul className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                          {selectedUserDetail.history.map((tx: any) => {
                            const isOutgoing = selectedUserDetail?.user?.tb_account_id === tx?.debit_account_id.toString();
                            return (
                              /* 2. CHANGED: Flex-col to stack items vertically inside the card */
                              <li key={tx.id} className="text-xs flex flex-col justify-between bg-slate-50 p-3 rounded-xl border border-slate-100 hover:border-slate-300 hover:shadow-sm transition-all">

                                {/* TOP ROW: Icon and Amount */}
                                <div className="flex justify-between items-start mb-1">
                                  <div className='flex gap-3 items-center'>

                                    {/* --- FIXED CIRCLE SHAPE --- */}
                                    {/* Added: w-8 h-8 flex items-center justify-center shrink-0 */}
                                    <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${isOutgoing ? 'bg-red-100 text-red-600' : 'bg-emerald-100 text-emerald-600'}`}>
                                      {isOutgoing ? (
                                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M7 7h10v10" /><path d="M7 17 17 7" /></svg>
                                      ) : (
                                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M17 17H7V7" /><path d="M17 7 7 17" /></svg>
                                      )}
                                    </div>

                                    {/* DETAILS */}
                                    <div>
                                      <div className="font-semibold text-slate-700 text-sm">
                                        {isOutgoing ? "Sent" : "Received"}
                                      </div>
                                      <div className="font-mono text-[10px] text-slate-400 -mt-0.5">
                                        Account:{isOutgoing ? tx.credit_account_id.toString() : isSystemDebit(tx.debit_account_id.toString())}
                                      </div>
                                    </div>

                                  </div>

                                  {/* AMOUNT */}
                                  <div className={`font-mono font-bold text-sm mt-1 ${isOutgoing ? 'text-red-600' : 'text-emerald-600'}`}>
                                    {isOutgoing ? '-' : '+'}{tx.amount.toString()}
                                  </div>
                                </div>
                              </li>
                            )
                          })}
                        </ul>
                      )}
                    </div>
                  </div>
                ) : (
                  // CASE 2: NO USER SELECTED (BLUR VIEW)
                  <div className="relative h-full">

                    {/* The Overlay Content */}
                    <div className="absolute inset-0 z-10 flex flex-col items-center justify-center transition-all text-center p-6">
                      <div className="bg-white p-4 rounded-full shadow-lg mb-4 animate-bounce-slow">
                        <span className="text-4xl">👆</span>
                      </div>
                      <h3 className="text-lg font-bold text-slate-800">No User Selected</h3>
                      <p className="text-sm text-slate-500 mt-2 max-w-[200px]">
                        Please select a user from the list on the left/above to view their live balance and transaction history.
                      </p>
                      {selectedUserId && !selectedUserDetail && (
                        <div className="mt-4 flex items-center gap-2 text-indigo-600 font-medium">
                          <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                          Loading Data...
                        </div>
                      )}
                    </div>

                    {/* The "Fake" Background Content to simulate blur */}
                    <div className="p-6 opacity-30 pointer-events-none select-none filter blur-[2px]">
                      <div className="mb-6 pb-6 border-b border-slate-100">
                        <div className="h-4 bg-slate-200 rounded w-24 mb-2"></div>
                        <div className="h-10 bg-slate-200 rounded w-48"></div>
                      </div>
                      <div className="space-y-4">
                        <div className="h-4 bg-slate-200 rounded w-32 mb-4"></div>
                        {[1, 2, 3, 4].map(i => (
                          <div key={i} className="h-12 bg-slate-100 rounded-lg w-full"></div>
                        ))}
                      </div>
                    </div>

                  </div>
                )}

              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}