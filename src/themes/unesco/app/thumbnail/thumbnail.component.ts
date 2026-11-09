import { CommonModule } from '@angular/common';
import {
  Component,
  Input,
  OnChanges,
  SimpleChanges,
} from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';

import { Item } from '../../../../app/core/shared/item.model';
import { ThemedLoadingComponent } from '../../../../app/shared/loading/themed-loading.component';
import { SafeUrlPipe } from '../../../../app/shared/utils/safe-url-pipe';
import { VarDirective } from '../../../../app/shared/utils/var.directive';
import { ThumbnailComponent as BaseComponent } from '../../../../app/thumbnail/thumbnail.component';

/**
 * Generated cover layout, modelled on the UNESDOC covers: 3:4 portrait,
 * scaled to the backend thumbnail size (thumbnail.maxheight = 480 in local.cfg).
 */
const COVER_WIDTH = 360;
const COVER_HEIGHT = 480;
const CENTER_X = COVER_WIDTH / 2;

/**
 * CSS rules embedded in the generated SVG
 */
const COVER_CSS =
  '.bg{fill:#fff7e6}' +
  '.band{fill:#0070cf}' +
  '.author{font:15px Arial,Helvetica,sans-serif;fill:#3c3c3c}' +
  '.title{font:34px Georgia,"Times New Roman",serif;fill:#0070cf}' +
  '.publisher{font:13px Arial,Helvetica,sans-serif;fill:#ffffff}' +
  '.i{font-style:italic}';

/**
 * A piece of text with its style: titles may contain <i>/<em> markup
 */
interface Run {
  text: string;
  italic: boolean;
}

type Word = Run[];

@Component({
  selector: 'ds-themed-thumbnail',
  styleUrls: ['../../../../app/thumbnail/thumbnail.component.scss'],
  templateUrl: './thumbnail.component.html',
  standalone: true,
  imports: [VarDirective, CommonModule, ThemedLoadingComponent, TranslateModule, SafeUrlPipe],
})
export class ThumbnailComponent extends BaseComponent implements OnChanges {

  /**
   * The Item this thumbnail belongs to; its metadata is used to generate a cover
   * when there is no thumbnail. Only available when this component is used directly
   * via <ds-themed-thumbnail>, since the core <ds-thumbnail> wrapper doesn't forward it.
   */
  @Input() item: Item;

  /**
   * SVG data URI of the generated cover, or undefined when no item was passed in
   * (in which case the blank image is shown).
   */
  coverSrc: string;

  /**
   * Alt text for the generated cover
   */
  coverAlt = '';

  ngOnChanges(changes: SimpleChanges): void {
    super.ngOnChanges(changes);
    this.coverSrc = this.buildCover();
  }

  private buildCover(): string | undefined {
    if (!this.item) {
      return undefined;
    }
    const value = (fields: string[]): string => (this.item.firstMetadataValue(fields) ?? '').trim();
    const author = value(['dc.contributor.author', 'dc.creator', 'dc.contributor.editor', 'dc.contributor']);
    const title = parseRichText(value(['dc.title']));
    const year = value(['dc.date.issued']).match(/\d{4}/)?.[0] ?? '';
    // e.g. "PCCF, 2003"
    const publisher = [value(['dc.publisher']), year].filter((part) => part).join(', ');
    this.coverAlt = title.map((run) => run.text).join('');

    // Author near the top (up to 2 lines)
    const authorLines = wrap([{ text: author, italic: false }], 38, 2);
    // Title centred around the middle of the cover (up to 3 lines)
    const titleLines = wrap(title, 17, 3);
    const titleLineHeight = 39;
    const titleFirstBaseline = 217 - ((titleLines.length - 1) * titleLineHeight) / 2;
    // Publisher in the curved band at the bottom (up to 2 lines)
    const publisherLines = wrap([{ text: publisher, italic: false }], 44, 2);
    const publisherFirstBaseline = publisherLines.length > 1 ? 440 : 448;

    const svg =
      `<svg xmlns="http://www.w3.org/2000/svg" width="${COVER_WIDTH}" height="${COVER_HEIGHT}" viewBox="0 0 ${COVER_WIDTH} ${COVER_HEIGHT}">` +
      `<style>${COVER_CSS}</style>` +
      `<rect class="bg" width="${COVER_WIDTH}" height="${COVER_HEIGHT}"/>` +
      `<rect class="band" width="${COVER_WIDTH}" height="10"/>` +
      `<path class="band" d="M0 426 Q${CENTER_X} 366 ${COVER_WIDTH} 426 V${COVER_HEIGHT} H0 Z"/>` +
      textBlock('author', authorLines, 63, 20) +
      textBlock('title', titleLines, titleFirstBaseline, titleLineHeight) +
      textBlock('publisher', publisherLines, publisherFirstBaseline, 17) +
      '</svg>';
    return 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svg);
  }
}

/**
 * Render centred lines of styled text as an SVG <text> element
 */
