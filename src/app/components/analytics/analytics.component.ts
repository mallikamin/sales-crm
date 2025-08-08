```typescript
import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { CustomerAnalytics, InteractionMedium } from '../../models';
import { CrmDataService } from '../../services/crm-data.service';

@Component({
  selector: 'app-analytics',
  templateUrl: './analytics.component.html',
  styleUrls: ['./analytics.component.scss']
})
export class AnalyticsComponent implements OnInit {
  customerAnalytics$: Observable<CustomerAnalytics[]>;
  
  // Filter options
  filterMedium: string = '';
  filterMinInteractions: number = 0;
  showOnlyNeedsFollowUp: boolean = false;
  
  // Analysis views
  emailOnlyContacts$: Observable<CustomerAnalytics[]>;
  readyForCalls$: Observable<CustomerAnalytics[]>;
  topPerformers$: Observable<CustomerAnalytics[]>;
  needsAttention$: Observable<CustomerAnalytics[]>;

  constructor(private crmService: CrmDataService) {
    this.customerAnalytics$ = this.crmService.getCustomerAnalytics();
  }

  ngOnInit() {
    this.setupAnalysisViews();
  }

  private setupAnalysisViews() {
    // Email only contacts (sent emails but no calls/linkedin)
    this.emailOnlyContacts$ = this.customerAnalytics$.pipe(
      map(analytics => analytics.filter(a => 
        a.emailsSent > 0 && 
        a.callsMade === 0 && 
        a.linkedinMessagesSent === 0
      ))
    );

    // Ready for calls (has email + linkedin + contact# but no calls)
    this.readyForCalls$ = this.customerAnalytics$.pipe(
      map(analytics => analytics.filter(a => 
        a.emailsSent > 0 && 
        a.linkedinMessagesSent > 0 && 
        a.hasContactNumber && 
        a.callsMade === 0
      ))
    );

    // Top performers (most interactions)
    this.topPerformers$ = this.customerAnalytics$.pipe(
      map(analytics => analytics
        .sort((a, b) => b.totalInteractions - a.totalInteractions)
        .slice(0, 10)
      )
    );

    // Needs attention (no recent interactions)
    this.needsAttention$ = this.customerAnalytics$.pipe(
      map(analytics => {
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        
        return analytics.filter(a => 
          a.lastInteractionDate < thirtyDaysAgo && 
          a.totalInteractions > 0
        );
      })
    );
  }

  getFilteredAnalytics(): Observable<CustomerAnalytics[]> {
    return this.customerAnalytics$.pipe(
      map(analytics => analytics.filter(customer => {
        if (this.filterMinInteractions > 0 && customer.totalInteractions < this.filterMinInteractions) {
          return false;
        }
        
        if (this.filterMedium && !customer.interactionsByMedium[this.filterMedium]) {
          return false;
        }
        
        if (this.showOnlyNeedsFollowUp && !customer.needsFollowUp) {
          return false;
        }
        
        return true;
      }))
    );
  }

  exportData() {
    this.customerAnalytics$.subscribe(analytics => {
      const csv = this.convertToCSV(analytics);
      this.downloadCSV(csv, 'customer-analytics.csv');
    });
  }

  private convertToCSV(data: CustomerAnalytics[]): string {
    const headers = ['Customer Name', 'Total Interactions', 'Emails Sent', 'Calls Made', 'LinkedIn Messages', 'Last Interaction'];
    const rows = data.map(customer => [
      customer.customerName,
      customer.totalInteractions,
      customer.emailsSent,
      customer.callsMade,
      customer.linkedinMessagesSent,
      customer.lastInteractionDate.toDateString()
    ]);
    
    return [headers, ...rows].map(row => row.join(',')).join('\n');
  }

  private downloadCSV(csv: string, filename: string) {
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    window.URL.revokeObjectURL(url);
  }
}
```