import {
  ChangeDetectionStrategy,
  Component,
  Injector,
  OnDestroy,
  OnInit,
} from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import {
  BehaviorSubject,
  Observable,
  Subscription,
} from 'rxjs';
import {
  distinctUntilChanged,
  map,
  switchMap,
} from 'rxjs/operators';

import { AuthorizationDataService } from '../../core/data/feature-authorization/authorization-data.service';
import { GenericConstructor } from '../../core/shared/generic-constructor';
import {
  hasValue,
  isNotEmptyOperator,
} from '../empty.util';
import { ThemeService } from '../theme-support/theme.service';
import { MenuService } from './menu.service';
import { MenuID } from './menu-id.model';
import { getComponentForMenu } from './menu-section.decorator';
import { MenuSection } from './menu-section.model';
import { AbstractMenuSectionComponent } from './menu-section/abstract-menu-section.component';

/**
 * A basic implementation of a MenuComponent
 */
@Component({
  selector: 'ds-menu',
  template: '',
  standalone: true,
})
export class MenuComponent implements OnInit, OnDestroy {
  /**
   * The ID of the Menu (See MenuID)
   */
  menuID: MenuID;

  /**
   * Observable that emits whether or not this menu is currently collapsed
   */
  menuCollapsed: Observable<boolean>;

  /**
   * Observable that emits whether or not this menu's preview is currently collapsed
   */
  menuPreviewCollapsed: Observable<boolean>;

  /**
   * Observable that emits whether or not this menu is currently visible
   */
  menuVisible: Observable<boolean>;

  /**
   * List of top level sections in this Menu
   */
  sections: Observable<MenuSection[]>;

  /**
   * Map of components and injectors for each dynamically rendered menu section
   */
  sectionMap$: BehaviorSubject<Map<string, {
    injector: Injector,
    component: GenericConstructor<AbstractMenuSectionComponent>
  }>> = new BehaviorSubject(new Map());

  /**
   * Prevent unnecessary rerendering
   */
  changeDetection: ChangeDetectionStrategy.OnPush;

  /**
   * Timer to briefly delay the sidebar preview from opening or closing
   */
  private previewTimer;

  /**
   * Array to track all subscriptions and unsubscribe them onDestroy
   * @type {Array}
   */
  subs: Subscription[] = [];

  private activatedRouteLastChild: ActivatedRoute;

  constructor(
    protected menuService: MenuService,
    protected injector: Injector,
    public authorizationService: AuthorizationDataService,
    public route: ActivatedRoute,
    protected themeService: ThemeService,
  ) {
  }

  /**
   * Sets all instance variables to their initial values
   */
  ngOnInit(): void {
    this.activatedRouteLastChild = this.getActivatedRoute(this.route);
    this.menuCollapsed = this.menuService.isMenuCollapsed(this.menuID);
    this.menuPreviewCollapsed = this.menuService.isMenuPreviewCollapsed(this.menuID);
    this.menuVisible = this.menuService.isMenuVisible(this.menuID);
    this.sections = this.menuService.getMenuTopSections(this.menuID);

    this.subs.push(
      this.sections.pipe(
        // if you return an array from a switchMap it will emit each element as a separate event.
        // So this switchMap is equivalent to a subscribe with a forEach inside
        switchMap((sections: MenuSection[]) => sections),
        isNotEmptyOperator(),
        switchMap((section: MenuSection) => this.getSectionComponent(section).pipe(
          map((component: GenericConstructor<AbstractMenuSectionComponent>) => ({ section, component })),
        )),
        distinctUntilChanged((x, y) => x.section.id === y.section.id && x.component.prototype === y.component.prototype),
      ).subscribe(({ section, component }) => {
        const nextMap = this.sectionMap$.getValue();
        nextMap.set(section.id, {
          injector: this.getSectionDataInjector(section),
          component,
        });
        this.sectionMap$.next(nextMap);
      }),
    );
  }

  /**
   *  Get activated route of the deepest activated route
   */
  getActivatedRoute(route) {
    if (route.children.length > 0) {
      return this.getActivatedRoute(route.firstChild);
    } else {
      return route;
    }
  }

  /**
   *  Collapse this menu when it's currently expanded, expand it when its currently collapsed
   * @param {Event} event The user event that triggered this method
   */
  toggle(event: Event) {
    event.preventDefault();
    this.menuService.toggleMenu(this.menuID);
  }

  /**
   * Expand this menu
   * @param {Event} event The user event that triggered this method
   */
  expand(event: Event) {
    event.preventDefault();
    this.menuService.expandMenu(this.menuID);
  }

  /**
   * Collapse this menu
   * @param {Event} event The user event that triggered this method
   */
  collapse(event: Event) {
    event.preventDefault();
    this.menuService.collapseMenu(this.menuID);
  }

  /**
   * Expand this menu's preview
   * @param {Event} event The user event that triggered this method
   */
  expandPreview(event: Event) {
    event.preventDefault();
    this.previewToggleDebounce(() => this.menuService.expandMenuPreview(this.menuID), 100);
  }

  /**
   * Collapse this menu's preview
   * @param {Event} event The user event that triggered this method
   */
  collapsePreview(event: Event) {
    event.preventDefault();
    this.previewToggleDebounce(() => this.menuService.collapseMenuPreview(this.menuID), 400);
  }

  /**
   * delay the handler function by the given amount of time
   *
   * @param {Function} handler The function to delay
   * @param {number} ms The amount of ms to delay the handler function by
   */
  private previewToggleDebounce(handler: () => void, ms: number): void {
    if (hasValue(this.previewTimer)) {
      clearTimeout(this.previewTimer);
    }
    this.previewTimer = setTimeout(handler, ms);
  }

  /**
   * Retrieve the component for a given MenuSection object
   * @param {MenuSection} section The given MenuSection
   * @returns {Observable<GenericConstructor<AbstractMenuSectionComponent>>} Emits the constructor of the Component that should be used to render this object
   */
  private getSectionComponent(section: MenuSection): Observable<GenericConstructor<AbstractMenuSectionComponent>> {
    return this.menuService.hasSubSections(this.menuID, section.id).pipe(
      map((expandable: boolean) => {
        return getComponentForMenu(this.menuID, expandable || section.alwaysRenderExpandable, this.themeService.getThemeName());
      },
      ),
    );
  }

  /**
   * Retrieve the Injector for a given MenuSection object
   * @param {MenuSection} section The given MenuSection
   * @returns {Injector} The Injector that injects the data for this menu section into the section's component
   */
  private getSectionDataInjector(section: MenuSection) {
    return Injector.create({
      providers: [{ provide: 'sectionDataProvider', useFactory: () => (section), deps: [] }],
      parent: this.injector,
    });
  }

  /**
   * Unsubscribe from open subscriptions
   */
  ngOnDestroy(): void {
    this.subs
      .filter((subscription) => hasValue(subscription))
      .forEach((subscription) => subscription.unsubscribe());
  }
}
