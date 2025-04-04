  // This component provided to Virginia Tech courtesy
  // of UMD DRUM repository and is used in conjunction with
  // Bitstream download displays.
  import { Component, Input, OnInit, inject } from '@angular/core';
  import { Bitstream } from '../../../../app/core/shared/bitstream.model';
  import { Observable } from 'rxjs';
  import { UsageReportDataService } from '../../../../app/core/statistics/usage-report-data.service';
  import { UsageReport } from '../../../../app/core/statistics/models/usage-report.model';
  import { AsyncPipe } from '@angular/common';

  @Component({
    selector: 'ds-bitstream-download-counter',
    template: `{{ label }} {{ (downloadsReport$ | async)?.points[0]?.values?.views }}`,
    standalone: true,
    imports: [AsyncPipe],
  })
  export class BitstreamDownloadCounterComponent implements OnInit {
    @Input() bitstream: Bitstream;
    @Input() label: string;

    downloadsReport$: Observable<UsageReport>;
    usageReportService = inject(UsageReportDataService);

    ngOnInit(): void {
      if (this.bitstream?.id) {
        this.downloadsReport$ = this.usageReportService.getStatistic(
          this.bitstream.id,
          'TotalDownloads'
        );
      } else {
        console.warn('Bitstream ID is missing, cannot fetch download statistics.');
        this.downloadsReport$ = new Observable<UsageReport>(); // Or a default empty observable
      }
    }
  }
