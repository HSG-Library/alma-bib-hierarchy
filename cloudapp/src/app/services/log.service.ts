import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class LogService {
  info(...args: any[]): void {
    if (args && args.length > 0) {
      console.info('[Bib-Hierarchy]', ...args);
    }
  }
  error(...args: any[]): void {
    if (args && args.length > 0) {
      console.error('[Bib-Hierarchy][ERR]', ...args);
    }
  }
}
