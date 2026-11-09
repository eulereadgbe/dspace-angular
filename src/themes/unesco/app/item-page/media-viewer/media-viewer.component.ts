import {
  AsyncPipe,
  NgIf,
} from '@angular/common';
import { Component } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';

import { MediaViewerComponent as BaseComponent } from '../../../../../app/item-page/media-viewer/media-viewer.component';
import { ThemedMediaViewerImageComponent } from '../../../../../app/item-page/media-viewer/media-viewer-image/themed-media-viewer-image.component';
import { ThemedMediaViewerVideoComponent } from '../../../../../app/item-page/media-viewer/media-viewer-video/themed-media-viewer-video.component';
import { ThemedLoadingComponent } from '../../../../../app/shared/loading/themed-loading.component';
import { VarDirective } from '../../../../../app/shared/utils/var.directive';
// eslint-disable-next-line dspace-angular-ts/themed-component-usages -- use the unesco thumbnail directly: the core wrapper does not forward [item]
import { ThumbnailComponent } from '../../thumbnail/thumbnail.component';

/**
 * Media viewer that shows a cover generated from the item's metadata
 * when the item has no THUMBNAIL bitstream.
 */
@Component({
  selector: 'ds-themed-media-viewer',
  templateUrl: './media-viewer.component.html',
  styleUrls: ['../../../../../app/item-page/media-viewer/media-viewer.component.scss'],
  standalone: true,
  imports: [
    ThemedMediaViewerImageComponent,
    // eslint-disable-next-line dspace-angular-ts/themed-component-usages
    ThumbnailComponent,
    AsyncPipe,
    NgIf,
    ThemedMediaViewerVideoComponent,
    TranslateModule,
    ThemedLoadingComponent,
    VarDirective,
  ],
})
export class MediaViewerComponent extends BaseComponent {
}
