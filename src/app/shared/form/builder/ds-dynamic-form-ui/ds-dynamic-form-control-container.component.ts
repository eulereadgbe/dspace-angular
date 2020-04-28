import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  ComponentFactoryResolver,
  ContentChildren,
  EventEmitter,
  Input,
  NgZone,
  OnChanges,
  OnDestroy,
  OnInit,
  Output,
  QueryList,
  SimpleChanges,
  Type,
  ViewChild,
  ViewContainerRef
} from '@angular/core';
import { FormGroup, FormArray } from '@angular/forms';

import {
  DYNAMIC_FORM_CONTROL_TYPE_ARRAY,
  DYNAMIC_FORM_CONTROL_TYPE_CHECKBOX,
  DYNAMIC_FORM_CONTROL_TYPE_CHECKBOX_GROUP,
  DYNAMIC_FORM_CONTROL_TYPE_DATEPICKER,
  DYNAMIC_FORM_CONTROL_TYPE_GROUP,
  DYNAMIC_FORM_CONTROL_TYPE_INPUT,
  DYNAMIC_FORM_CONTROL_TYPE_RADIO_GROUP,
  DYNAMIC_FORM_CONTROL_TYPE_SELECT,
  DYNAMIC_FORM_CONTROL_TYPE_TEXTAREA,
  DYNAMIC_FORM_CONTROL_TYPE_TIMEPICKER,
  DynamicDatePickerModel, DynamicFormComponentService,
  DynamicFormControl,
  DynamicFormControlContainerComponent,
  DynamicFormControlEvent, DynamicFormControlEventType,
  DynamicFormControlModel,
  DynamicFormLayout,
  DynamicFormLayoutService, DynamicFormRelationService,
  DynamicFormValidationService,
  DynamicTemplateDirective, DynamicFormArrayGroupModel, DynamicFormArrayModel,
} from '@ng-dynamic-forms/core';
import {
  DynamicNGBootstrapCalendarComponent,
  DynamicNGBootstrapCheckboxComponent,
  DynamicNGBootstrapCheckboxGroupComponent,
  DynamicNGBootstrapInputComponent,
  DynamicNGBootstrapRadioGroupComponent,
  DynamicNGBootstrapSelectComponent,
  DynamicNGBootstrapTextAreaComponent,
  DynamicNGBootstrapTimePickerComponent
} from '@ng-dynamic-forms/ui-ng-bootstrap';
import { TranslateService } from '@ngx-translate/core';
import { ReorderableRelationship } from './existing-metadata-list-element/existing-metadata-list-element.component';

