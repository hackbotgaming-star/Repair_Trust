import React, { useState, useEffect } from 'react';
import { api } from '../api/client';
import { Asset } from '../types';
import { StatusBadge } from '../components/common/StatusBadge';
import { RiskBadge } from '../components/common/RiskBadge';
import { Link } from 'react-router-dom';
import { 
  Layers, 
  Search, 
  Filter, 
  ArrowRight, 
  GitBranch, 
  SearchCode, 
  AlertTriangle,
  MapPin,
  Calendar,
  X
} from 'lucide-react';

export const AssetsPage: React.FC = () => {
  const [assets, setAssets] = useState<Asset[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [riskFilter, setRiskFilter] = useState('');
  const [repeatOnly, setRepeatOnly] = useState(false);
  const [selectedAsset, setSelectedAsset] = useState<Asset | null>(null);

  const fetchAssets = async () => {
    try {
      setLoading(true);
      const res = await api.assets.list({
        search,
        type: typeFilter || undefined,
        riskLevel: riskFilter || undefined,
        repeatFailureOnly: repeatOnly ? 'true' : undefined,
        limit: 50
      });
      setAssets(res.data);
    } catch (err) {
      console.error('Failed to load assets', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAssets();
  }, [typeFilter, riskFilter, repeatOnly]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchAssets();
  };

  return (
    <div className="p-6 md:p-8 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <Layers className="w-6 h-6 text-teal-600" />
            Infrastructure Asset Registry
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Stormwater drains, culverts, and road crossings under municipal monitoring.
          </p>
        </div>
        <div className="text-xs font-mono bg-slate-100 text-slate-600 px-3 py-1.5 rounded-xl border border-slate-200">
          Total Assets: <span className="font-bold text-slate-900">{assets.length}</span>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-4">
        <form onSubmit={handleSearchSubmit} className="flex-1 min-w-[240px] flex items-center gap-2">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by Asset ID (e.g. DR-001), Street, or Ward..."
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

        <div className="flex flex-wrap items-center gap-3">
          {/* Type Filter */}
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="px-3 py-2 border border-slate-200 rounded-xl text-xs bg-slate-50 font-medium text-slate-700 outline-none focus:ring-2 focus:ring-teal-500"
          >
            <option value="">All Asset Types</option>
            <option value="storm-water drain">Storm-water Drain</option>
            <option value="culvert">Culvert</option>
            <option value="road">Road</option>
          </select>

          {/* Risk Filter */}
          <select
            value={riskFilter}
            onChange={(e) => setRiskFilter(e.target.value)}
            className="px-3 py-2 border border-slate-200 rounded-xl text-xs bg-slate-50 font-medium text-slate-700 outline-none focus:ring-2 focus:ring-teal-500"
          >
            <option value="">All Risk Levels</option>
            <option value="HIGH">High Risk</option>
            <option value="MODERATE">Moderate Risk</option>
            <option value="LOW">Low Risk</option>
          </select>

          {/* Repeat Failures Toggle */}
          <label className="flex items-center gap-2 text-xs font-semibold text-slate-700 cursor-pointer bg-slate-50 px-3 py-2 rounded-xl border border-slate-200 hover:bg-slate-100">
            <input
              type="checkbox"
              checked={repeatOnly}
              onChange={(e) => setRepeatOnly(e.target.checked)}
              className="rounded text-teal-600 focus:ring-teal-500"
            />
            <span>Repeat Failures Only</span>
          </label>
        </div>
      </div>

      {/* Asset Table */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider text-[10px]">
                <th className="py-3.5 px-4">Asset ID & Name</th>
                <th className="py-3.5 px-4">Type</th>
                <th className="py-3.5 px-4">Location & Ward</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4">Risk Profile</th>
                <th className="py-3.5 px-4">Capacity / Debris</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    Loading asset registry...
                  </td>
                </tr>
              ) : assets.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    No matching assets found for this filter.
                  </td>
                </tr>
              ) : (
                assets.map((asset) => (
                  <tr
                    key={asset.assetId}
                    className="hover:bg-slate-50/70 transition cursor-pointer"
                    onClick={() => setSelectedAsset(asset)}
                  >
                    <td className="py-3.5 px-4">
                      <div className="font-mono font-bold text-slate-900">{asset.assetId}</div>
                      <div className="text-[11px] text-slate-500 font-medium truncate max-w-xs">{asset.name}</div>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="capitalize text-slate-700 font-medium">{asset.type}</span>
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="font-medium text-slate-800">{asset.location.street}</div>
                      <div className="text-[11px] text-slate-400">{asset.location.ward}</div>
                    </td>
                    <td className="py-3.5 px-4">
                      <StatusBadge status={asset.status} />
                    </td>
                    <td className="py-3.5 px-4">
                      <RiskBadge
                        level={asset.riskLevel}
                        score={asset.riskScore}
                        repeatFailure={asset.repeatFailureFlag}
                      />
                    </td>
                    <td className="py-3.5 px-4 font-mono text-[11px]">
                      <div>
                        Ratio: <span className="font-semibold">{asset.capacityRatio.toFixed(2)}</span>
                      </div>
                      <div className="text-slate-400">Debris: {asset.debrisSeverityIndex}/5.0</div>
                    </td>
                    <td className="py-3.5 px-4 text-right space-x-1" onClick={(e) => e.stopPropagation()}>
                      <Link
                        to={`/memory-graph?assetId=${asset.assetId}`}
                        title="View Asset Memory Graph"
                        className="p-1.5 inline-flex items-center text-slate-500 hover:text-teal-700 hover:bg-teal-50 rounded-lg transition"
                      >
                        <GitBranch className="w-4 h-4" />
                      </Link>
                      <Link
                        to={`/investigations?assetId=${asset.assetId}`}
                        title="AI Root Cause Investigation"
                        className="p-1.5 inline-flex items-center text-slate-500 hover:text-teal-700 hover:bg-teal-50 rounded-lg transition"
                      >
                        <SearchCode className="w-4 h-4" />
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Asset Detail Modal */}
      {selectedAsset && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-slate-200 max-w-xl w-full p-6 shadow-xl space-y-4">
            <div className="flex items-start justify-between border-b border-slate-100 pb-3">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-lg font-bold text-slate-900">{selectedAsset.assetId}: {selectedAsset.name}</h3>
                  <StatusBadge status={selectedAsset.status} />
                </div>
                <p className="text-xs text-slate-500 mt-0.5">
                  {selectedAsset.location.street}, {selectedAsset.location.ward}
                </p>
              </div>
              <button
                onClick={() => setSelectedAsset(null)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
                <span className="text-slate-400 block mb-1">Asset Type</span>
                <span className="font-semibold text-slate-800 capitalize">{selectedAsset.type}</span>
              </div>
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
                <span className="text-slate-400 block mb-1">Installation Year</span>
                <span className="font-semibold text-slate-800">{selectedAsset.installationYear || '2018'}</span>
              </div>
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
                <span className="text-slate-400 block mb-1">Dimensions</span>
                <span className="font-semibold text-slate-800">
                  {selectedAsset.dimensions?.lengthMeters}m L &bull; {selectedAsset.dimensions?.depthMeters}m D
                </span>
              </div>
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
                <span className="text-slate-400 block mb-1">Hydraulic Capacity Ratio</span>
                <span className="font-mono font-bold text-slate-800">{selectedAsset.capacityRatio}</span>
              </div>
            </div>

            {selectedAsset.recommendedAction && (
              <div className="p-3 bg-teal-50 border border-teal-200 rounded-xl text-xs text-teal-900">
                <strong className="block mb-0.5 text-teal-800">Municipal Recommendation:</strong>
                {selectedAsset.recommendedAction}
              </div>
            )}

            <div className="pt-2 flex justify-end gap-2 border-t border-slate-100">
              <Link
                to={`/memory-graph?assetId=${selectedAsset.assetId}`}
                className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5"
              >
                <GitBranch className="w-3.5 h-3.5" /> Open Memory Graph
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
