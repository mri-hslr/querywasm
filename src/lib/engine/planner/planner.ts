// FILE: src/lib/engine/planner/planner.ts

import { SelectStatement } from '../parser/ast';
import { PlanNode, TableScanNode, FilterNode, ProjectNode } from './planNodes';

export class LogicalPlanner {
  
  public buildPlan(ast: SelectStatement): PlanNode {
    // We build the tree bottom-up. Data flows from Scan -> Filter -> Project.

    // 1. BASE: Table Scan
    let currentPlan: PlanNode = {
      type: 'TableScan',
      tableName: ast.table.name,
      children: []
    } as TableScanNode;

    // 2. MIDDLE: Filter (if WHERE clause exists)
    if (ast.where) {
      currentPlan = {
        type: 'Filter',
        condition: ast.where,
        children: [currentPlan] // The Scan node becomes the child of the Filter node
      } as FilterNode;
    }

    // 3. ROOT: Projection (Selecting specific columns)
    const columns = ast.columns.map(col => col === '*' ? '*' : col.name);
    
    currentPlan = {
      type: 'Project',
      columns: columns,
      children: [currentPlan] // The previous node becomes the child of the Project node
    } as ProjectNode;

    return currentPlan;
  }
}