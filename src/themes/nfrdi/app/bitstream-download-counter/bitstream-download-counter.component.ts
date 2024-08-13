// This component provided to Virginia Tech courtesy
// of UMD DRUM repository and is used in conjunction with
// Bitstream download displays.
import {Component, Input, OnInit} from '@angular/core';
import {Bitstream} from '../../../../app/core/shared/bitstream.model';
import {Observable} from 'rxjs';
import {UsageReportDataService} from '../../../../app/core/statistics/usage-report-data.service';
import {UsageReport} from '../../../../app/core/statistics/models/usage-report.model';

@Component({
  template: `{{label}} {{(downloadsReport$ | async)?.points[0].values.views}}`,
  selector: 'ds-bitstream-download-counter'
})
export class BitstreamDownloadCounterComponent implements OnInit {
  @Input() bitstream: Bitstream;

  @Input() label: string;

  downloadsReport$: Observable<UsageReport>;

  constructor(
    protected usageReportService: UsageReportDataService
  ) {
  }

  ngOnInit(): void {
    this.downloadsReport$ = this.usageReportService.getStatistic(this.bitstream.id, 'TotalDownloads');
  }

}
