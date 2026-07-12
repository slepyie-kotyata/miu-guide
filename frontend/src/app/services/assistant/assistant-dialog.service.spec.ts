import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';

import { AssistantDialogService } from './assistant-dialog.service';
import { AssistantEmotionService } from './assistant-emotion.service';
import { AssistantVisibilityService } from './assistant-visibility.service';

describe('AssistantDialogService', () => {
  let service: AssistantDialogService;

  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({
      providers: [provideRouter([])],
    });
    service = TestBed.inject(AssistantDialogService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should have null currentMessage by default', () => {
    expect(service.currentMessage()).toBeNull();
  });

  it('should set currentMessage when playDialog is called', () => {
    service.playDialog([
      { text: 'Hello', emotion: 'miko-sit-eopen-mclosed', buttons: [] },
    ]);
    expect(service.currentMessage()).toBeTruthy();
    expect(service.currentMessage()?.text).toBe('Hello');
  });

  it('should advance to next message on showNextMessage', () => {
    service.playDialog([
      { text: 'First', emotion: 'miko-sit-eopen-mclosed', buttons: [] },
      { text: 'Second', emotion: 'miko-sit-eopen-mclosed', buttons: [] },
    ]);
    expect(service.currentMessage()?.text).toBe('First');

    service.showNextMessage();
    expect(service.currentMessage()?.text).toBe('Second');
  });

  it('should close dialog when queue is empty', () => {
    service.playDialog([
      { text: 'Only one', emotion: 'miko-sit-eopen-mclosed', buttons: [] },
    ]);

    service.showNextMessage();
    expect(service.currentMessage()).toBeNull();
  });

  it('should set currentMessage to null on closeDialog', () => {
    service.playDialog([
      { text: 'Hello', emotion: 'miko-sit-eopen-mclosed', buttons: [] },
    ]);
    expect(service.currentMessage()).not.toBeNull();

    service.closeDialog();
    expect(service.currentMessage()).toBeNull();
  });

  it('should advance on handleScreenTap when no buttons', () => {
    service.playDialog([
      { text: 'First', emotion: 'miko-sit-eopen-mclosed', buttons: [] },
      { text: 'Second', emotion: 'miko-sit-eopen-mclosed', buttons: [] },
    ]);

    service.handleScreenTap();
    expect(service.currentMessage()?.text).toBe('Second');
  });

  it('should not advance on handleScreenTap when buttons exist', () => {
    service.playDialog([
      {
        text: 'Choose',
        emotion: 'miko-sit-eopen-mclosed',
        buttons: [{ text: 'OK', action: () => {} }],
      },
      { text: 'Next', emotion: 'miko-sit-eopen-mclosed', buttons: [] },
    ]);

    service.handleScreenTap();
    expect(service.currentMessage()?.text).toBe('Choose');
  });
});
