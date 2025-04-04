import { CommonModule } from '@angular/common';
import { Component, ViewChildren, QueryList, AfterViewInit } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';

import { FileSectionComponent as BaseComponent } from '../../../../../../../app/item-page/simple/field-components/file-section/file-section.component';
import { slideSidebarPadding } from '../../../../../../../app/shared/animations/slide';
import { ThemedFileDownloadLinkComponent } from '../../../../../../../app/shared/file-download-link/themed-file-download-link.component';
import { ThemedLoadingComponent } from '../../../../../../../app/shared/loading/themed-loading.component';
import { MetadataFieldWrapperComponent } from '../../../../../../../app/shared/metadata-field-wrapper/metadata-field-wrapper.component';
import { FileSizePipe } from '../../../../../../../app/shared/utils/file-size-pipe';
import { VarDirective } from '../../../../../../../app/shared/utils/var.directive';
import { BitstreamDownloadCounterComponent } from '../../../../bitstream-download-counter/bitstream-download-counter.component'; // Import the standalone component

@Component({
  selector: 'ds-themed-item-page-file-section',
  templateUrl: './file-section.component.html',
  // templateUrl: '../../../../../../../app/item-page/simple/field-components/file-section/file-section.component.html',
  animations: [slideSidebarPadding],
  standalone: true,
  imports: [
    CommonModule,
    ThemedFileDownloadLinkComponent,
    MetadataFieldWrapperComponent,
    ThemedLoadingComponent,
    TranslateModule,
    FileSizePipe,
    VarDirective,
    BitstreamDownloadCounterComponent, // Add the imported component to the imports array
  ],
})
export class FileSectionComponent extends BaseComponent implements AfterViewInit {
  @ViewChildren('downloadCounter') downloadCounterComponents: QueryList<BitstreamDownloadCounterComponent>;
  downloadCounterComponentMap: { [key: string]: BitstreamDownloadCounterComponent } = {};

  ngAfterViewInit(): void {
    this.downloadCounterComponents.forEach(component => {
      if (component.bitstream?.id) {
        this.downloadCounterComponentMap[component.bitstream.id] = component;
      }
    });
  }
}
