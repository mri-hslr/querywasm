// FILE: src/components/PlanVisualizer.tsx
'use client';

import { ReactFlow, Background, Controls, Edge, Node } from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { PlanNode, TableScanNode, ProjectNode, FilterNode } from '@/lib/engine/planner/planNodes';
import { useMemo } from 'react';

interface PlanVisualizerProps {
  plan: PlanNode | null;
}

export default function PlanVisualizer({ plan }: PlanVisualizerProps) {
  const { nodes, edges } = useMemo(() => {
    if (!plan) return { nodes: [], edges: [] };

    const generatedNodes: Node[] = [];
    const generatedEdges: Edge[] = [];
    
    // We use a Map to keep track of levels to handle X/Y spacing automatically
    const levelCounts: Record<number, number> = {};

    function traverse(node: PlanNode, parentId: string | null, depth: number) {
      const id = `node-${generatedNodes.length + 1}`;
      
      // Fix: 'label' must be a generic string, not 'PlanNodeType'
      let label: string = ""; 

      if (node.type === 'TableScan') {
        label = `🗄️ Scan (${(node as TableScanNode).tableName})`;
      } else if (node.type === 'Project') {
        label = `🎯 Project [${(node as ProjectNode).columns.join(', ')}]`;
      } else if (node.type === 'Filter') {
        const cond = (node as FilterNode).condition;
        label = `⚙️ Filter (${cond.left.name} ${cond.operator} ${cond.right.value})`;
      }

      // Logic to position nodes horizontally centered
      if (!levelCounts[depth]) levelCounts[depth] = 0;
      const xPos = levelCounts[depth] * 250;
      levelCounts[depth] += 1;

      generatedNodes.push({
        id,
        position: { x: xPos, y: depth * 120 },
        data: { label },
        style: {
          background: '#18181b',
          color: '#fff',
          border: '1px solid #3b82f6',
          borderRadius: '8px',
          padding: '10px',
          fontSize: '12px',
          width: 200,
          textAlign: 'center',
          boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.4)'
        }
      });

      if (parentId) {
        generatedEdges.push({
          id: `e-${parentId}-${id}`,
          source: parentId,
          target: id,
          animated: true,
          style: { stroke: '#3b82f6', strokeWidth: 2 }
        });
      }

      node.children.forEach((child) => {
        traverse(child, id, depth + 1);
      });
    }

    // Since our logic is bottom-up in the planner, but visualizers 
    // usually look better top-down, we start depth at 0.
    traverse(plan, null, 0);
    
    return { nodes: generatedNodes, edges: generatedEdges };
  }, [plan]);

  if (!plan) return (
    <div className="h-[400px] w-full flex items-center justify-center border border-zinc-800 rounded-lg bg-zinc-900/50 text-zinc-500">
      Waiting for valid SQL AST...
    </div>
  );

  return (
    <div className="h-[500px] w-full border border-zinc-800 rounded-lg overflow-hidden bg-zinc-950">
      <ReactFlow 
        nodes={nodes} 
        edges={edges} 
        fitView
        // This ensures the tree doesn't jump around on re-renders
        nodesConnectable={false}
        nodesDraggable={true}
      >
        <Background color="#27272a" gap={20} />
        <Controls />
      </ReactFlow>
    </div>
  );
}