import React, { useState, useEffect } from 'react';
import { User, MapPin, Package, Heart, LogOut, ChevronRight } from 'lucide-react';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import useAuthStore from '../stores/useAuthStore';
import useWishlistStore from '../stores/useWishlistStore';
import { useOrders } from '../hooks/useOrders';
import { useAddresses } from '../hooks/useAddresses';
import { formatDate, formatPrice } from '../utils/formatters';
import Button from '../components/common/Button';
import Input from '../components/common/Input';
import ProductGrid from '../components/product/ProductGrid';
import Badge from '../components/common/Badge';
import Modal from '../components/common/Modal';

export default function DashboardPage() {
  const [activeTab, setActiveTab] = useState('profile');
  const { user, profile, updateProfile, logout } = useAuthStore();
  const navigate = useNavigate();

  useEffect(() => {
    document.title = 'My Dashboard — ShopVerse';
  }, []);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const tabs = [
    { id: 'profile', label: 'My Profile', icon: User },
    { id: 'orders', label: 'My Orders', icon: Package },
    { id: 'addresses', label: 'Saved Addresses', icon: MapPin },
    { id: 'wishlist', label: 'Wishlist', icon: Heart },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 lg:py-16 animate-fade-in">
      <div className="flex flex-col md:flex-row gap-8">
        
        {/* Sidebar */}
        <div className="w-full md:w-64 shrink-0">
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-700 p-6 mb-6">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-14 h-14 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-full flex items-center justify-center text-xl font-bold">
                {profile?.name?.charAt(0).toUpperCase() || user?.email?.charAt(0).toUpperCase()}
              </div>
              <div>
                <h3 className="font-bold text-gray-900 dark:text-white truncate max-w-[120px]">{profile?.name || 'User'}</h3>
                <p className="text-xs text-gray-500 dark:text-gray-400 truncate max-w-[120px]">{user?.email}</p>
              </div>
            </div>
            
            <nav className="space-y-2">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-colors text-sm font-medium
                      ${isActive 
                        ? 'bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400' 
                        : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-slate-700/50'}`}
                  >
                    <Icon size={18} />
                    {tab.label}
                  </button>
                );
              })}
            </nav>
            
            <hr className="my-6 border-gray-100 dark:border-slate-700" />
            
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-colors text-sm font-medium text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/20"
            >
              <LogOut size={18} />
              Logout
            </button>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="flex-1 bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-700 p-6 lg:p-8 min-h-[500px]">
          {activeTab === 'profile' && <ProfileTab profile={profile} updateProfile={updateProfile} email={user?.email} />}
          {activeTab === 'orders' && <OrdersTab userId={user?.id} />}
          {activeTab === 'addresses' && <AddressesTab userId={user?.id} />}
          {activeTab === 'wishlist' && <WishlistTab />}
        </div>
        
      </div>
    </div>
  );
}

// --- TAB COMPONENTS ---

function ProfileTab({ profile, updateProfile, email }) {
  const [formData, setFormData] = useState({
    name: profile?.name || '',
    phone: profile?.phone || '',
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (profile) {
      setFormData({ name: profile.name || '', phone: profile.phone || '' });
    }
  }, [profile]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await updateProfile(formData);
    setLoading(false);
    if (!error) toast.success('Profile updated successfully');
  };

  return (
    <div className="animate-fade-in">
      <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Profile Settings</h2>
      <form onSubmit={handleSubmit} className="max-w-md space-y-6">
        <Input label="Email Address" value={email || ''} readOnly disabled className="bg-gray-50 opacity-70" />
        <Input label="Full Name" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} required />
        <Input label="Phone Number" value={formData.phone} onChange={(e) => setFormData({...formData, phone: e.target.value})} />
        <Button type="submit" variant="primary" isLoading={loading}>Save Changes</Button>
      </form>
    </div>
  );
}

