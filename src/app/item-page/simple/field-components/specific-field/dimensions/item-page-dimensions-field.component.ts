import { Component, Input, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common'; // Import CommonModule

import { Item } from '../../../../../core/shared/item.model';
import { ItemPageFieldComponent } from '../item-page-field.component';
import { AsyncPipe } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { MetadataFieldWrapperComponent } from '../../../../../shared/metadata-field-wrapper/metadata-field-wrapper.component'; // Import MetadataFieldWrapperComponent

@Component({
  selector: 'ds-item-page-dimensions-field',
  templateUrl: './item-page-dimensions-field.component.html',
  standalone: true, // Mark the component as standalone
  imports: [CommonModule, AsyncPipe, TranslateModule, MetadataFieldWrapperComponent] // Import MetadataFieldWrapperComponent
})
/**
 * This component renders a Dimensions badge.
 * It expects 1 parameter: The item
 */
export class ItemPageDimensionsFieldComponent extends ItemPageFieldComponent implements AfterViewInit {
  // Is this hacky? It feels hacky. I can't figure out any other way to load the
  // Dimensions badge.js *after* Angular finishes rendering the DOM.
  ngAfterViewInit() {
    // Dimensions badge.js
    import('./badge.js');
    const initMethod = 'addBadges';
    window['__dimensions_embed'][initMethod]();
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
}
