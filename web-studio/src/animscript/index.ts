/**
 * AnimScript v0.1 Public Interface
 */

import { Lexer } from "./lexer";
import { Parser } from "./parser";
import { Compiler } from "./compiler";
import { AnimScriptIR, CompilerDiagnostic } from "./types";
import { evaluateFrame } from "./runtime";

export * from "./types";
export * from "./ast";
export * from "./lexer";
export * from "./parser";
export * from "./compiler";
export * from "./runtime";
export * from "./motionGraph";
export * from "./ik";
export * from "./registry/assetRegistry";

export function compileAnimScript(source: string): { ir: AnimScriptIR; diagnostics: CompilerDiagnostic[] } {
  const parser = new Parser(source);
  const { program, diagnostics: parseDiagnostics } = parser.parse();

  const compiler = new Compiler();
  const ir = compiler.compile(program);

  const allDiagnostics = [...parseDiagnostics, ...ir.diagnostics];
  ir.diagnostics = allDiagnostics;

  return { ir, diagnostics: allDiagnostics };
}
