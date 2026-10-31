import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { api } from '../api/client';
import { Asset, MemoryGraphData } from '../types';
import { InteractiveTimeline } from '../components/memory-graph/InteractiveTimeline';
import { RelationshipGraph } from '../components/memory-graph/RelationshipGraph';
import { StatusBadge } from '../components/common/StatusBadge';
import { RiskBadge } from '../components/common/RiskBadge';
import { GitBranch, Layers, AlertTriangle, Compass, RotateCcw } from 'lucide-react';

export const AssetMemoryGraphPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const urlAssetId = searchParams.get('assetId') || 'DR-001';

  const [selectedAssetId, setSelectedAssetId] = useState<string>(urlAssetId);
  const [assetList, setAssetList] = useState<Asset[]>([]);
  const [graphData, setGraphData] = useState<MemoryGraphData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'BOTH' | 'TIMELINE' | 'GRAPH'>('BOTH');

  // Sync state if URL query param changes from external navigation
  useEffect(() => {
    const param = searchParams.get('assetId');
    if (param && param !== selectedAssetId) {
      setSelectedAssetId(param);
    }
  }, [searchParams]);

  useEffect(() => {
    // Load asset list for selector
    api.assets.list({ limit: 50 })
      .then((res) => {
        if (res && res.data) {
          setAssetList(res.data);
        }
      })
      .catch((err) => console.error('Failed to load asset list:', err));
  }, []);

  const loadMemoryGraph = async (assetId: string) => {
    try {
      setLoading(true);
      setError(null);
      const res = await api.assets.getMemoryGraph(assetId);
      if (res && res.data) {
        setGraphData(res.data);
      } else {
        throw new Error(`No memory graph record returned for asset ${assetId}`);
      }
    } catch (err: any) {
      console.error('Failed to load memory graph:', err);
      setError(err.message || `Failed to load memory graph for asset ${assetId}`);
      setGraphData(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMemoryGraph(selectedAssetId);
  }, [selectedAssetId]);

  const handleAssetChange = (newId: string) => {
    setSelectedAssetId(newId);
    setSearchParams({ assetId: newId });
  };

  // Ensure current selectedAssetId is in options even before list finishes loading
  const hasCurrentInList = assetList.some((a) => a.assetId === selectedAssetId);

  return (
    <div className="p-6 md:p-8 space-y-6 max-w-7xl mx-auto">
      {/* Top Header & Asset Switcher */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-bold uppercase tracking-wider text-teal-700 bg-teal-50 px-2.5 py-0.5 rounded-full border border-teal-200">
              CORE MODULE 2
            </span>
            <span className="text-xs text-slate-400">&bull;</span>
            <span className="text-xs text-slate-500">Relational Provenance & Memory</span>
          </div>
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <GitBranch className="w-6 h-6 text-teal-600" />
            Asset Memory Graph
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Chronological and relational linkage of complaints, work orders, video proof, and engineering decisions.
          </p>
        </div>

        {/* Asset Selector */}
        <div className="flex items-center gap-3">
          <label className="text-xs font-bold text-slate-700">Select Asset:</label>
          <select
            value={selectedAssetId}
            onChange={(e) => handleAssetChange(e.target.value)}
            className="px-4 py-2 border border-slate-300 rounded-xl text-xs font-mono font-bold text-slate-800 bg-slate-50 focus:ring-2 focus:ring-teal-500 outline-none cursor-pointer"
          >
            {!hasCurrentInList && (
              <option value={selectedAssetId}>{selectedAssetId} (Current Selection)</option>
            )}
            {assetList.map((a) => (
              <option key={a.assetId} value={a.assetId}>
                {a.assetId} — {a.name} ({a.location?.ward || 'Municipal Ward'})
              </option>
            ))}
          </select>
        </div>
      </div>

      {loading ? (
        <div className="p-12 text-center text-slate-400 animate-pulse space-y-4">
          <div className="h-28 bg-slate-200 rounded-2xl"></div>
          <div className="h-96 bg-slate-200 rounded-2xl"></div>
        </div>
      ) : error ? (
        <div className="bg-white p-8 rounded-2xl border border-rose-200 text-center space-y-4">
          <div className="w-12 h-12 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center mx-auto">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900">Unable to load memory graph for {selectedAssetId}</h3>
            <p className="text-xs text-slate-500 mt-1">{error}</p>
          </div>
          <div className="flex justify-center gap-3">
            <button
              onClick={() => loadMemoryGraph(selectedAssetId)}
              className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5"
            >
              <RotateCcw className="w-3.5 h-3.5" /> Retry
            </button>
            <button
              onClick={() => handleAssetChange('DR-001')}
              className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5"
            >
              <Compass className="w-3.5 h-3.5" /> Load DR-001 (Primary SWD Trunk)
            </button>
          </div>
        </div>
      ) : graphData && graphData.asset ? (
        <>
          {/* Active Asset Summary Card */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-6">
            <div className="space-y-1.5">
              <div className="flex items-center gap-2">
                <span className="font-mono text-sm font-bold text-teal-800 bg-teal-50 px-2 py-0.5 rounded border border-teal-200">
                  {graphData.asset.assetId}
                </span>
                <StatusBadge status={graphData.asset.status} />
                <RiskBadge
                  level={graphData.asset.riskLevel}
                  score={graphData.asset.riskScore}
                  repeatFailure={graphData.asset.repeatFailureFlag}
                />
              </div>
              <h3 className="text-lg font-bold text-slate-900">{graphData.asset.name}</h3>
              <p className="text-xs text-slate-500">
                {graphData.asset.location?.street}, {graphData.asset.location?.ward} &bull; Type: <span className="capitalize">{graphData.asset.type}</span>
              </p>
            </div>

            <div className="flex items-center gap-4 bg-slate-50 p-3 rounded-xl border border-slate-200 text-xs">
              <div className="text-center px-3 border-r border-slate-200">
                <div className="text-slate-400 text-[10px] uppercase font-bold">Timeline Events</div>
                <div className="text-lg font-bold text-slate-900">{graphData.metrics?.totalTimelineEvents || 0}</div>
              </div>
              <div className="text-center px-3 border-r border-slate-200">
                <div className="text-slate-400 text-[10px] uppercase font-bold">Complaints</div>
                <div className="text-lg font-bold text-rose-600">{graphData.metrics?.complaintCount || 0}</div>
              </div>
              <div className="text-center px-3 border-r border-slate-200">
                <div className="text-slate-400 text-[10px] uppercase font-bold">Work Orders</div>
                <div className="text-lg font-bold text-blue-600">{graphData.metrics?.workOrderCount || 0}</div>
              </div>
              <div className="text-center px-3">
                <div className="text-slate-400 text-[10px] uppercase font-bold">Videos</div>
                <div className="text-lg font-bold text-purple-600">{graphData.metrics?.videoCount || 0}</div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Link
                to={`/investigations?assetId=${graphData.asset.assetId}`}
                className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-xs"
              >
                <Compass className="w-4 h-4" /> Root Cause Engine
              </Link>
            </div>
          </div>

          {/* View Mode Toggle */}
          <div className="flex items-center justify-end gap-2 text-xs font-semibold">
            <span className="text-slate-400">Display:</span>
            <div className="flex bg-slate-100 p-1 rounded-xl border border-slate-200">
              {(['BOTH', 'TIMELINE', 'GRAPH'] as const).map((mode) => (
                <button
                  key={mode}
                  onClick={() => setViewMode(mode)}
                  className={`px-3 py-1 rounded-lg transition ${
                    viewMode === mode
                      ? 'bg-white text-slate-900 font-bold shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {mode === 'BOTH' ? 'Split View' : mode}
                </button>
              ))}
            </div>
          </div>

          {/* Content Views */}
          <div className="space-y-8">
            {(viewMode === 'BOTH' || viewMode === 'GRAPH') && (
              <RelationshipGraph
                nodes={graphData.graph?.nodes || []}
                edges={graphData.graph?.edges || []}
              />
            )}

            {(viewMode === 'BOTH' || viewMode === 'TIMELINE') && (
              <InteractiveTimeline events={graphData.timeline || []} />
            )}
          </div>
        </>
      ) : (
        <div className="p-8 text-center text-slate-400">No memory graph data found.</div>
      )}
    </div>
  );
};
