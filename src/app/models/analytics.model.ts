```typescript
export interface CustomerAnalytics {
  customerId: number;
  customerName: string;
  totalInteractions: number;
  interactionsByMedium: { [key: string]: number };
  lastInteractionDate: Date;
  emailsSent: number;
  callsMade: number;
  linkedinMessagesSent: number;
  hasContactNumber: boolean;
  needsFollowUp: boolean;
}

export interface CRMKPIs {
  totalContacts: number;
  totalInteractions: number;
  activeCustomers: number;
  emailOnlyContacts: number;
  contactsWithoutCalls: number;
  pendingFollowUps: number;
  averageInteractionsPerCustomer: number;
}
```
