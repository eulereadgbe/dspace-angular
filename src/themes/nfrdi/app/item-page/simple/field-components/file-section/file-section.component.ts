import { Component } from '@angular/core';
import { slideSidebarPadding } from '../../../../../../../app/shared/animations/slide';
import { FileSectionComponent as BaseComponent } from '../../../../../../../app/item-page/simple/field-components/file-section/file-section.component';
import { UsageReportDataService } from '../../../../../../../app/core/statistics/usage-report-data.service';

@Component({
    selector: 'ds-item-page-file-section',
    templateUrl: './file-section.component.html',
    // templateUrl: '../../../../../../../app/item-page/simple/field-components/file-section/file-section.component.html',
    animations: [slideSidebarPadding],
    providers: [UsageReportDataService],
})
export class FileSectionComponent extends BaseComponent {

}
