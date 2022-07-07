import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Action, StoreConfig, StoreModule } from '@ngrx/store';
import { EffectsModule } from '@ngrx/effects';

import { CoreModule } from '../core/core.module';
import { SharedModule } from '../shared/shared.module';
import { storeModuleConfig } from '../app.reducer';
import { QualityAssuranceTopicsComponent } from './qa/topics/quality-assurance-topics.component';
import { QualityAssuranceEventsComponent } from './qa/events/quality-assurance-events.component';
import { SuggestionNotificationsStateService } from './suggestion-notifications-state.service';
import { suggestionNotificationsReducers, SuggestionNotificationsState } from './suggestion-notifications.reducer';
import { suggestionNotificationsEffects } from './suggestion-notifications-effects';
import { QualityAssuranceTopicsService } from './qa/topics/quality-assurance-topics.service';
import {
  QualityAssuranceTopicRestService
} from '../core/suggestion-notifications/qa/topics/quality-assurance-topic-rest.service';
import {
  QualityAssuranceEventRestService
} from '../core/suggestion-notifications/qa/events/quality-assurance-event-rest.service';
import { ProjectEntryImportModalComponent } from './qa/project-entry-import-modal/project-entry-import-modal.component';
import { TranslateModule } from '@ngx-translate/core';
import { SearchModule } from '../shared/search/search.module';
import { QualityAssuranceSourceComponent } from './qa/source/quality-assurance-source.component';
import { QualityAssuranceSourceService } from './qa/source/quality-assurance-source.service';
import {
  QualityAssuranceSourceRestService
} from '../core/suggestion-notifications/qa/source/quality-assurance-source-rest.service';

const MODULES = [
  CommonModule,
  SharedModule,
  CoreModule.forRoot(),
  StoreModule.forFeature('suggestionNotifications', suggestionNotificationsReducers, storeModuleConfig as StoreConfig<SuggestionNotificationsState, Action>),
  EffectsModule.forFeature(suggestionNotificationsEffects),
  TranslateModule
];

const COMPONENTS = [
  QualityAssuranceTopicsComponent,
  QualityAssuranceEventsComponent,
  QualityAssuranceSourceComponent
];

const DIRECTIVES = [ ];

const ENTRY_COMPONENTS = [
  ProjectEntryImportModalComponent
];

const PROVIDERS = [
  SuggestionNotificationsStateService,
  QualityAssuranceTopicsService,
  QualityAssuranceSourceService,
  QualityAssuranceTopicRestService,
  QualityAssuranceSourceRestService,
  QualityAssuranceEventRestService
];

@NgModule({
    imports: [
        ...MODULES,
        SearchModule
    ],
  declarations: [
    ...COMPONENTS,
    ...DIRECTIVES,
    ...ENTRY_COMPONENTS
  ],
  providers: [
    ...PROVIDERS
  ],
  entryComponents: [
    ...ENTRY_COMPONENTS
  ],
  exports: [
    ...COMPONENTS,
    ...DIRECTIVES
  ]
})

/**
 * This module handles all components that are necessary for the OpenAIRE components
 */
export class SuggestionNotificationsModule {
}
