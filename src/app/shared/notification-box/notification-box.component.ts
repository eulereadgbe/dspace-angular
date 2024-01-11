import { Component, Input } from '@angular/core';
import {
  AdminNotifyMetricsBox
} from '../../admin/admin-notify-dashboard/admin-notify-metrics/admin-notify-metrics.model';
import { listableObjectComponent } from '../object-collection/shared/listable-object/listable-object.decorator';
import {
  AdminNotifySearchResult
} from '../../admin/admin-notify-dashboard/models/admin-notify-message-search-result.model';
import { ViewMode } from '../../core/shared/view-mode.model';

@listableObjectComponent(AdminNotifySearchResult, ViewMode.ListElement)
@Component({
  selector: 'ds-notification-box',
  templateUrl: './notification-box.component.html',
  styleUrls: ['./notification-box.component.scss']
})
export class NotificationBoxComponent {
  @Input() boxConfig: AdminNotifyMetricsBox;
}
