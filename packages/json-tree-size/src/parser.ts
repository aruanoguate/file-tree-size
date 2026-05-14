import jsonSourceMap from 'json-source-map';
import { SizeNode } from './types';

type JsonValue = string | number | boolean | null | JsonObject | JsonArray;
type JsonObject = { [key: string]: JsonValue };
type JsonArray = JsonValue[];

/** Parse a JSON string and return a SizeNode tree with sizes and source positions. */
export function buildSizeTree(jsonText: string): SizeNode {
  const { data, pointers } = jsonSourceMap.parse(jsonText);
  return buildNode('root', data as JsonValue, '', pointers, 0, 0);
}

/**
 * Recursively builds a {@link SizeNode} for a JSON value and its descendants.
 * @param key - The property name or array index (as string) for this node.
 * @param value - The parsed JSON value.
 * @param path - The JSON-pointer path used to look up source positions.
 * @param pointers - The source-map pointer table from `json-source-map`.
 * @param defaultLine - Fallback 0-based line number if the pointer is missing.
 * @param defaultCol - Fallback 0-based column number if the pointer is missing.
 * @returns A fully populated {@link SizeNode} with children sorted by size descending.
 */
function buildNode(
  key: string,
  value: JsonValue,
  path: string,
  pointers: Record<string, { value: { line: number; column: number } }>,
  defaultLine: number,
  defaultCol: number
): SizeNode {
  const size = JSON.stringify(value).length;
  const type = getType(value);

  // json-source-map pointer for this node's value start position
  const pointer = pointers[path];
  /* istanbul ignore next -- defensive fallback for missing pointer */
  const line = pointer?.value?.line ?? defaultLine;
  /* istanbul ignore next -- defensive fallback for missing pointer */
  const col = pointer?.value?.column ?? defaultCol;

  const children: SizeNode[] = [];

  if (type === 'object' && value !== null) {
    for (const [k, v] of Object.entries(value as JsonObject)) {
      const childPath = `${path}/${k}`;
      children.push(buildNode(k, v, childPath, pointers, line, col));
    }
  } else if (type === 'array') {
    (value as JsonArray).forEach((v, i) => {
      const childPath = `${path}/${i}`;
      children.push(buildNode(String(i), v, childPath, pointers, line, col));
    });
  }

  // Sort children by size descending
  children.sort((a, b) => b.size - a.size);

  return { key, size, type, children, line, col };
}

/**
 * Determines the JSON type of a parsed value.
 * @param value - The parsed JSON value to classify.
 * @returns The {@link SizeNode.type} string for the value.
 */
function getType(value: JsonValue): SizeNode['type'] {
  if (value === null) return 'null';
  if (Array.isArray(value)) return 'array';
  if (typeof value === 'object') return 'object';
  if (typeof value === 'string') return 'string';
  if (typeof value === 'number') return 'number';
  return 'boolean';
}