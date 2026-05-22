import { Injectable, inject, signal, computed, WritableSignal, Signal } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, map, tap } from 'rxjs';
import { User } from '../interfaces/user.interface';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly _loggedInUser: WritableSignal<User | null> = signal<User | null>(this.loadFromSession());

  readonly loggedInUser: Signal<User | null> = this._loggedInUser.asReadonly();
  readonly isAuthenticated: Signal<boolean> = computed(() => this._loggedInUser() !== null);
  readonly token: Signal<string | null> = computed(() => this._loggedInUser()?.token ?? null);

  private http: HttpClient = inject(HttpClient);

  login(email: string, password: string): Observable<User> {
    const params: HttpParams = new HttpParams()
      .set('email', email)
      .set('password', password);

    return this.http
      .get<User[]>(`${environment.apiUrl}/users`, { params })
      .pipe(
        map((users: User[]) => {
          if (!users.length) throw new Error('אימייל או סיסמה שגויים');
          return users[0];
        }),
        tap((user: User) => {
          this._loggedInUser.set(user);
          const { password: _, ...safeUser } = user;
          sessionStorage.setItem('loggedInUser', JSON.stringify(safeUser));
        })
      );
  }

  logout(): void {
    this._loggedInUser.set(null);
    sessionStorage.removeItem('loggedInUser');
  }

  private loadFromSession(): User | null {
    const stored = sessionStorage.getItem('loggedInUser');
    return stored ? (JSON.parse(stored) as User) : null;
  }
}
