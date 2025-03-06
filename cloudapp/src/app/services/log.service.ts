import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class LogService {
  public info(...args: any[]): void {
    if (args && args.length > 0) {
      console.info('[Bib-Hierarchy]', ...args);
    }
  }
  public error(...args: any[]): void {
    if (args && args.length > 0) {
      console.error('[Bib-Hierarchy][ERR]', ...args);
    }
  }
}
