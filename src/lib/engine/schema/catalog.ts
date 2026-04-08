// FILE: src/lib/engine/schema/catalog.ts

export type DataType = 'INT' | 'TEXT' | 'BOOLEAN';

interface ColumnSchema {
  type: DataType;
}

interface TableSchema {
  [columnName: string]: ColumnSchema;
}

export class Catalog {
  // This is our "Virtual Database Schema"
  private tables: Record<string, TableSchema> = {
    users: {
      id: { type: 'INT' },
      user_name: { type: 'TEXT' },
      age: { type: 'INT' },
      is_active: { type: 'BOOLEAN' }
    },
    products: {
      id: { type: 'INT' },
      title: { type: 'TEXT' },
      price: { type: 'INT' }
    }
  };

  public hasTable(tableName: string): boolean {
    return tableName in this.tables;
  }

  public hasColumn(tableName: string, columnName: string): boolean {
    if (!this.hasTable(tableName)) return false;
    return columnName in this.tables[tableName];
  }

  public getColumnType(tableName: string, columnName: string): DataType {
    if (!this.hasColumn(tableName, columnName)) {
      throw new Error(`Catalog Error: Column '${columnName}' does not exist in table '${tableName}'`);
    }
    return this.tables[tableName][columnName].type;
  }
}