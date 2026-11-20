/**
 * AnimScript v0.1 AST Definitions
 * Strongly typed AST with line/column/span metadata for diagnostics.
 */

export interface SourceLocation {
  line: number;   // 1-based
  column: number; // 1-based
  offset: number; // 0-based
}

export interface NodeSpan {
  start: SourceLocation;
  end: SourceLocation;
}

export type ASTNode =
  | ProgramNode
  | StatementNode
  | ExpressionNode;

export interface ProgramNode {
  type: "Program";
  span: NodeSpan;
  body: StatementNode[];
}

export type StatementNode =
  | AssignmentStatementNode
  | ExpressionStatementNode
  | WithSceneStatementNode
  | WithSequenceStatementNode
  | WithParallelStatementNode;

export interface AssignmentStatementNode {
  type: "AssignmentStatement";
  span: NodeSpan;
  target: string;
  value: ExpressionNode;
}

export interface ExpressionStatementNode {
  type: "ExpressionStatement";
  span: NodeSpan;
  expression: ExpressionNode;
}

export interface WithSceneStatementNode {
  type: "WithSceneStatement";
  span: NodeSpan;
  sceneName: string;
  options: Record<string, ExpressionNode>;
  body: StatementNode[];
}

export interface WithSequenceStatementNode {
  type: "WithSequenceStatement";
  span: NodeSpan;
  body: StatementNode[];
}

export interface WithParallelStatementNode {
  type: "WithParallelStatement";
  span: NodeSpan;
  body: StatementNode[];
}

export type ExpressionNode =
  | NumberLiteralNode
  | StringLiteralNode
  | BooleanLiteralNode
  | CoordinateLiteralNode
  | IdentifierNode
  | PropertyAccessNode
  | BinaryExpressionNode
  | CallExpressionNode;

export interface NumberLiteralNode {
  type: "NumberLiteral";
  span: NodeSpan;
  value: number;
}

export interface StringLiteralNode {
  type: "StringLiteral";
  span: NodeSpan;
  value: string;
}

export interface BooleanLiteralNode {
  type: "BooleanLiteral";
  span: NodeSpan;
  value: boolean;
}

export interface CoordinateLiteralNode {
  type: "CoordinateLiteral";
  span: NodeSpan;
  elements: ExpressionNode[];
}

export interface IdentifierNode {
  type: "Identifier";
  span: NodeSpan;
  name: string;
}

export interface PropertyAccessNode {
  type: "PropertyAccess";
  span: NodeSpan;
  object: ExpressionNode;
  property: string;
}

export interface BinaryExpressionNode {
  type: "BinaryExpression";
  span: NodeSpan;
  operator: "+" | "-";
  left: ExpressionNode;
  right: ExpressionNode;
}

export interface CallArgument {
  name?: string; // Optional: named argument
  value: ExpressionNode;
}

export interface CallExpressionNode {
  type: "CallExpression";
  span: NodeSpan;
  callee: string;
  args: CallArgument[];
}
