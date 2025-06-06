import {
  ComponentFixture,
  TestBed,
  waitForAsync,
} from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { Router } from '@angular/router';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { TranslateModule } from '@ngx-translate/core';
import { of } from 'rxjs';

import { ConfigurationDataService } from '../../../core/data/configuration-data.service';
import { AuthorizationDataService } from '../../../core/data/feature-authorization/authorization-data.service';
import { ScriptDataService } from '../../../core/data/processes/script-data.service';
import { getProcessDetailRoute } from '../../../process-page/process-page-routing.paths';
import { Process } from '../../../process-page/processes/process.model';
import { NotificationsService } from '../../notifications/notifications.service';
import {
  createFailedRemoteDataObject$,
  createSuccessfulRemoteDataObject$,
} from '../../remote-data.utils';
import { NotificationsServiceStub } from '../../testing/notifications-service.stub';
import { PaginatedSearchOptions } from '../models/paginated-search-options.model';
import { SearchFilter } from '../models/search-filter.model';
import { SearchExportCsvComponent } from './search-export-csv.component';

describe('SearchExportCsvComponent', () => {
  let component: SearchExportCsvComponent;
  let fixture: ComponentFixture<SearchExportCsvComponent>;

  let scriptDataService: ScriptDataService;
  let authorizationDataService: AuthorizationDataService;
  let notificationsService;
  let router;
  let configurationDataService: jasmine.SpyObj<ConfigurationDataService>;

  const process = Object.assign(new Process(), { processId: 5, scriptName: 'metadata-export-search' });

  const searchConfig = new PaginatedSearchOptions({
    configuration: 'test-configuration',
    scope: 'test-scope',
    query: 'test-query',
    filters: [
      new SearchFilter('f.filter1', ['filter1value1,equals', 'filter1value2,equals']),
      new SearchFilter('f.filter2', ['filter2value1,contains']),
      new SearchFilter('f.filter3', ['[2000 TO 2001]'], 'equals'),
    ],
  });

  configurationDataService = jasmine.createSpyObj('ConfigurationDataService', {
    findByPropertyName: of({ payload: { value: '500' } }),
  });

  function initBeforeEachAsync() {
    scriptDataService = jasmine.createSpyObj('scriptDataService', {
      scriptWithNameExistsAndCanExecute: of(true),
      invoke: createSuccessfulRemoteDataObject$(process),
    });
    authorizationDataService = jasmine.createSpyObj('authorizationService', {
      isAuthorized: of(true),
    });

    notificationsService = new NotificationsServiceStub();

    router = jasmine.createSpyObj('authorizationService', ['navigateByUrl']);
    TestBed.configureTestingModule({
      imports: [TranslateModule.forRoot(), NgbModule, SearchExportCsvComponent],
      providers: [
        { provide: ScriptDataService, useValue: scriptDataService },
        { provide: AuthorizationDataService, useValue: authorizationDataService },
        { provide: NotificationsService, useValue: notificationsService },
        { provide: Router, useValue: router },
        { provide: ConfigurationDataService, useValue: configurationDataService },
      ],
    }).compileComponents();
  }

  function initBeforeEach() {
    fixture = TestBed.createComponent(SearchExportCsvComponent);
    component = fixture.componentInstance;
    component.searchConfig = searchConfig;
    fixture.detectChanges();
  }

  describe('init', () => {
    describe('comp', () => {
      beforeEach(waitForAsync(() => {
        initBeforeEachAsync();
      }));
      beforeEach(() => {
        initBeforeEach();
      });
      it('should init the comp', () => {
        expect(component).toBeTruthy();
      });
    });
    describe('when the user is an admin and the metadata-export-search script is present ', () => {
      beforeEach(waitForAsync(() => {
        initBeforeEachAsync();
      }));
      beforeEach(() => {
        initBeforeEach();
      });
      it('should add the button', () => {
        const debugElement = fixture.debugElement.query(By.css('button.export-button'));
        expect(debugElement).toBeDefined();
      });
    });
    describe('when the user is not an admin', () => {
      beforeEach(waitForAsync(() => {
        initBeforeEachAsync();
        (authorizationDataService.isAuthorized as jasmine.Spy).and.returnValue(of(false));
      }));
      beforeEach(() => {
        initBeforeEach();
      });
      it('should not add the button', () => {
        const debugElement = fixture.debugElement.query(By.css('button.export-button'));
        expect(debugElement).toBeNull();
      });
    });
    describe('when the metadata-export-search script is not present', () => {
      beforeEach(waitForAsync(() => {
        initBeforeEachAsync();
        (scriptDataService.scriptWithNameExistsAndCanExecute as jasmine.Spy).and.returnValue(of(false));
      }));

      it('should should not add the button', () => {
        initBeforeEach();

        const debugElement = fixture.debugElement.query(By.css('button.export-button'));
        expect(debugElement).toBeNull();
      });

      it('should not call scriptWithNameExistsAndCanExecute when unauthorized', () => {
        (authorizationDataService.isAuthorized as jasmine.Spy).and.returnValue(of(false));
        initBeforeEach();

        expect(scriptDataService.scriptWithNameExistsAndCanExecute).not.toHaveBeenCalled();
      });
    });
  });
  describe('export', () => {
    beforeEach(waitForAsync(() => {
      initBeforeEachAsync();
    }));
    beforeEach(() => {
      initBeforeEach();
    });
    it('should call the invoke script method with the correct parameters', () => {
      component.export();
      expect(scriptDataService.invoke).toHaveBeenCalledWith('metadata-export-search',
        [
          { name: '-q', value: searchConfig.query },
          { name: '-s', value: searchConfig.scope },
          { name: '-c', value: searchConfig.configuration },
          { name: '-f', value: 'filter1,equals=filter1value1' },
          { name: '-f', value: 'filter1,equals=filter1value2' },
          { name: '-f', value: 'filter2,contains=filter2value1' },
          { name: '-f', value: 'filter3,equals=[2000 TO 2001]' },
        ], []);

      component.searchConfig = null;
      fixture.detectChanges();

      component.export();
      expect(scriptDataService.invoke).toHaveBeenCalledWith('metadata-export-search', [], []);

    });
    it('should show a success message when the script was invoked successfully and redirect to the corresponding process page', () => {
      component.export();

      expect(notificationsService.success).toHaveBeenCalled();
      expect(router.navigateByUrl).toHaveBeenCalledWith(getProcessDetailRoute(process.processId));
    });
    it('should show an error message when the script was not invoked successfully and stay on the current page', () => {
      (scriptDataService.invoke as jasmine.Spy).and.returnValue(createFailedRemoteDataObject$('Error', 500));

      component.export();

      expect(notificationsService.error).toHaveBeenCalled();
      expect(router.navigateByUrl).not.toHaveBeenCalled();
    });
  });
  describe('clicking the button', () => {
    beforeEach(waitForAsync(() => {
      initBeforeEachAsync();
    }));
    beforeEach(() => {
      initBeforeEach();
    });
    it('should trigger the export function', () => {
      spyOn(component, 'export');

      const debugElement = fixture.debugElement.query(By.css('button.export-button'));
      debugElement.triggerEventHandler('click', null);

      expect(component.export).toHaveBeenCalled();
    });
  });
});
