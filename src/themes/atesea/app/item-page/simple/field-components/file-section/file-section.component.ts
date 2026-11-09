import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { NgbTooltipModule } from '@ng-bootstrap/ng-bootstrap';
import { TranslateModule } from '@ngx-translate/core';

import { FileSectionComponent as BaseComponent } from '../../../../../../../app/item-page/simple/field-components/file-section/file-section.component';
import { slideSidebarPadding } from '../../../../../../../app/shared/animations/slide';
import { ThemedFileDownloadLinkComponent } from '../../../../../../../app/shared/file-download-link/themed-file-download-link.component';
import { ThemedLoadingComponent } from '../../../../../../../app/shared/loading/themed-loading.component';
import { MetadataFieldWrapperComponent } from '../../../../../../../app/shared/metadata-field-wrapper/metadata-field-wrapper.component';
import { FileSizePipe } from '../../../../../../../app/shared/utils/file-size-pipe';
import { VarDirective } from '../../../../../../../app/shared/utils/var.directive';


@Component({
  selector: 'ds-themed-item-page-file-section',
  templateUrl: './file-section.component.html',
  animations: [slideSidebarPadding],
  imports: [
    CommonModule,
    FileSizePipe,
    MetadataFieldWrapperComponent,
    NgbTooltipModule,
    ThemedFileDownloadLinkComponent,
    ThemedLoadingComponent,
    TranslateModule,
    VarDirective,
  ],
})
export class FileSectionComponent extends BaseComponent {

  /**
   * Values of dc.relation.uri. When present, the section is headed
   * "View/Download" and shown even if the item has no files.
   */
  get relationUris(): string[] {
    return (this.item?.allMetadataValues('dc.relation.uri') ?? [])
      .map((value) => value?.trim())
      .filter((value) => !!value);
  }

  /**
   * Tooltip placements, tried in order: the first that fits in the viewport is used,
   * so the tooltip sits beside the link instead of covering it on small screens.
   */
  readonly tooltipPlacement = ['top', 'bottom', 'end', 'start'];

  /**
   * Display text for a relation URI: only the domain,
   * e.g. "https://example.com/myfiles/file.pdf" → "example.com".
   */
  getUriLabel(uri: string): string {
    try {
      return new URL(uri).hostname;
    } catch {
      // Not a parseable URL: strip protocol and anything after the first "/", "?" or "#"
      return uri.replace(/^https?:\/\//i, '').split(/[/?#]/)[0];
    }
  }
}
