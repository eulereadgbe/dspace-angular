import { NO_ERRORS_SCHEMA } from '@angular/core';
import {
  ComponentFixture,
  TestBed,
  waitForAsync,
} from '@angular/core/testing';
import { ActivatedRoute } from '@angular/router';
import { Store } from '@ngrx/store';
import {
  TranslateLoader,
  TranslateModule,
} from '@ngx-translate/core';
import { of } from 'rxjs';

import { Item } from '../../../../../core/shared/item.model';
import { Relationship } from '../../../../../core/shared/item-relationships/relationship.model';
import { SubmissionService } from '../../../../../submission/submission.service';
import { getMockThemeService } from '../../../../mocks/theme-service.mock';
import { ItemSearchResult } from '../../../../object-collection/shared/item-search-result.model';
import { ItemSearchResultListElementComponent } from '../../../../object-list/search-result-list-element/item-search-result/item-types/item/item-search-result-list-element.component';
import { SelectableListService } from '../../../../object-list/selectable-list/selectable-list.service';
import { createSuccessfulRemoteDataObject$ } from '../../../../remote-data.utils';
import { ActivatedRouteStub } from '../../../../testing/active-router.stub';
import { SubmissionServiceStub } from '../../../../testing/submission-service.stub';
import { TranslateLoaderMock } from '../../../../testing/translate-loader.mock';
import { ThemeService } from '../../../../theme-support/theme.service';
import { RelationshipOptions } from '../../models/relationship-options.model';
import { RemoveRelationshipAction } from '../relation-lookup-modal/relationship.actions';
import {
  ExistingMetadataListElementComponent,
  ReorderableRelationship,
} from './existing-metadata-list-element.component';

describe('ExistingMetadataListElementComponent', () => {
  let component: ExistingMetadataListElementComponent;
  let fixture: ComponentFixture<ExistingMetadataListElementComponent>;
  let selectionService;
  let store;
  let listID;
  let submissionItem;
  let relationship;
  let reoRel;
  let metadataFields;
  let relationshipOptions;
  let uuid1;
  let uuid2;
  let relatedItem;
  let leftItemRD$;
  let rightItemRD$;
  let relatedSearchResult;
  let submissionId;
  let relationshipService;
  let submissionServiceStub;

  function init() {
    uuid1 = '91ce578d-2e63-4093-8c73-3faafd716000';
    uuid2 = '0e9dba1c-e1c3-4e05-a539-446f08ef57a7';
    selectionService = jasmine.createSpyObj('selectionService', ['deselectSingle']);
    store = jasmine.createSpyObj('store', ['dispatch']);
    listID = '1234-listID';
    submissionItem = Object.assign(new Item(), { uuid: uuid1 });
    metadataFields = ['dc.contributor.author'];
    relationshipOptions = Object.assign(new RelationshipOptions(), {
      relationshipType: 'isPublicationOfAuthor',
      filter: 'test.filter',
      searchConfiguration: 'personConfiguration',
      nameVariants: true,
    });
    relatedItem = Object.assign(new Item(), { uuid: uuid2 });
    leftItemRD$ = createSuccessfulRemoteDataObject$(relatedItem);
    rightItemRD$ = createSuccessfulRemoteDataObject$(submissionItem);
    relatedSearchResult = Object.assign(new ItemSearchResult(), { indexableObject: relatedItem });
    relationshipService = {
      updatePlace: () => of({}),
    } as any;

    relationship = Object.assign(new Relationship(), { leftItem: leftItemRD$, rightItem: rightItemRD$ });
    submissionId = '1234';
    reoRel = new ReorderableRelationship(relationship, true, {} as any, {} as any, submissionId);
    submissionServiceStub = new SubmissionServiceStub();
    submissionServiceStub.getSubmissionObject.and.returnValue(of({}));
  }

  beforeEach(waitForAsync(() => {
    init();
    TestBed.configureTestingModule({
      imports: [
        TranslateModule.forRoot({
          loader: {
            provide: TranslateLoader,
            useClass: TranslateLoaderMock,
          },
        }),
        ExistingMetadataListElementComponent,
      ],
      providers: [
        { provide: SelectableListService, useValue: selectionService },
        { provide: Store, useValue: store },
        { provide: SubmissionService, useValue: submissionServiceStub },
        { provide: ThemeService, useValue: getMockThemeService() },
        { provide: ActivatedRoute, useValue: new ActivatedRouteStub() },
      ],
      schemas: [NO_ERRORS_SCHEMA],
    })
      .overrideComponent(ExistingMetadataListElementComponent, {
        remove: { imports: [ItemSearchResultListElementComponent] },
      })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ExistingMetadataListElementComponent);
    component = fixture.componentInstance;
    component.listId = listID;
    component.submissionItem = submissionItem;
    component.reoRel = reoRel;
    component.metadataFields = metadataFields;
    component.relationshipOptions = relationshipOptions;
    component.submissionId = submissionId;
    fixture.detectChanges();
    component.ngOnChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('removeSelection', () => {
    it('should deselect the object in the selectable list service', () => {
      component.removeSelection();
      expect(selectionService.deselectSingle).toHaveBeenCalledWith(listID, relatedSearchResult);
    });

    it('should dispatch a RemoveRelationshipAction', () => {
      component.removeSelection();
      const action = new RemoveRelationshipAction(submissionItem, relatedItem, relationshipOptions.relationshipType, submissionId);
      expect(store.dispatch).toHaveBeenCalledWith(action);
    });
  });
});
