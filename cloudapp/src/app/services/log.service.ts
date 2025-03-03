import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class LogService {
  info(...args: any[]): void {
    console.info('[Bib-Hierarchy]', ...args);
  }
  error(...args: any[]): void {
    console.error('[Bib-Hierarchy][ERR]', ...args);
  }
}
