import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class StatusMessageService {
  message = new BehaviorSubject<string>('loading');

  set(msg: string): void {
    if (msg) {
      this.message.next(msg);
    }
  }

  get(): Observable<string> {
    return this.message.asObservable();
  }
}
