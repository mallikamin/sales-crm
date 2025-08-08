```typescript
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, combineLatest } from 'rxjs';
import { map } from 'rxjs/operators';
import { Contact, Interaction, InteractionMedium, CustomerAnalytics, CRMKPIs } from '../models';

@Injectable({
  providedIn: 'root'
})
export class CrmDataService {
  private contactsSubject = new BehaviorSubject<Contact[]>([]);
  private interactionsSubject = new BehaviorSubject<Interaction[]>([]);

  public contacts$ = this.contactsSubject.asObservable();
  public interactions$ = this.interactionsSubject.asObservable();

  constructor() {
    this.loadInitialData();
  }

  private loadInitialData() {
    // Sample data - in real app, load from JSON files
    const sampleContacts: Contact[] = [
      {
        id: 1,
        name: 'Ahmed Khan',
        contactNumber: '+92-300-1234567',
        linkedinProfile: 'https://linkedin.com/in/ahmed-khan',
        designation: 'Sales Manager',
        company: 'Tech Solutions Ltd',
        whatsapp: '+92-300-1234567',
        notes: 'Interested in enterprise solutions',
        createdDate: new Date('2024-01-15'),
        lastUpdated: new Date('2024-01-15')
      },
      {
        id: 2,
        name: 'Sarah Ahmad',
        contactNumber: '+92-321-9876543',
        instagramLink: 'https://instagram.com/sarah_ahmad',
        designation: 'Marketing Director',
        company: 'Digital Marketing Pro',
        notes: 'Potential partnership opportunity',
        createdDate: new Date('2024-01-20'),
        lastUpdated: new Date('2024-01-20')
      }
    ];

    const sampleInteractions: Interaction[] = [
      {
        id: 1,
        customerId: 1,
        customerName: 'Ahmed Khan',
        medium: InteractionMedium.EMAIL,
        date: new Date('2024-02-01'),
        remarks: 'Sent product demo email',
        followUpRequired: true,
        followUpDate: new Date('2024-02-08')
      },
      {
        id: 2,
        customerId: 1,
        customerName: 'Ahmed Khan',
        medium: InteractionMedium.CALL,
        date: new Date('2024-02-08'),
        remarks: 'Discussed pricing and features. Interested in premium package.',
        followUpRequired: true,
        followUpDate: new Date('2024-02-15'),
        duration: 45
      },
      {
        id: 3,
        customerId: 2,
        customerName: 'Sarah Ahmad',
        medium: InteractionMedium.LINKEDIN,
        date: new Date('2024-02-05'),
        remarks: 'Connected on LinkedIn, discussed collaboration',
        followUpRequired: false
      }
    ];

    this.contactsSubject.next(sampleContacts);
    this.interactionsSubject.next(sampleInteractions);
  }

  // Contact methods
  getContacts(): Observable<Contact[]> {
    return this.contacts$;
  }

  addContact(contact: Contact): void {
    const contacts = this.contactsSubject.value;
    contact.id = Math.max(...contacts.map(c => c.id), 0) + 1;
    contact.createdDate = new Date();
    contact.lastUpdated = new Date();
    this.contactsSubject.next([...contacts, contact]);
  }

  updateContact(contact: Contact): void {
    const contacts = this.contactsSubject.value;
    const index = contacts.findIndex(c => c.id === contact.id);
    if (index > -1) {
      contact.lastUpdated = new Date();
      contacts[index] = contact;
      this.contactsSubject.next([...contacts]);
    }
  }

  deleteContact(id: number): void {
    const contacts = this.contactsSubject.value;
    this.contactsSubject.next(contacts.filter(c => c.id !== id));
  }

  // Interaction methods
  getInteractions(): Observable<Interaction[]> {
    return this.interactions$;
  }

  addInteraction(interaction: Interaction): void {
    const interactions = this.interactionsSubject.value;
    interaction.id = Math.max(...interactions.map(i => i.id), 0) + 1;
    this.interactionsSubject.next([...interactions, interaction]);
  }

  getInteractionsByCustomer(customerId: number): Observable<Interaction[]> {
    return this.interactions$.pipe(
      map(interactions => interactions.filter(i => i.customerId === customerId))
    );
  }

  // Analytics methods
  getCustomerAnalytics(): Observable<CustomerAnalytics[]> {
    return combineLatest([this.contacts$, this.interactions$]).pipe(
      map(([contacts, interactions]) => {
        return contacts.map(contact => {
          const customerInteractions = interactions.filter(i => i.customerId === contact.id);
          const interactionsByMedium = customerInteractions.reduce((acc, interaction) => {
            acc[interaction.medium] = (acc[interaction.medium] || 0) + 1;
            return acc;
          }, {} as { [key: string]: number });

          return {
            customerId: contact.id,
            customerName: contact.name,
            totalInteractions: customerInteractions.length,
            interactionsByMedium,
            lastInteractionDate: customerInteractions.length > 0 
              ? new Date(Math.max(...customerInteractions.map(i => i.date.getTime())))
              : contact.createdDate,
            emailsSent: interactionsByMedium[InteractionMedium.EMAIL] || 0,
            callsMade: interactionsByMedium[InteractionMedium.CALL] || 0,
            linkedinMessagesSent: interactionsByMedium[InteractionMedium.LINKEDIN] || 0,
            hasContactNumber: !!contact.contactNumber,
            needsFollowUp: customerInteractions.some(i => i.followUpRequired && 
              i.followUpDate && i.followUpDate <= new Date())
          };
        });
      })
    );
  }

  getCRMKPIs(): Observable<CRMKPIs> {
    return combineLatest([this.contacts$, this.interactions$, this.getCustomerAnalytics()]).pipe(
      map(([contacts, interactions, analytics]) => {
        const emailOnlyContacts = analytics.filter(a => 
          a.emailsSent > 0 && a.callsMade === 0 && a.linkedinMessagesSent === 0
        ).length;

        const contactsWithoutCalls = analytics.filter(a => 
          a.emailsSent > 0 && a.linkedinMessagesSent > 0 && 
          a.hasContactNumber && a.callsMade === 0
        ).length;

        return {
          totalContacts: contacts.length,
          totalInteractions: interactions.length,
          activeCustomers: analytics.filter(a => a.totalInteractions > 0).length,
          emailOnlyContacts,
          contactsWithoutCalls,
          pendingFollowUps: analytics.filter(a => a.needsFollowUp).length,
          averageInteractionsPerCustomer: contacts.length > 0 
            ? Math.round((interactions.length / contacts.length) * 100) / 100 
            : 0
        };
      })
    );
  }
}
```
