import { Component, Input, AfterViewInit } from '@angular/core';

import { Item } from '../../../../../core/shared/item.model';
import { ItemPageFieldComponent } from '../item-page-field.component';
declare function addWidget(): any;
@Component({
  selector: 'ds-item-page-plumx-field',
  templateUrl: './item-page-plumx-field.component.html'
})
/**
 * This component renders an Plumx widget.
 * It expects 1 parameter: The item
 */
export class ItemPagePlumxFieldComponent extends ItemPageFieldComponent implements AfterViewInit {
  ngAfterViewInit() {
    // Plumx widget-details.js
    import('./widget-details.js');
    addWidget();
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
