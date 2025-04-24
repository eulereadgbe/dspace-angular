import {
  AsyncPipe,
  NgIf,
  KeyValuePipe,
  NgForOf,
  CommonModule,
} from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  Input,
  OnInit,
  OnDestroy,
  ElementRef,
  ViewChild,
  Inject,
} from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { RouteService } from '../../../../../../../app/core/services/route.service'; // Import RouteService
import { TranslateModule } from '@ngx-translate/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap'; // Import NgbModal

import { Context } from '../../../../../../../app/core/shared/context.model';
import { Item } from '../../../../../../../app/core/shared/item.model';
import { ViewMode } from '../../../../../../../app/core/shared/view-mode.model';
import { CollectionsComponent } from '../../../../../../../app/item-page/field-components/collections/collections.component';
import { ThemedMediaViewerComponent } from '../../../../../../../app/item-page/media-viewer/themed-media-viewer.component';
import { MiradorViewerComponent } from '../../../../../../../app/item-page/mirador-viewer/mirador-viewer.component';
import { ThemedFileSectionComponent } from '../../../../../../../app/item-page/simple/field-components/file-section/themed-file-section.component';
import { ItemPageAbstractFieldComponent } from '../../../../../../../app/item-page/simple/field-components/specific-field/abstract/item-page-abstract-field.component';
import { ItemPageCcLicenseFieldComponent } from '../../../../../../../app/item-page/simple/field-components/specific-field/cc-license/item-page-cc-license-field.component';
import { ItemPageDateFieldComponent } from '../../../../../../../app/item-page/simple/field-components/specific-field/date/item-page-date-field.component';
import { GenericItemPageFieldComponent } from '../../../../../../../app/item-page/simple/field-components/specific-field/generic/generic-item-page-field.component';
import { ThemedItemPageTitleFieldComponent } from '../../../../../../../app/item-page/simple/field-components/specific-field/title/themed-item-page-field.component';
import { ItemPageUriFieldComponent } from '../../../../../../../app/item-page/simple/field-components/specific-field/uri/item-page-uri-field.component';
import { UntypedItemComponent as BaseComponent } from '../../../../../../../app/item-page/simple/item-types/untyped-item/untyped-item.component';
import { ThemedMetadataRepresentationListComponent } from '../../../../../../../app/item-page/simple/metadata-representation-list/themed-metadata-representation-list.component';
import { DsoEditMenuComponent } from '../../../../../../../app/shared/dso-page/dso-edit-menu/dso-edit-menu.component';
import { MetadataFieldWrapperComponent } from '../../../../../../../app/shared/metadata-field-wrapper/metadata-field-wrapper.component';
import { listableObjectComponent } from '../../../../../../../app/shared/object-collection/shared/listable-object/listable-object.decorator';
import { ThemedResultsBackButtonComponent } from '../../../../../../../app/shared/results-back-button/themed-results-back-button.component';
import { ThemedThumbnailComponent } from '../../../../../../../app/thumbnail/themed-thumbnail.component';
import { ItemPageSdgFieldComponent } from '../../../../../../../app/item-page/simple/field-components/specific-field/sdg/item-page-sdg-field.component';
import { ItemPageMetadataSearchLinkFieldComponent } from '../../../../../../../app/item-page/simple/field-components/specific-field/metadata-search-link/item-page-metadata-search-link-field.component';
import { ItemPageOdcFieldComponent } from '../../../../../../../app/item-page/simple/field-components/specific-field/odc/item-page-odc-field.component';
import { ItemPageAltmetricFieldComponent } from '../../../../../../../app/item-page/simple/field-components/specific-field/altmetric/item-page-altmetric-field.component';
import { ItemPageDimensionsFieldComponent } from '../../../../../../../app/item-page/simple/field-components/specific-field/dimensions/item-page-dimensions-field.component';
import { ItemPageShareFieldComponent } from '../../../../../../../app/item-page/simple/field-components/specific-field/share/item-page-share-field.component';
import { getItemPageRoute } from '../../../../../../../app/item-page/item-page-routing-paths';
import { map, takeUntil } from 'rxjs/operators';
import { Observable, of, Subject } from 'rxjs';
import { getAllSucceededRemoteDataPayload } from '../../../../../../../app/core/shared/operators';

