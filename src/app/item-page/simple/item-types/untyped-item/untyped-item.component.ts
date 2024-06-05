import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { Item } from '../../../../core/shared/item.model';
import { ViewMode } from '../../../../core/shared/view-mode.model';
import { listableObjectComponent } from '../../../../shared/object-collection/shared/listable-object/listable-object.decorator';
import { ItemComponent } from '../shared/item.component';

/**
 * Component that represents a publication Item page
 */

@listableObjectComponent(Item, ViewMode.StandalonePage)
@Component({
  selector: 'ds-untyped-item',
  styleUrls: ['./untyped-item.component.scss'],
  templateUrl: './untyped-item.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UntypedItemComponent extends ItemComponent {
  @Input() item: Item;
  /**
   * Helper function to extract the hostname from a URI.
   * @type {string}
   */
  parseUrl(url: string) {
    const regex = url.match(/^https?\:\/\/([^\/?#]+)(?:[\/?#]|$)/i);
    return regex && regex[1];
    }
}