function OrdersTab({ userId }) {
  const { orders, loading, error } = useOrders(userId);
  const [expandedOrder, setExpandedOrder] = useState(null);

  const statusColors = {
    'Pending Payment': 'warning',
    'Processing': 'info',
    'Shipped': 'primary',
    'Delivered': 'success',
    'Cancelled': 'danger'
  };

  if (loading) return <div className="animate-pulse flex flex-col gap-4"><div className="h-24 bg-gray-200 dark:bg-slate-700 rounded-xl"></div></div>;
  if (error) return <div className="text-red-500">Error loading orders.</div>;
  if (!orders?.length) return <div className="text-center py-12 text-gray-500">You haven't placed any orders yet.</div>;

  return (
    <div className="animate-fade-in space-y-4">
      <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Order History</h2>
      {orders.map((order) => (
        <div key={order.id} className="border border-gray-200 dark:border-slate-700 rounded-xl overflow-hidden">
          {/* Order Header */}
          <div 
            className="bg-gray-50 dark:bg-slate-900 p-4 flex flex-wrap items-center justify-between gap-4 cursor-pointer hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors"
            onClick={() => setExpandedOrder(expandedOrder === order.id ? null : order.id)}
          >
            <div>
              <p className="text-xs text-gray-500 uppercase font-semibold mb-1">Order ID</p>
              <p className="font-mono text-sm dark:text-gray-300">{order.id.split('-')[0]}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500 uppercase font-semibold mb-1">Date</p>
              <p className="text-sm dark:text-gray-300">{formatDate(order.created_at).split(',')[0]}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500 uppercase font-semibold mb-1">Total</p>
              <p className="text-sm font-semibold dark:text-gray-300">{formatPrice(order.total_amount)}</p>
            </div>
            <div>
              <Badge variant={statusColors[order.status] || 'default'}>{order.status}</Badge>
            </div>
            <div className="text-gray-400">
              <ChevronRight size={20} className={`transform transition-transform ${expandedOrder === order.id ? 'rotate-90' : ''}`} />
            </div>
          </div>
          
          {/* Order Items Expandable */}
          {expandedOrder === order.id && (
            <div className="p-4 bg-white dark:bg-slate-800 border-t border-gray-200 dark:border-slate-700 animate-slide-up">
              <h4 className="text-sm font-semibold mb-4 dark:text-gray-300">Items in this order:</h4>
              <div className="space-y-4">
                {order.order_items?.map((item) => (
                  <div key={item.id} className="flex items-center gap-4">
                    <img src={item.product_image || 'https://via.placeholder.com/60'} alt={item.product_name} className="w-12 h-12 rounded object-cover" />
                    <div className="flex-1">
                      <p className="text-sm font-medium dark:text-white">{item.product_name}</p>
                      <p className="text-xs text-gray-500">Qty: {item.quantity}</p>
                    </div>
                    <p className="text-sm font-semibold dark:text-white">{formatPrice(item.price)}</p>
                  </div>
                ))}
              </div>
              <div className="mt-6 pt-4 border-t border-gray-100 dark:border-slate-700">
                <h4 className="text-sm font-semibold mb-2 dark:text-gray-300">Shipping Address:</h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {order.shipping_address?.full_name}<br/>
                  {order.shipping_address?.address_line}, {order.shipping_address?.city}, {order.shipping_address?.state} {order.shipping_address?.pincode}
                </p>
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

function AddressesTab({ userId }) {
  const { addresses, loading, addAddress, deleteAddress } = useAddresses(userId);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newAddr, setNewAddr] = useState({ label: 'Home', full_name: '', phone: '', address_line: '', city: '', state: '', pincode: '', is_default: false });

  const handleAdd = async (e) => {
    e.preventDefault();
    const { error } = await addAddress({ ...newAddr, user_id: userId });
    if (!error) {
      toast.success('Address added');
      setIsModalOpen(false);
    }
  };

  const handleDelete = async (id) => {
    if(window.confirm('Delete this address?')) {
      await deleteAddress(id);
      toast.success('Address deleted');
    }
  }

  if (loading) return <div>Loading addresses...</div>;

  return (
    <div className="animate-fade-in">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Saved Addresses</h2>
        <Button size="sm" onClick={() => setIsModalOpen(true)}>Add New</Button>
      </div>

      {!addresses?.length ? (
        <div className="text-center py-12 text-gray-500">No saved addresses.</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {addresses.map(addr => (
            <div key={addr.id} className="p-4 border border-gray-200 dark:border-slate-700 rounded-xl relative">
              {addr.is_default && <span className="absolute top-4 right-4 text-xs font-semibold px-2 py-1 bg-indigo-100 text-indigo-700 rounded-md">Default</span>}
              <h4 className="font-semibold dark:text-white mb-2">{addr.label}</h4>
              <p className="text-sm text-gray-600 dark:text-gray-400">{addr.full_name}</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">{addr.address_line}</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">{addr.city}, {addr.state} {addr.pincode}</p>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">Phone: {addr.phone}</p>
              <div className="flex gap-2">
                <Button size="sm" variant="danger" onClick={() => handleDelete(addr.id)}>Delete</Button>
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Add Address">
        <form onSubmit={handleAdd} className="space-y-4">
          <Input label="Label (e.g. Home, Office)" value={newAddr.label} onChange={e => setNewAddr({...newAddr, label: e.target.value})} required />
          <Input label="Full Name" value={newAddr.full_name} onChange={e => setNewAddr({...newAddr, full_name: e.target.value})} required />
          <Input label="Phone" value={newAddr.phone} onChange={e => setNewAddr({...newAddr, phone: e.target.value})} required />
          <Input label="Address Line" value={newAddr.address_line} onChange={e => setNewAddr({...newAddr, address_line: e.target.value})} required />
          <div className="grid grid-cols-2 gap-4">
            <Input label="City" value={newAddr.city} onChange={e => setNewAddr({...newAddr, city: e.target.value})} required />
            <Input label="State" value={newAddr.state} onChange={e => setNewAddr({...newAddr, state: e.target.value})} required />
          </div>
          <Input label="Pincode" value={newAddr.pincode} onChange={e => setNewAddr({...newAddr, pincode: e.target.value})} required />
          <label className="flex items-center gap-2 mt-2 dark:text-white">
            <input type="checkbox" checked={newAddr.is_default} onChange={e => setNewAddr({...newAddr, is_default: e.target.checked})} />
            Set as Default Address
          </label>
          <div className="pt-4 flex justify-end">
            <Button type="submit">Save Address</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

function WishlistTab() {
  const { items } = useWishlistStore();
  
  if (!items?.length) return <div className="text-center py-12 text-gray-500">Your wishlist is empty.</div>;

  return (
    <div className="animate-fade-in">
      <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">My Wishlist</h2>
      <ProductGrid products={items} />
    </div>
  );
}