import { DYNAMIC_FORM_CONTROL_TYPE_TYPEAHEAD } from './models/typeahead/dynamic-typeahead.model';
import { DYNAMIC_FORM_CONTROL_TYPE_SCROLLABLE_DROPDOWN } from './models/scrollable-dropdown/dynamic-scrollable-dropdown.model';
import { DYNAMIC_FORM_CONTROL_TYPE_TAG } from './models/tag/dynamic-tag.model';
import { DYNAMIC_FORM_CONTROL_TYPE_DSDATEPICKER } from './models/date-picker/date-picker.model';
import { DYNAMIC_FORM_CONTROL_TYPE_LOOKUP } from './models/lookup/dynamic-lookup.model';
import { DynamicListCheckboxGroupModel } from './models/list/dynamic-list-checkbox-group.model';
import { DynamicListRadioGroupModel } from './models/list/dynamic-list-radio-group.model';
import { hasNoValue, hasValue, isEmpty, isNotEmpty, isNotUndefined } from '../../../empty.util';
import { DYNAMIC_FORM_CONTROL_TYPE_LOOKUP_NAME } from './models/lookup/dynamic-lookup-name.model';
import { DsDynamicTagComponent } from './models/tag/dynamic-tag.component';
import { DsDatePickerComponent } from './models/date-picker/date-picker.component';
import { DsDynamicListComponent } from './models/list/dynamic-list.component';
import { DsDynamicTypeaheadComponent } from './models/typeahead/dynamic-typeahead.component';
import { DsDynamicScrollableDropdownComponent } from './models/scrollable-dropdown/dynamic-scrollable-dropdown.component';
import { DsDynamicLookupComponent } from './models/lookup/dynamic-lookup.component';
import { DsDynamicFormGroupComponent } from './models/form-group/dynamic-form-group.component';
import { DsDynamicFormArrayComponent } from './models/array-group/dynamic-form-array.component';
import { DsDynamicRelationGroupComponent } from './models/relation-group/dynamic-relation-group.components';
import { DYNAMIC_FORM_CONTROL_TYPE_RELATION_GROUP } from './models/relation-group/dynamic-relation-group.model';
import { DsDatePickerInlineComponent } from './models/date-picker-inline/dynamic-date-picker-inline.component';
import { DYNAMIC_FORM_CONTROL_TYPE_CUSTOM_SWITCH } from './models/custom-switch/custom-switch.model';
import { CustomSwitchComponent } from './models/custom-switch/custom-switch.component';
import { map, startWith, switchMap, find, take, tap } from 'rxjs/operators';
import { combineLatest as observableCombineLatest, Observable, Subscription } from 'rxjs';
import { SearchResult } from '../../../search/search-result.model';
import { DSpaceObject } from '../../../../core/shared/dspace-object.model';
import { NgbModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { RelationshipService } from '../../../../core/data/relationship.service';
import { SelectableListService } from '../../../object-list/selectable-list/selectable-list.service';
import { DsDynamicDisabledComponent } from './models/disabled/dynamic-disabled.component';
import { DYNAMIC_FORM_CONTROL_TYPE_DISABLED } from './models/disabled/dynamic-disabled.model';
import { DsDynamicLookupRelationModalComponent } from './relation-lookup-modal/dynamic-lookup-relation-modal.component';
import {
  getAllSucceededRemoteData,
  getRemoteDataPayload,
  getSucceededRemoteData,
  getAllSucceededRemoteDataPayload, getPaginatedListPayload, getFirstSucceededRemoteDataPayload
} from '../../../../core/shared/operators';
import { RemoteData } from '../../../../core/data/remote-data';
import { Item } from '../../../../core/shared/item.model';
import { ItemDataService } from '../../../../core/data/item-data.service';
import { Store } from '@ngrx/store';
import { AppState } from '../../../../app.reducer';
import { SubmissionObjectDataService } from '../../../../core/submission/submission-object-data.service';
import { SubmissionObject } from '../../../../core/submission/models/submission-object.model';
import { PaginatedList } from '../../../../core/data/paginated-list';
import { ItemSearchResult } from '../../../object-collection/shared/item-search-result.model';
import { Relationship } from '../../../../core/shared/item-relationships/relationship.model';
import { Collection } from '../../../../core/shared/collection.model';
import { MetadataValue, VIRTUAL_METADATA_PREFIX } from '../../../../core/shared/metadata.models';
import { FormService } from '../../form.service';
import { SelectableListState } from '../../../object-list/selectable-list/selectable-list.reducer';
import { SubmissionService } from '../../../../submission/submission.service';
import { followLink } from '../../../utils/follow-link-config.model';
import { paginatedRelationsToItems } from '../../../../+item-page/simple/item-types/shared/item-relationships-utils';
import { RelationshipOptions } from '../models/relationship-options.model';
import { FormBuilderService } from '../form-builder.service';
import { modalConfigDefaults } from 'ngx-bootstrap/modal/modal-options.class';
import { models } from '../../../../core/core.module';

export function dsDynamicFormControlMapFn(model: DynamicFormControlModel): Type<DynamicFormControl> | null {
  switch (model.type) {
    case DYNAMIC_FORM_CONTROL_TYPE_ARRAY:
      return DsDynamicFormArrayComponent;

    case DYNAMIC_FORM_CONTROL_TYPE_CHECKBOX:
      return DynamicNGBootstrapCheckboxComponent;

    case DYNAMIC_FORM_CONTROL_TYPE_CHECKBOX_GROUP:
      return (model instanceof DynamicListCheckboxGroupModel) ? DsDynamicListComponent : DynamicNGBootstrapCheckboxGroupComponent;

    case DYNAMIC_FORM_CONTROL_TYPE_DATEPICKER:
      const datepickerModel = model as DynamicDatePickerModel;

      return datepickerModel.inline ? DynamicNGBootstrapCalendarComponent : DsDatePickerInlineComponent;

    case DYNAMIC_FORM_CONTROL_TYPE_GROUP:
      return DsDynamicFormGroupComponent;

    case DYNAMIC_FORM_CONTROL_TYPE_INPUT:
      return DynamicNGBootstrapInputComponent;

    case DYNAMIC_FORM_CONTROL_TYPE_RADIO_GROUP:
      return (model instanceof DynamicListRadioGroupModel) ? DsDynamicListComponent : DynamicNGBootstrapRadioGroupComponent;

    case DYNAMIC_FORM_CONTROL_TYPE_SELECT:
      return DynamicNGBootstrapSelectComponent;

    case DYNAMIC_FORM_CONTROL_TYPE_TEXTAREA:
      return DynamicNGBootstrapTextAreaComponent;

    case DYNAMIC_FORM_CONTROL_TYPE_TIMEPICKER:
      return DynamicNGBootstrapTimePickerComponent;

    case DYNAMIC_FORM_CONTROL_TYPE_TYPEAHEAD:
      return DsDynamicTypeaheadComponent;

    case DYNAMIC_FORM_CONTROL_TYPE_SCROLLABLE_DROPDOWN:
      return DsDynamicScrollableDropdownComponent;

    case DYNAMIC_FORM_CONTROL_TYPE_TAG:
      return DsDynamicTagComponent;

    case DYNAMIC_FORM_CONTROL_TYPE_RELATION_GROUP:
      return DsDynamicRelationGroupComponent;

    case DYNAMIC_FORM_CONTROL_TYPE_DSDATEPICKER:
      return DsDatePickerComponent;

    case DYNAMIC_FORM_CONTROL_TYPE_LOOKUP:
      return DsDynamicLookupComponent;

    case DYNAMIC_FORM_CONTROL_TYPE_LOOKUP_NAME:
      return DsDynamicLookupComponent;

    case DYNAMIC_FORM_CONTROL_TYPE_DISABLED:
      return DsDynamicDisabledComponent;

    case DYNAMIC_FORM_CONTROL_TYPE_CUSTOM_SWITCH:
      return CustomSwitchComponent;

    default:
      return null;
  }
}

@Component({
  selector: 'ds-dynamic-form-control-container',
  styleUrls: ['./ds-dynamic-form-control-container.component.scss'],
  templateUrl: './ds-dynamic-form-control-container.component.html',
  changeDetection: ChangeDetectionStrategy.Default
})
export class DsDynamicFormControlContainerComponent extends DynamicFormControlContainerComponent implements OnInit, OnChanges, OnDestroy {
  @ContentChildren(DynamicTemplateDirective) contentTemplateList: QueryList<DynamicTemplateDirective>;
  // tslint:disable-next-line:no-input-rename
  @Input('templates') inputTemplateList: QueryList<DynamicTemplateDirective>;

  @Input() formId: string;
  @Input() asBootstrapFormGroup = false;
  @Input() bindId = true;
  @Input() context: any | null = null;
  @Input() group: FormGroup;
  @Input() hasErrorMessaging = false;
  @Input() layout = null as DynamicFormLayout;
  @Input() model: any;
  relationshipValue$: Observable<ReorderableRelationship>;
  isRelationship: boolean;
  modalRef: NgbModalRef;
  item: Item;
  item$: Observable<Item>;
  collection: Collection;
  listId: string;
  searchConfig: string;
  value: MetadataValue;
  /**
   * List of subscriptions to unsubscribe from
   */
  private subs: Subscription[] = [];

  /* tslint:disable:no-output-rename */
  @Output('dfBlur') blur: EventEmitter<DynamicFormControlEvent> = new EventEmitter<DynamicFormControlEvent>();
  @Output('dfChange') change: EventEmitter<DynamicFormControlEvent> = new EventEmitter<DynamicFormControlEvent>();
  @Output('dfFocus') focus: EventEmitter<DynamicFormControlEvent> = new EventEmitter<DynamicFormControlEvent>();
  @Output('ngbEvent') customEvent: EventEmitter<DynamicFormControlEvent> = new EventEmitter<DynamicFormControlEvent>();
  /* tslint:enable:no-output-rename */
  @ViewChild('componentViewContainer', { read: ViewContainerRef, static: true }) componentViewContainerRef: ViewContainerRef;

  private showErrorMessagesPreviousStage: boolean;

  get componentType(): Type<DynamicFormControl> | null {
    return dsDynamicFormControlMapFn(this.model);
  }

  constructor(
    protected componentFactoryResolver: ComponentFactoryResolver,
    protected dynamicFormComponentService: DynamicFormComponentService,
    protected layoutService: DynamicFormLayoutService,
    protected validationService: DynamicFormValidationService,
    protected translateService: TranslateService,
    protected relationService: DynamicFormRelationService,
    private modalService: NgbModal,
    private relationshipService: RelationshipService,
    private selectableListService: SelectableListService,
    private itemService: ItemDataService,
    private zone: NgZone,
    private store: Store<AppState>,
    private submissionObjectService: SubmissionObjectDataService,
    private ref: ChangeDetectorRef,
    private formService: FormService,
    private formBuilderService: FormBuilderService,
    private submissionService: SubmissionService
  ) {
    super(componentFactoryResolver, layoutService, validationService, dynamicFormComponentService, relationService);
  }

  /**
   * Sets up the necessary variables for when this control can be used to add relationships to the submitted item
   */
  ngOnInit(): void {
    this.isRelationship = hasValue(this.model.relationship);
    const isWrapperAroundRelationshipList = hasValue(this.model.relationshipConfig);

    if (this.isRelationship || isWrapperAroundRelationshipList) {
      const config = this.model.relationshipConfig || this.model.relationship;
      const relationshipOptions = Object.assign(new RelationshipOptions(), config);
      this.listId = 'list-' + relationshipOptions.relationshipType;
      this.setItem();

      if (isWrapperAroundRelationshipList || !this.model.repeatable) {
        const subscription = this.selectableListService.getSelectableList(this.listId).pipe(
          find((list: SelectableListState) => hasNoValue(list)),
          switchMap(() => this.item$.pipe(take(1))),
          switchMap((item) => {
            const relationshipsRD$ = this.relationshipService.getItemRelationshipsByLabel(item,
              relationshipOptions.relationshipType,
              undefined,
              followLink('leftItem'),
              followLink('rightItem'),
              followLink('relationshipType')
            );

            relationshipsRD$.pipe(
              getFirstSucceededRemoteDataPayload(),
              getPaginatedListPayload()
            ).subscribe((relationships: Relationship[]) => {
              // set initial namevariants for pre-existing relationships
              relationships.forEach((relationship: Relationship) => {
                const relationshipMD: MetadataValue = item.firstMetadata(relationshipOptions.metadataField, { authority: `${VIRTUAL_METADATA_PREFIX}${relationship.id}` });
                const nameVariantMD: MetadataValue = item.firstMetadata(this.model.metadataFields, { authority: `${VIRTUAL_METADATA_PREFIX}${relationship.id}` });
                if (hasValue(relationshipMD) && isNotEmpty(relationshipMD.value) && hasValue(nameVariantMD) && isNotEmpty(nameVariantMD.value)) {
                  this.relationshipService.setNameVariant(this.listId, relationshipMD.value, nameVariantMD.value);
                }
              });
            });

            return relationshipsRD$.pipe(
              paginatedRelationsToItems(item.uuid),
              getSucceededRemoteData(),
              map((items: RemoteData<PaginatedList<Item>>) => items.payload.page.map((i) => Object.assign(new ItemSearchResult(), { indexableObject: i }))),
            )
          })
        ).subscribe((relatedItems: Array<SearchResult<Item>>) => this.selectableListService.select(this.listId, relatedItems));
        this.subs.push(subscription);
      }

      if (hasValue(this.model.metadataValue)) {
        this.value = Object.assign(new MetadataValue(), this.model.metadataValue);
      } else {
        this.value = Object.assign(new MetadataValue(), this.model.value);
      }

      if (hasValue(this.value) && this.value.isVirtual) {
        const relationship$ = this.relationshipService.findById(this.value.virtualValue, followLink('leftItem'), followLink('rightItem'), followLink('relationshipType'))
          .pipe(
            getAllSucceededRemoteData(),
            getRemoteDataPayload());
        this.relationshipValue$ = observableCombineLatest([this.item$.pipe(take(1)), relationship$]).pipe(
          switchMap(([item, relationship]: [Item, Relationship]) =>
            relationship.leftItem.pipe(
              getAllSucceededRemoteData(),
              getRemoteDataPayload(),
              map((leftItem: Item) => {
                return new ReorderableRelationship(relationship, leftItem.uuid !== item.uuid, this.relationshipService, this.store, this.model.submissionId)
              }),
            )
          ),
          startWith(undefined)
        );
      }
    }
  }

  get isCheckbox(): boolean {
    return this.model.type === DYNAMIC_FORM_CONTROL_TYPE_CHECKBOX || this.model.type === DYNAMIC_FORM_CONTROL_TYPE_CUSTOM_SWITCH;
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes && !this.isRelationship && hasValue(this.group.get(this.model.id))) {
      super.ngOnChanges(changes);
      if (this.model && this.model.placeholder) {
        this.model.placeholder = this.translateService.instant(this.model.placeholder);
      }
    }
  }

  ngDoCheck() {
    if (isNotUndefined(this.showErrorMessagesPreviousStage) && this.showErrorMessagesPreviousStage !== this.showErrorMessages) {
      this.showErrorMessagesPreviousStage = this.showErrorMessages;
      this.forceShowErrorDetection();
    }
  }

  ngAfterViewInit() {
    this.showErrorMessagesPreviousStage = this.showErrorMessages;
  }

  /**
   * Since Form Control Components created dynamically have 'OnPush' change detection strategy,
   * changes are not propagated. So use this method to force an update
   */
  protected forceShowErrorDetection() {
    if (this.showErrorMessages) {
      this.destroyFormControlComponent();
      this.createFormControlComponent();
    }
  }

  onChangeLanguage(event) {
    if (isNotEmpty((this.model as any).value)) {
      this.onChange(event);
    }
  }

  public hasResultsSelected(): Observable<boolean> {
    return this.model.value.pipe(map((list: Array<SearchResult<DSpaceObject>>) => isNotEmpty(list)));
  }

  /**
   * Open a modal where the user can select relationships to be added to item being submitted
   */
  openLookup() {
    this.modalRef = this.modalService.open(DsDynamicLookupRelationModalComponent, {
      size: 'lg'
    });
    const modalComp = this.modalRef.componentInstance;

    modalComp.query = this.model.value && !this.model.readOnly ? this.model.value.value : '';
    if (hasValue(this.model.value)) {
      this.model.value = '';
      this.onChange({
        $event: { previousIndex: 0 },
        context: { index: 0 },
        control: this.control,
        model: this.model,
        type: DynamicFormControlEventType.Change
      });
    }
    this.submissionService.dispatchSave(this.model.submissionId);

    modalComp.repeatable = this.model.repeatable;
    modalComp.listId = this.listId;
    modalComp.relationshipOptions = this.model.relationship;
    modalComp.metadataFields = this.model.metadataFields;
    modalComp.item = this.item;
    modalComp.collection = this.collection;
    modalComp.submissionId = this.model.submissionId;
  }

  /**
   * Callback for the remove event,
   * remove the current control from its array
   */
  onRemove(): void {
    const arrayContext: DynamicFormArrayModel = (this.context as DynamicFormArrayGroupModel).context;
    const path = this.formBuilderService.getPath(arrayContext);
    const formArrayControl = this.group.root.get(path) as FormArray;
    console.log('this.listId', this.listId);
    this.formBuilderService.removeFormArrayGroup(this.context.index, formArrayControl, arrayContext);
  }

  /**
   * Unsubscribe from all subscriptions
   */
  ngOnDestroy(): void {
    this.subs
      .filter((sub) => hasValue(sub))
      .forEach((sub) => sub.unsubscribe());
  }

  /**
   *  Initialize this.item$ based on this.model.submissionId
   */
  private setItem() {
    const submissionObject$ = this.submissionObjectService
      .findById(this.model.submissionId, followLink('item'), followLink('collection')).pipe(
        getAllSucceededRemoteData(),
        getRemoteDataPayload()
      );

    this.item$ = submissionObject$.pipe(switchMap((submissionObject: SubmissionObject) => (submissionObject.item as Observable<RemoteData<Item>>).pipe(getAllSucceededRemoteData(), getRemoteDataPayload())));
    const collection$ = submissionObject$.pipe(switchMap((submissionObject: SubmissionObject) => (submissionObject.collection as Observable<RemoteData<Collection>>).pipe(getAllSucceededRemoteData(), getRemoteDataPayload())));

    this.subs.push(this.item$.subscribe((item) => this.item = item));
    this.subs.push(collection$.subscribe((collection) => this.collection = collection));

  }
}
