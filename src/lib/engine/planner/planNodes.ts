// FILE: src/lib/engine/planner/planNodes.ts

import { BinaryExpressionNode } from '../parser/ast';

export type PlanNodeType = 'TableScan' | 'Filter' | 'Project';

// Base interface for all Plan Nodes
export interface PlanNode {
  type: PlanNodeType;
  children: PlanNode[];
}

export interface TableScanNode extends PlanNode {
  type: 'TableScan';
  tableName: string;
}

export interface FilterNode extends PlanNode {
  type: 'Filter';
  // We reuse the AST's binary expression for the condition to keep it simple for now
  condition: BinaryExpressionNode; 
}

export interface ProjectNode extends PlanNode {
  type: 'Project';
  columns: string[];
}