```typescript
import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import { CrmDataService } from '../../services/crm-data.service';
import { CRMKPIs, CustomerAnalytics } from '../../models';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit {
  kpis$: Observable<CRMKPIs>;
  customerAnalytics$: Observable<CustomerAnalytics[]>;
  
  // Chart data
  interactionTrendsData: any;
  mediumDistributionData: any;
  
  constructor(private crmService: CrmDataService) {
    this.kpis$ = this.crmService.getCRMKPIs();
    this.customerAnalytics$ = this.crmService.getCustomerAnalytics();
  }

  ngOnInit() {
    this.loadChartData();
  }

  private loadChartData() {
    this.customerAnalytics$.subscribe(analytics => {
      this.setupInteractionTrendsChart(analytics);
      this.setupMediumDistributionChart(analytics);
    });
  }

  private setupInteractionTrendsChart(analytics: CustomerAnalytics[]) {
    const monthlyData = this.aggregateInteractionsByMonth(analytics);
    
    this.interactionTrendsData = {
      labels: monthlyData.map(d => d.month),
      datasets: [{
        label: 'Total Interactions',
        data: monthlyData.map(d => d.count),
        borderColor: '#3498db',
        backgroundColor: 'rgba(52, 152, 219, 0.1)',
        fill: true
      }]
    };
  }

  private setupMediumDistributionChart(analytics: CustomerAnalytics[]) {
    const mediumTotals = analytics.reduce((acc, customer) => {
      Object.entries(customer.interactionsByMedium).forEach(([medium, count]) => {
        acc[medium] = (acc[medium] || 0) + count;
      });
      return acc;
    }, {} as { [key: string]: number });

    this.mediumDistributionData = {
      labels: Object.keys(mediumTotals),
      datasets: [{
        data: Object.values(mediumTotals),
        backgroundColor: [
          '#FF6384',
          '#36A2EB', 
          '#FFCE56',
          '#4BC0C0',
          '#9966FF'
        ]
      }]
    };
  }

  private aggregateInteractionsByMonth(analytics: CustomerAnalytics[]): any[] {
    // Simplified - in real app, use actual interaction dates
    return [
      { month: 'Jan 2024', count: 25 },
      { month: 'Feb 2024', count: 32 },
      { month: 'Mar 2024', count: 28 },
      { month: 'Apr 2024', count: 41 }
    ];
  }
}
```