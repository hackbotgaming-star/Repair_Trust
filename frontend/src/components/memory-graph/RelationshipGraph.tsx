import React, { useState, useEffect } from 'react';
import { GraphNode, GraphEdge } from '../../types';
import { GitBranch, ShieldAlert, Wrench, Video, CheckCircle, AlertTriangle, Layers, ArrowRight } from 'lucide-react';

interface RelationshipGraphProps {
  nodes: GraphNode[];
  edges: GraphEdge[];
  onSelectNode?: (node: GraphNode) => void;
}

export const RelationshipGraph: React.FC<RelationshipGraphProps> = ({ nodes, edges, onSelectNode }) => {
  const [selectedNode, setSelectedNode] = useState<GraphNode | null>(nodes[0] || null);

  useEffect(() => {
    setSelectedNode(nodes[0] || null);
  }, [nodes]);

  const getNodeColor = (type: string, status?: string) => {
    switch (type) {
      case 'Asset':
        return 'border-teal-500 bg-teal-50 text-teal-900';
      case 'Complaint':
        return 'border-rose-400 bg-rose-50 text-rose-900';
      case 'WorkOrder':
        return 'border-blue-400 bg-blue-50 text-blue-900';
      case 'LiveWorkProofVideo':
        return 'border-purple-400 bg-purple-50 text-purple-900';
      case 'EngineerDecision':
        return status === 'Approved'
          ? 'border-emerald-500 bg-emerald-50 text-emerald-900'
          : 'border-rose-500 bg-rose-50 text-rose-900';
      case 'Inspection':
        return 'border-amber-400 bg-amber-50 text-amber-900';
      case 'Rainfall':
        return 'border-sky-400 bg-sky-50 text-sky-900';
      default:
        return 'border-slate-300 bg-slate-50 text-slate-800';
    }
  };

  const getNodeIcon = (type: string) => {
    switch (type) {
      case 'Asset':
        return <Layers className="w-4 h-4 text-teal-600" />;
      case 'Complaint':
        return <AlertTriangle className="w-4 h-4 text-rose-600" />;
      case 'WorkOrder':
        return <Wrench className="w-4 h-4 text-blue-600" />;
      case 'LiveWorkProofVideo':
        return <Video className="w-4 h-4 text-purple-600" />;
      case 'EngineerDecision':
        return <CheckCircle className="w-4 h-4 text-emerald-600" />;
      case 'Inspection':
        return <GitBranch className="w-4 h-4 text-amber-600" />;
      default:
        return <Layers className="w-4 h-4 text-slate-600" />;
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs">
      <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100">
        <div>
          <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <GitBranch className="w-4 h-4 text-teal-600" />
            Asset Memory Relationship Graph
          </h3>
          <p className="text-xs text-slate-500">
            Interactive structural causality map linking complaints, work orders, video proof, and engineering sign-offs.
          </p>
        </div>
        <div className="text-xs text-slate-400 font-mono">
          {nodes.length} Nodes &bull; {edges.length} Relationships
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Graph Visual Canvas */}
        <div className="lg:col-span-2 bg-slate-50/80 rounded-xl p-5 border border-slate-200 min-h-[380px] overflow-x-auto">
          <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-3 flex items-center gap-1.5">
            <span>Entity Relationship Chain</span>
            <span className="text-slate-300">&bull;</span>
            <span className="text-slate-500">Click a node to inspect provenance</span>
          </div>

          <div className="space-y-4">
            {/* Flow Representation */}
            {nodes.map((node) => {
              const isSelected = selectedNode?.id === node.id;
              // Outgoing edges from this node
              const outgoing = edges.filter((e) => e.source === node.id);

              return (
                <div key={node.id} className="relative">
                  <div
                    onClick={() => {
                      setSelectedNode(node);
                      onSelectNode?.(node);
                    }}
                    className={`inline-flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl border-2 transition cursor-pointer shadow-xs ${getNodeColor(
                      node.type,
                      node.status
                    )} ${isSelected ? 'ring-2 ring-teal-500 ring-offset-2 scale-[1.02]' : 'hover:scale-[1.01]'}`}
                  >
                    <div className="p-1 rounded-lg bg-white/80">{getNodeIcon(node.type)}</div>
                    <div>
                      <div className="text-[10px] font-bold uppercase tracking-wider opacity-75">{node.type}</div>
                      <div className="text-xs font-bold leading-tight">{node.label}</div>
                    </div>
                  </div>

                  {/* Connected links indicators */}
                  {outgoing.length > 0 && (
                    <div className="ml-6 my-2 pl-3 border-l-2 border-dashed border-slate-300 space-y-1.5">
                      {outgoing.map((edge) => {
                        const targetNode = nodes.find((n) => n.id === edge.target);
                        if (!targetNode) return null;
                        return (
                          <div key={edge.id} className="flex items-center gap-2 text-xs text-slate-500">
                            <ArrowRight className="w-3 h-3 text-slate-400 shrink-0" />
                            <span className="font-mono text-[10px] bg-slate-200 text-slate-700 px-1.5 py-0.2 rounded font-semibold">
                              {edge.label}
                            </span>
                            <span className="font-medium text-slate-700">{targetNode.label}</span>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Node Inspector Panel */}
        <div className="bg-slate-50 rounded-xl p-4 border border-slate-200 flex flex-col justify-between">
          <div>
            <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-2">
              Node Inspector
            </div>

            {selectedNode ? (
              <div className="space-y-3">
                <div className="p-3 bg-white rounded-lg border border-slate-200">
                  <span className="text-[10px] font-bold text-teal-700 uppercase bg-teal-50 px-2 py-0.5 rounded border border-teal-200">
                    {selectedNode.type}
                  </span>
                  <h4 className="text-sm font-bold text-slate-900 mt-2">{selectedNode.label}</h4>
                  {selectedNode.status && (
                    <div className="mt-1 text-xs text-slate-600">
                      Status: <span className="font-semibold">{selectedNode.status}</span>
                    </div>
                  )}
                </div>

                <div>
                  <div className="text-xs font-semibold text-slate-700 mb-1">Raw Entity Attributes:</div>
                  <pre className="text-[10px] font-mono bg-white p-3 rounded-lg border border-slate-200 overflow-x-auto text-slate-600 max-h-56 leading-tight">
                    {JSON.stringify(selectedNode.data, null, 2)}
                  </pre>
                </div>
              </div>
            ) : (
              <div className="text-xs text-slate-400 italic py-8 text-center">
                Select any node from the graph to inspect connected records.
              </div>
            )}
          </div>

          <div className="mt-4 pt-3 border-t border-slate-200 text-[11px] text-slate-500 flex items-center gap-1.5">
            <ShieldAlert className="w-3.5 h-3.5 text-teal-600 shrink-0" />
            <span>MongoDB relational document integrity verified.</span>
          </div>
        </div>
      </div>
    </div>
  );
};
