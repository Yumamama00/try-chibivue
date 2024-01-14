// テンプレートコンパイラで扱うNodeの種類
export const enum NodeTypes {
  ELEMENT,
  TEXT,
  INTERPOLATION,
  ATTRIBUTE,
  DIRECTIVE,
}

// 全ての Node は type と loc を持つ
// loc というのは location のことで、この Node がソースコード(テンプレート文字列)のどこに該当するかの情報を保持している
export interface Node {
  type: NodeTypes;
  loc: SourceLocation;
}

// Element の Node
export interface ElementNode extends Node {
  type: NodeTypes.ELEMENT;
  tag: string; // eg. "div"
  props: Array<AttributeNode | DirectiveNode>; // eg. { name: "class", value: { content: "container" } }
  children: TemplateChildNode[];
  isSelfClosing: boolean; // eg. <img /> -> true
}

export interface DirectiveNode extends Node {
  type: NodeTypes.DIRECTIVE;
  // v-name:arg="exp" というような形式で表すことにする。
  // eg. v-on:click="increment"の場合は { name: "on", arg: "click", exp="increment" }
  name: string;
  arg: string;
  exp: string;
}

// ElementNode が持つ属性
export interface AttributeNode extends Node {
  type: NodeTypes.ATTRIBUTE;
  name: string;
  value: TextNode | undefined;
}

export interface TextNode extends Node {
  type: NodeTypes.TEXT;
  content: string;
}

export interface InterpolationNode extends Node {
  type: NodeTypes.INTERPOLATION;
  content: string; // マスタッシュの中に記述された内容 (今回は setup で定義された単一の変数名がここに入る)
}

export type TemplateChildNode = ElementNode | TextNode | InterpolationNode;

// location の情報です。 Node はこの情報を持つ
// start, end に位置情報が入る
// source には実際のコード(文字列)が入る
export interface SourceLocation {
  start: Position;
  end: Position;
  source: string;
}

export interface Position {
  offset: number; // from start of file
  line: number;
  column: number;
}
