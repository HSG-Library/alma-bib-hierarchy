import { DestroyRef, Injectable } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class StatusMessageService {
  public message = new BehaviorSubject<string>('loading');

  public constructor(private destroyRef: DestroyRef) {}

  public set(msg: string): void {
    if (msg) {
      this.message.next(msg);
    }
  }

  public get(): Observable<string> {
    return this.message
      .asObservable()
      .pipe(takeUntilDestroyed(this.destroyRef));
  }
}
