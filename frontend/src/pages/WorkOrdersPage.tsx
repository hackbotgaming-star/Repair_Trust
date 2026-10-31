import React, { useState, useEffect } from 'react';
import { api } from '../api/client';
import { WorkOrder, Asset } from '../types';
import { StatusBadge } from '../components/common/StatusBadge';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Wrench, Plus, Search, Filter, ArrowRight, Video, ShieldCheck, X } from 'lucide-react';

export const WorkOrdersPage: React.FC = () => {
  const { role } = useAuth();
  const [orders, setOrders] = useState<WorkOrder[]>([]);
  const [assets, setAssets] = useState<Asset[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);

  // New Work Order form state
  const [newAssetId, setNewAssetId] = useState('DR-001');
  const [repairType, setRepairType] = useState('Drain De-silting & Cleaning');
  const [problemDescription, setProblemDescription] = useState('');
  const [priority, setPriority] = useState<'Low' | 'Medium' | 'High' | 'Urgent'>('High');
  const [assignedWorkerName, setAssignedWorkerName] = useState('Ramesh Kumar (Zone 4 Field Team)');
  const [creating, setCreating] = useState(false);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const res = await api.workOrders.list({
        search,
        status: statusFilter || undefined,
        limit: 50
      });
      setOrders(res.data);
    } catch (err) {
      console.error('Failed to load work orders:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
    api.assets.list({ limit: 50 }).then((res) => setAssets(res.data)).catch(console.error);
  }, [statusFilter]);

  const handleCreateWorkOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreating(true);
    try {
      const res = await api.workOrders.create({
        assetId: newAssetId,
        repairType,
        problemDescription,
        priority,
        assignedWorkerName
      });
      setShowCreateModal(false);
      setProblemDescription('');
      fetchOrders();
      alert(`Work order ${res.data.workOrderId} created and assigned.`);
    } catch (err: any) {
      alert('Error creating work order: ' + err.message);
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="p-6 md:p-8 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-bold uppercase tracking-wider text-teal-700 bg-teal-50 px-2.5 py-0.5 rounded-full border border-teal-200">
              CORE MODULE 5
            </span>
            <span className="text-xs text-slate-400">&bull;</span>
            <span className="text-xs text-slate-500">Lifecycle & Evidence Verification</span>
          </div>
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <Wrench className="w-6 h-6 text-teal-600" />
            Municipal Work Orders
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Track repair assignments, verify LiveWork Proof footage, and enforce Closure Auditor rules.
          </p>
        </div>

        {(role === 'engineer' || role === 'administrator') && (
          <button
            onClick={() => setShowCreateModal(true)}
            className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-xs"
          >
            <Plus className="w-4 h-4" /> Issue New Work Order
          </button>
        )}
      </div>

      {/* Filter and Search */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-4">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            fetchOrders();
          }}
          className="flex-1 min-w-[240px] flex items-center gap-2"
        >
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by Work Order ID (e.g. WO-2026-003) or Asset..."
              className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-teal-500 outline-none"
            />
          </div>
          <button
            type="submit"
            className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl transition"
          >
            Search
          </button>
        </form>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-3 py-2 border border-slate-200 rounded-xl text-xs bg-slate-50 font-medium text-slate-700 outline-none"
        >
          <option value="">All Lifecycles</option>
          <option value="Assigned">Assigned</option>
          <option value="In Progress">In Progress</option>
          <option value="Submitted for Review">Submitted for Review</option>
          <option value="Approved">Approved</option>
          <option value="Returned for More Evidence">Returned for More Evidence</option>
        </select>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider text-[10px]">
                <th className="py-3.5 px-4">Work Order ID</th>
                <th className="py-3.5 px-4">Asset ID</th>
                <th className="py-3.5 px-4">Repair Type</th>
                <th className="py-3.5 px-4">Assigned Squad</th>
                <th className="py-3.5 px-4">Priority</th>
                <th className="py-3.5 px-4">Auditor State</th>
                <th className="py-3.5 px-4">Lifecycle Status</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-400">
                    Loading work orders...
                  </td>
                </tr>
              ) : orders.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-400">
                    No work orders found.
                  </td>
                </tr>
              ) : (
                orders.map((wo) => (
                  <tr key={wo.workOrderId} className="hover:bg-slate-50/70 transition">
                    <td className="py-3.5 px-4 font-mono font-bold text-slate-900">{wo.workOrderId}</td>
                    <td className="py-3.5 px-4 font-semibold text-teal-800">{wo.assetId}</td>
                    <td className="py-3.5 px-4 text-slate-700">{wo.repairType}</td>
                    <td className="py-3.5 px-4 text-slate-600">{wo.assignedWorkerName}</td>
                    <td className="py-3.5 px-4">
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase ${
                          wo.priority === 'Urgent'
                            ? 'bg-rose-100 text-rose-800'
                            : wo.priority === 'High'
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-slate-100 text-slate-700'
                        }`}
                      >
                        {wo.priority}
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      <StatusBadge status={wo.closureAuditorStatus} />
                    </td>
                    <td className="py-3.5 px-4">
                      <StatusBadge status={wo.status} />
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <Link
                        to={`/work-orders/${wo.workOrderId}`}
                        className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-bold transition inline-flex items-center gap-1 shadow-xs"
                      >
                        Open Workspace <ArrowRight className="w-3 h-3" />
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-slate-200 max-w-lg w-full p-6 shadow-xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Wrench className="w-4 h-4 text-teal-600" />
                Issue Municipal Work Order
              </h3>
              <button
                onClick={() => setShowCreateModal(false)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateWorkOrder} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-700 font-bold mb-1">Target Infrastructure Asset:</label>
                <select
                  value={newAssetId}
                  onChange={(e) => setNewAssetId(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl outline-none"
                >
                  {assets.map((a) => (
                    <option key={a.assetId} value={a.assetId}>
                      {a.assetId} — {a.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">Repair Type:</label>
                <select
                  value={repairType}
                  onChange={(e) => setRepairType(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl outline-none"
                >
                  <option value="Drain De-silting & Cleaning">Drain De-silting & Cleaning</option>
                  <option value="Downstream Obstruction Removal">Downstream Obstruction Removal</option>
                  <option value="Structural Crack Patching">Structural Crack Patching</option>
                  <option value="Culvert Flume Clearing">Culvert Flume Clearing</option>
                  <option value="Cover Slab / Grate Replacement">Cover Slab / Grate Replacement</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">Problem Description & Directive:</label>
                <textarea
                  rows={3}
                  value={problemDescription}
                  onChange={(e) => setProblemDescription(e.target.value)}
                  placeholder="Mandatory instructions for field squad..."
                  className="w-full p-3 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-teal-500"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-bold mb-1">Priority:</label>
                  <select
                    value={priority}
                    onChange={(e) => setPriority(e.target.value as any)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl outline-none"
                  >
                    <option value="Low">Low</option>
                    <option value="Medium">Medium</option>
                    <option value="High">High</option>
                    <option value="Urgent">Urgent</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-700 font-bold mb-1">Assigned Worker:</label>
                  <input
                    type="text"
                    value={assignedWorkerName}
                    onChange={(e) => setAssignedWorkerName(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl outline-none"
                  />
                </div>
              </div>

              <div className="pt-2 flex justify-end gap-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 bg-slate-100 text-slate-700 rounded-xl font-bold transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={creating || !problemDescription.trim()}
                  className="px-5 py-2 bg-teal-600 hover:bg-teal-700 disabled:bg-slate-300 text-white rounded-xl font-bold transition"
                >
                  {creating ? 'Issuing...' : 'Create Work Order'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