function textBlock(cssClass: string, lines: Run[][], firstBaseline: number, lineHeight: number): string {
  if (lines.length === 0) {
    return '';
  }
  const tspans = lines.map((line, i) => {
    const runs = line
      .map((run) => run.italic ? `<tspan class="i">${escapeXml(run.text)}</tspan>` : escapeXml(run.text))
      .join('');
    return `<tspan x="${CENTER_X}" dy="${i === 0 ? 0 : lineHeight}">${runs}</tspan>`;
  }).join('');
  return `<text class="${cssClass}" x="${CENTER_X}" y="${firstBaseline}" text-anchor="middle">${tspans}</text>`;
}

/**
 * Turn a metadata value that may contain <i>/<em> tags into styled runs.
 * Other tags are dropped and common HTML entities are decoded.
 */
function parseRichText(html: string): Run[] {
  const runs: Run[] = [];
  let italicDepth = 0;
  for (const part of html.split(/(<\/?(?:i|em)\b[^>]*>)/i)) {
    if (/^<\/(?:i|em)/i.test(part)) {
      italicDepth = Math.max(0, italicDepth - 1);
    } else if (/^<(?:i|em)\b/i.test(part)) {
      italicDepth++;
    } else if (part) {
      const text = decodeEntities(part.replace(/<[^>]*>/g, ''));
      if (text) {
        runs.push({ text, italic: italicDepth > 0 });
      }
    }
  }
  return runs;
}

function decodeEntities(text: string): string {
  return text
    .replace(/&nbsp;/g, ' ')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;|&apos;/g, '\'')
    .replace(/&amp;/g, '&');
}

function wordLength(word: Word): number {
  return word.reduce((n, run) => n + run.text.length, 0);
}

/**
 * Characters [start, end) of a word, keeping each character's style
 */
function sliceWord(word: Word, start: number, end: number): Word {
  const result: Word = [];
  let pos = 0;
  for (const run of word) {
    const from = Math.max(start, pos);
    const to = Math.min(end, pos + run.text.length);
    if (from < to) {
      result.push({ text: run.text.slice(from - pos, to - pos), italic: run.italic });
    }
    pos += run.text.length;
  }
  return result;
}

/**
 * Split styled runs into words, keeping the style of each piece
 * (a word can be partly italic, e.g. "<i>Nature</i>,")
 */
function toWords(runs: Run[]): Word[] {
  const words: Word[] = [];
  let current: Word = [];
  for (const run of runs) {
    for (const piece of run.text.split(/(\s+)/)) {
      if (/^\s+$/.test(piece)) {
        if (current.length) {
          words.push(current);
          current = [];
        }
      } else if (piece) {
        current.push({ text: piece, italic: run.italic });
      }
    }
  }
  if (current.length) {
    words.push(current);
  }
  return words;
}

/**
 * Join words into one line, merging neighbouring runs that share a style
 */
function joinWords(words: Word[]): Run[] {
  const line: Run[] = [];
  words.forEach((word, i) => {
    const pieces = i === 0 ? word : [{ text: ' ', italic: word[0].italic }, ...word];
    for (const run of pieces) {
      const last = line[line.length - 1];
      if (last && last.italic === run.italic) {
        last.text += run.text;
      } else {
        line.push({ ...run });
      }
    }
  });
  return line;
}

/**
 * Word-wrap styled text into at most maxLines lines of maxChars characters
 * (an average-character-width estimate); the last line is cut with an
 * ellipsis when the text doesn't fit.
 */
function wrap(runs: Run[], maxChars: number, maxLines: number): Run[][] {
  const lines: Word[][] = [];
  let current: Word[] = [];
  let currentLength = 0;
  for (let word of toWords(runs)) {
    // break words that are longer than a whole line
    while (wordLength(word) > maxChars) {
      if (current.length) {
        lines.push(current);
        current = [];
        currentLength = 0;
      }
      lines.push([sliceWord(word, 0, maxChars)]);
      word = sliceWord(word, maxChars, wordLength(word));
    }
    const length = wordLength(word);
    if (length === 0) {
      continue;
    }
    if (current.length && currentLength + 1 + length > maxChars) {
      lines.push(current);
      current = [];
      currentLength = 0;
    }
    current.push(word);
    currentLength += (currentLength ? 1 : 0) + length;
  }
  if (current.length) {
    lines.push(current);
  }

  const result = lines.slice(0, maxLines).map(joinWords);
  if (lines.length > maxLines) {
    // fill the last visible line with the remaining text, then cut it with an ellipsis
    const last = joinWords([].concat(...lines.slice(maxLines - 1)));
    const cut = sliceWord(last, 0, Math.min(wordLength(last), maxChars - 1));
    const lastRun = cut[cut.length - 1];
    if (lastRun) {
      lastRun.text = lastRun.text.replace(/\s+$/, '') + '…';
    }
    result[maxLines - 1] = cut;
  }
  return result;
}

function escapeXml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}