@listableObjectComponent(Item, ViewMode.StandalonePage, Context.Any, 'unesco')
@Component({
  selector: 'ds-untyped-item',
  styleUrls: ['./untyped-item.component.scss'],
  templateUrl: './untyped-item.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  imports: [
    CommonModule,
    NgIf,
    ThemedResultsBackButtonComponent,
    MiradorViewerComponent,
    ThemedItemPageTitleFieldComponent,
    DsoEditMenuComponent,
    MetadataFieldWrapperComponent,
    ThemedThumbnailComponent,
    ThemedMediaViewerComponent,
    ThemedFileSectionComponent,
    ItemPageDateFieldComponent,
    ThemedMetadataRepresentationListComponent,
    GenericItemPageFieldComponent,
    ItemPageAbstractFieldComponent,
    ItemPageUriFieldComponent,
    CollectionsComponent,
    RouterLink,
    AsyncPipe,
    TranslateModule,
    ItemPageCcLicenseFieldComponent,
    KeyValuePipe,
    NgForOf,
    ItemPageSdgFieldComponent,
    ItemPageOdcFieldComponent,
    ItemPageAltmetricFieldComponent,
    ItemPageDimensionsFieldComponent,
    ItemPageMetadataSearchLinkFieldComponent,
    ItemPageShareFieldComponent,
  ],
})
export class UntypedItemComponent extends BaseComponent implements OnInit, OnDestroy {
  @Input() item: Item;

  modalUrl: string | null = null;
  closing = false;

  hasOriginalBitstream$: Observable<boolean> = of(false);
  itemPageRoute: string;

  @ViewChild('customModalOverlay') modalOverlayRef: ElementRef<HTMLDivElement>;

  private destroyed$: Subject<boolean> = new Subject<boolean>();

  constructor(
    protected routeService: RouteService,
    protected router: Router,
    private modalService: NgbModal // Inject NgbModal
  ) {
    super(routeService, router);
  }

  ngOnInit(): void {
    super.ngOnInit();
    this.hasOriginalBitstream$ = this.object.bundles.pipe(
      getAllSucceededRemoteDataPayload(),
      map((bundleList) => {
        const bundles = bundleList.page;
        return bundles?.some(b =>
          b.name === 'ORIGINAL' && Array.isArray(b.bitstreams) && b.bitstreams.length > 0
        ) ?? false;
      })
    );
    this.itemPageRoute = `/items/${this.object.uuid}`;
    window.addEventListener('keydown', this.handleEscapeKey);
  }

  ngOnDestroy(): void {
    this.destroyed$.next(true);
    this.destroyed$.complete();
    window.removeEventListener('keydown', this.handleEscapeKey);
  }

  parseUrl(url: string): string | null {
    const regex = url.match(/^https?:\/\/([^\/?#]+)(?:[\/?#]|$)/i);
    return regex?.[1] ?? null;
  }

  hasRelationUri(): boolean {
    return !!this.object?.metadata['dc.relation.uri']?.length;
  }

  private modalRef: any; // To store the NgbModalRef

  openModal(modalContent: any, url: string): void {
    this.modalUrl = url;
    this.closing = false;
    this.modalRef = this.modalService.open(modalContent, { size: 'lg' });
  }

  closeModal(): void {
      this.closing = true;
      if (this.modalRef) {
        this.modalRef.dismiss(); // Or this.modalRef.close() depending on your use case
        this.modalRef = null; // Clear the reference
      }
      // We no longer need to manually remove 'modal-open-noscroll' here,
      // ng-bootstrap usually handles body class management.
      this.modalUrl = null;
      this.closing = false;
    }

  handleEscapeKey = (event: KeyboardEvent): void => {
    if (event.key === 'Escape') {
      this.closeModal();
    }
  };
}
