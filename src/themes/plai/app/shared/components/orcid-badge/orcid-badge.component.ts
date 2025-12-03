import { Component, Input, OnChanges, SimpleChanges, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { OrcidAuthorityService } from '../../../core/services/orcid-authority.service';
import { NgbTooltipModule } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'plai-orcid-badge',
  standalone: true,
  imports: [CommonModule, NgbTooltipModule],
  templateUrl: './orcid-badge.component.html',
})
export class OrcidBadgeComponent implements OnChanges {
  @Input() authorityId: string | null = null;
  orcid: string | null = null;
  loading = false;

  // Inject ChangeDetectorRef
  constructor(private orcidService: OrcidAuthorityService, private cdr: ChangeDetectorRef) {}

  ngOnChanges(changes: SimpleChanges) {
    if (changes.authorityId && this.authorityId) {
      this.loading = true;
      this.orcidService.getOrcidId(this.authorityId).subscribe(id => {
        this.orcid = id;
        this.loading = false;
        this.cdr.detectChanges();
      });
    } else {
      this.orcid = null;
    }
  }
}
