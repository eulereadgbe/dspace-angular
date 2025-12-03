import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class OrcidAuthorityService {
  // If running in a browser and the frontend is on localhost, point to the public API host.
  // Otherwise use a relative path so production behaves as before.
  private backendBase: string = ((): string => {
    try {
      if (typeof window !== 'undefined') {
        const host = window.location.hostname;
        // detect typical local dev hosts; change the target if you prefer another host
        if (host === 'localhost' || host === '127.0.0.1' || host.startsWith('dev.') || host.endsWith('.local')) {
          return 'https://repository.plai.net.ph';
        }
      }
    } catch (e) {
      // safe fallback
    }
    return '';
  })();

  constructor(private http: HttpClient) {}

  getOrcidId(authorityId: string): Observable<string | null> {
    if (!authorityId) {
      return of(null);
    }
    const url = `${this.backendBase}/server/api/authorities/${encodeURIComponent(authorityId)}`;
    return this.http.get<any>(url).pipe(
      map(resp => {
        if (resp && resp.response && Array.isArray(resp.response.docs) && resp.response.docs.length > 0) {
          return resp.response.docs[0].orcid_id || null;
        }
        return null;
      }),
      catchError(() => of(null))
    );
  }
}
