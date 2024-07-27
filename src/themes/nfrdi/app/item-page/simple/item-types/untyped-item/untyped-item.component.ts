import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { Item } from '../../../../../../../app/core/shared/item.model';
import { ViewMode } from '../../../../../../../app/core/shared/view-mode.model';
import {
  listableObjectComponent
} from '../../../../../../../app/shared/object-collection/shared/listable-object/listable-object.decorator';
import { Context } from '../../../../../../../app/core/shared/context.model';
import {
  UntypedItemComponent as BaseComponent
} from '../../../../../../../app/item-page/simple/item-types/untyped-item/untyped-item.component';

/**
 * Component that represents an untyped Item page
 */
@listableObjectComponent(Item, ViewMode.StandalonePage, Context.Any, 'nfrdi')
@Component({
  selector: 'ds-untyped-item',
  // styleUrls: ['./untyped-item.component.scss'],
  styleUrls: ['../../../../../../../app/item-page/simple/item-types/untyped-item/untyped-item.component.scss'],
  templateUrl: './untyped-item.component.html',
  // templateUrl: '../../../../../../../app/item-page/simple/item-types/untyped-item/untyped-item.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UntypedItemComponent extends BaseComponent {
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
