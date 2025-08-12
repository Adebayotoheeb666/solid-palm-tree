import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { 
  Users, 
  Plane, 
  DollarSign, 
  MessageSquare, 
  TrendingUp,
  Clock,
  CheckCircle,
  AlertTriangle,
  Search,
  Filter,
  Download,
  Eye
} from "lucide-react";
import { useAuth } from "../hooks/useAuth";
import { useAuthenticatedFetch } from "../hooks/useAuth";
import { Booking, SupportTicket } from "@shared/api";

interface AdminStats {
  totalBookings: number;
  totalRevenue: number;
  activeUsers: number;
  pendingTickets: number;
  recentBookings: Booking[];
  urgentTickets: SupportTicket[];
}

interface AdminTabProps {
  authenticatedFetch: any;
  stats: AdminStats | null;
}

export default function AdminDashboard() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const authenticatedFetch = useAuthenticatedFetch();
  
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState<"overview" | "bookings" | "payments" | "support">("overview");

  useEffect(() => {
    fetchAdminStats();
  }, []);

  const fetchAdminStats = async () => {
    try {
      // Fetch comprehensive admin statistics from the new API
      const [statsRes, supportRes] = await Promise.all([
        authenticatedFetch('/api/admin/stats'),
        authenticatedFetch('/api/admin/support/stats')
      ]);

      if (statsRes.ok && supportRes.ok) {
        const statsData = await statsRes.json();
        const supportData = await supportRes.json();

        // Use real data from the database instead of mock data
        const adminStats: AdminStats = {
          totalBookings: statsData.totalBookings || 0,
          totalRevenue: statsData.totalRevenue || 0,
          activeUsers: statsData.activeUsers || 0,
          pendingTickets: supportData.byStatus?.open || 0,
          recentBookings: statsData.recentBookings || [],
          urgentTickets: [] // Would need urgent tickets from support API
        };

        setStats(adminStats);
      } else {
        console.error('Failed to fetch admin stats:', statsRes.status, supportRes.status);
        
        // Fallback to empty/default stats if API fails
        const fallbackStats: AdminStats = {
          totalBookings: 0,
          totalRevenue: 0,
          activeUsers: 0,
          pendingTickets: 0,
          recentBookings: [],
          urgentTickets: []
        };
        
        setStats(fallbackStats);
        setError("Unable to load current statistics. Database connection may be unavailable.");
      }
    } catch (err) {
      console.error('Error fetching admin stats:', err);
      
      // Fallback to empty stats
      const fallbackStats: AdminStats = {
        totalBookings: 0,
        totalRevenue: 0,
        activeUsers: 0,
        pendingTickets: 0,
        recentBookings: [],
        urgentTickets: []
      };
      
      setStats(fallbackStats);
      setError("An error occurred while loading admin data. Please check if the database is connected.");
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-[#E7E9FF] flex items-center justify-center">
        <div className="text-center">
          <p className="text-[#637996] mb-4">Please log in to access the admin dashboard</p>
          <button
            onClick={() => navigate("/login")}
            className="bg-[#3839C9] text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Login
          </button>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#E7E9FF] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#3839C9] mx-auto mb-4"></div>
          <p className="text-[#637996]">Loading admin dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#E7E9FF] font-jakarta">
      {/* Header */}
      <header className="container mx-auto px-4 md:px-12 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center cursor-pointer" onClick={() => navigate("/")}> 
            <img
              src="/onboard/result.png"
              alt="OnboardTicket Logo"
              className="h-14 md:h-24 w-auto max-w-[220px] md:max-w-[320px] object-contain cursor-pointer"
              loading="eager"
            />
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-[#637996]">
              Welcome, {user.firstName} (Admin)
            </span>
            <button
              onClick={() => navigate("/dashboard")}
              className="px-6 py-2 bg-[#3839C9] text-white font-bold text-lg rounded-lg hover:bg-blue-700 transition-colors shadow-md"
            >
              User Dashboard
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="container mx-auto px-4 md:px-12 py-8">
        {/* Page Header */}
        <div className="bg-white/60 backdrop-blur-md rounded-[24px] p-8 md:p-12 shadow-xl border border-[#E7E9FF] mb-8">
          <h1 className="text-3xl md:text-4xl font-extrabold text-[#3839C9] mb-4">
            Admin Dashboard
          </h1>
          <p className="text-lg text-[#637996]">
            Manage bookings, users, and support tickets
          </p>
        </div>

        {error && (
          <div className="mb-8 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-yellow-600" />
              <p className="text-yellow-800 font-medium">{error}</p>
            </div>
            <p className="text-sm text-yellow-700 mt-2">
              The system is currently running in fallback mode. Connect to Supabase to see real data.
            </p>
          </div>
        )}

        {/* Tab Navigation */}
        <div className="bg-white/60 backdrop-blur-md rounded-[24px] p-2 shadow-xl border border-[#E7E9FF] mb-8">
          <div className="flex gap-2">
            {[
              { id: "overview", label: "Overview", icon: TrendingUp },
              { id: "bookings", label: "Bookings", icon: Plane },
              { id: "payments", label: "Payments", icon: DollarSign },
              { id: "support", label: "Support", icon: MessageSquare }
            ].map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => setActiveTab(id as any)}
                className={`flex items-center gap-2 px-6 py-3 rounded-[20px] font-semibold transition-all ${
                  activeTab === id
                    ? "bg-[#3839C9] text-white shadow-lg"
                    : "text-[#637996] hover:text-[#3839C9] hover:bg-white/50"
                }`}
              >
                <Icon className="h-4 w-4" />
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* Overview Tab */}
        {activeTab === "overview" && (
          <div className="space-y-8">
            {/* Statistics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <StatCard
                title="Total Bookings"
                value={stats?.totalBookings || 0}
                icon={Plane}
                color="bg-blue-500"
                change="+12% this month"
              />
              <StatCard
                title="Total Revenue"
                value={`$${stats?.totalRevenue || 0}`}
                icon={DollarSign}
                color="bg-green-500"
                change="+8% this month"
              />
              <StatCard
                title="Active Users"
                value={stats?.activeUsers || 0}
                icon={Users}
                color="bg-purple-500"
                change="+15% this month"
              />
              <StatCard
                title="Pending Tickets"
                value={stats?.pendingTickets || 0}
                icon={MessageSquare}
                color="bg-orange-500"
                change={stats?.pendingTickets === 0 ? "All resolved!" : "Needs attention"}
              />
            </div>

            {/* Recent Activity */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Recent Bookings */}
              <div className="bg-white/60 backdrop-blur-md rounded-[24px] p-8 shadow-xl border border-[#E7E9FF]">
                <h3 className="text-xl font-bold text-[#3839C9] mb-6">Recent Bookings</h3>
                {stats?.recentBookings && stats.recentBookings.length > 0 ? (
                  <div className="space-y-4">
                    {stats.recentBookings.slice(0, 5).map((booking) => (
                      <div key={booking.id} className="flex items-center justify-between p-4 bg-white/50 rounded-lg">
                        <div>
                          <p className="font-semibold text-[#20242A]">{booking.pnr}</p>
                          <p className="text-sm text-[#637996]">
                            {booking.route.from.code} → {booking.route.to.code}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold text-[#20242A]">${booking.totalAmount}</p>
                          <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${
                            booking.status === 'confirmed' ? 'bg-green-100 text-green-800' :
                            booking.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-red-100 text-red-800'
                          }`}>
                            {booking.status}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Plane className="h-12 w-12 text-[#A2A2A2] mx-auto mb-4" />
                    <p className="text-[#637996]">No recent bookings found</p>
                    <p className="text-sm text-[#A2A2A2] mt-2">
                      Bookings will appear here when users start making reservations
                    </p>
                  </div>
                )}
              </div>

              {/* Support Tickets */}
              <div className="bg-white/60 backdrop-blur-md rounded-[24px] p-8 shadow-xl border border-[#E7E9FF]">
                <h3 className="text-xl font-bold text-[#3839C9] mb-6">Support Overview</h3>
                {stats?.pendingTickets ? (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 bg-white/50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <MessageSquare className="h-5 w-5 text-[#3839C9]" />
                        <span className="font-medium">Open Tickets</span>
                      </div>
                      <span className="font-bold text-[#3839C9]">{stats.pendingTickets}</span>
                    </div>
                    <div className="text-center py-4">
                      <button 
                        onClick={() => setActiveTab("support")}
                        className="text-[#3839C9] hover:text-blue-700 font-medium"
                      >
                        View all support tickets →
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
                    <p className="text-[#637996] font-medium">All caught up!</p>
                    <p className="text-sm text-[#A2A2A2] mt-2">No pending support tickets</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Other Tabs Content */}
        {activeTab === "bookings" && <BookingsTab authenticatedFetch={authenticatedFetch} stats={stats} />}
        {activeTab === "payments" && <PaymentsTab authenticatedFetch={authenticatedFetch} stats={stats} />}
        {activeTab === "support" && <SupportTab authenticatedFetch={authenticatedFetch} stats={stats} />}
      </div>
    </div>
  );
}

// Statistics Card Component
function StatCard({ title, value, icon: Icon, color, change }: {
  title: string;
  value: string | number;
  icon: any;
  color: string;
  change: string;
}) {
  return (
    <div className="bg-white/60 backdrop-blur-md rounded-[24px] p-6 shadow-xl border border-[#E7E9FF]">
      <div className="flex items-center justify-between mb-4">
        <div className={`${color} p-3 rounded-lg`}>
          <Icon className="h-6 w-6 text-white" />
        </div>
      </div>
      <h3 className="text-sm font-medium text-[#637996] mb-1">{title}</h3>
      <p className="text-2xl font-bold text-[#20242A] mb-2">{value}</p>
      <p className="text-xs text-[#A2A2A2]">{change}</p>
    </div>
  );
}

// Bookings Tab Component
function BookingsTab({ authenticatedFetch, stats }: AdminTabProps) {
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");

  useEffect(() => {
    fetchBookings();
  }, [filter]);

  const fetchBookings = async () => {
    try {
      const response = await authenticatedFetch(`/api/admin/bookings?status=${filter}`);
      if (response.ok) {
        const data = await response.json();
        setBookings(data.bookings || []);
      }
    } catch (error) {
      console.error('Error fetching bookings:', error);
      setBookings([]);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-white/60 backdrop-blur-md rounded-[24px] p-8 shadow-xl border border-[#E7E9FF]">
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#3839C9] mx-auto mb-4"></div>
          <p className="text-[#637996]">Loading bookings...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white/60 backdrop-blur-md rounded-[24px] p-8 shadow-xl border border-[#E7E9FF]">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-[#3839C9]">Bookings Management</h2>
        <div className="flex items-center gap-4">
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="px-4 py-2 border border-[#E7E9FF] rounded-lg bg-white/50 focus:outline-none focus:ring-2 focus:ring-[#3839C9]"
          >
            <option value="all">All Bookings</option>
            <option value="pending">Pending</option>
            <option value="confirmed">Confirmed</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>
      </div>

      {bookings.length > 0 ? (
        <div className="space-y-4">
          {bookings.map((booking) => (
            <div key={booking.id} className="p-4 bg-white/50 rounded-lg border border-[#E7E9FF]">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold text-[#20242A]">{booking.pnr}</h3>
                  <p className="text-sm text-[#637996]">
                    {booking.from_city} ({booking.from_code}) → {booking.to_city} ({booking.to_code})
                  </p>
                  <p className="text-xs text-[#A2A2A2]">
                    {new Date(booking.created_at).toLocaleDateString()}
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-[#20242A]">${booking.total_amount}</p>
                  <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${
                    booking.status === 'confirmed' ? 'bg-green-100 text-green-800' :
                    booking.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-red-100 text-red-800'
                  }`}>
                    {booking.status}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-8">
          <Plane className="h-12 w-12 text-[#A2A2A2] mx-auto mb-4" />
          <p className="text-[#637996]">No bookings found</p>
          <p className="text-sm text-[#A2A2A2] mt-2">
            {filter === "all" ? "No bookings have been made yet" : `No ${filter} bookings found`}
          </p>
        </div>
      )}
    </div>
  );
}

// Payments Tab Component  
function PaymentsTab({ authenticatedFetch, stats }: AdminTabProps) {
  const [transactions, setTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTransactions();
  }, []);

  const fetchTransactions = async () => {
    try {
      const response = await authenticatedFetch('/api/admin/payments');
      if (response.ok) {
        const data = await response.json();
        setTransactions(data.transactions || []);
      }
    } catch (error) {
      console.error('Error fetching transactions:', error);
      setTransactions([]);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-white/60 backdrop-blur-md rounded-[24px] p-8 shadow-xl border border-[#E7E9FF]">
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#3839C9] mx-auto mb-4"></div>
          <p className="text-[#637996]">Loading transactions...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white/60 backdrop-blur-md rounded-[24px] p-8 shadow-xl border border-[#E7E9FF]">
      <h2 className="text-2xl font-bold text-[#3839C9] mb-6">Payment Transactions</h2>

      {transactions.length > 0 ? (
        <div className="space-y-4">
          {transactions.map((transaction) => (
            <div key={transaction.id} className="p-4 bg-white/50 rounded-lg border border-[#E7E9FF]">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold text-[#20242A]">{transaction.transactionId}</h3>
                  <p className="text-sm text-[#637996]">
                    Payment Method: {transaction.method}
                  </p>
                  <p className="text-xs text-[#A2A2A2]">
                    {new Date(transaction.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-[#20242A]">${transaction.amount}</p>
                  <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${
                    transaction.status === 'completed' ? 'bg-green-100 text-green-800' :
                    transaction.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                    transaction.status === 'failed' ? 'bg-red-100 text-red-800' :
                    'bg-purple-100 text-purple-800'
                  }`}>
                    {transaction.status}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-8">
          <DollarSign className="h-12 w-12 text-[#A2A2A2] mx-auto mb-4" />
          <p className="text-[#637996]">No transactions found</p>
          <p className="text-sm text-[#A2A2A2] mt-2">Payment transactions will appear here</p>
        </div>
      )}
    </div>
  );
}

// Support Tab Component
function SupportTab({ authenticatedFetch, stats }: AdminTabProps) {
  const [tickets, setTickets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTickets();
  }, []);

  const fetchTickets = async () => {
    try {
      const response = await authenticatedFetch('/api/admin/support/tickets');
      if (response.ok) {
        const data = await response.json();
        setTickets(data.tickets || []);
      }
    } catch (error) {
      console.error('Error fetching support tickets:', error);
      setTickets([]);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-white/60 backdrop-blur-md rounded-[24px] p-8 shadow-xl border border-[#E7E9FF]">
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#3839C9] mx-auto mb-4"></div>
          <p className="text-[#637996]">Loading support tickets...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white/60 backdrop-blur-md rounded-[24px] p-8 shadow-xl border border-[#E7E9FF]">
      <h2 className="text-2xl font-bold text-[#3839C9] mb-6">Support Tickets</h2>

      {tickets.length > 0 ? (
        <div className="space-y-4">
          {tickets.map((ticket) => (
            <div key={ticket.id} className="p-4 bg-white/50 rounded-lg border border-[#E7E9FF]">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold text-[#20242A]">{ticket.subject}</h3>
                  <p className="text-sm text-[#637996] line-clamp-2">{ticket.message}</p>
                  <p className="text-xs text-[#A2A2A2]">
                    {new Date(ticket.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <div className="text-right">
                  <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${
                    ticket.priority === 'urgent' ? 'bg-red-100 text-red-800' :
                    ticket.priority === 'high' ? 'bg-orange-100 text-orange-800' :
                    ticket.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-green-100 text-green-800'
                  }`}>
                    {ticket.priority}
                  </span>
                  <p className="text-xs text-[#A2A2A2] mt-1">{ticket.status}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-8">
          <MessageSquare className="h-12 w-12 text-[#A2A2A2] mx-auto mb-4" />
          <p className="text-[#637996]">No support tickets found</p>
          <p className="text-sm text-[#A2A2A2] mt-2">Support tickets will appear here when users contact support</p>
        </div>
      )}
    </div>
  );
}
