import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SmsMessengerComponent } from './sms-messenger.component';

describe('SmsMessengerComponent', () => {
  let component: SmsMessengerComponent;
  let fixture: ComponentFixture<SmsMessengerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SmsMessengerComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SmsMessengerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
