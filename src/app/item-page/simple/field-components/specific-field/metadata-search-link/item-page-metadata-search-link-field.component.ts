import { Component, Input } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { Item } from '../../../../../core/shared/item.model';
import { ItemPageFieldComponent } from '../item-page-field.component';
import { MetadataFieldWrapperComponent } from '../../../../../shared/metadata-field-wrapper/metadata-field-wrapper.component';

@Component({
  selector: 'ds-item-page-metadata-search-link',
  templateUrl: './item-page-metadata-search-link-field.component.html',
  standalone: true,
  imports: [
    CommonModule,
    TranslateModule,
    RouterModule,
    MetadataFieldWrapperComponent,
  ],
})
/**
 * This component renders a Discovery search link for a metadata value.
 * It expects 4 parameters: The item, a separator, the metadata keys and an i18n key
 */
export class ItemPageMetadataSearchLinkFieldComponent extends ItemPageFieldComponent {

  /**
   * The item to display metadata for
   */
  @Input() item: Item;

  /**
   * Separator string between multiple values of the metadata fields defined
   * @type {string}
   */
  @Input() separator: string;

  /**
   * Fields (schema.element.qualifier) used to render their values.
   */
  @Input() fields: string[];

  /**
   * Label i18n key for the rendered metadata
   */
  @Input() label: string;

  /**
   * Name of index from discovery.xml
   */
  @Input() index: string;

  /**
   * Helper function to generate a search link for the metadata value using its
   * Discovery index.
   * @type {string}
   */
  generateSearchParams(metadataValue: string, discoveryIndex: string) {
      const searchFilter = 'f.' + discoveryIndex;
      const searchValue = metadataValue + ',equals';

      // Debugging logs
      console.log(`Metadata Value: ${metadataValue}`);
      console.log(`Discovery Index: ${discoveryIndex}`);
      console.log(`Search Filter: ${searchFilter}`);
      console.log(`Search Value: ${searchValue}`);

      // Note the special syntax for searchFilter, since we want to use the
      // string value of the searchFilter variable as the object key, not a
      // literal "searchFilter".
      return { [searchFilter]: searchValue };
  }
}
