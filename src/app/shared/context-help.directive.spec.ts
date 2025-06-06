import {
  Component,
  Input,
} from '@angular/core';
import {
  ComponentFixture,
  TestBed,
  waitForAsync,
} from '@angular/core/testing';
import { NgbTooltipModule } from '@ng-bootstrap/ng-bootstrap';
import { TranslateService } from '@ngx-translate/core';
import {
  BehaviorSubject,
  of,
} from 'rxjs';

import {
  ContextHelpDirective,
  ContextHelpDirectiveInput,
} from './context-help.directive';
import { ContextHelp } from './context-help.model';
import { ContextHelpService } from './context-help.service';
import { ContextHelpWrapperComponent } from './context-help-wrapper/context-help-wrapper.component';

@Component({
  template: `<div *dsContextHelp="contextHelpParams()">some text</div>`,
  standalone: true,
  imports: [
    ContextHelpDirective,
    NgbTooltipModule,
  ],
})
class TestComponent {
  @Input() content = '';
  @Input() id = '';
  contextHelpParams(): ContextHelpDirectiveInput {
    return {
      content: this.content,
      id: this.id,
      iconPlacement: 'left',
      tooltipPlacement: ['bottom'],
    };
  }
}

const messages = {
  lorem: 'lorem ipsum dolor sit amet',
  linkTest: 'This is text, [this](https://dspace.lyrasis.org) is a link, and [so is this](https://google.com)',
};
const exampleContextHelp: ContextHelp = {
  id: 'test-tooltip',
  isTooltipVisible: false,
};
describe('ContextHelpDirective', () => {
  let component: TestComponent;
  let fixture: ComponentFixture<TestComponent>;
  let translateService: any;
  let contextHelpService: any;
  let getContextHelp$: BehaviorSubject<ContextHelp>;
  let shouldShowIcons$: BehaviorSubject<boolean>;

  beforeEach(waitForAsync(() => {
    translateService = jasmine.createSpyObj('translateService', ['get']);
    contextHelpService = jasmine.createSpyObj('contextHelpService', [
      'shouldShowIcons$',
      'getContextHelp$',
      'add',
      'remove',
      'toggleIcons',
      'toggleTooltip',
      'showTooltip',
      'hideTooltip',
    ]);

    TestBed.configureTestingModule({
      imports: [NgbTooltipModule, TestComponent, ContextHelpWrapperComponent, ContextHelpDirective],
      providers: [
        { provide: TranslateService, useValue: translateService },
        { provide: ContextHelpService, useValue: contextHelpService },
      ],
    }).compileComponents();
  }));

  beforeEach(() => {
    // Set up service behavior.
    getContextHelp$ = new BehaviorSubject<ContextHelp>(exampleContextHelp);
    shouldShowIcons$ = new BehaviorSubject<boolean>(false);
    contextHelpService.getContextHelp$.and.returnValue(getContextHelp$);
    contextHelpService.shouldShowIcons$.and.returnValue(shouldShowIcons$);
    translateService.get.and.callFake((content) => of(messages[content]));

    // Set up fixture and component.
    fixture = TestBed.createComponent(TestComponent);
    component = fixture.componentInstance;
    component.id = 'test-tooltip';
    component.content = 'lorem';

    fixture.detectChanges();
  });

  it('should generate the context help wrapper component', (done) => {
    fixture.whenStable().then(() => {
      expect(fixture.nativeElement.children.length).toBe(1);
      const [wrapper] = fixture.nativeElement.children;
      expect(component).toBeDefined();
      expect(wrapper.tagName).toBe('DS-CONTEXT-HELP-WRAPPER');
      expect(contextHelpService.add).toHaveBeenCalledWith(exampleContextHelp);
      done();
    });
  });
});
