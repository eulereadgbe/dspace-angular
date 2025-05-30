import {
  cold,
  getTestScheduler,
  hot,
} from 'jasmine-marbles';
import { of } from 'rxjs';
import { TestScheduler } from 'rxjs/testing';

import { getMockHrefOnlyDataService } from '../../shared/mocks/href-only-data.service.mock';
import { getMockRequestService } from '../../shared/mocks/request.service.mock';
import {
  createSuccessfulRemoteDataObject,
  createSuccessfulRemoteDataObject$,
} from '../../shared/remote-data.utils';
import { HALEndpointServiceStub } from '../../shared/testing/hal-endpoint-service.stub';
import {
  createPaginatedList,
  getFirstUsedArgumentOfSpyMethod,
} from '../../shared/testing/utils.test';
import { RequestService } from '../data/request.service';
import { RequestEntry } from '../data/request-entry.model';
import { FlatBrowseDefinition } from '../shared/flat-browse-definition.model';
import { HierarchicalBrowseDefinition } from '../shared/hierarchical-browse-definition.model';
import { ValueListBrowseDefinition } from '../shared/value-list-browse-definition.model';
import { BrowseService } from './browse.service';
import { BrowseEntrySearchOptions } from './browse-entry-search-options.model';

describe('BrowseService', () => {
  let scheduler: TestScheduler;
  let service: BrowseService;
  let requestService: RequestService;

  const browsesEndpointURL = 'https://rest.api/browses';
  const halService: any = new HALEndpointServiceStub(browsesEndpointURL);
  const browseDefinitions = [
    Object.assign(new FlatBrowseDefinition(), {
      id: 'date',
      browseType: 'flatBrowse',
      sortOptions: [
        {
          name: 'title',
          metadata: 'dc.title',
        },
        {
          name: 'dateissued',
          metadata: 'dc.date.issued',
        },
        {
          name: 'dateaccessioned',
          metadata: 'dc.date.accessioned',
        },
      ],
      defaultSortOrder: 'ASC',
      type: 'browse',
      metadataKeys: [
        'dc.date.issued',
      ],
      _links: {
        self: { href: 'https://rest.api/discover/browses/dateissued' },
        items: { href: 'https://rest.api/discover/browses/dateissued/items' },
      },
    }),
    Object.assign(new ValueListBrowseDefinition(), {
      id: 'author',
      browseType: 'valueList',
      sortOptions: [
        {
          name: 'title',
          metadata: 'dc.title',
        },
        {
          name: 'dateissued',
          metadata: 'dc.date.issued',
        },
        {
          name: 'dateaccessioned',
          metadata: 'dc.date.accessioned',
        },
      ],
      defaultSortOrder: 'ASC',
      type: 'browse',
      metadataKeys: [
        'dc.contributor.*',
        'dc.creator',
      ],
      _links: {
        self: { href: 'https://rest.api/discover/browses/author' },
        entries: { href: 'https://rest.api/discover/browses/author/entries' },
        items: { href: 'https://rest.api/discover/browses/author/items' },
      },
    }),
    Object.assign(new HierarchicalBrowseDefinition(), {
      id: 'srsc',
      browseType: 'hierarchicalBrowse',
      facetType: 'subject',
      vocabulary: 'srsc',
      type: 'browse',
      metadata: [
        'dc.subject',
      ],
      _links: {
        vocabulary: { 'href': 'https://rest.api/submission/vocabularies/srsc/' },
        items: { 'href': 'https://rest.api/discover/browses/srsc/items' },
        entries: { 'href': 'https://rest.api/discover/browses/srsc/entries' },
        self: { 'href': 'https://rest.api/discover/browses/srsc' },
      },
    }),
  ];

  let browseDefinitionDataService;
  let hrefOnlyDataService;

  const getRequestEntry$ = (successful: boolean) => {
    return of({
      response: { isSuccessful: successful, payload: browseDefinitions } as any,
    } as RequestEntry);
  };

  function initTestService() {
    browseDefinitionDataService = jasmine.createSpyObj('browseDefinitionDataService', {
      findAll: createSuccessfulRemoteDataObject$(createPaginatedList(browseDefinitions)),
    });
    hrefOnlyDataService = getMockHrefOnlyDataService();
    return new BrowseService(
      requestService,
      halService,
      browseDefinitionDataService,
      hrefOnlyDataService,
    );
  }

  beforeEach(() => {
    scheduler = getTestScheduler();
  });

  describe('getBrowseDefinitions', () => {

    beforeEach(() => {
      requestService = getMockRequestService(getRequestEntry$(true));
      service = initTestService();
      spyOn(halService, 'getEndpoint').and
        .returnValue(hot('--a-', { a: browsesEndpointURL }));
    });

    it('should call BrowseDefinitionDataService to create the RemoteData Observable', () => {
      service.getBrowseDefinitions();
      expect(browseDefinitionDataService.findAll).toHaveBeenCalled();

    });
  });

  describe('getBrowseEntriesFor and findList', () => {
    // should contain special characters such that url encoding can be tested as well
    const mockAuthorName = 'Donald Smith & Sons';
    const mockAuthorityKey = 'some authority key ?=;';

    beforeEach(() => {
      requestService = getMockRequestService(getRequestEntry$(true));
      service = initTestService();
    });

    describe('when getBrowseEntriesFor is called with a valid browse definition id', () => {
      it('should call hrefOnlyDataService.findListByHref with the expected href', () => {
        const expected = (browseDefinitions[1] as ValueListBrowseDefinition)._links.entries.href;

        scheduler.schedule(() => service.getBrowseEntriesFor(new BrowseEntrySearchOptions(browseDefinitions[1].id)).subscribe());
        scheduler.flush();

        expect(getFirstUsedArgumentOfSpyMethod(hrefOnlyDataService.findListByHref)).toBeObservable(cold('(a|)', {
          a: expected,
        }));
      });

    });

    describe('when findList is called with a valid browse definition id', () => {
      it('should call hrefOnlyDataService.findListByHref with the expected href', () => {
        const expected = browseDefinitions[1]._links.items.href + '?filterValue=' + encodeURIComponent(mockAuthorName);

        scheduler.schedule(() => service.getBrowseItemsFor(mockAuthorName, undefined, new BrowseEntrySearchOptions(browseDefinitions[1].id)).subscribe());
        scheduler.flush();

        expect(getFirstUsedArgumentOfSpyMethod(hrefOnlyDataService.findListByHref)).toBeObservable(cold('(a|)', {
          a: expected,
        }));
      });

    });
    describe('when getBrowseItemsFor is called with a valid filter value and authority key', () => {
      it('should call hrefOnlyDataService.findListByHref with the expected href', () => {
        const expected = browseDefinitions[1]._links.items.href +
          '?filterValue=' + encodeURIComponent(mockAuthorName) +
          '&filterAuthority=' + encodeURIComponent(mockAuthorityKey);

        scheduler.schedule(() => service.getBrowseItemsFor(mockAuthorName, mockAuthorityKey, new BrowseEntrySearchOptions(browseDefinitions[1].id)).subscribe());
        scheduler.flush();

        expect(getFirstUsedArgumentOfSpyMethod(hrefOnlyDataService.findListByHref)).toBeObservable(cold('(a|)', {
          a: expected,
        }));
      });
    });
  });

  describe('getBrowseURLFor', () => {

    describe('if getBrowseDefinitions fires', () => {
      beforeEach(() => {
        requestService = getMockRequestService(getRequestEntry$(true));
        service = initTestService();
        spyOn(service, 'getBrowseDefinitions').and
          .returnValue(hot('--a-', {
            a: createSuccessfulRemoteDataObject(createPaginatedList(browseDefinitions)),
          }));
      });

      it('should return the URL for the given metadataKey and linkPath', () => {
        const metadataKey = 'dc.date.issued';
        const linkPath = 'items';
        const expectedURL = browseDefinitions[0]._links[linkPath];

        const result = service.getBrowseURLFor(metadataKey, linkPath);
        const expected = cold('c-d-', { c: undefined, d: expectedURL });

        expect(result).toBeObservable(expected);
      });

      it('should work when the definition uses a wildcard in the metadataKey', () => {
        const metadataKey = 'dc.contributor.author';  // should match dc.contributor.* in the definition
        const linkPath = 'items';
        const expectedURL = browseDefinitions[1]._links[linkPath];

        const result = service.getBrowseURLFor(metadataKey, linkPath);
        const expected = cold('c-d-', { c: undefined, d: expectedURL });

        expect(result).toBeObservable(expected);
      });

      it('should throw an error when the key doesn\'t match', () => {
        const metadataKey = 'dc.title'; // isn't in the definitions
        const linkPath = 'items';

        const result = service.getBrowseURLFor(metadataKey, linkPath);
        const expected = cold('c-#-', { c: undefined }, new Error(`A browse endpoint for ${linkPath} on ${metadataKey} isn't configured`));

        expect(result).toBeObservable(expected);
      });

      it('should throw an error when the link doesn\'t match', () => {
        const metadataKey = 'dc.date.issued';
        const linkPath = 'collections'; // isn't in the definitions

        const result = service.getBrowseURLFor(metadataKey, linkPath);
        const expected = cold('c-#-', { c: undefined }, new Error(`A browse endpoint for ${linkPath} on ${metadataKey} isn't configured`));

        expect(result).toBeObservable(expected);
      });

    });

    describe('if getBrowseDefinitions doesn\'t fire', () => {
      it('should return undefined', () => {
        requestService = getMockRequestService(getRequestEntry$(true));
        service = initTestService();
        spyOn(service, 'getBrowseDefinitions').and
          .returnValue(hot('----'));

        const metadataKey = 'dc.date.issued';
        const linkPath = 'items';

        const result = service.getBrowseURLFor(metadataKey, linkPath);
        const expected = cold('b---', { b: undefined });
        expect(result).toBeObservable(expected);
      });
    });
  });

  describe('getFirstItemFor', () => {
    beforeEach(() => {
      requestService = getMockRequestService();
      service = initTestService();
    });

    describe('when getFirstItemFor is called with a valid browse definition id', () => {
      const expectedURL = browseDefinitions[1]._links.items.href + '?page=0&size=1';

      it('should call hrefOnlyDataService.findListByHref with the expected href', () => {
        scheduler.schedule(() => service.getFirstItemFor(browseDefinitions[1].id).subscribe());
        scheduler.flush();

        expect(getFirstUsedArgumentOfSpyMethod(hrefOnlyDataService.findListByHref)).toBeObservable(cold('(a|)', {
          a: expectedURL,
        }));
      });

    });
  });

});
