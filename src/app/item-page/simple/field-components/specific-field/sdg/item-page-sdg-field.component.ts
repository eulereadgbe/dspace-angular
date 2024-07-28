import { Component, Input } from '@angular/core';

import { Item } from '../../../../../core/shared/item.model';
import { ItemPageFieldComponent } from '../item-page-field.component';

@Component({
  selector: 'ds-item-page-sdg-field',
  styleUrls: ['./item-page-sdg-field.component.scss'],
  templateUrl: './item-page-sdg-field.component.html'
})
/**
 * This component renders a UN SDG icon.
 * It expects 3 parameters: The item, the metadata keys and an i18n key
 */
export class ItemPageSdgFieldComponent extends ItemPageFieldComponent {

  /**
   * The item to display metadata for
   */
  @Input() item: Item;

  /**
   * Fields (schema.element.qualifier) used to render their values.
   */
  @Input() fields: string[];

  /**
   * Label i18n key for the rendered metadata
   */
  @Input() label: string;

  /**
   * Helper function to extract the number from an SDG metadata value from
   * inside the component's HTML. For example, given "SDG 2 - Zero hunger",
   * will return "02" (because our SDG icon assets are zero padded).
   * @type {string}
   */
  calculateSdgNumber(sdg: string) {
    return sdg.match(/[0-9]+/)[0].padStart(2, '0');
  }
}
