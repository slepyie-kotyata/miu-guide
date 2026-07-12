import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';

import { AssistantChatService } from './assistant-chat.service';

describe('AssistantChatService', () => {
  let service: AssistantChatService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideRouter([])],
    });
    service = TestBed.inject(AssistantChatService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should have chat closed by default', () => {
    expect(service.isChatOpen()).toBe(false);
  });

  it('should have empty conversation by default', () => {
    expect(service.conversation()).toEqual([]);
  });

  it('should open chat and add greeting on handleCatClick', () => {
    service.handleCatClick();

    expect(service.isChatOpen()).toBe(true);
    expect(service.conversation().length).toBe(1);
    expect(service.conversation()[0].sender).toBe('cat');
  });

  it('should close chat on closeChat', () => {
    service.handleCatClick();
    expect(service.isChatOpen()).toBe(true);

    service.closeChat();
    expect(service.isChatOpen()).toBe(false);
    expect(service.conversation()).toEqual([]);
  });

  it('should toggle chat on handleCatClick', () => {
    service.handleCatClick();
    expect(service.isChatOpen()).toBe(true);

    service.handleCatClick();
    expect(service.isChatOpen()).toBe(false);
  });

  it('should add user and cat message on sendQuestion', (done) => {
    service.handleCatClick();
    service.sendQuestion('Test question');

    expect(service.conversation().length).toBe(2);
    expect(service.conversation()[1].text).toBe('Test question');
    expect(service.conversation()[1].sender).toBe('user');

    setTimeout(() => {
      expect(service.conversation().length).toBe(3);
      expect(service.conversation()[2].sender).toBe('cat');
      done();
    }, 600);
  });

  it('should not add message on empty sendQuestion', () => {
    service.handleCatClick();
    service.sendQuestion('   ');

    expect(service.conversation().length).toBe(1);
  });
});
