"use strict";

// Comment text shared by the two renderers: word-wrapped doc comments, and what an input's doc
// says about it.

const W = require("./workflow");

const WIDTH = 100;

// Word-wraps text to WIDTH: the first line starts with `first`, the others with `rest`. Splitting
// on whitespace keeps a newline in a description from ending a comment line, and `*/` is escaped
// so none ends the comment.
function wrap(text, first, rest) {
  const lines = [];
  let line = first;
  let fresh = true;
  for (const word of String(text).replace(/\*\//g, "*\\/").split(/\s+/).filter(Boolean)) {
    if (!fresh && line.length + 1 + word.length > WIDTH) {
      lines.push(line);
      line = rest + word;
    } else {
      line += (fresh ? "" : " ") + word;
    }
    fresh = false;
  }
  lines.push(line);
  return lines.map((l) => l.replace(/\s+$/, ""));
}

// A doc comment at indent: paragraphs, a blank line, then tags (whose lines after the first are
// indented two more; with wrapTags false, each on one line, as a JSDoc type must be). One short
// paragraph alone goes on one line.
function doc(paragraphs, tags, indent, { wrapTags = true } = {}) {
  const texts = paragraphs.filter((text) => String(text).trim() !== "");
  if (texts.length === 1 && tags.length === 0) {
    const one = wrap(texts[0], `${indent}/** `, "");
    if (one.length === 1 && one[0].length + 3 <= WIDTH) return [`${one[0]} */`];
  }
  const lines = [];
  texts.forEach((text, i) => {
    if (i > 0) lines.push(`${indent} *`);
    lines.push(...wrap(text, `${indent} * `, `${indent} * `));
  });
  if (tags.length) {
    if (lines.length) lines.push(`${indent} *`);
    for (const tag of tags) lines.push(...(wrapTags ? wrap(tag, `${indent} * `, `${indent} *   `) : [`${indent} * ${tag}`]));
  }
  if (lines.length === 0) return [];
  return [`${indent}/**`, ...lines, `${indent} */`];
}

// A workflow's name as a title, or its key.
function title(workflow) {
  const name = workflow.name.split(/\s+/).filter(Boolean).join(" ");
  return name === "" ? workflow.key : name;
}

// The workflow's intro: its name, key and version, then its description.
function intro(workflow) {
  const version = workflow.draft ? "a draft, not published yet" : `version ${workflow.version === null ? "null" : workflow.version}`;
  const text = `${title(workflow)} (\`${workflow.key}\`, ${version}).`;
  return workflow.description.trim() === "" ? text : `${text} ${workflow.description}`;
}

function operationPhrase(id) {
  const known = W.knownOperation(id);
  return known
    ? `the ${id} body (see \`${known.method}\`)`
    : `the ${id} body (an operation this version of qubesync doesn't know)`;
}

// What an input's doc says: the operation it's the body of, its description, the fields the
// workflow sets itself, its values, and a nested discriminated object's branches.
function inputText(schema) {
  const parts = [];
  const id = W.operation(schema);
  if (id) parts.push(operationPhrase(id));
  const description = typeof schema.description === "string" ? schema.description.trim() : "";
  if (id && description !== "") parts[parts.length - 1] += ":";
  if (description !== "") parts.push(description);
  const set = id ? W.setByWorkflow(schema) : [];
  if (set.length) {
    parts.push(
      `The workflow sets ${set.map((field) => `\`${field}\``).join(", ")} itself: a value given for ${
        set.length === 1 ? "it" : "them"
      } is overwritten.`
    );
  }
  if (Array.isArray(schema.enum)) parts.push(`One of ${schema.enum.map((v) => JSON.stringify(v)).join(", ")}.`);
  if (Object.prototype.hasOwnProperty.call(schema, "const")) parts.push(`Always ${JSON.stringify(schema.const)}.`);
  const extra = schema.additionalProperties;
  if (W.isPlainObject(extra) && Array.isArray(extra.enum)) {
    parts.push(`Each value is one of ${extra.enum.map((v) => JSON.stringify(v)).join(", ")}.`);
  }
  const nested = W.isPlainObject(schema.items) ? schema.items : schema;
  if (!id && W.discriminated(nested)) parts.push(branchesPhrase(nested, nested === schema ? "It's" : "Each is"));
  return parts.join(" ");
}

// A nested discriminated object's branches: `"customer", whose `add` is the customer.create body
// (...)`.
function branchesPhrase(schema, subject) {
  const discriminator = schema.discriminator.propertyName;
  const branches = W.branchSchemas(schema).map(({ properties }) => {
    const value = JSON.stringify(W.fixedValue(properties, discriminator));
    const bodies = Object.keys(properties)
      .sort(W.compare)
      .map((name) => {
        const id = W.operation(properties[name]);
        return id ? `\`${name}\` is ${operationPhrase(id)}` : null;
      })
      .filter(Boolean);
    return bodies.length ? `${value}, whose ${bodies.join(" and ")}` : value;
  });
  return `${subject} one of these, by \`${discriminator}\`: ${branches.join("; ")}.`;
}

// An input's doc as a sentence of its own: its first letter capitalized.
function sentence(text) {
  return text === "" ? text : text[0].toUpperCase() + text.slice(1);
}

module.exports = { WIDTH, wrap, doc, title, intro, inputText, sentence };
