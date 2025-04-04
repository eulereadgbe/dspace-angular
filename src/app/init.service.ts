/**
 * The contents of this file are subject to the license and copyright
 * detailed in the LICENSE and NOTICE files at the root of the source
 * tree and available online at
 *
 * http://www.dspace.org/license/
 */
import {
  APP_INITIALIZER,
  Inject,
  makeStateKey,
  Provider,
  TransferState,
  Type,
} from '@angular/core';
import { DYNAMIC_FORM_CONTROL_MAP_FN } from '@ng-dynamic-forms/core';
import {
  select,
  Store,
} from '@ngrx/store';
import { TranslateService } from '@ngx-translate/core';
import isEqual from 'lodash/isEqual';
import { Observable } from 'rxjs';
import {
  distinctUntilChanged,
  find,
} from 'rxjs/operators';

import {
  APP_CONFIG,
  APP_DATA_SERVICES_MAP,
  AppConfig,
} from '../config/app-config.interface';
import { environment } from '../environments/environment';
import { AppState } from './app.reducer';
import { BreadcrumbsService } from './breadcrumbs/breadcrumbs.service';
import { CheckAuthenticationTokenAction } from './core/auth/auth.actions';
import { isAuthenticationBlocking } from './core/auth/selectors';
import { LAZY_DATA_SERVICES } from './core/data-services-map';
import { LocaleService } from './core/locale/locale.service';
import { HeadTagService } from './core/metadata/head-tag.service';
import { CorrelationIdService } from './correlation-id/correlation-id.service';
import { dsDynamicFormControlMapFn } from './shared/form/builder/ds-dynamic-form-ui/ds-dynamic-form-control-map-fn';
import { MenuService } from './shared/menu/menu.service';
import { MenuProviderService } from './shared/menu/menu-provider.service';
import { ThemeService } from './shared/theme-support/theme.service';
import { Angulartics2DSpace } from './statistics/angulartics/dspace-provider';

/**
 * Performs the initialization of the app.
 *
 * Should be extended to implement server- & browser-specific functionality.
 * Initialization steps shared between the server and browser implementations
 * can be included in this class.
 *
 * Note that the service cannot (indirectly) depend on injection tokens that are only available _after_ APP_INITIALIZER.
 * For example, NgbModal depends on ApplicationRef and can therefore not be used during initialization.
 */
export abstract class InitService {
  /**
   * The state transfer key to use for the NgRx store state
   * @protected
   */
  protected static NGRX_STATE = makeStateKey('NGRX_STATE');

  protected constructor(
    protected store: Store<AppState>,
    protected correlationIdService: CorrelationIdService,
    @Inject(APP_CONFIG) protected appConfig: AppConfig,
    protected translate: TranslateService,
    protected localeService: LocaleService,
    protected angulartics2DSpace: Angulartics2DSpace,
    protected headTagService: HeadTagService,
    protected breadcrumbsService: BreadcrumbsService,
    protected themeService: ThemeService,
    protected menuService: MenuService,
    protected menuProviderService: MenuProviderService,

  ) {
  }

  /**
   * The initialization providers to use in `*AppModule`
   * - this concrete {@link InitService}
   * - {@link APP_CONFIG} with optional pre-initialization hook
   * - {@link APP_INITIALIZER}
   * <br>
   * Should only be called on concrete subclasses of InitService for the initialization hooks to work
   */
  public static providers(): Provider[] {
    if (!InitService.isPrototypeOf(this)) {
      throw new Error(
        'Initalization providers should only be generated from concrete subclasses of InitService',
      );
    }
    return [
      {
        provide: InitService,
        useClass: this as unknown as Type<InitService>,
      },
      {
        provide: APP_CONFIG,
        useFactory: (transferState: TransferState) => {
          this.resolveAppConfig(transferState);
          return environment;
        },
        deps: [ TransferState ],
      },
      {
        provide: APP_INITIALIZER,
        useFactory: (initService: InitService) => initService.init(),
        deps: [ InitService ],
        multi: true,
      },
      {
        provide: APP_DATA_SERVICES_MAP,
        useValue: LAZY_DATA_SERVICES,
      },
      {
        provide: DYNAMIC_FORM_CONTROL_MAP_FN,
        useValue: dsDynamicFormControlMapFn,
      },
    ];
  }

  /**
   * Optional pre-initialization method to ensure that {@link APP_CONFIG} is fully resolved before {@link init} is called.
   *
   * For example, Router depends on APP_BASE_HREF, which in turn depends on APP_CONFIG.
   * In production mode, APP_CONFIG is resolved from the TransferState when the app is initialized.
   * If we want to use Router within APP_INITIALIZER, we have to make sure APP_BASE_HREF is resolved beforehand.
   * In this case that means that we must transfer the configuration from the SSR state during pre-initialization.
   * @protected
   */
  protected static resolveAppConfig(
    transferState: TransferState,
  ): void {
    // overridden in subclasses if applicable
  }

  /**
   * Main initialization method.
   * @protected
   */
  protected abstract init(): () => Promise<boolean>;

  // Common initialization steps

  /**
   * Dispatch a {@link CheckAuthenticationTokenAction} to start off the chain of
   * actions used to determine whether a user is already logged in.
   * @protected
   */
  protected checkAuthenticationToken(): void {
    this.store.dispatch(new CheckAuthenticationTokenAction());
  }

  /**
   * Initialize the correlation ID (from cookie, NgRx store or random)
   * @protected
   */
  protected initCorrelationId(): void {
    this.correlationIdService.initCorrelationId();
  }

  /**
   * Make sure the {@link environment} matches {@link APP_CONFIG} and print
   * some information about it to the console
   * @protected
   */
  protected checkEnvironment(): void {
    if (!isEqual(environment, this.appConfig)) {
      throw new Error('environment does not match app config!');
    }

    if (environment.debug) {
      console.info(environment);
    }
  }

  /**
   * Initialize internationalization services
   * - Specify the active languages
   * - Set the current locale
   * @protected
   */
  protected initI18n(): void {
    // Load all the languages that are defined as active from the config file
    this.translate.addLangs(
      environment.languages
        .filter((LangConfig) => LangConfig.active === true)
        .map((a) => a.code),
    );

    // Load the default language from the config file
    // translate.setDefaultLang(environment.defaultLanguage);

    this.localeService.setCurrentLanguageCode();
  }

  /**
   * Initialize Angulartics
   * @protected
   */
  protected initAngulartics(): void {
    this.angulartics2DSpace.startTracking();
  }

  /**
   * Start route-listening subscriptions
   * - {@link HeadTagService.listenForRouteChange}
   * - {@link BreadcrumbsService.listenForRouteChanges}
   * - {@link ThemeService.listenForRouteChanges}
   * @protected
   */
  protected initRouteListeners(): void {
    this.headTagService.listenForRouteChange();
    this.breadcrumbsService.listenForRouteChanges();
    this.themeService.listenForRouteChanges();
  }

  /**
   * Emits once authentication is ready (no longer blocking)
   * @protected
   */
  protected authenticationReady$(): Observable<boolean> {
    return this.store.pipe(
      select(isAuthenticationBlocking),
      distinctUntilChanged(),
      find((b: boolean) => b === false),
    );
  }
}
