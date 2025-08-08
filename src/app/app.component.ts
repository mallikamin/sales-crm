```typescript
import { Component } from '@angular/core';

@Component({
  selector: 'app-root',
  template: `
    <mat-toolbar color="primary">
      <span>Sales CRM</span>
      <div class="nav-spacer"></div>
      <nav class="nav-links">
        <a mat-button routerLink="/dashboard" routerLinkActive="active">Dashboard</a>
        <a mat-button routerLink="/contacts" routerLinkActive="active">Contacts</a>
        <a mat-button routerLink="/interactions" routerLinkActive="active">Interactions</a>
        <a mat-button routerLink="/analytics" routerLinkActive="active">Analytics</a>
      </nav>
    </mat-toolbar>
    
    <main class="main-content">
      <router-outlet></router-outlet>
    </main>
  `,
  styles: [`
    .nav-spacer { flex: 1 1 auto; }
    .nav-links a { margin-left: 16px; }
    .nav-links a.active { background: rgba(255,255,255,0.1); }
    .main-content { padding: 20px; min-height: calc(100vh - 64px); }
  `]
})
export class AppComponent {
  title = 'Sales CRM';
}
```
