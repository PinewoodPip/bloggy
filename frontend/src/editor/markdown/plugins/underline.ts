/**
 * Forked and modified from https://github.com/mdit-plugins/mdit-plugins/blob/main/packages/ins/src/plugin.ts
 */

import type { PluginSimple } from "markdown-it";
import type { RuleInline } from "markdown-it/lib/parser_inline.mjs";
import type StateInline from "markdown-it/lib/rules_inline/state_inline.mjs";
import type { Delimiter } from "markdown-it/lib/rules_inline/state_inline.mjs";

/*
 * Insert each marker as a separate text token, and add it to delimiter list
 *
 */
const tokenize: RuleInline = (state, silent) => {
  const start = state.pos;
  const marker = state.src.charAt(start);

  if (silent || marker !== "_") return false;

  const scanned = state.scanDelims(state.pos, true);
  let { length } = scanned;

  if (length < 2) return false;

  if (length % 2) {
    const token = state.push("text", "", 0);

    token.content = marker;
    length--;
  }

  for (let i = 0; i < length; i += 2) {
    const token = state.push("text", "", 0);

    token.content = marker + marker;

    if (scanned.can_open || scanned.can_close)
      state.delimiters.push({
        marker: 0x5F, // _
        length: 0, // disable "rule of 3" length checks meant for emphasis
        token: state.tokens.length - 1,
        end: -1,
        open: scanned.can_open,
        close: scanned.can_close,
      });
  }

  state.pos += scanned.length;

  return true;
};

/*
 * Walk through delimiter list and replace text tokens with tags
 *
 */
const postProcess = (state: StateInline, delimiters: Delimiter[]): void => {
  let token;
  const loneMarkers = [];
  const max = delimiters.length;

  for (let i = 0; i < max; i++) {
    const startDelim = delimiters[i];

    if (startDelim.marker === 0x5F /* _ */ && startDelim.end !== -1) {
      const endDelim = delimiters[startDelim.end];

      token = state.tokens[startDelim.token];
      token.type = "underline_open";
      token.tag = "u";
      token.nesting = 1;
      token.markup = "__";
      token.content = "";

      token = state.tokens[endDelim.token];
      token.type = "underline_close";
      token.tag = "u";
      token.nesting = -1;
      token.markup = "__";
      token.content = "";

      if (
        state.tokens[endDelim.token - 1].type === "text" &&
        state.tokens[endDelim.token - 1].content === "_"
      )
        loneMarkers.push(endDelim.token - 1);
    }
  }

  /*
   * If a marker sequence has an odd number of characters, it’s splitted
   * like this: `~~~~~` -> `~` + `~~` + `~~`, leaving one marker at the
   * start of the sequence.
   *
   * So, we have to move all those markers after subsequent s_close tags.
   *
   */
  while (loneMarkers.length) {
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const i = loneMarkers.pop()!;
    let j = i + 1;

    while (j < state.tokens.length && state.tokens[j].type === "underline_close") j++;

    j--;

    if (i !== j) {
      token = state.tokens[j];
      state.tokens[j] = state.tokens[i];
      state.tokens[i] = token;
    }
  }
};

export const plugin: PluginSimple = (md) => {
  // Must run after bold/emphasis as CommonMark uses __ as an alias for it
  md.inline.ruler.after("emphasis", "underline", tokenize);
  md.inline.ruler2.after("emphasis", "underline", (state) => {
    postProcess(state, state.delimiters);

    for (const tokenMeta of state.tokens_meta) {
      if (tokenMeta?.delimiters) postProcess(state, tokenMeta.delimiters);
    }

    return true;
  });
};