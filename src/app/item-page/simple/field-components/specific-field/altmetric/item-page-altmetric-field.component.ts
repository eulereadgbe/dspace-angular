import { Component, Input, AfterViewInit } from '@angular/core';

import { Item } from '../../../../../core/shared/item.model';
import { ItemPageFieldComponent } from '../item-page-field.component';

@Component({
  selector: 'ds-item-page-altmetric-field',
  templateUrl: './item-page-altmetric-field.component.html'
})
/**
 * This component renders an Altmetric badge.
 * It expects 1 parameter: The item
 */
export class ItemPageAltmetricFieldComponent extends ItemPageFieldComponent implements AfterViewInit {
  // Is this hacky? It feels hacky. I can't figure out any other way to load the
  // Altmetric embed.js *after* Angular finishes rendering the DOM.
  ngAfterViewInit() {
    // Altmetric embed.js
    import('./embed.js');
    window['_altmetric_embed_init']();
  }

  /**
   * The item to display metadata for
   */
  @Input() item: Item;

  /**
   * Helper function to extract the DOI itself from a URI. Should return the
   * DOI component for any variation of http, https, dx.doi.org, and doi.org.
   * @type {string}
   */
  parseDoi(doi: string) {
    const regex = /https?:\/\/(dx\.)?doi\.org\//gi;
    return doi.replace(regex, '');
  }

  /**
   * Helper function to extract the Handle itself from a URI.
   * @type {string}
   */
  parseHandle(handle: string) {
    const regex = /https?:\/\/hdl\.handle\.net\//gi;
    return handle.replace(regex, '');
  }
}
