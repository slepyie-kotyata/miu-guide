import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import {
  HttpTestingController,
  provideHttpClientTesting,
} from '@angular/common/http/testing';

import { ScheduleService } from './schedule.service';
import { Lesson } from '../models/schedule.model';

describe('ScheduleService', () => {
  let service: ScheduleService;
  let httpTesting: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(ScheduleService);
    httpTesting = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpTesting.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should call GET with correct URL and params', () => {
    const mockLessons: Lesson[] = [
      {
        beginLesson: '09:00',
        date: '2026.07.12',
        dayOfWeekString: 'Сб',
        discipline: 'Математика',
        endLesson: '10:30',
        kindOfWork: 'Лекция',
        lessonNumberStart: 1,
        listOfLecturers: [{ lecturer: 'Иванов И.И.', auditorium: '101' }],
      },
    ];

    service.getDaySchedule(150, '2026.07.12').subscribe((data) => {
      expect(data).toEqual(mockLessons);
    });

    const req = httpTesting.expectOne(
      'https://miu-api.enjine.ru/schedule/150?day=2026.07.12',
    );
    expect(req.request.method).toBe('GET');
    req.flush(mockLessons);
  });

  it('should handle HTTP errors', () => {
    service.getDaySchedule(150, '2026.07.12').subscribe({
      next: () => fail('should have failed'),
      error: (err) => {
        expect(err).toBeTruthy();
      },
    });

    const req = httpTesting.expectOne(
      'https://miu-api.enjine.ru/schedule/150?day=2026.07.12',
    );
    req.flush('Server error', { status: 500, statusText: 'Internal Server Error' });
  });
});
