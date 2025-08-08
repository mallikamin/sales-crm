```typescript
export interface Interaction {
  id: number;
  customerId: number;
  customerName: string;
  medium: InteractionMedium;
  date: Date;
  remarks: string;
  followUpRequired: boolean;
  followUpDate?: Date;
  outcome?: string;
  duration?: number; // for calls in minutes
}

export enum InteractionMedium {
  EMAIL = 'Email',
  CALL = 'Call',
  WHATSAPP = 'WhatsApp',
  LINKEDIN = 'LinkedIn',
  INSTAGRAM = 'Instagram'
}
```
