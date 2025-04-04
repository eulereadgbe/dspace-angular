  // This component provided to Virginia Tech courtesy
  // of UMD DRUM repository and is used in conjunction with
  // Bitstream download displays.
  import { Component, Input, OnInit, inject } from '@angular/core';
  import { Bitstream } from '../../../../app/core/shared/bitstream.model';
  import { Observable, map } from 'rxjs'; // Import the map operator
  import { UsageReportDataService } from '../../../../app/core/statistics/usage-report-data.service';
  import { UsageReport } from '../../../../app/core/statistics/models/usage-report.model';
  import { AsyncPipe, DecimalPipe } from '@angular/common';

  @Component({
    selector: 'ds-bitstream-download-counter',
    template: `{{ label }} {{ downloadCount | number: '1.0-0' }}`, // Format with DecimalPipe
    standalone: true,
    imports: [AsyncPipe, DecimalPipe],
  })
  export class BitstreamDownloadCounterComponent implements OnInit {
    @Input() bitstream: Bitstream;
    @Input() label: string;

    downloadsReport$: Observable<number>;
    usageReportService = inject(UsageReportDataService);
    downloadCount: number = 0;

  ngOnInit(): void {
    if (this.bitstream?.id) {
      this.downloadsReport$ = this.usageReportService.getStatistic(
        this.bitstream.id,
        'TotalDownloads'
      ).pipe(
        map(report => report?.points[0]?.values?.[0]?.views || 0) // Extract count and optional chaining
      );

      this.downloadsReport$.subscribe(count => {
        this.downloadCount = count;
      });
      } else {
        console.warn('Bitstream ID is missing, cannot fetch download statistics.');
        this.downloadsReport$ = new Observable<number>(); // Or a default empty observable
      }
    }
  }
