import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common'; // Import CommonModule
import { Item } from '../../../../../core/shared/item.model';
import { ItemPageFieldComponent } from '../item-page-field.component';
// Import any other modules/components/pipes used in the template
// For example, if you use RouterLink:
// import { RouterLink } from '@angular/router';

@Component({
  selector: 'ds-item-page-share-field',
  styleUrls: ['../../../../../shared/metadata-field-wrapper/metadata-field-wrapper.component.scss'],
  templateUrl: './item-page-share-field.component.html',
  standalone: true,
  imports: [
    CommonModule, // Add CommonModule to imports
    // RouterLink, // If used in the template
    // OtherStandaloneComponent,
    // SomeStandalonePipe,
  ],
})
/**
 * This component renders share icons.
 * It expects 1 parameter: The item
 */
export class ItemPageShareFieldComponent extends ItemPageFieldComponent {

  /**
   * The item to display metadata for
   */
  @Input() item: Item;
}
